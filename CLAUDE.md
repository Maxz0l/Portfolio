# CLAUDE.md — Portfolio Enzo Lorandi

Ce fichier guide Claude Code dans le développement de ce projet. Lis-le entièrement avant toute modification.

## Vue d'ensemble

Portfolio personnel d'**Enzo Lorandi**, ingénieur ETI (CPE Lyon) spécialisé en **robotique de service** : électronique, systèmes embarqués, robotique et IA appliquée.

Objectif du site : montrer l'étendue et la profondeur technique du profil, et donner envie d'engager la conversation (labo, startup ou grand groupe industriel). Le profil est différenciant et doit être assumé, pas dilué.

> **Décision du 2026-07-23 : le site se positionne sur ce qu'Enzo sait faire, pas sur ce qu'il cherche.** Aucune mention de « PFE », de « à la recherche de » ni de date de disponibilité - ne rien réintroduire de tel sans son accord explicite. Conséquence assumée : le site n'a pas d'appel à l'action daté.

## Stack technique

- **HTML / CSS / JavaScript pur** — aucun framework, aucune dépendance build.
- Hébergement cible : **GitHub Pages** (statique uniquement, pas de PHP ni backend).
- Polices **auto-hébergées** (`assets/fonts/`, 20 woff2 latin + latin-ext, `assets/css/fonts.css` avec `unicode-range`) : `Space Grotesk` (titres), `Inter` (corps), `JetBrains Mono` (labels techniques). Plus aucun appel à Google Fonts (décision du 2026-07-24 : alignement sur la doctrine « tout vendorisé », LCP, RGPD).

## Architecture du projet

```
/
├── index.html          # Accueil one-page scrollable (6 sections) + JSON-LD Person
├── projets.html        # Détail des 7 projets
├── experiences.html    # Timeline parcours (RATP, Padoue, CPE)
├── 404.html            # Page introuvable en charte (chemins absolus /Portfolio/, servie par GitHub Pages)
├── robots.txt · sitemap.xml · .nojekyll · README.md   # Fondations SEO / GitHub Pages
└── assets/
    ├── css/style.css        # TOUT le design system + styles partagés (fichier unique)
    ├── css/fonts.css        # @font-face des polices auto-hébergées (généré depuis l'API css2)
    ├── fonts/               # 20 woff2 (Space Grotesk 400-700, Inter 300-600, JetBrains Mono 400-500)
    ├── js/main.js           # JS partagé 3 pages (nav, scroll, reveal, smooth scroll Lenis + GSAP)
    ├── js/hero3d.js         # Module ES, accueil uniquement : bras compagnon 3D (Three.js, calque fixe)
    ├── vendor/three.module.min.js  # Three.js r160 minifié, hébergé en local (pas de CDN)
    ├── vendor/gsap.min.js       # GSAP 3.15 (moteur d'animation) — global `gsap`
    ├── vendor/ScrollTrigger.min.js # Plugin scroll GSAP — global `ScrollTrigger`
    ├── vendor/lenis.min.js      # Lenis 1.3 (smooth scroll inertiel) — global `Lenis`
    └── img/                 # Images (favicon, og-image, photos projets, photo perso à venir)
```

### Conventions structurelles (décisions actées, à respecter)

