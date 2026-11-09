/**
 * A tiny timeline engine for the case study graphics (ResultVisual.astro).
 *
 * Each [data-scene] loops over `data-loop` seconds while it is on screen. Every
 * frame it writes the current time to `--t` on the scene, and CSS turns that
 * into fills, fades and pops. A few things CSS cannot do are handled here:
 *
 *   data-count="t0 v0, t1 v1"   number ticker, text from data-fmt ("Week {}")
 *   data-along="#path"          follow an SVG path, with data-keys="t f, t f" or
 *                               data-speed / data-offset / data-stops for a loop
 *   data-hops="x0 x1 ..."       bounce between points in the order of data-seq
 *   data-move="x0 y0 x1 y1 a b" glide between two points from time a to b
 *   data-board                  rows with data-vals re-sort by value over data-times
 *
 * With reduced motion, or before the script runs, scenes rest on `--still`.
 */

type Update = (t: number) => void;

/** How fast scene time runs against the clock. Below 1 slows every graphic down evenly.
 *  A scene, or anything around it, can set its own pace with data-rate (the Approach phases do). */
const SPEED = 0.25;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const nums = (s: string | undefined) => (s ?? '').trim().split(/[\s,]+/).filter(Boolean).map(Number);
const pairs = (s: string | undefined) =>
  (s ?? '')
    .split(',')
    .map((p) => nums(p))
    .filter((p) => p.length === 2) as [number, number][];

function piecewise(keys: [number, number][], t: number, ease: (x: number) => number) {
  if (!keys.length) return 0;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return lerp(v0, v1, ease((t - t0) / (t1 - t0 || 1)));
  }
  return keys[keys.length - 1][1];
}

const place = (el: Element, x: number, y: number) => el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);

function counters(scene: HTMLElement): Update[] {
  return Array.from(scene.querySelectorAll<HTMLElement>('[data-count]')).map((el) => {
    const keys = pairs(el.dataset.count);
    const fmt = el.dataset.fmt ?? '{}';
    let last = '';
    return (t) => {
      const v = Math.floor(piecewise(keys, t, (x) => clamp01(x)) + 1e-6);
      const text = fmt.replace('{}', v.toLocaleString('en-CA'));
      if (text !== last) el.textContent = last = text;
    };
  });
}

function followers(scene: HTMLElement): Update[] {
  return Array.from(scene.querySelectorAll<SVGGraphicsElement>('[data-along]')).map((el) => {
    const path = scene.querySelector<SVGPathElement>(el.dataset.along!);
    if (!path) return () => {};
    // Measured on first use: a scene in a hidden view may not have geometry yet.
    let len = 0;
    const keys = pairs(el.dataset.keys);
    const speed = Number(el.dataset.speed ?? 0);
    const offset = Number(el.dataset.offset ?? 0);
    // Stations: cumulative path fractions where a mover pauses ("0 0.2 ... 1").
    const stops = nums(el.dataset.stops);
    return (t) => {
      let f: number;
      if (keys.length) {
        f = piecewise(keys, t, smooth);
      } else {
        f = (((t * speed + offset) % 1) + 1) % 1;
        if (stops.length > 1) {
          // Stop and go: move for part of each leg, then wait at the station.
          let k = 0;
          while (k < stops.length - 2 && f >= stops[k + 1]) k++;
          const span = stops[k + 1] - stops[k] || 1;
          f = stops[k] + smooth((f - stops[k]) / span / 0.55) * span;
        }
      }
      if (!len) len = path.getTotalLength();
      if (!len) return;
      const p = path.getPointAtLength(clamp01(f) * len);
      place(el, p.x, p.y);
    };
  });
}

function hoppers(scene: HTMLElement): Update[] {
  return Array.from(scene.querySelectorAll<SVGGraphicsElement>('[data-hops]')).map((el) => {
    const xs = nums(el.dataset.hops);
    const seq = nums(el.dataset.seq);
    const y = Number(el.dataset.y ?? 0);
    const hop = Number(el.dataset.hop ?? 0.7);
    const start = Number(el.dataset.start ?? 0);
    const lift = Number(el.dataset.lift ?? 0.3);
    return (t) => {
      const s = Math.max(0, t - start);
      const k = Math.min(seq.length - 1, Math.floor(s / hop));
      if (k >= seq.length - 1) return place(el, xs[seq[seq.length - 1]], y);
      const a = xs[seq[k]];
      const b = xs[seq[k + 1]];
      const m = smooth((s - k * hop) / (hop * 0.72));
      place(el, lerp(a, b, m), y - Math.sin(Math.PI * m) * Math.abs(b - a) * lift);
    };
  });
}

