// ===========================================================
// ENZO LORANDI - PORTFOLIO
// Couche WOW (index uniquement) : bras robotique 3D procédural
//
// Principes (validés par l'équipe) :
//  - Three.js via CDN/import map, aucune dépendance build
//  - Sobre, monochrome orange/sombre (charte) — pas de néon
//  - Robustesse > ambition : fallback propre sur mobile,
//    prefers-reduced-motion et absence de WebGL (on garde le hero CSS)
//  - Rendu en pause hors écran et onglet caché (perf / batterie)
//  - Géométrie construite en pivots pour pouvoir, plus tard,
//    « poser » le bras dans la main d'une photo détourée
// ===========================================================

const mount = document.getElementById('hero3d');

// ---------- Garde-fous : ne pas initialiser si inadapté ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = window.matchMedia('(max-width: 860px)').matches;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

if (mount && !reduceMotion && !isSmall && webglAvailable()) {
  init();
}

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
  mount.appendChild(renderer.domElement);

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
  const matBody = new THREE.MeshStandardMaterial({ color: COL_BODY, metalness: 0.55, roughness: 0.42 });
  const matDark = new THREE.MeshStandardMaterial({ color: COL_DARK, metalness: 0.6, roughness: 0.5 });
  const matAccent = new THREE.MeshStandardMaterial({
    color: COL_ACCENT, metalness: 0.3, roughness: 0.45,
    emissive: COL_ACCENT, emissiveIntensity: 0.55
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
  const fingerL = new THREE.Mesh(fingerGeo, matAccent);
  const fingerR = new THREE.Mesh(fingerGeo, matAccent);
  gripper.add(fingerL, fingerR);

  // ---------- Pose de repos (figée, lisible) : bras qui tend vers le nom ----------
  // angles de base autour desquels oscille la micro-animation
  // épaule très inclinée + coude plié -> la pince pointe vers le haut-gauche (le nom)
  const POSE = { shoulder: -0.85, elbow: 1.25, wrist: -0.5 };
  shoulder.rotation.z = POSE.shoulder;
  elbow.rotation.z = POSE.elbow;
  wrist.rotation.z = POSE.wrist;

  // ===========================================================
  // Élément gauche : cerveau stylisé en fond + puce électronique
  // par-dessus, qui pulse en orange (versant IA).
  // ===========================================================
  const netRoot = new THREE.Group();
  scene.add(netRoot);

  // --- cerveau : deux hémisphères lisses + filaments neuronaux lumineux ---
  const brainMat = new THREE.MeshStandardMaterial({
    color: 0x120f18, emissive: COL_ACCENT, emissiveIntensity: 0.05,
    metalness: 0.1, roughness: 0.95, transparent: true, opacity: 0.55
  });
  // matériau additif pour les filaments (donne le côté "réseau neuronal")
  const filamentMat = new THREE.LineBasicMaterial({
    color: COL_ACCENT, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending
  });
  // halo de contour (fresnel simulé) : coque BackSide qui glow sur la silhouette
  const haloMat = new THREE.MeshBasicMaterial({
    color: COL_ACCENT, transparent: true, opacity: 0.12,
    side: THREE.BackSide, blending: THREE.AdditiveBlending
  });
  // déformation douce partagée -> même galbe pour solide / halo / filaments
  function deform(g, seed) {
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n =
        Math.sin(v.x * 3.1 + seed) * Math.cos(v.y * 2.7) +
        Math.sin(v.y * 3.4 + 1.3) * Math.cos(v.z * 3.0) +
        Math.sin(v.z * 2.8 + 2.1) * Math.cos(v.x * 3.3);
      v.multiplyScalar(1 + n * 0.028);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }
  function makeLobe(seed) {
    const lobe = new THREE.Group();
    // volume lisse
    const gSolid = deform(new THREE.IcosahedronGeometry(1.05, 4), seed);
    lobe.add(new THREE.Mesh(gSolid, brainMat));
    // halo de contour légèrement plus grand
    const gHalo = deform(new THREE.IcosahedronGeometry(1.05, 3), seed);
    const halo = new THREE.Mesh(gHalo, haloMat);
    halo.scale.setScalar(1.07);
    lobe.add(halo);
    // filaments épars et propres (subdivision basse -> grandes facettes élégantes)
    const gWire = deform(new THREE.IcosahedronGeometry(1.05, 2), seed);
    lobe.add(new THREE.LineSegments(new THREE.WireframeGeometry(gWire), filamentMat));
    return lobe;
  }
  const brain = new THREE.Group();
  const lobeL = makeLobe(0.0); lobeL.position.x = -0.5; lobeL.scale.set(0.9, 1.1, 1.2);
  const lobeR = makeLobe(2.5); lobeR.position.x = 0.5; lobeR.scale.set(0.9, 1.1, 1.2);
  brain.add(lobeL, lobeR);
  brain.position.z = -0.9; // en retrait, derrière la puce
  netRoot.add(brain);

  // halo orange diffus derrière le cerveau
  const brainGlow = new THREE.PointLight(COL_ACCENT, 6, 9, 2);
  brainGlow.position.set(0, 0, -1.8);
  netRoot.add(brainGlow);

  // --- puce électronique posée par-dessus (légèrement basculée) ---
  const chip = new THREE.Group();
  chip.position.set(0, -0.2, 0.9); // centré sur la masse du cerveau
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

  // ---------- Cadrage : bras à droite, cerveau+puce à gauche ----------
  function layoutForViewport() {
    const aspect = mount.clientWidth / mount.clientHeight;
    const wide = aspect > 1.4;
    root.position.x = wide ? 3.8 : 2.4;
    root.scale.setScalar(wide ? 0.8 : 0.64);
    netRoot.position.x = wide ? -4.7 : -2.9;
    netRoot.scale.setScalar(wide ? 0.95 : 0.62);
  }
  root.rotation.z = 0;
  root.position.y = 0.3;
  netRoot.position.y = 0.4;
  layoutForViewport();

  // ---------- Micro-animation : pose stable + respiration discrète ----------
  const clock = new THREE.Clock();
  let scrollT = 0; // 0 en haut, 1 quand le hero est sorti

  function animate() {
    const t = clock.getElapsedTime();

    // léger balayage du plateau, amplitude faible (reste lisible)
    turntable.rotation.y = Math.sin(t * 0.3) * 0.22;

    // micro-oscillations autour de la pose de repos
    shoulder.rotation.z = POSE.shoulder + Math.sin(t * 0.5) * 0.05;
    elbow.rotation.z = POSE.elbow + Math.sin(t * 0.5 + 0.9) * 0.06;
    wrist.rotation.z = POSE.wrist + Math.sin(t * 0.7 + 0.4) * 0.05;

    // pince qui respire (ouverture/fermeture légère)
    const grip = 0.16 + (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.1;
    fingerL.position.x = -grip;
    fingerR.position.x = grip;

    // respiration de la lumière d'accent
    accentLight.intensity = 16 + Math.sin(t * 1.3) * 5;

    // cerveau + puce : pulsation orange (battement)
    const pulse = Math.sin(t * 1.8) * 0.5 + 0.5; // 0..1
    chipCore.material.emissiveIntensity = 0.7 + pulse * 1.8;
    traces.material.opacity = 0.22 + pulse * 0.4;
    padMat.emissiveIntensity = 0.4 + pulse * 0.9;
    filamentMat.opacity = 0.18 + pulse * 0.3;
    brainGlow.intensity = 4 + pulse * 7;
    brainMat.emissiveIntensity = 0.04 + pulse * 0.1;
    // léger flottement 3D de l'ensemble
    netRoot.rotation.y = Math.sin(t * 0.25) * 0.22;

    // parallaxe au scroll : les deux éléments glissent légèrement
    root.rotation.y = scrollT * 0.4;
    root.position.y = 0.3 - scrollT * 1.2;
    netRoot.position.y = 0.4 - scrollT * 1.0;

    renderer.render(scene, camera);
  }

  // ---------- Boucle avec pause hors-écran / onglet caché ----------
  let running = false;
  let rafId = null;
  function loop() {
    rafId = requestAnimationFrame(loop);
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

  // ne tourne que quand le hero est visible
  const hero = document.querySelector('.hero');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { e.isIntersecting ? start() : stop(); });
  }, { threshold: 0.05 });
  if (hero) io.observe(hero);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : (hero && start());
  });

  // suivi du scroll (normalisé sur la hauteur du hero)
  function onScroll() {
    const h = (hero ? hero.offsetHeight : window.innerHeight) || 1;
    scrollT = Math.min(window.scrollY / h, 1);
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
  }
  window.addEventListener('resize', onResize);

  // ---------- Apparition en fondu ----------
  start();
  requestAnimationFrame(() => mount.classList.add('ready'));
}