- **HTML dupliqué par page** : la nav et le footer sont écrits en dur dans chaque fichier (pas d'injection JS). Raison : robustesse, SEO, pas de flash de chargement. Si tu modifies la nav ou le footer, **répercute le changement dans les 3 fichiers**.
- **CSS unique et partagé** : un seul `style.css`. Le design reste centralisé.
- **JS** : `main.js` partagé sur les 3 pages (nav, scroll, reveal). Exception assumée : `hero3d.js`, module ES chargé **uniquement sur l'accueil** pour la couche WOW 3D — séparé pour ne pas charger Three.js (~670 Ko) sur les pages où il est inutile.
- **Three.js hébergé en local** (`assets/vendor/three.module.min.js`, build minifié officiel r160 du package npm, ~670 Ko) via import map, pas de CDN externe — robustesse et conformité « pas de dépendance build ».
- **Librairies d'animation hébergées en local** (`assets/vendor/gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js`) en builds UMD (globaux), chargées via `<script>` classiques **avant `main.js`** (ordre : gsap → ScrollTrigger → lenis → main.js). Pas de CDN, pas de build. `main.js` reste un script classique et consomme les globaux ; seul `hero3d.js` est un module ES. Voir le skill `scroll-motion` pour l'intégration Lenis↔ScrollTrigger.
- **Navigation** : nav fixe identique partout. Depuis les pages détail, les liens pointent vers `index.html#section`. La page active porte la classe `.active`.

## Design system (NE PAS dévier sans validation)

Toutes les valeurs sont définies en variables CSS dans `:root` (voir `style.css`). Utilise toujours les variables, jamais de valeurs en dur.

### Palette — dark cyber, accent orange ambre
- `--bg: #0a0a0f` — fond noir bleuté
- `--surface: #13131c` / `--surface-2: #1a1a26` — surfaces/cartes
- `--accent: #ff8c1a` — orange (accent principal)
- `--accent-light: #ffb45c` — orange clair (hovers, dégradés)
- `--text: #f0eee8` — blanc chaud / `--text-muted: #8a8578` — gris chaud
- `--border: rgba(255,255,255,0.08)`

### Règle d'or sur l'orange
L'orange est réservé aux **accents** : liens, boutons, hovers, titres clés, labels techniques, points de timeline. **Jamais** pour le corps de texte (lisibilité). Le texte de paragraphe reste en blanc chaud.

### Typographie
- Titres : `var(--font-title)` (Space Grotesk)
- Corps : `var(--font-body)` (Inter)
- Labels techniques / dates / tags : `var(--font-mono)` (JetBrains Mono)

### Espacement
Échelle stricte en variables : `--s1` (8px) à `--s7` (96px). Utilise ces variables pour tout espacement.

### Effets "cyber" — subtils, jamais tape-à-l'œil
- Grille blueprint de fond très discrète (`body::before`)
- Glow orange léger au hover des cartes
- Bordures qui s'illuminent en orange au survol (`--border-hover`)
- **Important** : le profil vise aussi des grands groupes conservateurs. L'élégance prime sur l'effet. Pas de surcharge néon.

### Motion / Animation de scroll — « wow élégant » (décision actée)
Stack : **GSAP + ScrollTrigger + Lenis** (smooth scroll inertiel), vendorisés en local. Objectif : un défilement organique et fluide qui *révèle* le contenu, sans jamais le noyer. Débat conseil tranché par Enzo : intensité **wow élégant au service du contenu** (ni sobre-minimal, ni démo Awwwards).

Principes (garde-fous, cf. skill `scroll-motion`) :
- **Un effet = une intention** : chaque animation doit révéler ou hiérarchiser un contenu. Si on ne sait pas dire ce qu'elle apporte, on ne la met pas.
- **Lisibilité en 30 s** : un recruteur (y compris Thales/Alstom/Siemens) doit tout comprendre même en scrollant vite. Le contenu reste lisible sans JS (ne jamais masquer en CSS de base).
- **Perf** : animer uniquement `transform`/`opacity`. Attention : le hero charge déjà Three.js (~670 Ko minifié).
- **Accessibilité** : `prefers-reduced-motion` → pas de Lenis, révélations en état final immédiat (même logique que le hero 3D).
- **Sobriété** : un seul « moment fort » pinné sur tout le site, parallaxe subtile (5–15 %), pas de curseur custom ni de transitions plein écran gratuites.

> **Décision du 2026-07-24 (conseil 4 agents : Kenji/Léa/Sara/Élise, tranché par Enzo) : « bras compagnon » (Concept B).** La couche 3D de l'accueil est un **calque fixe** derrière tout le contenu (`.hero-3d` en `position:fixed`, z-index 0, contenu en z-index ≥ 1) : le bras reste dans la **gouttière droite** et suit une chorégraphie de poses clés amortie par lerp (jamais de scrub 1:1) sur la progression du document. Garde-fous actés : **estompé (opacité ~0.35) sur les grilles Projets/Compétences**, **quasi figé pendant le manifeste pinné** (le moment fort reste le texte), voile ~0.6 ailleurs, rendu à la demande (pleine cadence au scroll, ~20 fps au repos), puce = hero uniquement. Le plein cadre derrière le texte a été **rejeté à l'unanimité** (contraste/crédibilité). Position d'Élise (minoritaire, consignée) : pas de 3D persistante du tout — si un recruteur grand groupe tique, revenir à la 3D hero-seule est un simple retour de `.hero-3d` en `absolute` dans le header.
>
> **v2.2 « cellule ancrée » : implémentée puis RETIRÉE (décision d'Enzo du 2026-07-24).** Le rail linéaire « 7e axe », l'ombre de contact, les câbles-gaines et les matériaux contrastés avaient été ajoutés suite au débat orchestré Kenji/Marc/Sara/Élise/Léa ; après visualisation, Enzo a tranché pour **revenir à la v2.1** (bras flottant + pick-and-place, sans habillage de cellule). Le code v2.2 a été retiré de `hero3d.js` (retour du groupe `root` directement dans la scène, matériaux d'origine). Ne pas réintroduire le rail ou l'habillage sans demande explicite d'Enzo.
>
> **Ajout v2.1 (même jour, après test d'Enzo : « mouvements plus importants ») : séquence pick-and-place.** Le bras va chercher un **cube orange** posé sur un socle (prise à ~30 % du scroll), le transporte en pivotant, et le **dépose sur un second socle** (~70 %), puis revient au repos. Implémentation dans `hero3d.js` : **IK 2 axes analytique** (épaule/coude + orientation d'outil imposée, deux branches de coude — « surplomb » pour les saisies par le dessus, branche de repos pour la pose d'accueil), résolue **une fois par clé à l'init** puis interpolation d'angles smoothstep + amortissement. Le cube est aimanté au point d'outil (`toolTip`) pendant la fenêtre de tenue (p ∈ [0.36, 0.73]), sinon il rejoint son socle par lerp — séquence entièrement réversible au scroll inverse. Les cibles de prise sont définies en coordonnées plan (`PICK`/`PLACE`) : les socles sont **construits sous les cibles**, donc la prise est exacte par construction, sans réglage visuel.

## Contenu — informations validées (source de vérité)

### Identité
- Nom : Enzo Lorandi
- Accroche : "Robotique · Électronique · IA appliquée" (actée le 2026-07-24, conseil Nina/Élise : « Sciences du numérique » était vague et ne renvoyait à aucun bloc de compétences. Alternative consignée si Enzo préfère : la liste canonique à 4 items « Électronique · Systèmes embarqués · Robotique · IA appliquée », déjà utilisée en meta/contact, à vérifier en layout mobile)
- Positionnement affiché : « Ingénieur CPE Lyon - du capteur à l'IA ». Pas d'objectif de recherche affiché (cf. décision du 2026-07-23 en tête de fichier).
- **Décision du 2026-07-24 (audit contenu Nina/Élise/Sara, tranché par Enzo) : le sigle « ETI » est retiré de tout le site** (hero, intro Profil, footers, meta/og, JSON-LD, README). Raison (vérifiée par Élise) : un recruteur qui google « ETI » trouve « Entreprise de Taille Intermédiaire » (INSEE) - le sigle crée une fausse piste. **Unique exception** : la ligne diplôme de la timeline (`experiences.html`, « Diplôme d'Ingénieur - Filière ETI (Électronique, Télécommunications et Informatique)... ») où c'est le nom officiel vérifiable, auto-défini entre parenthèses. Footer partagé : « CPE Lyon · Robotique & IA appliquée ».
- **Règle éditoriale « preuve avant slogan »** (même audit) : toute mention de « progresser / apprendre / optimiser » doit être immédiatement adossée à une preuve nommée (7 projets, 5 domaines, choix d'architecture documentés). Jamais de « passionné », « curieux », « polyvalent » à nu.

### Expérience (page experiences, timeline du + récent au + ancien)
1. **RATP** (Mars–Sept 2026) — Coordinateur Technique Systèmes, via IKOS Consulting. Implémentation du MF19, lignes 3bis/7bis/10. Interfacage entre les différents MOE : Signalisation, traction, voie, GC, BT, PAE... et les exploitants: maintenance des train et exploitation classique. NB : mettre RATP en avant, IKOS en sous-ligne.
2. **Università di Padova** (Sept 2025–Fév 2026) — Échange robotique : robotique industrielle, intelligente, neurorobotique.
3. **CPE Lyon** (2022–2026) — Diplôme ingénieur ETI, spécialisation Robotique de Service.

### Projets (page projets) — toujours préciser le RÔLE PERSONNEL d'Enzo, pas juste le projet global

**Ordre acté par Enzo** : classement par importance de son rôle personnel. LockWise en tête (le plus complet, le plus concret, celui où il touche le plus de domaines), puis les **projets individuels** de Padoue (neurorobotique, puis les deux assignments d'Intelligent Robotics), puis les projets d'équipe (Robonbon, Robot Doseur).

**Projets de Padoue (individuels, ajoutés après l'état des lieux du 2026-07-23)** — ils comblent un trou majeur : la section Compétences annonçait « ROS2 (avancé) » sans qu'aucun projet ROS2 ne soit montré.
4. **Décodage BCI** (individuel) — imagerie motrice sur EEG, 3 jours / 8 sujets. Traitement du signal (spectrogrammes, CAR, Laplacien, band power), carte de Fisher, topographies ERD/ERS, décodeur par sujet, évaluation en ligne par accumulation d'évidence, chaîne ROS-Neuro. MATLAB / EEGLAB / BioSig. Code : https://github.com/Maxz0l/neurorobotics
5. **TurtleBot3** (individuel) — navigation guidée par AprilTag vers le point médian de deux tags, puis détection de tables cylindriques au LiDAR. Architecture **hybride délibératif/réactif** (Arkin, Brooks) assumée contre Bug2/A*, 4 nœuds ROS 2, TF2, 4 couches de priorité. ROS 2 Humble / Gazebo. Vidéo : https://youtu.be/XyFvxgqdXcs · Code : https://github.com/Maxz0l/lorandi_assignement_1
6. **UR5 + MoveIt!** (individuel) — échange de deux cubes repérés par AprilTag avec pince Robotiq 85, en deux mouvements sans emplacement tampon. 4 nœuds ROS 2 découplés par topics/TF, MoveIt! 2 (IK, chemins cartésiens, scène de planification), détection de couleur OpenCV. Vidéo : https://youtu.be/ha9ZuNDaH0M · Code : https://github.com/Maxz0l/lorandi_assignment_2

**Projet CPE ajouté le 2026-07-23**
7. **ChronoScore** (équipe de 3, Enzo cité parmi les auteurs sur la page de garde) — chronomètre + compteur de score décrits en **VHDL** et implémentés sur carte **FPGA**. Quatre sous-blocs (base de temps, affichage, chronomètre, score), division de l'horloge 100 MHz, multiplexage de l'affichage 7 segments, gestion des boutons, simulation avant implémentation. Comble le trou « Électronique numérique », annoncée en compétences sans projet pour l'illustrer. **Le rôle personnel d'Enzo n'est pas documenté** : la section s'intitule donc **« Architecture »** et non « Mon périmètre », et la méta indique « Équipe de 3 ». Ne pas transformer en périmètre personnel sans qu'Enzo le confirme.

**Projet en attente d'arbitrage — « Projet TSA » (Traitement du Signal Aléatoire)**
Contenu décodé et prêt (amélioration de captations audio de concerts : modulation par déplacement de fréquence binaire, estimation de la densité de probabilité du bruit et de la densité spectrale de puissance, détection d'un signal noyé dans le bruit par filtrage adapté / maximisation du SNR, prédiction autorégressive d'ordre M par filtrage optimal de Wiener). **NON publié - à ne pas ajouter sans validation explicite d'Enzo.**

> **Extraction du contenu des PDF sans outillage** : l'environnement n'a ni poppler, ni Python, ni ffmpeg. Les PDF exportés de PowerPoint/Slides ont leurs flux compressés en Deflate (lisibles via `System.IO.Compression.DeflateStream` en C# compilé par `Add-Type`) et leurs polices **sous-ensemblées décalent les codes de caractères d'un offset constant** — +29 pour la plupart, +3 pour une seconde police dans `SCORING PROJECT.pdf`. Décoder = inflater le flux, récupérer les littéraux `(...)` des opérateurs `Tj`/`TJ`, puis ajouter l'offset. Les accents se perdent (codes hors plage), donc le texte extrait sert à *comprendre* le projet, pas à être recopié.

> **Point de vigilance** : les README des deux assignments d'Intelligent Robotics mentionnent publiquement un recours à Claude comme aide au développement, avec la liste de la contribution humaine (choix d'architecture, calibration des paramètres, intégration, tests). Le contenu du site est rédigé **à partir de cette contribution humaine documentée**, sans la contredire ni la masquer. Un recruteur qui ouvre le dépôt verra la mention : c'est cohérent avec le fait qu'Enzo revendique « Claude Code » et le prompt engineering en compétences.

1. **LockWise** (équipe de 7) — Casier sécurisé à clés par RFID. STM32 + Raspberry Pi + Django.
   Rôle d'Enzo : driver RFID (MFRC522/SPI), capteurs (IR + reed switch), actionneurs (serrures/pont en H), FSM embarquée, design boîtier. Code : https://gitlab.com/enzo4623206/lockwise
2. **Robonbon** (équipe de 3) — Robot vocal créateur de brochettes, piloté par LLM.
   Rôle d'Enzo : module dialogue (reconnaissance vocale + LLM), câblage/électronique, conception du distributeur de bonbons (rails + moteurs DC).
3. **Robot Doseur** (équipe de 3) — Préparateur de boissons (température/concentration/volume contrôlés). **Catégorisation actée par Enzo : électronique analogique / instrumentation, PAS « mécatronique »** — son périmètre est la chaîne de mesure analogique (conditionnement, NE555, pont de mesure) et la puissance, pas la conception mécanique.
   Rôle d'Enzo : mesure température (capteur + conditionnement), concentration (NE555 + photodiode), volume (pont de mesure), MLI/pont en H, électrovannes, résistance de chauffage. (Pas l'IHM.)

### Compétences (6 blocs - restructuration actée le 2026-07-24, audit Nina/Élise/Sara + ajouts Enzo)
Ordre affiché = différenciation décroissante : **Robotique → Hardware → IA appliquée → Développement → Soft skills → Langues**. Le bloc « Conception » a été fusionné dans Hardware (« Impression 3D » en fin de bloc) - ne pas le recréer sans nouvelle compétence CAO confirmée par Enzo.
- **Robotique** : ROS2 (accent, **sans** niveau « avancé » - la preuve = les 3 projets ROS, pas une auto-note), MoveIt! 2, Gazebo, TF2, cinématique inverse, perception LiDAR
- **Hardware** (le bloc le plus différenciant, 2 accents) : STM32 (accent), VHDL/FPGA (accent), Raspberry Pi, Arduino ; SPI/I2C/UART/CAN ; capteurs & actionneurs ; électronique analogique ; traitement du signal ; impression 3D. Détail des capteurs/actionneurs maîtrisés (source CV) : IR, RFID/NFC, température, optiques, inductifs, magnétiques, encodeurs ; moteurs DC, pont en H, PWM, servos, pas-à-pas, électrovannes, relais, transistors de puissance ; conditionnement, AOP, NE555, filtrage ; instrumentation (oscillo, multimètre, soudure)
- **IA appliquée** : LLM (accent), Claude Code, prompt engineering, neurorobotique, learning from networks
- **Développement** (volontairement SANS accent - bloc « support » qui montre la largeur) : Python, C/C++, JavaScript, HTML/CSS, PHP, Linux, Git/GitLab, déploiement
- **Soft skills** (ajout demandé par Enzo le 2026-07-24, cadré par une recherche marché : adaptabilité/communication/capacité d'apprentissage/esprit critique = top des attentes recruteurs 2026). Actuelles : Apprentissage rapide · Adaptabilité · Communication multi-équipes · Esprit critique. **Affichées sans ancrage entre parenthèses** : les preuves initialement affichées (7 projets, Italie/RATP, choix d'architecture...) ont été retirées le 2026-07-24 sur décision d'Enzo - les pills restent courtes, les preuves sont dans les sections Projets/Expérience du site. La sélection des 4 skills reste, elle, adossée à des preuves réelles : ne pas en ajouter une nouvelle sans preuve nommée quelque part sur le site. « Curiosité » du brief d'Enzo volontairement absorbée dans « Apprentissage rapide » (trop générique seule).
- **Langues** : Français (natif), Anglais (C1). L'italien (notions) a été retiré le 2026-07-24 à la demande d'Enzo.

**Pills accent cliquables (pont compétence → preuve)** : les 4 accents de la section sont des liens vers le projet qui les prouve - ROS2→`projets.html#turtlebot`, STM32→`#lockwise`, VHDL/FPGA→`#chronoscore`, LLM→`#robonbon`. Réservé aux accents, jamais aux pills neutres (le signal doit rester rare).

**Règle des pills accent sur les projets et la timeline (actée)** : l'accent = la compétence la plus spécifique et différenciante que CE projet prouve - jamais un doublon du tag `//` de catégorie, jamais un langage générique. Application : LockWise→STM32F303, BCI→ROS-Neuro, TurtleBot→ROS 2 Humble, UR5→MoveIt! 2, Robonbon→LLM, Doseur→NE555, ChronoScore→VHDL ; timeline : RATP→Signalisation (harmonisé sur les 2 pages), Padoue→Neurorobotique, CPE→Robotique de service.

### À compléter par Enzo (placeholders dans le code)
**Traitement « planche technique » (procédé acté sur le Robot Doseur)** : quand la seule source disponible est un schéma sur fond blanc, ne pas le coller tel quel (pavé blanc qui jure sur le dark cyber) et ne pas l'agrandir (flou). Le bon procédé : extraire les figures à leur **résolution native**, les transposer en **blanc-sur-sombre** (luminance inversée, puis interpolation entre `--surface-2` et `--text`, avec un gamma par figure selon que le tracé est imprimé, au stylo ou au crayon), et les **composer côte à côte** sur un canevas `--surface-2`. Le fond de la figure devient exactement la couleur du canevas : aucune couture visible, et le résultat s'intègre à la charte. Voir `assets/img/doseur.jpg` (1128x240, 42 Ko) pour le résultat.

**Deux formats par visuel : `-card` et pleine largeur.** Les blocs média n'ont pas le même ratio - `.card-media` fait ~1,9:1 (180 px de haut) et `.pd-media` ~3,6:1. Un visuel unique recadré pour les deux est illisible dans l'un des deux. D'où les paires `lockwise-card.jpg` / `lockwise-schema.jpg`, `doseur-card.jpg` / `doseur.jpg`, `chronoscore-card.jpg` / `chronoscore.jpg`. Corollaire acté : **ne pas utiliser `is-figure` sur `.card-media`** - une planche annotée y rend à ~189 px de large, ce qui n'est plus une information mais une texture. `is-figure` reste correct sur `.pd-media` (400 px max).

**ChronoScore : visuel procédural assumé.** `chronoscore.jpg` est un afficheur 7 segments dessiné par programme aux couleurs de la charte, pas une photo. C'est une **illustration**, pas une preuve - elle comble le trou visuel sans rien prétendre de faux. À remplacer dès qu'Enzo peut photographier la carte FPGA avec l'afficheur allumé.

> Rappel : une photo optiquement floue ne se rattrape pas. Le masque flou remonte le contraste mais ne recrée aucun détail - si la source est ratée, changer de source plutôt que de la retoucher.

- Photos/visuels des 3 projets (`assets/img/`). Ordre d'impact validé : (1) **vidéo de démo** (voir ci-dessous) — la preuve la plus forte, le système est vu en marche ; (2) photo du montage réel, même prise au téléphone ; (3) figure extraite des supports de présentation (schéma d'architecture, schéma électronique, rendu CAO), **recadrée** pour ne garder que la figure ; (4) jamais une capture de slide entière (titre, logo, puces, fond blanc).
- Liens GitLab / GitHub (email + LinkedIn déjà en place)

### Composant vidéo de démo (façade cliquable)

Enzo a des vidéos YouTube de démonstration (Robonbon, projets de robotique intelligente de Padoue ; les liens sont dans les dépôts GitHub des projets).

**Décision actée : ne pas héberger les vidéos dans le dépôt.** GitHub Pages plafonne à 100 Mo par fichier, ~1 Go de dépôt et ~100 Go/mois de bande passante ; et sans ffmpeg dans l'environnement on ne peut pas les recompresser correctement. **Ne pas non plus poser une `<iframe>` YouTube directe** : ~1 Mo de JS et des cookies tiers au chargement, sur une page qui porte déjà Three.js.

À la place, un composant **façade** (`.video-embed`, CSS dans `style.css`, JS dans `main.js`) : une vignette cliquable qui ne charge l'iframe (`youtube-nocookie.com`) qu'**au clic**. Sans JS, la façade reste un lien vers YouTube — le contenu est toujours atteignable.

Markup à coller dans le `.pd-media` du projet concerné (`projets.html`) :

```html
<div class="pd-media">
  <a class="video-embed" data-video-id="ID_YOUTUBE"
     href="https://www.youtube.com/watch?v=ID_YOUTUBE"
     target="_blank" rel="noopener"
     aria-label="Voir la démo vidéo de NOM_DU_PROJET">
    <img src="assets/img/NOM-poster.jpg" alt="" loading="lazy" width="960" height="540">
    <span class="video-play" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    </span>
    <span class="video-label">Voir la démo</span>
  </a>
</div>
```

- `data-video-id` : l'identifiant seul (la partie après `v=`), pas l'URL complète.
- Le `<img>` poster est **obligatoire en pratique** : sans lui, la façade est un rectangle gris et la grille projets se retrouve à moitié vide (défaut relevé par 5 agents sur 7 lors de l'état des lieux du 2026-07-23). Il porte `alt=""` : c'est un fond décoratif, l'`aria-label` du `<a>` porte déjà l'information.

**Source des vignettes : les vidéos d'Enzo, jamais des images du web.** Décision actée. Les vignettes proviennent de `https://img.youtube.com/vi/<ID>/maxresdefault.jpg`, c'est-à-dire d'images de ses propres vidéos. Deux raisons de ne pas prendre de photo de UR5 ou de TurtleBot sur le web : (1) droit d'auteur, ces images sont protégées et le site est public ; (2) surtout, une photo de catalogue n'est pas son travail - tout l'argument du site est de **prouver que la chose existe**, une illustration générique le détruit. Attention au recadrage : la vignette de Robonbon contient un panneau de titre avec les noms des camarades et de l'encadrant, à exclure (cf. règle 8).
- Tant que `data-video-id` commence par `A_REMPLIR`, le JS reste inerte (garde-fou anti-vidéo cassée en production).
- Ce composant règle aussi le « cul-de-sac » relevé par Sara et Élise : Robonbon et Robot Doseur n'ont aujourd'hui aucun lien de sortie ni preuve, contrairement à LockWise qui a son GitLab.

## Roadmap / état d'avancement

- [x] Contenu des 3 pages finalisé
- [x] Design system défini
- [x] Structure HTML/CSS/JS — v1 statique complète
- [x] Mise en ligne GitHub Pages — https://maxz0l.github.io/Portfolio/
- [x] Finitions : favicon SVG, balises Open Graph + bannière `og-image.png`, email + LinkedIn réels
- [x] **Couche WOW v1** : bras robotique 3D procédural dans le hero (Three.js, accueil uniquement)
  - Silhouette industrielle 6 axes (carters moteurs, bagues orange, coude plié, pince), accent orange charte
  - Bras construit en **géométrie procédurale** (pas de GLB), hiérarchie de pivots épaule/coude/poignet/pince
  - Pose stable + micro-animation discrète, parallaxe au scroll
  - Fallback : désactivé sur mobile, `prefers-reduced-motion` et sans WebGL ; rendu en pause hors écran
- [x] **Élément gauche** : puce électronique procédurale (die orange pulsant, pattes, pistes) — décision actée après itérations (réseau de neurones puis cerveau+puce abandonnés, jugés peu lisibles/moches). Composition « bookend » bras (droite) / puce (gauche) encadrant le nom, cadrage proportionnel FOV vérifié 1280–1920px.
- [x] Cercle photo hero agrandi (`clamp(180px, 17vw, 240px)`), prêt à recevoir la vraie photo
- [x] Accessibilité : focus clavier (`:focus-visible`), lien d'évitement, icônes SVG (remplacement emojis), cible tactile nav
- [x] **Environnement scroll-motion** : GSAP + ScrollTrigger + Lenis vendorisés, skill `scroll-motion` + `REFERENCES.md`, design system motion documenté
- [x] **Couche WOW scroll v1** : smooth scroll Lenis + révélations organiques au scroll (piliers, cartes, skills, timeline) + moment fort pinné sur le manifeste — implémenté dans `main.js`
- [x] **Photo de profil réelle** — `assets/img/enzo-lorandi.jpg` (560x560, 23 Ko), dérivée recadrée de l'original `LORANDI-Enzo.jpg` (4083x3860, 750 Ko) conservé au dépôt. Toute nouvelle photo doit être redimensionnée : le hero est au-dessus de la ligne de flottaison.
- [ ] Photos réelles des 3 projets (actuellement placeholders SVG dans `index.html` et `projets.html`)
- [x] **Minifier Three.js** — remplacé le 2026-07-24 par le build minifié officiel du package npm `three@0.160.1` (`three.module.min.js`, 670 Ko, téléchargé via unpkg avec l'accord d'Enzo). L'ancien build non minifié (1,29 Mo) est supprimé du dépôt (récupérable via git).
- [x] **Couche WOW scroll v2 : « bras compagnon » (Concept B)** — implémentée le 2026-07-24 (cf. décision en section Motion). `#hero3d` sorti du header en calque fixe, chorégraphie de poses clés amortie sur la progression du document, fenêtres de lisibilité par section, rendu à la demande, puce cantonnée au hero. Réglages Kenji au passage : puce qui respire (0,6 rad/s, émissif 1,0→1,9) au lieu de clignoter, idle du bras apaisé (0,03 rad @ 0,15). Testée par Enzo en navigateur : validée dans l'idée → a demandé des mouvements plus amples, d'où la v2.1.
- [x] **Couche WOW scroll v2.1 : pick-and-place** (cf. note en section Motion) — le bras saisit un cube sur un socle et le dépose sur un second au fil du scroll, IK 2 axes analytique résolue par clé, cube aimanté au point d'outil pendant la tenue. Mouvement validé visuellement par Enzo en navigateur.
- [x] ~~Couche WOW scroll v2.2 : cellule ancrée~~ — **retirée** le 2026-07-24 après visualisation par Enzo (cf. note en section Motion). Le site reste sur la v2.1.
- [x] **Corrections d'audit UX (conseil du 2026-07-24)** — pin du manifeste réduit à 75 % (au lieu de 120 %), sommaire ancré `.project-toc` sur `projets.html`, `aria-expanded` togglé sur le burger (3 pages), fix superposition boutons hero / scroll-hint sur mobile (photo réduite, réserve basse, scroll-hint masqué sous 620 px de haut).
- [x] **Lot d'améliorations du conseil (2026-07-24, 7 audits sous-agents + analyse ui-ux-pro-max, accepté par Enzo)** :
  - **Matière 3D (Kenji)** : tone mapping ACES (exposure 1.1), environment map procédurale PMREM (3 panneaux HDR : key chaud / fill froid / rebond orange, `envMapIntensity` 0.3-0.6 pour rester sobre), fog couleur `--bg` (11→20), doigts de pince en accent adouci (émissif 0.25 - le point focal reste le cube), bandes d'accent du bras qui respirent au rythme de la puce, « beat » lumineux du cube à la prise/lâcher. **Non vérifié visuellement - à valider par Enzo en navigateur.** Réglages en réserve (Kenji, non appliqués) : `DAMP` 0.08→0.11 si le bras traîne, clé d'anticipation avant la levée.
  - **Robustesse (Léa)** : scroll nav en `{passive:true}`, listener `load` de hero3d protégé par `readyState` (Three.js peut arriver après `load`), gestion `webglcontextlost/restored` (coupure propre par le fondu CSS), `modulepreload` de Three.js.
  - **A11y / conformité** : `scroll-behavior: smooth` conditionné à `prefers-reduced-motion`, `h4`→`h3` sur les fiches projets, `aria-current` (statique + JS), `theme-color`, variables `--halo-glow/--grid-line/--bg-overlay`, icônes contact en SVG (enveloppe + LinkedIn officiel), styles inline rapatriés en classes, letter-spacing boutons, `.pill-accent` renforcée, glow hover `.skill-block`.
  - **Contenu (Nina)** : accroche hero (cf. Identité), « Ingénieur en formation » → « Ingénieur ETI **formé** à CPE Lyon » (variante prudente - **passer à « diplômé » sur confirmation d'Enzo, à partir d'octobre 2026**), pills HTML/CSS + PHP ajoutées, sous-titres sur LockWise/Robonbon/Doseur, « Système mécatronique » → « Système automatisé » (Doseur), meta description experiences dé-étudiantisée.
  - **UX (Sara) / conversion (Élise)** : CTA de fin de page sur projets et experiences (`.page-cta`), chip actif du sommaire projets (IntersectionObserver), lien « ↑ Sommaire » en pied des 7 fiches, badge « Individuel / Équipe de N » sur les cartes de l'accueil (`.card-topline`/`.card-crew`).
  - **Fondations (Tom)** : `404.html` en charte, `robots.txt` + `sitemap.xml`, JSON-LD `schema.org/Person` (sans notion de recherche/disponibilité, conforme à la décision du 2026-07-23), `README.md`, `.nojekyll`, polices auto-hébergées (cf. Stack).
  - **Écarté sciemment** : animation CSS des piliers proposée par Marc (doublon avec les révélations GSAP), ancrage CSS bas-droite du hero (Kenji I9, à débattre), resserrement des paragraphes 720→640px.
- [x] **Audit final contenu (2026-07-24, Nina/Élise/Sara, validé par Enzo)** : retrait d'« ETI » partout sauf ligne diplôme timeline (cf. Identité), intro Profil et pilier 3 reformulés « preuve avant slogan » (« Sept projets, cinq domaines... », « comprendre la chaîne complète avant de l'optimiser »), grille Compétences restructurée en 5 blocs avec accents cliquables (cf. Compétences), règle des pills accent appliquée aux 7 projets + timeline (Robonbon Python→LLM, Doseur→NE555 + pill « Pont de mesure », BCI MATLAB→ROS-Neuro, RATP harmonisé sur « Signalisation »), ligne de chips des 7 domaines en tête de la section Projets de l'accueil, fichiers agents Nina/Élise purgés des mentions ETI/PFE obsolètes.
- [x] ~~CV PDF téléchargeable~~ - **écarté définitivement par Enzo le 2026-07-25** : il adapte son CV à chaque fiche de poste, un PDF statique sur le site serait contradictoire avec cette pratique. Ne pas re-proposer (la reco d'Élise est consignée comme écartée).
- [ ] Photo réelle de la carte FPGA allumée (ChronoScore) - remplace l'illustration procédurale.
- [ ] **Couche WOW v2 (optionnelle, en pause)** : photo détourée d'Enzo en fond, bras robotique « posé » dans une main + réseau de neurones dans l'autre. Idée mise de côté au profit de la puce seule, mais la hiérarchie de pivots du bras reste prête pour un repositionnement dans une main si l'idée est reprise.
- [ ] Liens GitLab / GitHub (non prioritaire)

## Outils / Skills Claude Code

- **`ui-ux-pro-max`** (`.claude/skills/`) : skill de design intelligence (styles, palettes, typographies, guidelines UX). S'active sur les demandes de type "améliore/conçois/vérifie l'UI". Respecter quand même les règles du design system ci-dessus — le skill propose, le design system fixé dans ce fichier tranche.
- **`hero3d-visual-check`** (`.claude/skills/`) : workflow de capture d'écran headless (Chromium + SwiftShader) pour juger visuellement un changement sur la couche 3D du hero (`hero3d.js`) avant de pousser. À utiliser systématiquement avant de commit un ajustement de position/cadrage/matériaux sur le bras ou la puce. Sert aussi à capturer le scroll à plusieurs positions.
- **`scroll-motion`** (`.claude/skills/`) : patterns et intégration des animations de scroll « wow élégant » (GSAP + ScrollTrigger + Lenis vendorisés). Ordre de chargement, câblage Lenis↔ScrollTrigger↔hero3d, patterns (révélations, parallaxe, pinning), règles de perf et fallback reduced-motion. `REFERENCES.md` liste les sources d'effets prêts à adapter (Osmo, Codrops, démos GSAP, exemples Lenis).
- **`.claude/settings.json`** : allowlist de permissions pour les commandes read-only courantes (git status/diff/log, ls, lecture de fichiers du repo) — réduit les prompts de confirmation en session.

## Équipe projet (mode de travail collaboratif)

Ce projet se construit avec une **équipe d'experts**, chacun avec une expertise et un point de vue propres. Enzo est le **chef de projet** : il décide, les experts conseillent et se challengent. Ne te contente pas d'un avis unanime de façade : la valeur vient du débat.

Ces personas existent désormais sous **deux formes complémentaires** — bien comprendre la différence :

- **(a) Débat orchestré dans le thread principal** (roleplay) : pour une **décision** rapide (choix de design, arbitrage, orientation), tu fais parler les personas concernés directement dans la conversation, tu fais ressortir désaccords et compromis, tu proposes une synthèse, Enzo tranche. C'est léger, immédiat, partage le contexte de la discussion en cours. Limite : c'est *toi* (l'orchestrateur) qui incarnes tous les rôles dans un seul contexte — pas d'indépendance réelle, biais possible vers le consensus.

- **(b) Sous-agents réels `.claude/agents/*.md`** : pour un **audit en profondeur**, tu convoques l'expert comme un véritable sous-agent (via le tool Agent / `subagent_type`). Différence de fond avec le roleplay :
  - **Contexte isolé** : le sous-agent démarre avec sa propre fenêtre de contexte et son system prompt. Il n'est pas pollué par le fil de la conversation ni par les autres avis — il regarde le code avec un œil neuf.
  - **Pas de cross-talk** : les sous-agents ne se parlent pas entre eux. Chacun analyse et **remonte un rapport structuré à l'orchestrateur**, qui seul fait la synthèse. Ça évite l'alignement grégaire (un agent qui se range à l'avis d'un autre).
  - **Lecture seule** : ce sont des auditeurs (tools `Read, Grep, Glob`, + `WebSearch/WebFetch` pour Nina et Élise). Ils ne modifient rien — l'implémentation reste orchestrée dans le thread principal.
  - **Modèle par rôle** : analyses lourdes en modèle fort, revues mécaniques en modèle rapide (voir table).

Règle de choix : **débat orchestré** pour décider vite pendant qu'on code ; **sous-agents** quand on veut un audit indépendant et fouillé (revue avant push, verdict recruteur, audit perf/archi, revue esthétique de la couche 3D).

### Table des sous-agents

| Persona | Fichier | Modèle | Pourquoi ce modèle | Web |
|---|---|---|---|---|
| Tom — Architecte | `tom-archi.md` | opus | décisions structurantes coûteuses à défaire = analyse lourde | non |
| Kenji — DA 3D/Motion | `kenji-3d.md` | opus | jugement esthétique + technique 3D nuancé = analyse lourde | non |
| Sara — UX | `sara-ux.md` | sonnet | raisonnement sur les parcours, équilibré | non |
| Léa — Front/Perf | `lea-front.md` | sonnet | évaluation de risques perf/faisabilité, équilibré | non |
| Nina — Contenu | `nina-contenu.md` | sonnet | nuance de langue et de ton | oui |
| Élise — RH | `elise-rh.md` | sonnet | jugement recruteur holistique | oui |
| Marc — UI | `marc-ui.md` | haiku | conformité design system = vérification mécanique (rapide/économe) | non |

**Promotion possible plus tard** : Léa, Kenji et Marc sont les candidats naturels pour être un jour « promus » en **implémenteurs** (ajout de `Edit/Write`, voire `Bash` pour Léa) — Léa corrigerait directement du code/perf, Kenji réglerait les paramètres d'animation de `hero3d.js`/`main.js`, Marc corrigerait les écarts de charte dans le CSS. **On ne le fait pas d'emblée** volontairement : garder l'implémentation centralisée dans le thread principal donne un seul point de contrôle (revue humaine au niveau de l'orchestrateur), évite que plusieurs agents fassent des éditions concurrentes/conflictuelles, et rend les auditeurs incapables d'abîmer le repo. On promeut un agent en implémenteur seulement quand le besoin d'édition autonome dépasse ce coût de contrôle.

### Les agents

- **Sara — UX Designer**
  Veille au parcours utilisateur, à la clarté et à la logique de navigation. Pense "progressive disclosure", repères de l'utilisateur, lisibilité du parcours. Challenge ce qui complique l'expérience.

- **Marc — UI Designer**
  Garant du design system (palette dark cyber + orange, typo, espacement). Défend la cohérence visuelle et l'effet "WOW subtil". Veille à ce que l'esthétique serve le fond sans le noyer.

- **Léa — Développeuse Front**
  Responsable de la faisabilité technique et de la performance. Pense compatibilité GitHub Pages, perf mobile, maintenabilité, risques techniques. Prône le principe : livrer une v1 fonctionnelle d'abord, enrichir ensuite.

- **Tom — Architecte Web**
  Cadre la structure : arborescence, organisation des fichiers, SEO, décisions difficiles à changer après coup. Pragmatique (ex : a tranché pour la duplication HTML plutôt que l'injection JS sur 3 pages).

- **Nina — Content Strategist**
  Gardienne du contenu et du ton. Combat le vague et l'auto-dévalorisation : le profil d'Enzo est différenciant et doit être assumé. Veille à la cohérence du message et au fait de mettre en avant ce qui compte (Padoue, neurorobotique, RATP, LLM).

- **Élise — Recruteuse Tech (RH)**
  Le juge de paix. Évalue tout du point de vue "est-ce que ça me donne envie de recruter Enzo ?". Rappelle les attentes des recruteurs (labos, startups ET grands groupes industriels conservateurs). Privilégie lisibilité en 30 secondes et impact réel sur l'effet gratuit.

- **Kenji — Directeur Artistique 3D / Motion**
  Expert du rendu 3D temps réel (Three.js) : matériaux (PBR, metalness/roughness, émission), éclairage (key/fill/rim, ambiance), composition, profondeur de champ, silhouette et lisibilité des formes, animation/easing. Garant du « beau » sur la couche WOW. Sait quand une forme procédurale doit être affinée, simplifiée ou stylisée plutôt que rendue littéralement. Travaille main dans la main avec Marc (charte) et Léa (perf). Son exigence : que chaque élément 3D ait l'air intentionnel et soigné, jamais bricolé.

### Comment les faire intervenir
- Pour une décision structurante : convoque les agents pertinents, fais émerger leurs positions (y compris divergentes), propose une synthèse, puis laisse Enzo trancher.
- Tous les agents ne parlent pas à chaque fois : sélectionne ceux dont l'expertise est concernée.
- Si un agent est en désaccord avec une demande qui dessert le projet, il doit le dire (ex : Nina si une formulation sous-vend le profil, Élise si un effet visuel nuit à la lisibilité).

## Règles de travail pour Claude Code

1. **Respecte le design system** : variables CSS uniquement, palette et typo fixées.
2. **Cohérence multi-pages** : tout changement de nav/footer se répercute dans les 3 fichiers HTML.
3. **Pas de framework, pas de dépendance build** — HTML/CSS/JS pur pour rester compatible GitHub Pages.
4. **Rôle personnel d'Enzo** : sur les projets, toujours distinguer ce qu'Enzo a fait du projet global (équipes de plusieurs personnes).
5. **Ne sur-vends pas, n'édulcore pas** : le contenu est validé, factuel et assumé. En cas de doute sur une formulation, demande.
6. **Lisibilité avant effet** : sur le dark cyber, le contraste texte doit rester impeccable.
7. **Français** : tout le contenu visible est en français. Tirets simples `-`, pas de tirets longs.
8. **Aucune donnée personnelle de tiers dans le dépôt** — ni sur le site, ni dans les images, ni dans `CLAUDE.md`, ni dans aucun fichier versionné. Pas de noms de camarades, pas de visages identifiables. Raison : **tout fichier commité est publiquement lisible** (le dépôt GitHub et GitHub Pages), y compris les fichiers de travail comme celui-ci et les fichiers jamais référencés par une page. Les projets d'équipe se décrivent par leur taille (« Équipe de 3 »), jamais par les personnes. Les originaux contenant des tiers restent en local et sont listés dans `.gitignore`. Même logique pour les **rationales stratégiques personnelles** : ce fichier consigne les règles et décisions, leurs justifications sensibles restent hors dépôt (mémoire locale de session).
