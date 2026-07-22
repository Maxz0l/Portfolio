# CLAUDE.md — Portfolio Enzo Lorandi

Ce fichier guide Claude Code dans le développement de ce projet. Lis-le entièrement avant toute modification.

## Vue d'ensemble

Portfolio personnel d'**Enzo Lorandi**, ingénieur ETI (CPE Lyon) spécialisé en **robotique de service**, à la recherche d'un **PFE en robotique / IA / sciences du numérique pour 2026**.

Objectif du site : convaincre un recruteur (labo, startup ou grand groupe industriel type Alstom/Thales/Siemens Mobility) de proposer un PFE. Le profil est différenciant et doit être assumé, pas dilué.

## Stack technique

- **HTML / CSS / JavaScript pur** — aucun framework, aucune dépendance build.
- Hébergement cible : **GitHub Pages** (statique uniquement, pas de PHP ni backend).
- Polices via Google Fonts : `Space Grotesk` (titres), `Inter` (corps), `JetBrains Mono` (labels techniques).

## Architecture du projet

```
/
├── index.html          # Accueil one-page scrollable (6 sections)
├── projets.html        # Détail des 3 projets
├── experiences.html    # Timeline parcours (RATP, Padoue, CPE)
└── assets/
    ├── css/style.css        # TOUT le design system + styles partagés (fichier unique)
    ├── js/main.js           # JS partagé 3 pages (nav, scroll, reveal, smooth scroll Lenis + GSAP)
    ├── js/hero3d.js         # Module ES, accueil uniquement : bras robotique 3D (Three.js)
    ├── vendor/three.module.js   # Three.js hébergé en local (pas de CDN)
    ├── vendor/gsap.min.js       # GSAP 3.15 (moteur d'animation) — global `gsap`
    ├── vendor/ScrollTrigger.min.js # Plugin scroll GSAP — global `ScrollTrigger`
    ├── vendor/lenis.min.js      # Lenis 1.3 (smooth scroll inertiel) — global `Lenis`
    └── img/                 # Images (favicon, og-image, photos projets, photo perso à venir)
```

### Conventions structurelles (décisions actées, à respecter)

- **HTML dupliqué par page** : la nav et le footer sont écrits en dur dans chaque fichier (pas d'injection JS). Raison : robustesse, SEO, pas de flash de chargement. Si tu modifies la nav ou le footer, **répercute le changement dans les 3 fichiers**.
- **CSS unique et partagé** : un seul `style.css`. Le design reste centralisé.
- **JS** : `main.js` partagé sur les 3 pages (nav, scroll, reveal). Exception assumée : `hero3d.js`, module ES chargé **uniquement sur l'accueil** pour la couche WOW 3D — séparé pour ne pas charger Three.js (~1,2 Mo) sur les pages où il est inutile.
- **Three.js hébergé en local** (`assets/vendor/three.module.js`) via import map, pas de CDN externe — robustesse et conformité « pas de dépendance build ».
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
- **Perf** : animer uniquement `transform`/`opacity`. Attention : le hero charge déjà Three.js (~1,2 Mo).
- **Accessibilité** : `prefers-reduced-motion` → pas de Lenis, révélations en état final immédiat (même logique que le hero 3D).
- **Sobriété** : un seul « moment fort » pinné sur tout le site, parallaxe subtile (5–15 %), pas de curseur custom ni de transitions plein écran gratuites.

## Contenu — informations validées (source de vérité)

### Identité
- Nom : Enzo Lorandi
- Accroche : "Robotique · IA · Sciences du numérique"
- Objectif : PFE en robotique, 2026

### Expérience (page experiences, timeline du + récent au + ancien)
1. **RATP** (Mars–Sept 2026) — Assistant Coordinateur Technique Systèmes, via IKOS Consulting. Implémentation du MF19, lignes 3bis/7bis/10. Signalisation, traction, interfaces voie/GC. NB : mettre RATP en avant, IKOS en sous-ligne.
2. **Università di Padova** (Sept 2025–Fév 2026) — Échange robotique : robotique industrielle, intelligente, neurorobotique, learning from networks.
3. **CPE Lyon** (Sept 2022–Juin 2026) — Diplôme ingénieur, filière ETI (Électronique, Télécommunications et Informatique), spécialisation Robotique de Service. Diplôme obtenu après validation du PFE (en cours de recherche).

> Note : la mission RATP est le stage élève ingénieur (validation école). Le PFE est encore à trouver — c'est l'objectif du site.

### Projets (page projets) — toujours préciser le RÔLE PERSONNEL d'Enzo, pas juste le projet global
1. **LockWise** (équipe de 7) — Casier sécurisé à clés par RFID. STM32 + Raspberry Pi + Django.
   Rôle d'Enzo : driver RFID (MFRC522/SPI), capteurs (IR + reed switch), actionneurs (serrures/pont en H), FSM embarquée, design boîtier. Code : https://gitlab.com/enzo4623206/lockwise
2. **Robonbon** (équipe de 3) — Robot vocal créateur de brochettes, piloté par LLM.
   Rôle d'Enzo : module dialogue (reconnaissance vocale + LLM), câblage/électronique, conception du distributeur de bonbons (rails + moteurs DC).
3. **Robot Doseur** (équipe de 3) — Préparateur de boissons (température/concentration/volume contrôlés).
   Rôle d'Enzo : mesure température (capteur + conditionnement), concentration (NE555 + photodiode), volume (pont de mesure), MLI/pont en H, électrovannes, résistance de chauffage. (Pas l'IHM.)

### Compétences (6 domaines)
- **Robotique** : ROS2 (avancé, projets mobilité), Gazebo, cinématique inverse
- **Développement** : Python, C/C++, JavaScript, HTML/CSS, PHP, Git/GitLab, déploiement
- **IA appliquée** : principaux modèles du marché, Claude Code, prompt engineering, neurorobotique, learning from networks
- **Hardware** : STM32 (HAL/CubeMX), Raspberry Pi, Arduino ; SPI/I2C/UART/CAN ; capteurs (IR, RFID/NFC, température, optiques, inductifs, magnétiques, encodeurs) ; actionneurs (moteurs DC, pont en H, PWM, servos, pas-à-pas, électrovannes, relais, transistors de puissance) ; électronique analogique (conditionnement, AOP, NE555, filtrage) ; électronique numérique ; instrumentation (oscillo, multimètre, soudure)
- **Conception** : impression 3D
- **Langues** : Français (natif), Anglais (C1), Italien (notions)

### À compléter par Enzo (placeholders dans le code)
- Photo de profil (hero) + photos/visuels des projets (`assets/img/`)
- Liens GitLab / GitHub (email + LinkedIn déjà en place)

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
- [ ] **Couche WOW scroll v1** : smooth scroll Lenis + révélations organiques au scroll (piliers, cartes, skills, timeline) + 1 moment fort pinné — à implémenter dans `main.js` via le skill `scroll-motion`
- [ ] **Photo de profil réelle** — placeholder `[ photo ]` dans `.hero-photo` (index.html), à remplacer
- [ ] Photos réelles des 3 projets (actuellement placeholders SVG dans `index.html` et `projets.html`)
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
