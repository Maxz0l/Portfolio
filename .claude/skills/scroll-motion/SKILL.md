---
name: scroll-motion
description: Animations de scroll "wow élégant" pour le portfolio (GSAP + ScrollTrigger + Lenis vendorisés en local). À utiliser quand Enzo demande d'ajouter/ajuster du smooth scroll, des révélations au scroll, du parallaxe, du pinning de section, ou tout mouvement "organique" lié au défilement. Contient l'ordre de chargement, l'intégration Lenis↔ScrollTrigger↔hero3d, les patterns prêts à l'emploi, les règles de perf et le fallback reduced-motion.
---

# Scroll-motion — le "wow élégant" du portfolio

Stack actée (débat conseil, cf. CLAUDE.md) : **GSAP 3.15 + ScrollTrigger + Lenis 1.3**, vendorisés en local dans `assets/vendor/` (pas de CDN, pas de build — même logique que Three.js). Intensité visée : **wow élégant au service du contenu**, jamais démo Awwwards gratuite. La cible inclut de grands groupes conservateurs (Alstom/Thales/Siemens) : chaque animation doit *révéler* le contenu, rester lisible en 30 s, et ne jamais gêner la lecture.

## Fichiers vendorisés

- `assets/vendor/gsap.min.js` (~73 Ko) — moteur d'animation, expose le global `gsap`
- `assets/vendor/ScrollTrigger.min.js` (~45 Ko) — plugin scroll, expose `ScrollTrigger`
- `assets/vendor/lenis.min.js` (~18 Ko) — smooth scroll inertiel, expose `Lenis`

Ce sont des builds **UMD (globaux)** volontairement : `main.js` est un script classique (pas un module ES), il consomme `window.gsap` / `window.ScrollTrigger` / `window.Lenis` directement. Ne pas repasser en ESM sans raison — ça casserait la simplicité de main.js. (Exception rappel : seul `hero3d.js` est un module ES, pour Three.js.)

## Ordre de chargement (dans les 3 pages HTML)

Les libs doivent être chargées **avant** `main.js`, dans cet ordre (ScrollTrigger dépend de gsap) :

```html
<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/vendor/ScrollTrigger.min.js"></script>
<script src="assets/vendor/lenis.min.js"></script>
<script src="assets/js/main.js"></script>
```

Répercuter dans `index.html`, `projets.html`, `experiences.html` (règle de cohérence multi-pages).

## Intégration Lenis ↔ ScrollTrigger (À NE PAS OUBLIER)

Lenis prend la main sur le scroll natif. Sans synchro, ScrollTrigger calcule les positions sur le scroll natif et tout se décale. Câblage canonique dans `main.js` :

```js
if (window.Lenis && !prefersReducedMotion()) {
  const lenis = new Lenis({
    duration: 1.1,              // inertie : 1.0–1.2 = fluide sans être mou
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
    smoothWheel: true,
  });
  // pilote Lenis avec le ticker gsap (une seule horloge, pas de double RAF)
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // informe ScrollTrigger à chaque frame de scroll
  lenis.on('scroll', ScrollTrigger.update);
}
```

`prefersReducedMotion()` = helper à définir (`window.matchMedia('(prefers-reduced-motion: reduce)').matches`). Si réduit : **ne pas** instancier Lenis (scroll natif), et rendre les animations instantanées (voir plus bas).

## Coordination avec hero3d.js (piège connu)

`hero3d.js` a sa propre parallaxe qui lit `window.scrollY`. Avec Lenis, `window.scrollY` bouge toujours (Lenis scrolle réellement la page), donc la parallaxe du hero continue de fonctionner — mais elle peut légèrement "retarder" par rapport aux éléments animés via ScrollTrigger. Si un décalage se voit : faire lire à hero3d la valeur de scroll via `ScrollTrigger` ou exposer le `lenis` sur `window` et lire `lenis.scroll`. Vérifier au screenshot avant de conclure.

## Patterns "wow élégant" (à privilégier)

1. **Révélation au scroll (le pain quotidien)** — apparition douce + léger translate-up, échelonnée par groupe. Utiliser `ScrollTrigger.batch` pour les grilles (piliers, cartes projet, skills) :
   ```js
   gsap.set('.reveal', { opacity: 0, y: 24 });
   ScrollTrigger.batch('.reveal', {
     start: 'top 85%',
     onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out' }),
     once: true,
   });
   ```
2. **Parallaxe de section** — fonds/halos qui glissent plus lentement que le contenu (`yPercent` piloté par `scrub: true`). Subtil : amplitude 5–15 %, jamais plus.
3. **Pinning d'UN moment fort** — épingler une section clé (ex : la timeline d'expérience, ou une "phrase manifeste") pendant que son contenu se compose. Un seul pin marquant sur tout le site, pas trois.
4. **Progress line / compteur de scroll** — fine barre orange de progression (charte), discrète, en haut. Renforce la sensation de parcours.

## Règles de perf (Léa) — NON NÉGOCIABLES

- Animer **uniquement `transform` et `opacity`**. Jamais `top/left/width/height/margin` (reflow → jank).
- `will-change: transform` seulement sur les éléments réellement animés, retiré après (`ScrollTrigger` le gère souvent seul ; ne pas en abuser).
- `scrub: true` pour lier au scroll ; pour un scrub "lissé" mettre `scrub: 0.5` (retard doux) plutôt que des valeurs élevées.
- `ScrollTrigger.refresh()` après tout changement de layout (chargement d'images, fonts).
- Tester la fluidité à plusieurs largeurs ET en throttling CPU (le hero charge déjà Three.js ~1,2 Mo).

## Fallback accessibilité (obligatoire, comme le hero 3D)

- `prefers-reduced-motion: reduce` → **pas de Lenis** (scroll natif), et les révélations passent en état final immédiat :
  ```js
  if (prefersReducedMotion()) {
    gsap.set('.reveal', { opacity: 1, y: 0 });
    return; // ne pas créer de ScrollTrigger animés
  }
  ```
- Le contenu doit être **entièrement lisible sans JS** (les éléments `.reveal` ne doivent pas être `opacity:0` en CSS de base — c'est le JS qui les masque, pour ne jamais cacher le contenu si le JS échoue).

## Vérification visuelle avant de pousser

Utiliser le skill **`hero3d-visual-check`** (Chromium headless + SwiftShader), mais pour le scroll il faut capturer **à plusieurs positions de défilement** : dans le script Puppeteer, `page.evaluate(() => window.scrollTo(0, Y))` puis attendre ~400 ms (le temps de l'inertie/scrub) avant `screenshot`. Capturer haut / milieu / bas de page pour juger le rythme des révélations. Toujours vérifier aussi une capture `prefers-reduced-motion` (émulable via `page.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}])`) pour confirmer que le contenu reste visible.

## Sources d'animations prêtes à l'emploi

Voir `REFERENCES.md` dans ce dossier : liste curée de sites (Osmo, Codrops, démos GSAP/ScrollTrigger, exemples Lenis, galeries d'inspiration) où trouver des effets déjà codés à adapter à la charte — jamais copier tel quel sans reprendre palette/typo/espacement du design system.
