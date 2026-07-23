// ===========================================================
// ENZO LORANDI - PORTFOLIO
// JS partagé (3 pages)
//   - nav / burger / section active
//   - couche WOW scroll : smooth scroll Lenis + révélations GSAP
// Libs attendues en globaux (chargées avant ce fichier) :
//   window.gsap, window.ScrollTrigger, window.Lenis
// ===========================================================

// ---------- NAV : fond au scroll ----------
const nav = document.getElementById('nav');
if (nav && !nav.classList.contains('scrolled')) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll);
  onScroll();
}

// ---------- BURGER : menu mobile ----------
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ---------- SECTION ACTIVE (index uniquement) ----------
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

if (sections.length && navItems.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(a => {
          const isActive = a.getAttribute('href') === `#${id}`;
          if (!a.classList.contains('nav-cta')) {
            a.classList.toggle('active', isActive);
          }
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ---------- VIDÉO DE DÉMO : façade cliquable -> iframe au clic ----------
// Aucune ressource YouTube n'est chargée tant que l'utilisateur n'a pas
// cliqué (une iframe YouTube pèse ~1 Mo et pose des cookies tiers). Sans JS,
// la façade reste un simple lien vers la vidéo : le contenu est toujours
// atteignable. Voir CLAUDE.md pour le markup à coller par projet.
document.querySelectorAll('.video-embed[data-video-id]').forEach((facade) => {
  const id = facade.dataset.videoId;
  if (!id || id.startsWith('A_REMPLIR')) return; // identifiant pas encore renseigné

  facade.addEventListener('click', (e) => {
    // on laisse passer les gestes "ouvrir dans un nouvel onglet" : le <a> porte
    // un target="_blank", il doit tenir sa promesse.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    iframe.title = facade.getAttribute('aria-label') || 'Vidéo de démonstration';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;

    // on remplace le <a> par un conteneur neutre (une iframe dans un lien
    // serait du HTML invalide et piégerait les clics)
    const wrap = document.createElement('div');
    wrap.className = 'video-embed playing';
    wrap.appendChild(iframe);
    facade.replaceWith(wrap);
    // le <a> qui portait le focus vient de disparaître du DOM : sans ça,
    // l'utilisateur clavier repart du haut de la page.
    wrap.tabIndex = -1;
    wrap.focus();
  });
});

// ===========================================================
// COUCHE WOW SCROLL — Lenis (smooth) + GSAP/ScrollTrigger
// ===========================================================
(function initScrollMotion() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Éléments révélés au scroll. IMPORTANT : ils restent visibles en CSS de
  // base — c'est le JS qui les masque puis les révèle. Si le JS ne tourne
  // pas (ou pas de GSAP), le contenu s'affiche normalement.
  const REVEAL_SELECTOR = [
    '.section-label', '.section h2', '.piliers-intro',
    '.pilier', '.project-card', '.skill-block', '.xp-preview',
    '.tl-item', '.project-detail', '.contact-text', '.contact-item',
    '.page-header h1', '.page-header p'
  ].join(', ');

  const hasGSAP = window.gsap && window.ScrollTrigger;
  if (!hasGSAP) return; // pas de lib -> contenu visible, aucune animation

  gsap.registerPlugin(ScrollTrigger);

  // --- Accessibilité : mouvement réduit -> aucune animation, aucun smooth
  //     scroll. On ne masque rien : le contenu reste en état final. ---
  if (prefersReduced) return;

  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10
  ) || 68;

  // ---------- Smooth scroll inertiel (Lenis) ----------
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: true,
    });
    // une seule horloge : le ticker gsap pilote Lenis
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // ScrollTrigger recalcule à chaque frame de scroll Lenis
    lenis.on('scroll', ScrollTrigger.update);
    window.__lenis = lenis; // exposé (debug / hero3d si besoin)

    // ancres internes -> scroll fluide (respecte la hauteur de nav)
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href.length < 2) return; // ignore href="#"
      a.addEventListener('click', (e) => {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -navHeight, duration: 1.2 });
      });
    });
  }

  // ---------- Révélations au scroll (batch, échelonnées) ----------
  const revealEls = gsap.utils.toArray(REVEAL_SELECTOR);
  if (revealEls.length) {
    gsap.set(revealEls, { opacity: 0, y: 26 });
    ScrollTrigger.batch(revealEls, {
      start: 'top 88%',
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0,
        duration: 0.8, stagger: 0.09, ease: 'power3.out', overwrite: true,
      }),
      once: true,
    });
  }

  // ---------- Intro du hero au chargement (accueil) ----------
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner) {
    gsap.from(heroInner.children, {
      opacity: 0, y: 30,
      duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.15,
    });
  }

  // ---------- Parallaxe + fondu du hero au scroll ----------
  const hero = document.querySelector('.hero');
  if (hero && heroInner) {
    gsap.to(heroInner, {
      yPercent: 16, opacity: 0.25, ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.4,
      },
    });
  }

  // ---------- Moment fort : manifeste pinné, mots qui s'illuminent ----------
  const manifesto = document.querySelector('.manifesto');
  if (manifesto) {
    const words = manifesto.querySelectorAll('.word');
    if (words.length) {
      gsap.set(words, { opacity: 0.12 }); // en veille -> s'allument au scroll
      gsap.timeline({
        scrollTrigger: {
          trigger: manifesto,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.5,
        },
      }).to(words, { opacity: 1, stagger: 0.4, ease: 'none' });
    }
  }

  // ---------- Barre de progression de scroll (charte orange) ----------
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  gsap.to(bar, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  // ---------- Recalage après chargement images/fonts ----------
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