function movers(scene: HTMLElement): Update[] {
  return Array.from(scene.querySelectorAll<SVGGraphicsElement>('[data-move]')).map((el) => {
    const [x0, y0, x1, y1, a, b] = nums(el.dataset.move);
    return (t) => {
      const p = smooth((t - a) / (b - a));
      place(el, lerp(x0, x1, p), lerp(y0, y1, p));
    };
  });
}

function boards(scene: HTMLElement): Update[] {
  return Array.from(scene.querySelectorAll<HTMLElement>('[data-board]')).map((board) => {
    const times = nums(board.dataset.times);
    const rows = Array.from(board.querySelectorAll<HTMLElement>('[data-vals]'));
    const vals = rows.map((r) => nums(r.dataset.vals).map((v, i) => [times[i], v] as [number, number]));
    const ranks = rows.map(() => -1);
    return (t) => {
      const now = vals.map((keys) => piecewise(keys, t, smooth));
      const order = now.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0]).map(([, i]) => i);
      rows.forEach((row, i) => {
        row.style.setProperty('--v', now[i].toFixed(3));
        const r = order.indexOf(i);
        if (r !== ranks[i]) {
          ranks[i] = r;
          row.style.setProperty('--rank', String(r));
          row.dataset.rank = String(r);
        }
      });
    };
  });
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const canAnimate = () => !reduce.matches && 'IntersectionObserver' in window;

interface Controller {
  /** Start from the beginning. `once` plays a single loop, rests, then calls onDone. */
  play(opts?: { once?: boolean; onDone?: () => void }): void;
  /** Carry on from where it was. */
  resume(): void;
  pause(): void;
  /** Stop and rest on the finished frame. */
  stop(): void;
  /** Loop for as long as it runs, from where it is. */
  loop(): void;
}
const controllers = new WeakMap<HTMLElement, Controller>();

/* [data-cycle] holds alternatives (roles, kinds of organization); one shows per loop. */
function cyclers(scene: HTMLElement) {
  const sets = Array.from(scene.querySelectorAll<HTMLElement>('[data-cycle]'));
  let n = 0;
  return () => {
    n++;
    for (const set of sets) {
      const items = Array.from(set.children);
      items.forEach((el, i) => el.classList.toggle('on', i === n % items.length));
    }
  };
}

function makeController(scene: HTMLElement): Controller {
  const loop = Number(scene.dataset.loop ?? 8);
  const rate = Number(scene.closest<HTMLElement>('[data-rate]')?.dataset.rate ?? SPEED) || SPEED;
  const still = Number(scene.dataset.still ?? loop * 0.9);
  const updates = [...counters(scene), ...followers(scene), ...hoppers(scene), ...movers(scene), ...boards(scene)];
  const nextVariant = cyclers(scene);
  const apply = (t: number) => {
    scene.style.setProperty('--t', t.toFixed(3));
    for (const u of updates) u(t);
  };

  let raf = 0;
  let elapsed = 0;
  let last = 0;
  let lap = 0;
  let once = false;
  let onDone: (() => void) | undefined;

  const halt = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const stop = () => {
    halt();
    scene.classList.remove('is-playing');
    apply(still);
  };
  const frame = (now: number) => {
    if (last) elapsed += Math.min(0.1, (now - last) / 1000) * rate;
    last = now;
    if (once && elapsed >= loop) {
      stop();
      onDone?.();
      return;
    }
    const thisLap = Math.floor(elapsed / loop);
    if (thisLap !== lap) {
      lap = thisLap;
      nextVariant();
    }
    // data-hold pins a scene to one moment (used when checking the graphics).
    const hold = scene.dataset.hold;
    const t = hold ? Number(hold) : elapsed % loop;
    apply(t);
    // Lets things outside the scene follow along (the Approach timeline marker).
    scene.dispatchEvent(new CustomEvent('scene:frame', { detail: { t, loop } }));
    raf = requestAnimationFrame(frame);
  };

  apply(canAnimate() ? 0 : still);
  return {
    play(opts = {}) {
      halt();
      once = Boolean(opts.once);
      onDone = opts.onDone;
      elapsed = 0;
      last = 0;
      lap = 0;
      scene.classList.add('is-playing');
      raf = requestAnimationFrame(frame);
    },
    resume() {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    pause: halt,
    stop,
    loop() {
      once = false;
      onDone = undefined;
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
  };
}

function initScene(scene: HTMLElement) {
  if (scene.dataset.sceneReady) return;
  scene.dataset.sceneReady = '1';
  // [data-frozen]: a still picture (thumbnails). No clock; CSS rests it on --still.
  if (scene.closest('[data-frozen]')) return;
  const ctrl = makeController(scene);
  controllers.set(scene, ctrl);
  // [data-manual]: something else decides when it plays (sceneController below).
  if (scene.closest('[data-manual]')) {
    if (canAnimate()) ctrl.stop();
    return;
  }
  // Scenes inside a group are played one at a time by the group (below).
  if (!canAnimate() || scene.closest('[data-scene-group]')) {
    if (scene.closest('[data-scene-group]') && canAnimate()) ctrl.stop();
    return;
  }
  new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) ctrl.resume();
      else ctrl.pause();
    },
    { threshold: 0.25 },
  ).observe(scene);
}

