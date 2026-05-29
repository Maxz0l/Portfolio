// ===========================================================
// ENZO LORANDI - PORTFOLIO
// JS partagé (3 pages) - v1 statique
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

// ---------- REVEAL au scroll ----------
const revealEls = document.querySelectorAll('.pilier, .project-card, .skill-block, .xp-preview, .tl-item, .project-detail, .contact-item');
revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, (i % 3) * 90);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));
