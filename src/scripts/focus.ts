/**
 * Focus: when someone points at one thing (a case study, a phase), the rest of the page
 * steps back behind a soft grey veil, so it is clear what to look at.
 *
 * focusOn(zone) lifts that zone above the veil; focusOn(null) lets everything back.
 * Inside the zone, components dim their own other items (keyed on html.is-focusing).
 */
let veil: HTMLElement | null = null;
let zone: HTMLElement | null = null;
let release = 0;
let lower = 0;

const root = document.documentElement;

function ensureVeil() {
  if (veil?.isConnected) return;
  veil = document.createElement('div');
  veil.className = 'focus-veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.append(veil);
}

function apply(next: HTMLElement | null) {
  window.clearTimeout(lower);
  if (next) {
    ensureVeil();
    if (zone && zone !== next) zone.classList.remove('is-focus-zone');
    zone = next;
    zone.classList.add('is-focus-zone');
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
