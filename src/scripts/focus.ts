/**
 * Focus: when someone points at one thing (a case study, a phase), the rest of the page
 * steps back behind a soft grey veil, so it is clear what to look at.
 *
 * focusOn(zone) lifts that zone above the veil; focusOn(null) lets everything back.
 * Inside the zone, components dim their own other items (keyed on html.is-focusing).
 */
let veil: HTMLElement | null = null;
let halo: HTMLElement | null = null;
let zone: HTMLElement | null = null;
let follow = 0;
let release = 0;
let lower = 0;

const root = document.documentElement;

function ensureVeil() {
  if (veil?.isConnected && halo?.isConnected) return;
  veil = document.createElement('div');
  veil.className = 'focus-veil';
  veil.setAttribute('aria-hidden', 'true');
  // A soft glow that hugs the focused item, so its edge fades into the veil instead of a hard line
  halo = document.createElement('div');
  halo.className = 'focus-halo';
  halo.setAttribute('aria-hidden', 'true');
  document.body.append(veil, halo);
}

// The halo follows the focused item as it opens, grows and scrolls
function track() {
  cancelAnimationFrame(follow);
  const step = () => {
    if (!zone || !halo) return;
    const r = zone.getBoundingClientRect();
    halo.style.transform = `translate(${r.left.toFixed(1)}px, ${r.top.toFixed(1)}px)`;
    halo.style.width = `${r.width.toFixed(1)}px`;
    halo.style.height = `${r.height.toFixed(1)}px`;
    follow = requestAnimationFrame(step);
  };
  step();
}

function apply(next: HTMLElement | null) {
  window.clearTimeout(lower);
  if (next) {
    ensureVeil();
    if (zone && zone !== next) zone.classList.remove('is-focus-zone');
    zone = next;
    zone.classList.add('is-focus-zone');
    track();
    // Let the veil exist for a frame before it fades in
    requestAnimationFrame(() => root.classList.add('is-focusing'));
    return;
  }
  root.classList.remove('is-focusing');
  // The zone stays above the veil until the veil has faded out
  const was = zone;
  lower = window.setTimeout(() => {
    if (zone === was && !root.classList.contains('is-focusing')) {
      was?.classList.remove('is-focus-zone');
      zone = null;
      cancelAnimationFrame(follow);
    }
  }, 360);
}

/** Lift a zone above the veil, or pass null to clear (after a short pause, so moving
 *  from one item to the next does not flicker). */
export function focusOn(next: HTMLElement | null) {
  window.clearTimeout(release);
  if (next) apply(next);
  else release = window.setTimeout(() => apply(null), 140);
}

document.addEventListener('spockhart:view', () => {
  window.clearTimeout(release);
  apply(null);
});
