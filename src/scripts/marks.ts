/**
 * Marks with `.mark-tilt` lean a few degrees toward the pointer.
 * Paused offscreen and under reduced motion; touch input is ignored.
 */
export function initMarks(reduce: MediaQueryList) {
  const marks = Array.from(document.querySelectorAll<SVGSVGElement>('svg.mark-tilt'));
  if (!marks.length || reduce.matches) return;

  const state = marks.map((el) => ({ el, visible: false, x: 0, y: 0, tx: 0, ty: 0 }));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const s = state.find((m) => m.el === e.target);
      if (s) s.visible = e.isIntersecting;
    }
    start();
  });
  marks.forEach((m) => io.observe(m));

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      for (const s of state) {
        const r = s.el.getBoundingClientRect();
        const reach = Math.max(window.innerWidth, window.innerHeight) * 0.6;
        s.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / reach));
        s.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / reach));
      }
      start();
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => {
    state.forEach((s) => ((s.tx = 0), (s.ty = 0)));
    start();
  });

  let raf = 0;
  const start = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const frame = () => {
    raf = 0;
    let moving = false;
    for (const s of state) {
      if (!s.visible) continue;
      s.x += (s.tx - s.x) * 0.07;
      s.y += (s.ty - s.y) * 0.07;
      s.el.style.transform = `perspective(900px) rotateY(${(s.x * 9).toFixed(2)}deg) rotateX(${(-s.y * 9).toFixed(2)}deg)`;
      if (Math.abs(s.tx - s.x) > 0.001 || Math.abs(s.ty - s.y) > 0.001) moving = true;
    }
    if (moving) start();
  };
}
