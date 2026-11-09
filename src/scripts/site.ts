/**
 * Site-wide behaviour: header state, mobile menu, scroll reveals,
 * the mark's pointer tilt, and copy-to-clipboard.
 * Every effect is decorative; the page is complete without this script.
 */
import { initMarks } from './marks';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Header ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  // The header is light-on-dark whenever it sits over a dark area: a dark hero, a page that is
  // dark throughout (Our Work), or the part below a hero when the device is in dark mode
  const alwaysDark = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-dark], [data-dark-page]'));
  const body = Array.from(document.querySelectorAll<HTMLElement>('[data-body]'));
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    const mid = header.offsetHeight / 2;
    const dark = darkMode.matches ? alwaysDark.concat(body) : alwaysDark;
    header.classList.toggle(
      'over-dark',
      dark.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= mid && r.bottom > mid;
      }),
    );
    ticking = false;
  };
  update();
  darkMode.addEventListener('change', update);
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update, { passive: true });
}

/* ---------- Mobile menu ---------- */
function initMenu() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-mobile-nav]');
  if (!header || !toggle || !panel) return;
  const label = toggle.querySelector('.menu-label');

  const open = () => {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = 'Close';
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => header.classList.add('is-open'));
    panel.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
  };
  const close = (returnFocus = true) => {
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menu';
    document.documentElement.style.overflow = '';
    panel.hidden = true;
    if (returnFocus) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => (toggle.getAttribute('aria-expanded') === 'true' ? close() : open()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close();
  });
  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) close(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) close(false);
  });
}

/* ---------- Scroll reveals ----------
   Content is visible at rest. Only elements that start below the fold animate,
   and the observer fires just before they enter the viewport. */
function initReveals() {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!els.length) return;

  // Once an element has risen into place it goes back to normal, so it no longer sits on
  // its own layer (the focus veil needs to be able to lift things out of it)
  const settle = (el: Element) =>
    el.addEventListener('animationend', function done(e) {
      if (e.target !== el || (e as AnimationEvent).animationName !== 'rise') return;
      el.classList.remove('reveal-in');
      el.removeEventListener('animationend', done);
    });
  const play = (el: HTMLElement) => {
    if (el.dataset.reveal === 'stagger') {
      Array.from(el.children).forEach((child, i) => {
        (child as HTMLElement).style.setProperty('--i', String(i));
        settle(child);
        child.classList.add('reveal-in');
      });
    } else {
      settle(el);
      el.classList.add('reveal-in');
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        play(entry.target as HTMLElement);
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px 10% 0px', threshold: 0 },
  );

  const fold = window.innerHeight;
  for (const el of els) {
    if (el.getBoundingClientRect().top < fold) continue;
    io.observe(el);
  }
}

/* ---------- Copy email ---------- */
function initCopy() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy ?? '';
      const host = btn.closest<HTMLElement>('[data-copy-email]');
      const status = btn.querySelector('.copy-status');
      const done = () => {
        host?.classList.add('is-copied');
        if (status) status.textContent = 'Copied';
        window.setTimeout(() => {
          host?.classList.remove('is-copied');
          if (status) status.textContent = '';
        }, 1800);
      };
      try {
        await navigator.clipboard.writeText(value);
        done();
      } catch {
        const text = host?.querySelector('.copy-address');
        if (text) {
          const range = document.createRange();
          range.selectNodeContents(text);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    });
  });
}

initHeader();
initMenu();
initReveals();
initCopy();
document.addEventListener('spockhart:view', initReveals);
initMarks(reduceMotion);
