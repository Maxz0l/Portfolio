# Journal des décisions (le « pourquoi historique »)

Ce fichier est **versionné** : il voyage avec le repo et est partagé avec quiconque travaille dessus.

Il ne duplique pas `CLAUDE.md`. `CLAUDE.md` dit **ce qui est** (l'état courant, les conventions à suivre). Ce journal dit **pourquoi on en est arrivé là** : le raisonnement, et surtout les **alternatives essayées puis rejetées** — pour ne pas re-proposer dans 6 mois une idée déjà tranchée.

Format d'une entrée : `décision → raison (+ alternative rejetée si pertinent)`.

---

## Structure & architecture

- **HTML dupliqué par page (nav/footer en dur) plutôt qu'injection JS** → robustesse, SEO, pas de flash de chargement. *Rejeté : l'injection JS d'une nav commune sur 3 pages* (fragile, mauvais pour le SEO, flash au chargement). Décision de Tom. Coût assumé : synchroniser 3 fichiers à la main → depuis, **appliqué par un hook** (voir `.claude/hooks/`).
- **Un seul `style.css` partagé** → design centralisé, pas de divergence de charte entre pages.
- **`main.js` script classique unique + `hero3d.js` seul module ES** → garder `main.js` simple (consomme les globaux UMD). *Rejeté : tout passer en modules ES* (compliquerait `main.js` sans gain).

## Dépendances & build

- **Three.js hébergé en local (`assets/vendor/`) au lieu d'un CDN** → le CDN (jsdelivr/unpkg) est bloqué par la politique réseau du conteneur distant ; et cohérence avec « pas de dépendance build ». *Rejeté : import via CDN* (cassait en conteneur).
- **GSAP + ScrollTrigger + Lenis vendorisés en local, builds UMD (globaux)** → même logique que Three.js (fichiers uniques, pas de build, compat GitHub Pages). *Rejeté : natif CSS scroll-driven* (support navigateur partiel début 2026) *et Motion One* (pinning/scroll avancé moins puissant). Décision tranchée par Enzo.

## Couche WOW 3D (hero)

- **Bras robotique en géométrie procédurale (pas de GLB)** → pas de dépendance à un fichier d'asset, contrôle total de la silhouette, hiérarchie de pivots réutilisable.
- **Élément gauche = puce électronique seule** → *itérations rejetées : réseau de neurones en couches* (peu lisible), puis *cerveau + puce* (jugé « moche », informe). La puce seule est nette et lisible. Décision d'Enzo après plusieurs essais et revue « DA 3D » (Kenji).
- **Cadrage proportionnel au FOV (`halfW = tan(fov/2)·cameraZ·aspect`) plutôt que positions fixes** → *rejeté : positions en dur* (clipping des éléments à 1280px). Le proportionnel reste dans le cadre de 1280 à 1920.
- **Sol + liseré orange sous le robot : ajouté puis retiré** → mal reçu (« un cercle orange qui apparaît »). Le robot « flotte » volontairement.
- **Composition « bookend » (puce à gauche, bras à droite, encadrant le nom)** → équilibre visuel, met le nom au centre.

## Couche WOW scroll

- **Intensité « wow élégant au service du contenu »** (ni sobre-minimal, ni démo Awwwards) → double cible : labos/startups (audace) ET grands groupes conservateurs Alstom/Thales/Siemens (crédibilité ingénieur). Le contenu doit rester lisible en 30 s. Décision tranchée par Enzo.
- **Un seul « moment fort » pinné = le manifeste plein écran** → *rejeté pour ce rôle : timeline d'expérience et section compétences* (moins central). Un seul pic d'intensité sur tout le site, pas trois.
- **Phrase manifeste : « Du capteur à l'IA, je conçois des robots qui agissent dans le monde réel. »** → condense le positionnement full-stack (capteur → IA) + l'ancrage terrain, assumé sans sur-vendre.

## Environnement agentique (`.claude/`)

- **Environnement portable, pas mono-plateforme** → le repo est édité depuis **deux OS** : Windows en local (Enzo) ET conteneur Linux distant (sessions Claude Code sur le web). Un skill/hook « Linux-only » ou « Windows-only » casserait un des deux côtés. *Rejeté : chemins et commandes en dur pour un seul OS.*
- **Permission `Read(/**)` (ancrée racine projet) au lieu de `Read(//home/user/Portfolio/**)`** → chemin absolu machine = mort dès qu'on change de machine.
- **Sous-agents `.claude/agents/*` en lecture seule (Read/Grep/Glob) plutôt qu'implémenteurs** → garder l'implémentation centralisée dans le thread principal : un seul point de contrôle, pas d'éditions concurrentes/conflictuelles, auditeurs incapables d'abîmer le repo. Promotion en implémenteurs (Léa, Kenji, Marc) différée jusqu'à ce que le besoin dépasse ce coût de contrôle.
- **Modèle par sous-agent (opus pour Tom/Kenji, sonnet pour la plupart, haiku pour Marc)** → payer le modèle fort là où il y a du raisonnement lourd (archi, esthétique 3D), le modèle rapide pour la vérification mécanique (conformité charte).
- **Règle nav/footer appliquée par un hook `PostToolUse`** → transformer une règle déclarative de `CLAUDE.md` en contrainte exécutable. Comparaison sémantique (libellés + logo + footer), pas diff brut, pour éviter les faux positifs (hrefs et classe `active` diffèrent légitimement entre pages).
- **Check du hook : implémentation Node de référence + miroir Python, choisi par un wrapper** → robustesse cross-machine (ni Node ni Python garanti sur Windows). Compromis assumé : risque de dérive entre les deux implémentations (documenté dans les fichiers).
