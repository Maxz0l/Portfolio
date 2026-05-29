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

  // ---------- Pose de repos (figée, lisible) : bras qui "atteint" ----------
  // angles de base autour desquels oscille la micro-animation
  const POSE = { shoulder: -0.55, elbow: 1.15, wrist: -0.35 };
  shoulder.rotation.z = POSE.shoulder;   // épaule inclinée vers l'arrière
  elbow.rotation.z = POSE.elbow;         // coude nettement plié
  wrist.rotation.z = POSE.wrist;         // poignet orienté vers l'avant

  // ---------- Cadrage : bras décalé à droite, légèrement incliné ----------
  function layoutForViewport() {
    // décalage horizontal proportionnel à la largeur (le texte occupe le centre/gauche)
    const aspect = mount.clientWidth / mount.clientHeight;
    root.position.x = aspect > 1.4 ? 3.4 : 2.1;
    root.scale.setScalar(aspect > 1.4 ? 0.8 : 0.66);
  }
  root.rotation.z = -0.16;
  root.position.y = 0.1;
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

    // parallaxe au scroll : le bras pivote et glisse légèrement
    root.rotation.y = scrollT * 0.4;
    root.position.y = 0.1 - scrollT * 1.2;

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
