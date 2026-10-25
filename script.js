const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const header = $('#header'), burger = $('#burger'), nav = $('#nav');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Convert root-based site links to explicit index.html paths. This keeps them
// working on a web host and when the folder is previewed with file:// URLs.
const siteScript = document.currentScript;
if (siteScript && siteScript.src) {
  const siteRoot = new URL('.', siteScript.src);
  $$('a[href^="/"]').forEach(link => {
    const target = new URL(link.getAttribute('href').slice(1), siteRoot);
    if (target.pathname === siteRoot.pathname || target.pathname.endsWith('/')) {
      target.pathname += 'index.html';
    }
    link.href = target.href;
  });
}

if (header && burger && nav) {
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 20), { passive: true });
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', nav.classList.toggle('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

// Animate numbers from their visible HTML values; the figures remain correct without JavaScript.
function countUp(el) {
  const end = Number(el.dataset.n);
  const start = performance.now();
  const duration = 900;
  (function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = String(Math.round(end * (1 - Math.pow(1 - progress, 3))));
    if (progress < 1) requestAnimationFrame(tick);
  })(start);
}

const stats = $$('.stats b[data-n]');
if ('IntersectionObserver' in window && !reduce) {
  const statsObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      countUp(entry.target);
      statsObserver.unobserve(entry.target);
    }
  }), { threshold: 0.3 });
  stats.forEach(el => statsObserver.observe(el));
}

const hero = $('.hero'), heroImage = $('.hero-img');
if (hero && heroImage && !reduce && matchMedia('(hover:hover)').matches) {
  hero.addEventListener('mousemove', event => {
    const x = event.clientX / innerWidth - 0.5;
    const y = event.clientY / innerHeight - 0.5;
    heroImage.style.transform = `perspective(900px) rotateY(${x * -8}deg) rotateX(${y * 6}deg)`;
  });
  hero.addEventListener('mouseleave', () => heroImage.style.transform = '');
}

const form = $('#form');
if (form) form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(form);
  const english = document.documentElement.lang === 'en';
  const message = english
    ? `Hello, I need vehicle transport.\nName: ${fields.get('n')}\nLocation: ${fields.get('l')}\nService: ${fields.get('s')}`
    : `السلام عليكم، أحتاج سطحة.\nالاسم: ${fields.get('n')}\nالموقع: ${fields.get('l')}\nالخدمة: ${fields.get('s')}`;
  trackEvent('generate_lead', { method: 'whatsapp_form' });
  location.href = `https://wa.me/966508432801?text=${encodeURIComponent(message)}`;
});

function trackEvent(name, parameters = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', name, parameters);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: `site_${name}`, ...parameters });
  // Google Ads placeholder: gtag('event', 'conversion', { send_to: 'AW-REPLACE_WITH_ID/REPLACE_WITH_LABEL' });
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="tel:"], a[href*="wa.me/"]');
  if (!link) return;
  trackEvent(link.href.startsWith('tel:') ? 'phone_click' : 'whatsapp_click', { link_url: link.href });
});

const year = $('#year');
if (year) year.textContent = String(new Date().getFullYear());

const scene = $('#scene');
if (scene && 'IntersectionObserver' in window && !reduce) {
  new IntersectionObserver((entries, observer) => entries.forEach(entry => {
    if (entry.isIntersecting) {
      scene.classList.add('go');
      observer.disconnect();
    }
  }), { threshold: 0.3 }).observe(scene);
} else if (scene) {
  scene.classList.add('go');
}
