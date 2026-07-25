// ===========================================================
// ENZO LORANDI - PORTFOLIO
// Couche WOW (index uniquement) : bras robotique 3D procédural
// « bras compagnon » (Concept B, conseil du 2026-07-24) : calque FIXE
// derrière tout le contenu, chorégraphié par le scroll de toute la page.
//
// Principes (validés par l'équipe) :
//  - Three.js vendorisé via import map, aucune dépendance build
//  - Sobre, monochrome orange/sombre (charte) — pas de néon
//  - Robustesse > ambition : fallback propre sur mobile,
//    prefers-reduced-motion et absence de WebGL (on garde le hero CSS)
//  - Rendu à la demande : pleine cadence quand ça bouge, ~20 fps au
//    repos, pause onglet caché (perf / batterie)
//  - Lisibilité d'abord : bras confiné dans la gouttière droite,
//    estompé sur les grilles denses, figé pendant le manifeste pinné
//  - Géométrie construite en pivots pour pouvoir, plus tard,
//    « poser » le bras dans la main d'une photo détourée
// ===========================================================

const mount = document.getElementById('hero3d');

// ---------- Garde-fous : ne pas initialiser si inadapté ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const smallMq = window.matchMedia('(max-width: 860px)');

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

// init paresseuse : couvre aussi une fenêtre redimensionnée au-delà de 860px
// après le chargement (le cas « évalué une seule fois » de l'ancien code)
let inited = false;
function maybeInit() {
  if (!inited && mount && !reduceMotion && !smallMq.matches && webglAvailable()) {
    inited = true;
    init();
  }
}
maybeInit();
smallMq.addEventListener('change', maybeInit);