/**
 * [data-scene-group]: its scenes play one at a time, in order, each for one loop.
 * Scenes that are not playing rest on their finished frame.
 *
 * The attribute can hold a media query, e.g. data-scene-group="(min-width: 901px)".
 * Where the query does not match (phones), the scenes simply loop on their own while
 * they are on screen, like any other scene.
 */
function initGroup(group: HTMLElement) {
  if (group.dataset.groupReady || !canAnimate()) return;
  group.dataset.groupReady = '1';
  const scenes = Array.from(group.querySelectorAll<HTMLElement>('[data-scene]'));
  const ctrls = scenes.map((s) => controllers.get(s)!);
  const gap = Number(group.dataset.gap ?? 700);
  const mq = group.dataset.sceneGroup ? window.matchMedia(group.dataset.sceneGroup) : null;
  // data-hover="(query)": where it matches, nothing moves until a scene is pointed at
  const hoverMq = group.dataset.hover ? window.matchMedia(group.dataset.hover) : null;
  const hovering = () => Boolean(hoverMq?.matches);
  const sequenced = () => (!mq || mq.matches) && !hovering();
  let index = 0;
  let visible = false;
  let timer = 0;
  let running = false;
  const onScreen = new Set<number>();

  const mark = (k: number) => scenes.forEach((s, i) => s.classList.toggle('is-active', i === k));
  const next = () => {
    if (!visible || !sequenced()) return;
    const k = index;
    running = true;
    mark(k);
    ctrls[k].play({
      once: true,
      onDone: () => {
        running = false;
        mark(-1);
        index = (k + 1) % scenes.length;
        timer = window.setTimeout(next, gap);
      },
    });
  };
  const halt = () => {
    window.clearTimeout(timer);
    ctrls.forEach((c) => c.stop());
    running = false;
    mark(-1);
  };
  const modeName = () => (hovering() ? 'hover' : sequenced() ? 'sequence' : 'free');
  const setMode = () => {
    halt();
    group.dataset.mode = modeName();
    if (hovering()) return;
    if (sequenced()) {
      index = 0;
      next();
    } else {
      onScreen.forEach((k) => ctrls[k].loop());
    }
  };

  new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (!sequenced()) return;
      if (visible && !running) next();
      if (!visible) halt();
    },
    { threshold: 0.35 },
  ).observe(group);

  const each = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const k = scenes.indexOf(e.target as HTMLElement);
        if (e.isIntersecting) onScreen.add(k);
        else onScreen.delete(k);
        if (sequenced() || hovering()) continue;
        if (e.isIntersecting) ctrls[k].loop();
        else ctrls[k].pause();
      }
    },
    { threshold: 0.25 },
  );
  scenes.forEach((s) => each.observe(s));

  // Hover mode: the scene pointed at plays from the start and keeps looping; leaving stops it
  scenes.forEach((scene, k) => {
    scene.addEventListener('pointerenter', () => {
      if (!hovering()) return;
      mark(k);
      ctrls[k].play();
    });
    scene.addEventListener('pointerleave', () => {
      if (!hovering()) return;
      ctrls[k].stop();
      mark(-1);
    });
  });

  group.dataset.mode = modeName();
  mq?.addEventListener('change', setMode);
  hoverMq?.addEventListener('change', setMode);
}

/** The controller for a scene, for scenes that are played by hand ([data-manual]). */
export function sceneController(scene: HTMLElement): Controller | undefined {
  return controllers.get(scene);
}
export const scenesCanAnimate = () => canAnimate();

export function initScenes() {
  document.querySelectorAll<HTMLElement>('[data-scene]').forEach(initScene);
  document.querySelectorAll<HTMLElement>('[data-scene-group]').forEach(initGroup);
}
