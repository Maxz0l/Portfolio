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
  camera.position.set(0, 0.4, 9);
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
  function segment(length, radius, mat) {
    // un "os" de bras : cylindre vertical dont la base est en y=0
    const g = new THREE.CylinderGeometry(radius, radius * 0.92, length, 24);
    g.translate(0, length / 2, 0);
    return new THREE.Mesh(g, mat);
  }
  function jointRing(radius) {
    const g = new THREE.TorusGeometry(radius, radius * 0.32, 16, 28);
    g.rotateX(Math.PI / 2);
    return new THREE.Mesh(g, matAccent);
  }

  // ---------- Assemblage du bras (hiérarchie de pivots) ----------
  // root -> base -> turntable -> shoulder -> upperArm -> elbow -> forearm -> wrist -> gripper
  const root = new THREE.Group();
  scene.add(root);

  // socle
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.25, 0.45, 32), matDark);
  base.position.y = -2.6;
  root.add(base);

  // plateau tournant
  const turntable = new THREE.Group();
  turntable.position.y = -2.35;
  root.add(turntable);
  const tt = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.4, 28), matBody);
  turntable.add(tt);

  // épaule
  const shoulder = new THREE.Group();
  shoulder.position.y = 0.2;
  turntable.add(shoulder);
  shoulder.add(jointRing(0.5));
  const upperArm = segment(2.2, 0.42, matBody);
  shoulder.add(upperArm);

  // coude (en haut du bras supérieur)
  const elbow = new THREE.Group();
  elbow.position.y = 2.2;
  shoulder.add(elbow);
  elbow.add(jointRing(0.42));
  const forearm = segment(1.9, 0.34, matBody);
  elbow.add(forearm);

  // poignet
  const wrist = new THREE.Group();
  wrist.position.y = 1.9;
  elbow.add(wrist);
  wrist.add(jointRing(0.32));

  // pince (deux doigts)
  const gripper = new THREE.Group();
  gripper.position.y = 0.15;
  wrist.add(gripper);
  const fingerGeo = new THREE.BoxGeometry(0.14, 0.6, 0.3);
  fingerGeo.translate(0, 0.3, 0);
  const fingerL = new THREE.Mesh(fingerGeo, matAccent);
  const fingerR = new THREE.Mesh(fingerGeo, matAccent);
  fingerL.position.x = -0.28;
  fingerR.position.x = 0.28;
  gripper.add(fingerL, fingerR);

  // ---------- Cadrage : bras décalé à droite, légèrement incliné ----------
  function layoutForViewport() {
    // décalage horizontal proportionnel à la largeur (le texte occupe le centre/gauche)
    const aspect = mount.clientWidth / mount.clientHeight;
    root.position.x = aspect > 1.4 ? 3.0 : 1.8;
    root.scale.setScalar(aspect > 1.4 ? 1 : 0.82);
  }
  root.rotation.z = -0.12;
  root.position.y = 0.3;
  layoutForViewport();

  // ---------- Animation idle : mouvement lent et organique ----------
  const clock = new THREE.Clock();
  let scrollT = 0; // 0 en haut, 1 quand le hero est sorti

  function animate() {
    const t = clock.getElapsedTime();

    // rotation continue du plateau (balayage)
    turntable.rotation.y = Math.sin(t * 0.35) * 0.6;

    // articulations : sinusoïdes déphasées -> geste fluide
    shoulder.rotation.z = -0.35 + Math.sin(t * 0.5) * 0.18;
    elbow.rotation.z = 0.6 + Math.sin(t * 0.5 + 0.9) * 0.22;
    wrist.rotation.z = Math.sin(t * 0.7 + 0.4) * 0.25;

    // pince qui s'ouvre/se ferme doucement
    const grip = 0.18 + (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.18;
    fingerL.position.x = -grip;
    fingerR.position.x = grip;

    // respiration de la lumière d'accent
    accentLight.intensity = 16 + Math.sin(t * 1.3) * 5;

    // parallaxe au scroll : le bras pivote et glisse légèrement
    root.rotation.y = scrollT * 0.5;
    root.position.y = 0.3 - scrollT * 1.2;

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
