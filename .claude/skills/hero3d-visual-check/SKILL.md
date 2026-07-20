---
name: hero3d-visual-check
description: Capture un screenshot du hero de index.html (couche 3D Three.js incluse) via Chromium headless, pour un feedback visuel avant de pousser une modification de hero3d.js ou style.css. À utiliser quand Enzo demande de vérifier/juger le rendu du bras robotique, de la puce électronique, du cadrage, ou de tout changement visuel sur le hero. Nécessite puppeteer (installé localement dans le projet, hors du repo git).
---

# Vérification visuelle du hero 3D

Ce projet est du HTML/CSS/JS pur sans build, donc pas de dev server par défaut. Pour juger visuellement un changement (position du bras, de la puce, du cadrage responsive, etc.) sans attendre un déploiement GitHub Pages, on sert le repo en local et on capture un screenshot avec Chromium headless.

## Pourquoi ces contraintes

- **Three.js + WebGL en headless** : les flags Chromium par défaut ne donnent pas accès au GPU. Il faut forcer SwiftShader (rendu logiciel) sinon le canvas reste noir/vide.
- **CDN bloqué** : la politique réseau de l'environnement bloque jsdelivr/unpkg. C'est pour ça que `assets/vendor/three.module.js` est hébergé en local — ne pas réintroduire de CDN dans les scripts de test.
- **puppeteer hors du repo** : ne pas l'ajouter aux dépendances du projet (le projet n'a pas de `package.json`, pas de build). L'installer dans un dossier scratch, jamais commité.

## Étapes

1. Vérifier/installer puppeteer dans un dossier hors repo (ex: le scratchpad) :
   ```bash
   cd /tmp/claude-scratch-puppeteer && npm init -y >/dev/null 2>&1; npm install puppeteer >/dev/null 2>&1
   ```

2. Servir le repo en local (port libre, ex 8420) :
   ```bash
   cd /home/user/Portfolio && python3 -m http.server 8420 &
   ```

3. Écrire le script de capture DANS le dossier scratch puppeteer (pas dans le repo, pour ne pas polluer git status) :
   ```js
   // /tmp/claude-scratch-puppeteer/shot.mjs
   import puppeteer from 'puppeteer';

   const width = process.argv[2] ? Number(process.argv[2]) : 1440;
   const height = process.argv[3] ? Number(process.argv[3]) : 900;
   const out = process.argv[4] || '/tmp/portfolio-screenshot.png';

   const browser = await puppeteer.launch({
     headless: 'new',
     args: [
       '--enable-unsafe-swiftshader',
       '--use-gl=angle',
       '--use-angle=swiftshader',
       '--no-sandbox',
     ],
   });
   const page = await browser.newPage();
   await page.setViewport({ width, height });
   await page.goto('http://localhost:8420/index.html', { waitUntil: 'networkidle0' });
   // laisser le temps au fade-in .hero-3d.ready + à la scène de se stabiliser
   await new Promise(r => setTimeout(r, 1200));
   await page.screenshot({ path: out });
   await browser.close();
   console.log('saved to', out);
   ```

4. Lancer pour une ou plusieurs largeurs (toujours tester au moins 1280 et 1920, le cadrage proportionnel du hero dépend de l'aspect ratio) :
   ```bash
   cd /tmp/claude-scratch-puppeteer
   node shot.mjs 1280 800 /tmp/portfolio-1280.png
   node shot.mjs 1920 1080 /tmp/portfolio-1920.png
   node shot.mjs 390 844 /tmp/portfolio-mobile.png   # vérifie que la 3D est bien désactivée (<=860px)
   ```

5. Lire les images avec le tool Read pour juger le rendu, avant de statuer sur un ajustement de `hero3d.js` (positions, cadrage FOV) ou `style.css`.

6. Arrêter le serveur HTTP local une fois fini :
   ```bash
   kill %1  # ou pkill -f "http.server 8420"
   ```

## Points de vigilance déjà rencontrés sur ce projet

- Le cadrage du bras et de la puce est **proportionnel** (`halfW = tan(fov/2) * cameraZ * aspect`), pas en position fixe — un changement doit être revérifié à plusieurs largeurs (1280 à 1920), pas une seule capture.
- En dessous de 860px la couche 3D est désactivée (`isSmall`) — un screenshot mobile doit montrer le hero sans canvas, c'est le comportement attendu, pas un bug.
- Ne pas juger uniquement sur une capture immédiate après `goto` : la scène a un fade-in CSS (`opacity` sur `.hero-3d.ready`) et une pose initiale qui peut encore s'animer légèrement — attendre ~1s avant de capturer.
