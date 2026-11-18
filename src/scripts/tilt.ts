/**
 * Buoyant cards: the pointer has a little weight. Wherever it rests on a [data-tilt] card, that
 * spot sinks back slightly and the opposite side lifts, easing in and out as if the card were
 * floating. data-tilt is the most it leans, in degrees; data-tilt-depth is the perspective, in px
 * (larger for wider cards, so the lean stays as gentle). Laptops and desktops only, and never
 * with reduced motion.
 */
export function initTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    if (el.dataset.tiltReady) return;
    el.dataset.tiltReady = '1';
    const max = Number(el.dataset.tilt) || 3;
    const depth = Number(el.dataset.tiltDepth) || 1600;
    // Where the pointer is (target) and where the card has got to (current), both -0.5 to 0.5
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const frame = () => {
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      const settled = Math.abs(tx - x) < 0.0005 && Math.abs(ty - y) < 0.0005;
      if (settled && tx === 0 && ty === 0) {
        el.style.transform = '';
        raf = 0;
        return;
      }
      // The point under the pointer recedes: right side back for x > 0, top back for y < 0
      el.style.transform = `perspective(${depth}px) rotateX(${(-y * max).toFixed(3)}deg) rotateY(${(x * max).toFixed(3)}deg)`;
      raf = settled ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
      ty = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
      kick();
    });
    el.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
      kick();
    });
  });
}
