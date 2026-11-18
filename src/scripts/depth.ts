/**
 * Depth as you scroll: whatever stands nearer to you in the room passes by a little faster than
 * the page. [data-depth] is how much nearer, as a fraction: at 0.06 a card sits 6px further along
 * for every 100px it is from the middle of the screen, and right where it was laid out as it
 * crosses the middle. It moves with the `translate` property, so it adds to any transform the
 * card already has (rising into view, the buoyant tilt). Laptops and desktops only, and never
 * with reduced motion.
 */
type Item = { el: HTMLElement; k: number; mid: number };

const on = window.matchMedia('(min-width: 1100px) and (prefers-reduced-motion: no-preference)');
let items: Item[] = [];
let ticking = false;
let bound = false;

/* Where each card sits on the page, without its shift */
function measure() {
  for (const it of items) it.el.style.translate = '';
  for (const it of items) {
    const r = it.el.getBoundingClientRect();
    it.mid = r.top + window.scrollY + r.height / 2;
  }
}

function update() {
  ticking = false;
  if (!on.matches) {
    for (const it of items) it.el.style.translate = '';
    return;
  }
  const centre = window.scrollY + window.innerHeight / 2;
  for (const it of items) it.el.style.translate = `0 ${((it.mid - centre) * it.k).toFixed(1)}px`;
}

const queue = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
};
const remeasure = () => {
  measure();
  queue();
};

export function initDepth() {
  items = Array.from(document.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
    el,
    k: Number(el.dataset.depth) || 0,
    mid: 0,
  }));
  if (!bound) {
    bound = true;
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', remeasure, { passive: true });
    on.addEventListener('change', remeasure);
    // Anything that changes the page's height (a case study opening, fonts arriving) moves the cards
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
  }
  remeasure();
}
