---
name: hero3d-visual-check
description: Capture un screenshot du hero de index.html (couche 3D Three.js incluse) via Chromium headless, pour un feedback visuel avant de pousser une modification de hero3d.js, main.js ou style.css. À utiliser quand Enzo demande de vérifier/juger le rendu du bras robotique, de la puce électronique, du cadrage, des animations de scroll, ou de tout changement visuel. Nécessite puppeteer (installé dans un dossier scratch hors repo, jamais commité).
---

# Vérification visuelle du hero 3D / du scroll

Ce projet est du HTML/CSS/JS pur sans build, donc pas de dev server par défaut. Pour juger visuellement un changement (position du bras, de la puce, cadrage responsive, révélations au scroll, manifeste pinné) sans attendre un déploiement GitHub Pages, on sert le repo en local et on capture un screenshot avec Chromium headless.

## Environnement / shell (à connaître avant de lancer)

Le tool **Bash** de Claude Code s'exécute :
- **Windows** : via **Git Bash** (Git for Windows), auto-détecté par défaut. `~`, `/tmp`, `kill`, `command -v` fonctionnent donc. (Fallback PowerShell seulement si Git Bash absent, ou si `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` — dans ce cas, voir les notes « PowerShell/cmd » plus bas.)
- **Linux / macOS** (ex : sessions Claude Code sur le web) : bash natif.

Les commandes ci-dessous sont **portables** : un seul jeu qui marche en Git Bash (Windows) comme en bash (Linux/mac). C'est volontaire — le repo est édité depuis deux OS (Windows en local + conteneur Linux distant), un skill mono-plateforme casserait l'un des deux.

## Pourquoi ces contraintes

- **Three.js + WebGL en headless** : les flags Chromium par défaut ne donnent pas accès au GPU. Il faut forcer SwiftShader (rendu logiciel) sinon le canvas reste noir/vide.
- **CDN bloqué (conteneur distant)** : la politique réseau du conteneur bloque jsdelivr/unpkg. C'est pour ça que `assets/vendor/*` (Three.js, GSAP, ScrollTrigger, Lenis) est hébergé en local — ne pas réintroduire de CDN dans les scripts de test.
- **puppeteer hors du repo** : ne pas l'ajouter aux dépendances du projet (pas de `package.json`, pas de build). L'installer dans un dossier scratch sous le profil utilisateur, jamais commité.

## Étapes

Toutes les commandes se lancent **depuis la racine du repo** (le dossier courant de la session). On utilise deux variables pour rester portable :

```bash
# dossier scratch hors repo (Git Bash: ~ -> C:/Users/<toi> ; Linux: $HOME)
SCRATCH="$HOME/portfolio-visual-check"
# runtime Python disponible (Windows: souvent 'python' ou 'py' ; Linux: 'python3')
PY=$(command -v python3 || command -v python || command -v py)
```

1. Installer puppeteer dans le scratch (une seule fois) :
   ```bash
   mkdir -p "$SCRATCH"
   ( cd "$SCRATCH" && npm init -y >/dev/null 2>&1 && npm install puppeteer >/dev/null 2>&1 )
   ```

2. Servir le repo en local (depuis la racine du repo), en capturant le PID pour l'arrêter proprement :
   ```bash
   "$PY" -m http.server 8420 >/dev/null 2>&1 &
   SERVER_PID=$!
   ```

3. Écrire le script de capture DANS le scratch (jamais dans le repo, pour ne pas polluer `git status`) :
   ```js
   // "$SCRATCH/shot.mjs"
   import puppeteer from 'puppeteer';

   const width  = process.argv[2] ? Number(process.argv[2]) : 1440;
   const height = process.argv[3] ? Number(process.argv[3]) : 900;
   const out    = process.argv[4] || 'shot.png';           // chemin relatif au scratch
   const scrollY = process.argv[5] ? Number(process.argv[5]) : 0;

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
   await new Promise(r => setTimeout(r, 1200));           // fade-in .hero-3d.ready + stabilisation
   if (scrollY) { await page.evaluate(y => window.scrollTo(0, y), scrollY);
                  await new Promise(r => setTimeout(r, 700)); } // inertie/scrub du scroll
   await page.screenshot({ path: out });
   await browser.close();
   console.log('saved', out);
   ```

4. Lancer pour plusieurs largeurs (toujours 1280 ET 1920, le cadrage du hero dépend de l'aspect ratio) et plusieurs positions de scroll :
   ```bash
   cd "$SCRATCH"
   node shot.mjs 1280 800  shot-1280.png
   node shot.mjs 1920 1080 shot-1920.png
   node shot.mjs 390  844  shot-mobile.png            # 3D désactivée <=860px (attendu)
   node shot.mjs 1440 900  shot-scroll-mid.png 1700   # révélations au scroll
   cd -   # retour à la racine du repo
   ```

5. Lire les images avec le tool Read (chemin `"$SCRATCH/shot-*.png"`) pour juger le rendu, avant de statuer sur un ajustement de `hero3d.js`, `main.js` ou `style.css`.

6. Arrêter le serveur HTTP local :
   ```bash
   kill "$SERVER_PID"
   ```

### Notes PowerShell / cmd (si Git Bash absent)

Si Claude Code tombe en PowerShell/cmd (rare), les équivalents :
- scratch : `$env:USERPROFILE\portfolio-visual-check`
- lancer le serveur : `Start-Process python -ArgumentList '-m','http.server','8420'` (PowerShell)
- arrêter : `taskkill /IM python.exe /F` (cmd) ou `Stop-Process -Name python` (PowerShell)

Dans ce cas, préférer réactiver Git Bash (installer Git for Windows) pour retrouver le jeu de commandes portable ci-dessus.

## Points de vigilance déjà rencontrés sur ce projet

- Le cadrage du bras et de la puce est **proportionnel** (`halfW = tan(fov/2) * cameraZ * aspect`), pas en position fixe — un changement doit être revérifié à plusieurs largeurs (1280 à 1920), pas une seule capture.
- En dessous de 860px la couche 3D est désactivée (`isSmall`) — un screenshot mobile doit montrer le hero sans canvas, c'est le comportement attendu, pas un bug.
- Ne pas juger uniquement sur une capture immédiate après `goto` : fade-in CSS (`.hero-3d.ready`) + pose initiale encore animée — attendre ~1s avant de capturer.
- Pour le **scroll** (Lenis + GSAP), capturer à plusieurs `scrollY` et attendre ~700ms après le scroll (inertie/scrub). Vérifier aussi une capture `prefers-reduced-motion` (émulable via `page.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}])`) : le contenu doit rester pleinement visible.