async function init() {
  const THREE = await import('three');

  // ---------- Couleurs (alignées sur le design system) ----------
  const COL_BODY = 0x1a1a26;   // --surface-2
  const COL_DARK = 0x0f0f17;   // articulations sombres
  const COL_ACCENT = 0xff8c1a; // --accent

  // ---------- Scène / caméra / renderer ----------
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0, 0.4, 12);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  // tone mapping filmique : les émissifs orange restent denses au lieu de
  // clipper vers le blanc quand ils s'additionnent aux lumières (réglage Kenji)
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  mount.appendChild(renderer.domElement);

  // ---------- Environnement de réflexion (procédural, aucun asset) ----------
  // Un métal PBR ne rend que ce qu'il reflète : sans environment map, les
  // segments metalness 0.5+ lisent « plastique gris ». On fabrique une petite
  // « pièce » émissive (key chaud, fill froid, rebond orange) passée au PMREM.
  // Valeurs > 1 = panneaux HDR. envMapIntensity bas côté matériaux : reflets
  // doux, pas chromés (sobriété charte).
  {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x07070c);
    const panel = (r, g, b, w, h, x, y, z) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial());
      m.material.color.setRGB(r, g, b);
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      envScene.add(m);
    };
    panel(3.0, 2.7, 2.2, 7, 5, -5, 7, 4);    // key chaud, haut gauche (cohérent avec la key light)
    panel(0.5, 0.55, 0.8, 5, 9, 8, 1, -2);   // fill bleuté discret, droite
    panel(1.6, 0.9, 0.2, 6, 3, 2, -7, 3);    // rebond orange charte, par dessous
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();
  }

  // brume très légère couleur --bg : les éléments lointains (socle de dépose,
  // base) s'estompent -> profondeur atmosphérique gratuite
  scene.fog = new THREE.Fog(0x0a0a0f, 11, 20);

  // ---------- Lumières : douces, accent orange ----------
  scene.add(new THREE.AmbientLight(0x404056, 1.1));

  const key = new THREE.DirectionalLight(0xfff2e0, 1.4);
  key.position.set(-4, 6, 5);
  scene.add(key);

  const accentLight = new THREE.PointLight(COL_ACCENT, 18, 18, 2);
  accentLight.position.set(2.5, 1.5, 3);
  scene.add(accentLight);

  // rim light dédié au bloc gauche (ciselle les arêtes de la puce)
  const chipRim = new THREE.DirectionalLight(0xfff2e0, 1.2);
  chipRim.position.set(-6, 3, 4);
  scene.add(chipRim);

  const rim = new THREE.DirectionalLight(COL_ACCENT, 0.6);
  rim.position.set(5, -2, -4);
  scene.add(rim);

  // ---------- Matériaux ----------
  const matBody = new THREE.MeshStandardMaterial({ color: COL_BODY, metalness: 0.55, roughness: 0.35, envMapIntensity: 0.6 });
  const matDark = new THREE.MeshStandardMaterial({ color: COL_DARK, metalness: 0.6, roughness: 0.5, envMapIntensity: 0.45 });
  const matAccent = new THREE.MeshStandardMaterial({
    color: COL_ACCENT, metalness: 0.3, roughness: 0.45,
    emissive: COL_ACCENT, emissiveIntensity: 0.55, envMapIntensity: 0.3
  });
  // accent adouci pour les doigts de pince : le point focal du pick-and-place
  // doit rester le cube, pas l'outil qui le porte
  const matAccentSoft = new THREE.MeshStandardMaterial({
    color: COL_ACCENT, metalness: 0.3, roughness: 0.45,
    emissive: COL_ACCENT, emissiveIntensity: 0.25, envMapIntensity: 0.3
  });

  // ---------- Helpers de construction ----------
  // "os" du bras : poutre effilée dont la base est en y=0 (creuse une lecture industrielle)
  function link(length, rBase, rTop, mat) {
    const g = new THREE.CylinderGeometry(rTop, rBase, length, 20);
    g.translate(0, length / 2, 0);
    return new THREE.Mesh(g, mat);
  }
  // carter de moteur : cylindre couché sur l'axe X (le repère visuel clé d'un bras 6 axes)
  function motorHousing(radius, width, mat) {
    const g = new THREE.CylinderGeometry(radius, radius, width, 28);
    g.rotateZ(Math.PI / 2);
    return new THREE.Mesh(g, mat);
  }
  // bague d'accent orange autour d'un carter (axe X)
  function accentBand(radius, width) {
    const g = new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, width, 28, 1, true);
    g.rotateZ(Math.PI / 2);
    return new THREE.Mesh(g, matAccent);
  }

  // ---------- Assemblage : bras industriel 6 axes simplifié ----------
  // Hiérarchie de pivots : root -> base -> turntable(J1) -> shoulder(J2)
  //   -> upperArm -> elbow(J3) -> forearm -> wrist(J4) -> gripper
  // Silhouette : socle large, carters de moteurs horizontaux à chaque
  // articulation, segments effilés, coude plié -> lecture "bras qui atteint".
  const root = new THREE.Group();
  scene.add(root);

  // --- socle au sol (large, stable) ---
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.35, 0.35, 36), matDark);
  foot.position.y = -2.9;
  root.add(foot);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.95, 0.7, 32), matBody);
  pillar.position.y = -2.45;
  root.add(pillar);

  // --- J1 : plateau tournant (axe vertical) ---
  const turntable = new THREE.Group();
  turntable.position.y = -2.05;
  root.add(turntable);
  turntable.add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.45, 28), matBody));

  // --- J2 : épaule (carter horizontal) ---
  const shoulder = new THREE.Group();
  shoulder.position.y = 0.35;
  turntable.add(shoulder);
  shoulder.add(motorHousing(0.55, 1.0, matDark));
  shoulder.add(accentBand(0.55, 0.18));
  // bras supérieur effilé
  const upperArm = link(2.1, 0.46, 0.34, matBody);
  shoulder.add(upperArm);

  // --- J3 : coude (carter horizontal en bout de bras supérieur) ---
  const elbow = new THREE.Group();
  elbow.position.y = 2.1;
  shoulder.add(elbow);
  elbow.add(motorHousing(0.42, 0.8, matDark));
  elbow.add(accentBand(0.42, 0.15));
  // avant-bras plus fin
  const forearm = link(1.75, 0.34, 0.24, matBody);
  elbow.add(forearm);

  // --- J4 : poignet ---
  const wrist = new THREE.Group();
  wrist.position.y = 1.75;
  elbow.add(wrist);
  wrist.add(motorHousing(0.3, 0.55, matDark));
  // bride d'outil
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.35, 20), matBody);
  flange.position.y = 0.22;
  wrist.add(flange);

  // --- effecteur : pince deux doigts ---
  const gripper = new THREE.Group();
  gripper.position.y = 0.42;
  wrist.add(gripper);
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.4), matDark);
  gripper.add(palm);
  const fingerGeo = new THREE.BoxGeometry(0.12, 0.55, 0.32);
  fingerGeo.translate(0, 0.27, 0);
  const fingerL = new THREE.Mesh(fingerGeo, matAccentSoft);
  const fingerR = new THREE.Mesh(fingerGeo, matAccentSoft);
  gripper.add(fingerL, fingerR);
  // point d'outil : centre de prise entre les doigts (cible de l'IK, ancre du cube porté)
  const toolTip = new THREE.Object3D();
  toolTip.position.y = 0.3;
  gripper.add(toolTip);

  // ---------- Pose de repos (figée, lisible) : bras qui tend vers le nom ----------
  // angles de base autour desquels oscille la micro-animation
  // épaule très inclinée + coude plié -> la pince pointe vers le haut-gauche (le nom)
  const POSE = { shoulder: -0.85, elbow: 1.25, wrist: -0.5 };
  shoulder.rotation.z = POSE.shoulder;
  elbow.rotation.z = POSE.elbow;
  wrist.rotation.z = POSE.wrist;

  // ===========================================================
  // Cinématique du pick-and-place (v2.1, demande d'Enzo) :
  // le bras va chercher un cube sur un socle et le dépose sur un
  // second socle au fil du scroll. Les poses ne sont pas réglées à
  // la main : une IK 2 axes (épaule/coude) garantit que la pince
  // atteint exactement le cube — même principe que sur l'UR5.
  // ===========================================================
  // longueurs des segments (cf. géométrie ci-dessus)
  const L1 = 2.1;   // bras supérieur (épaule -> coude)
  const L2 = 1.75;  // avant-bras (coude -> poignet)
  const L3 = 0.72;  // poignet -> centre de prise (groupe pince à 0.42 + point de prise à 0.30)
  const SHOULDER_Y = -1.7; // pivot épaule en coordonnées root (turntable -2.05 + 0.35)

  // IK plane 2 axes + orientation d'outil imposée. Convention : un angle
  // cumulé θ oriente un segment selon (-sin θ, cos θ).
  // `branch` choisit la configuration du coude :
  //   +1 = coude plié « en dessous » (celle de la pose de repos, θ2 > 0)
  //   -1 = coude « en surplomb » (θ2 < 0) — la config naturelle pour saisir
  //        par le dessus, comme un bras industriel au-dessus d'un plateau.
  // Vérifié numériquement : branch +1 sur la FK de POSE redonne POSE.
  const clamp1 = (v) => Math.min(1, Math.max(-1, v));
  const normPI = (a) => ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  function solveIK(r, h, tool, branch) {
    // position du poignet : cible reculée de L3 le long de la direction d'outil
    const wx = r + L3 * Math.sin(tool);
    const wy = h - L3 * Math.cos(tool);
    let D = Math.hypot(wx, wy);
    D = Math.min(Math.max(D, Math.abs(L1 - L2) + 0.05), L1 + L2 - 0.05);
    const beta = Math.acos(clamp1((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2)));
    const alpha = Math.acos(clamp1((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D)));
    const phi = Math.atan2(-wx, wy);
    const t1 = branch > 0 ? phi - alpha : phi + alpha;
    const t2 = branch > 0 ? Math.PI - beta : beta - Math.PI;
    return { t1, t2, tw: normPI(tool - t1 - t2) };
  }

  // --- décor : cube « payload » + deux socles (charte : sombre + accent) ---
  // positions des prises dans le plan du bras (r, h rel. épaule) et angle du plateau
  const PICK  = { turn:  0.50, r: 2.20, h: 0.15 }; // cube au départ
  const PLACE = { turn: -0.65, r: 2.55, h: 0.35 }; // cube à l'arrivée
  const CUBE_HALF = 0.15;
  const GRIP_OPEN = 0.30, GRIP_CLOSED = 0.21; // fermé = doigts au contact du cube (0.3 de large)

  function seatPosition(s) { // centre du cube posé, en coordonnées root
    return new THREE.Vector3(
      s.r * Math.cos(s.turn),
      SHOULDER_Y + s.h,
      -s.r * Math.sin(s.turn)
    );
  }
  function addPedestal(s) {
    const seat = seatPosition(s);
    const topY = seat.y - CUBE_HALF;          // dessus du socle sous le cube
    const baseY = -3.06;                       // niveau du sol
    const hgt = topY - baseY;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, hgt, 20), matDark);
    ped.position.set(seat.x, baseY + hgt / 2, seat.z);
    root.add(ped);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.06, 20, 1, true), matAccent);
    ring.position.set(seat.x, topY - 0.05, seat.z);
    root.add(ring);
  }
  addPedestal(PICK);
  addPedestal(PLACE);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(CUBE_HALF * 2, CUBE_HALF * 2, CUBE_HALF * 2),
    new THREE.MeshStandardMaterial({
      color: COL_ACCENT, emissive: COL_ACCENT, emissiveIntensity: 0.7,
      metalness: 0.3, roughness: 0.45,
    })
  );
  cube.position.copy(seatPosition(PICK));
  root.add(cube);

  // ===========================================================
  // Élément gauche : cerveau stylisé en fond + puce électronique
  // par-dessus, qui pulse en orange (versant IA).
  // ===========================================================
  const netRoot = new THREE.Group();
  scene.add(netRoot);

  // halo orange diffus derrière la puce (donne du volume à l'ensemble)
  const chipGlow = new THREE.PointLight(COL_ACCENT, 6, 9, 2);
  chipGlow.position.set(0, 0, -1.2);
  netRoot.add(chipGlow);

  // --- puce électronique (légèrement basculée) ---
  const chip = new THREE.Group();
  chip.position.set(0, 0, 0); // seule entité du bloc gauche -> centrée
  chip.rotation.x = -0.35; // basculement 3D -> perspective, moins "plat"
  chip.rotation.z = 0.12;
  netRoot.add(chip);

  // boîtier biseauté (chanfrein via 2e box plus fine au-dessus)
  const chipBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x0c0c14, metalness: 0.7, roughness: 0.35 })
  );
  chip.add(chipBody);
  const chipTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 1.32, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x16161f, metalness: 0.6, roughness: 0.4 })
  );
  chipTop.position.z = 0.13;
  chip.add(chipTop);

  // petits composants CMS sur le dessus (détail de réalisme)
  const smdMat = new THREE.MeshStandardMaterial({ color: 0x2a2a33, metalness: 0.5, roughness: 0.5 });
  const smdPos = [[-0.5, 0.5], [0.5, -0.5], [-0.52, -0.42], [0.48, 0.5]];
  smdPos.forEach(([sx, sy]) => {
    const smd = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.05), smdMat);
    smd.position.set(sx, sy, 0.16);
    chip.add(smd);
  });

  // cavité sombre encastrée (le die est en retrait dedans)
  const chipRecess = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.78, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x060608, metalness: 0.5, roughness: 0.6 })
  );
  chipRecess.position.z = 0.15;
  chip.add(chipRecess);

  // die lumineux, plus petit, au fond de la cavité (le "cœur" qui pulse)
  const chipCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.52, 0.04),
    new THREE.MeshStandardMaterial({ color: COL_ACCENT, emissive: COL_ACCENT, emissiveIntensity: 1.2 })
  );
  chipCore.position.z = 0.17;
  chip.add(chipCore);
  // fines rainures sombres sur le die (motif "silicium")
  const dieLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.52, 0.52, 4, 4)),
    new THREE.LineBasicMaterial({ color: 0x3a2a10, transparent: true, opacity: 0.5 })
  );
  dieLines.position.z = 0.2;
  chip.add(dieLines);

  // pattes métalliques sur les 4 côtés
  const pinMat = new THREE.MeshStandardMaterial({ color: 0x7a7a82, metalness: 0.95, roughness: 0.25 });
  const pinGeo = new THREE.BoxGeometry(0.3, 0.07, 0.07);
  const PINS = 6, span = 1.1;
  for (let i = 0; i < PINS; i++) {
    const off = (i - (PINS - 1) / 2) * (span / (PINS - 1));
    [[-1], [1]].forEach(([sx]) => {
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(sx * 0.88, off, 0);
      chip.add(pin);
    });
    [[-1], [1]].forEach(([sy]) => {
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.rotation.z = Math.PI / 2;
      pin.position.set(off, sy * 0.88, 0);
      chip.add(pin);
    });
  }

  // pistes de circuit orange en angles droits + pads (vrai routage PCB)
  const tracePts = [];
  const padList = [];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let k = 0; k < 12; k++) {
    const d = dirs[k % 4];
    const perp = [-d[1], d[0]];
    const lane = ((k >> 2) - 1) * 0.42;       // décalage latéral par voie
    const start = 0.95, mid = 1.35 + (k % 3) * 0.25, turn = lane;
    const ax = d[0] * start + perp[0] * lane;
    const ay = d[1] * start + perp[1] * lane;
    const bx = d[0] * mid + perp[0] * lane;
    const by = d[1] * mid + perp[1] * lane;
    const cx = d[0] * mid + perp[0] * (lane + turn * 0 + (perp[0] || perp[1]) * 0); // segment coudé
    // coude : du point B, on tourne le long de la perpendiculaire
    const ex = bx + perp[0] * 0.45, ey = by + perp[1] * 0.45;
    tracePts.push(new THREE.Vector3(ax, ay, 0.05), new THREE.Vector3(bx, by, 0.05));
    tracePts.push(new THREE.Vector3(bx, by, 0.05), new THREE.Vector3(ex, ey, 0.05));
    padList.push([ex, ey]);
  }
  const traceMat = new THREE.LineBasicMaterial({
    color: COL_ACCENT, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending
  });
  const traces = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tracePts), traceMat);
  chip.add(traces);
  // pads carrés en bout de piste
  const padGeo = new THREE.PlaneGeometry(0.1, 0.1);
  const padMat = new THREE.MeshStandardMaterial({
    color: COL_ACCENT, emissive: COL_ACCENT, emissiveIntensity: 0.7, transparent: true, opacity: 0.7
  });
  padList.forEach(([px, py]) => {
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(px, py, 0.05);
    chip.add(pad);
  });

  // ---------- Cadrage : bras à droite, puce à gauche ----------
  // Positions proportionnelles à la demi-largeur visible -> pas de clipping,
  // écartement qui s'adapte (plus large sur grand écran, resserré sur petit).
  function layoutForViewport() {
    const aspect = mount.clientWidth / mount.clientHeight;
    const halfH = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    const halfW = halfH * aspect;
    const wide = aspect > 1.4;
    // fractions calées pour rester intégralement dans le cadre (marge incluse)
    root.position.x = halfW * (wide ? 0.56 : 0.40);
    root.scale.setScalar(wide ? 0.8 : 0.6);
    netRoot.position.x = -halfW * (wide ? 0.62 : 0.48);
    netRoot.scale.setScalar(wide ? 1.05 : 0.66);
  }
  root.position.y = 0.3;
  netRoot.position.y = 0.4;
  layoutForViewport();

  // ---------- Chorégraphie de scroll : séquence pick-and-place ----------
  // Chaque clé décrit la CIBLE DE L'OUTIL (turn, r, h, angle d'outil, pince) ;
  // l'IK est résolue UNE FOIS par clé à l'init (cibles statiques), puis on
  // interpole les angles articulaires entre clés. Les prises (descente,
  // fermeture) partagent la même cible -> la pince est exactement sur le
  // cube au moment de la fermeture, sans réglage visuel.
  // Les clés de repos utilisent POSE directement (branche coude +1) ; les
  // clés de saisie sont en coude « en surplomb » (branche -1).
  const TOOL_DOWN = Math.PI; // pince orientée vers le bas
  const RAW_KEYS = [
    { p: 0.00, pose: POSE, turn: 0.00, grip: 0.18 },                                         // hero
    { p: 0.14, turn: PICK.turn,  r: PICK.r,  h: PICK.h + 0.9,  grip: GRIP_OPEN },            // survol du cube
    { p: 0.30, turn: PICK.turn,  r: PICK.r,  h: PICK.h,        grip: GRIP_OPEN },            // descente sur le cube
    { p: 0.36, turn: PICK.turn,  r: PICK.r,  h: PICK.h,        grip: GRIP_CLOSED },          // prise
    { p: 0.46, turn: PICK.turn,  r: PICK.r,  h: PICK.h + 1.0,  grip: GRIP_CLOSED },          // levée
    { p: 0.60, turn: PLACE.turn, r: PLACE.r, h: PLACE.h + 0.9, grip: GRIP_CLOSED },          // transfert (pivot)
    { p: 0.70, turn: PLACE.turn, r: PLACE.r, h: PLACE.h,       grip: GRIP_CLOSED },          // pose
    { p: 0.76, turn: PLACE.turn, r: PLACE.r, h: PLACE.h,       grip: GRIP_OPEN },            // lâcher
    { p: 0.86, turn: PLACE.turn, r: PLACE.r, h: PLACE.h + 1.0, grip: 0.24 },                 // dégagement
    { p: 1.00, pose: POSE, turn: 0.00, grip: 0.18 },                                         // repos
  ];
  const KEYS = RAW_KEYS.map((k) => {
    const ik = k.pose
      ? { t1: k.pose.shoulder, t2: k.pose.elbow, tw: k.pose.wrist }
      : solveIK(k.r, k.h, TOOL_DOWN, -1);
    return { p: k.p, turn: k.turn, grip: k.grip, shoulder: ik.t1, elbow: ik.t2, wrist: ik.tw };
  });
  // le cube est « tenu » entre la fermeture (0.36) et le lâcher (0.73)
  const HOLD_START = 0.36, HOLD_END = 0.73;

  function targetAt(p) {
    let a = KEYS[0], b = KEYS[0], t = 0;
    if (p >= KEYS[KEYS.length - 1].p) { a = b = KEYS[KEYS.length - 1]; }
    else {
      for (let i = 1; i < KEYS.length; i++) {
        if (p <= KEYS[i].p) { a = KEYS[i - 1]; b = KEYS[i]; break; }
      }
      t = b.p > a.p ? (p - a.p) / (b.p - a.p) : 0;
      t = t * t * (3 - 2 * t); // smoothstep : arrivée douce sur chaque clé
    }
    const lerp = (x, y) => x + (y - x) * t;
    return {
      turn: lerp(a.turn, b.turn),
      shoulder: lerp(a.shoulder, b.shoulder),
      elbow: lerp(a.elbow, b.elbow),
      wrist: lerp(a.wrist, b.wrist),
      grip: lerp(a.grip, b.grip),
    };
  }

  // Fenêtres de lisibilité (audit Sara/Kenji) : bras estompé sur les grilles
  // denses où l'œil scanne, quasi figé pendant le manifeste pinné (le moment
  // fort reste le texte). Plages normalisées mesurées sur le layout réel.
  const zones = []; // { start, end, opacity, idle }
  function measureZones() {
    zones.length = 0;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh || 1;
    const add = (el, opacity, idle) => {
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      zones.push({
        start: Math.max(0, (top - vh * 0.5) / max),
        end: Math.min(1, (top + el.offsetHeight - vh * 0.4) / max),
        opacity, idle,
      });
    };
    add(document.querySelector('.manifesto'), 0.55, 0.08); // présent mais silencieux
    add(document.getElementById('projets'), 0.35, 1);
    add(document.getElementById('competences'), 0.35, 1);
  }

  // ---------- Animation : respiration lente + chorégraphie amortie ----------
  const clock = new THREE.Clock();
  let pDoc = 0;  // progression 0..1 sur tout le document
  let pHero = 0; // progression 0..1 sur le seul hero (puce, sortie d'intro)
  let lastScrollAt = 0;

  // état courant amorti
  const cur = {
    turn: 0, shoulder: POSE.shoulder, elbow: POSE.elbow, wrist: POSE.wrist,
    grip: 0.18, y: 0.3, opacity: 1, idle: 1,
  };
  const DAMP = 0.08;
  const heldPos = new THREE.Vector3(); // tampon : position de prise en coordonnées root
  // « beat » lumineux : flash bref du cube à la prise et au lâcher, pour que
  // l'œil comprenne l'événement sans mouvement supplémentaire
  let wasHeld = false, beatAt = -1;

  function animate() {
    const t = clock.getElapsedTime();

    // cibles selon la position dans le document
    const pose = targetAt(pDoc);
    let opacityT = pHero < 0.75 ? 1 : 0.6; // hors hero : voile de lisibilité
    let idleT = 1;
    for (const z of zones) {
      if (pDoc >= z.start && pDoc <= z.end) { opacityT = z.opacity; idleT = z.idle; }
    }

    // amortissement (l'inertie organique vient d'ici)
    cur.turn += (pose.turn - cur.turn) * DAMP;
    cur.shoulder += (pose.shoulder - cur.shoulder) * DAMP;
    cur.elbow += (pose.elbow - cur.elbow) * DAMP;
    cur.wrist += (pose.wrist - cur.wrist) * DAMP;
    cur.grip += (pose.grip - cur.grip) * DAMP * 1.6; // la pince réagit un peu plus vite
    cur.y += ((0.3 - pDoc * 0.8) - cur.y) * DAMP; // glissement total <= 1 unité
    cur.opacity += (opacityT - cur.opacity) * DAMP;
    cur.idle += (idleT - cur.idle) * DAMP;

    // respiration unique très lente, superposée à la pose chorégraphiée
    // (remplace l'ancien balayage sinusoïdal, trop « screensaver »)
    const idle = cur.idle;
    turntable.rotation.y = cur.turn + Math.sin(t * 0.15) * 0.03 * idle;
    shoulder.rotation.z = cur.shoulder + Math.sin(t * 0.32) * 0.02 * idle;
    elbow.rotation.z = cur.elbow + Math.sin(t * 0.32 + 0.9) * 0.02 * idle;
    wrist.rotation.z = cur.wrist + Math.sin(t * 0.45 + 0.4) * 0.02 * idle;
    fingerL.position.x = -cur.grip;
    fingerR.position.x = cur.grip;

    // ---------- cube : tenu par la pince ou posé sur son socle ----------
    const held = pDoc >= HOLD_START && pDoc <= HOLD_END;
    if (held !== wasHeld) { wasHeld = held; beatAt = t; }
    const beat = beatAt >= 0 ? Math.max(0, 1 - (t - beatAt) * 2.5) : 0; // ~0.4 s de décroissance
    cube.material.emissiveIntensity = 0.7 + beat * 0.7;
    if (held) {
      // tenu : le cube suit le point de prise (FK des angles amortis réels)
      root.updateMatrixWorld();
      toolTip.getWorldPosition(heldPos);
      root.worldToLocal(heldPos);
      cube.position.lerp(heldPos, 0.35); // rattrapage rapide -> pas de saut visible
      cube.rotation.y += ((-cur.turn) - cube.rotation.y) * DAMP;
    } else {
      // posé : il rejoint (ou reste sur) le socle correspondant
      const seat = seatPosition(pDoc < HOLD_START ? PICK : PLACE);
      cube.position.lerp(seat, 0.18);
      cube.rotation.y += (0 - cube.rotation.y) * DAMP;
    }

    // respiration de la lumière d'accent (amplitude contenue)
    accentLight.intensity = 17 + Math.sin(t * 0.7) * 3;

    // puce : respiration lente, émissif resserré — elle respire, elle ne
    // clignote pas (0.6 rad/s au lieu de 1.8)
    const pulse = Math.sin(t * 0.6) * 0.5 + 0.5; // 0..1
    chipCore.material.emissiveIntensity = 1.0 + pulse * 0.9;
    traces.material.opacity = 0.28 + pulse * 0.22;
    padMat.emissiveIntensity = 0.55 + pulse * 0.45;
    chipGlow.intensity = 5.5 + pulse * 3.5;
    // les bandes d'accent du bras respirent au même souffle que la puce :
    // les deux versants (robotique / IA) vivent ensemble
    matAccent.emissiveIntensity = 0.5 + pulse * 0.15;
    netRoot.rotation.y = Math.sin(t * 0.25) * 0.22;

    // la puce appartient au hero : elle glisse vers le haut et disparaît
    netRoot.position.y = 0.4 + pHero * 2.2;
    netRoot.visible = pHero < 0.98;

    // dérive verticale douce + légère rotation du bras en sortie de hero
    root.position.y = cur.y;
    root.rotation.y = pHero * 0.25;

    renderer.domElement.style.opacity = cur.opacity.toFixed(3);
    renderer.render(scene, camera);
  }

  // ---------- Boucle : rendu à la demande ----------
  // Pleine cadence pendant le scroll et tant que la pose converge ;
  // ~20 fps de « respiration » quand tout est posé (batterie, condition Léa).
  let running = false;
  let rafId = null;
  let frameSkip = 0;
  function isSettled() {
    const pose = targetAt(pDoc);
    return (performance.now() - lastScrollAt) > 250 &&
      Math.abs(pose.turn - cur.turn) < 0.002 &&
      Math.abs(pose.shoulder - cur.shoulder) < 0.002 &&
      Math.abs(pose.grip - cur.grip) < 0.005;
  }
  function loop() {
    rafId = requestAnimationFrame(loop);
    if (isSettled() && (frameSkip = (frameSkip + 1) % 3) !== 0) return;
    animate();
  }
  function start() {
    if (running) return;
    running = true;
    clock.start();
    loop();
  }
  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    clock.stop();
  }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : (!smallMq.matches && start());
  });
  // perte de contexte WebGL (pression GPU, onglet longtemps caché) : le calque
  // est persistant sur toute la page, on coupe proprement via le fondu CSS
  // plutôt que de laisser un canvas figé derrière le contenu
  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    mount.classList.remove('ready');
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    if (!smallMq.matches) { mount.classList.add('ready'); start(); }
  });
  // bascule du seuil mobile après chargement : on coupe/reprend proprement
  smallMq.addEventListener('change', () => {
    if (smallMq.matches) { stop(); mount.classList.remove('ready'); }
    else { mount.classList.add('ready'); start(); }
  });

  // ---------- Suivi du scroll (progression hero + document) ----------
  const hero = document.querySelector('.hero');
  function onScroll() {
    const y = window.scrollY;
    const heroH = (hero ? hero.offsetHeight : window.innerHeight) || 1;
    const max = document.documentElement.scrollHeight - window.innerHeight || 1;
    pHero = Math.min(y / heroH, 1);
    pDoc = Math.min(y / max, 1);
    lastScrollAt = performance.now();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Redimensionnement ----------
  function onResize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    layoutForViewport();
    measureZones();
    onScroll();
  }
  window.addEventListener('resize', onResize);
  // re-mesure après chargement complet : les pin-spacers de ScrollTrigger
  // (manifeste) modifient la hauteur du document. init() ayant attendu le
  // téléchargement de Three.js, `load` peut être déjà passé : on vérifie.
  if (document.readyState === 'complete') { measureZones(); onScroll(); }
  else window.addEventListener('load', () => { measureZones(); onScroll(); });
  measureZones();

  // ---------- Apparition en fondu ----------
  start();
  requestAnimationFrame(() => mount.classList.add('ready'));
}
