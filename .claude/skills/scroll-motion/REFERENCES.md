# Références — animations de scroll prêtes à adapter

Sources curées pour trouver des effets "wow élégant" déjà codés, à **adapter** à la charte du portfolio (dark cyber + orange #ff8c1a, typo Space Grotesk/Inter/JetBrains Mono, espacement en variables). Ne jamais copier tel quel : reprendre systématiquement palette, typo et rythme d'espacement du design system.

## Vanilla / GSAP (prioritaire — on est en HTML/CSS/JS pur, pas de framework)

- **Osmo** — https://osmo.supply — composants et effets GSAP prêts à copier (smooth scroll Lenis, text reveals, hover magnétique, marquees). Pensés vanilla/Webflow, très proches de notre stack. **La meilleure source pour nous.**
- **GSAP Demos officiels** — https://gsap.com/demos/ et https://codepen.io/collection/DkvGzg (ScrollTrigger) — pinning, scrub, parallaxe, batch reveals. Code de référence, exactement nos libs vendorisées.
- **ScrollTrigger docs + exemples** — https://gsap.com/docs/v3/Plugins/ScrollTrigger/ — chaque option a une démo CodePen éditable.
- **Lenis exemples** — https://github.com/darkroomengineering/lenis + https://lenis.darkroom.engineering/ — setups smooth scroll et intégration ScrollTrigger (celle qu'on utilise dans main.js).
- **Codrops / Tympanus** — https://tympanus.net/codrops/ — tutoriels + démos téléchargeables (souvent GSAP). Chercher "scroll", "reveal", "on-scroll animations". Code source fourni.

## Inspiration (juger le "beau", pas forcément copier le code)

- **Awwwards** — https://www.awwwards.com/websites/animation/ — le mètre-étalon du wow. Filtrer par "animation". Attention : beaucoup vont trop loin pour notre cible conservatrice — piocher l'élégance, pas la surcharge.
- **Godly** — https://godly.website — inspiration web haut de gamme, souvent sobre.
- **Cofolios / portfolios d'ingénieurs** — chercher des portfolios de dev/ingénieurs (pas de designers pures) pour calibrer le curseur "impressionnant mais crédible pour un profil technique".

## Concepts / pédagogie

- **Olivier Larose** — https://blog.olivierlarose.com — tutoriels d'effets scroll (React, mais les concepts et le maths d'easing se transposent en GSAP vanilla).
- **GSAP Learning** — https://gsap.com/resources/ — easing, timelines, stagger.

## Rappels d'usage pour ce projet

- Tout ce qui vient d'ici passe par le filtre du **conseil** (Kenji pour le rendu/motion, Marc pour la charte, Élise pour "est-ce que ça sert le profil ?", Léa pour la perf).
- Vérifier au screenshot (skill `hero3d-visual-check`, positions de scroll multiples) avant de pousser.
- Un effet = une intention. Si on ne sait pas dire ce qu'il *révèle* du contenu, on ne le met pas.
