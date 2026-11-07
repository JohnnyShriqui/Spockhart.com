import { compute, inputs, describeDays, iconScale, type Values } from '../lib/calc';

const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
const int = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const formatInput = (format: string, v: number) => (format === 'money' ? `$${v}` : format === 'hours' ? `${v} h` : int.format(v));

const PERSON =
  '<svg viewBox="0 0 12 16"><circle cx="6" cy="4" r="3.2"/><path d="M0.6 16c0-3.6 2.4-6.2 5.4-6.2s5.4 2.6 5.4 6.2z"/></svg>';

export function initCalculator() {
  const root = document.querySelector<HTMLElement>('[data-calc]');
  if (!root) return;
  const form = root.querySelector<HTMLFormElement>('[data-calc-form]')!;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const out = (key: string) => root.querySelector<HTMLElement>(`[data-out="${key}"]`);
  // A figure can appear more than once (the phone layout repeats some), so update them all.
  const outs = (key: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-out="${key}"]`));
  const ranges = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="range"]'));
  const days = Array.from(root.querySelectorAll<HTMLElement>('.day'));
  const team = root.querySelector<HTMLElement>('[data-team]');
  const teamKey = root.querySelector<HTMLElement>('[data-team-key]');
  const cta = root.querySelector<HTMLAnchorElement>('[data-calc-cta]');
  const summary = root.querySelector<HTMLElement>('[data-calc-summary]');

  // Displayed numbers tween from their last value.
  const shown: Record<string, number> = {};
  const anims: Record<string, number> = {};
  const tween = (key: string, to: number, fmt: (n: number) => string, from?: number, dur = 420) => {
    const els = outs(key);
    if (!els.length) return;
    const set = (text: string) => els.forEach((el) => (el.textContent = text));
    const start = from ?? shown[key] ?? to;
    shown[key] = to;
    cancelAnimationFrame(anims[key]);
    if (reduce || start === to) {
      set(fmt(to));
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      set(fmt(start + (to - start) * e));
      if (t < 1) anims[key] = requestAnimationFrame(step);
    };
    anims[key] = requestAnimationFrame(step);
  };

  const values = (): Values => {
    const v = {} as Values;
    for (const r of ranges) v[r.name as keyof Values] = Number(r.value);
    return v;
  };

  let iconCount = team?.children.length ?? 0;
  const renderTeam = (people: number, fte: number) => {
    if (!team) return;
    const { icons, per } = iconScale(people);
    if (icons !== iconCount) {
      team.innerHTML = Array.from({ length: icons }, () => `<span class="person">${PERSON}${PERSON.replace('<svg', '<svg class="person-fill"')}</span>`).join('');
      // Scoped styles need the component's data attribute on injected nodes.
      const scope = Array.from(root.attributes).find((a) => a.name.startsWith('data-astro-cid'));
      if (scope) team.querySelectorAll('*').forEach((n) => n.setAttribute(scope.name, ''));
      iconCount = icons;
    }
    const filled = fte / per;
    Array.from(team.children).forEach((el, i) => {
      (el as HTMLElement).style.setProperty('--f', String(Math.max(0, Math.min(1, filled - i))));
    });
    if (teamKey) {
      teamKey.hidden = per === 1;
      teamKey.textContent = `Each figure is ${per} people`;
    }
  };

  let summaryTimer = 0;
  const update = () => {
    const v = values();
    const r = compute(v);

    for (const input of ranges) {
      const min = Number(input.min);
      const max = Number(input.max);
      const fmt = input.dataset.format ?? 'int';
      input.style.setProperty('--p', `${((Number(input.value) - min) / (max - min)) * 100}%`);
      const display = form.querySelector<HTMLElement>(`[data-display="${input.name}"]`);
      if (display) display.textContent = formatInput(fmt, Number(input.value));
      input.setAttribute('aria-valuetext', formatInput(fmt, Number(input.value)));
    }

    tween('hours', r.hours, (n) => int.format(n));
    tween('cost', r.cost, (n) => money.format(n));
    tween('fte', r.fte, (n) => one.format(n));
    outs('days').forEach((d) => (d.textContent = describeDays(v.hours)));
    const lost = v.hours / 8;
    days.forEach((el, i) => el.style.setProperty('--f', String(Math.max(0, Math.min(1, lost - (4 - i))))));
    renderTeam(v.people, r.fte);

    if (cta) {
      const estimate = `Our numbers: ${v.people} people spend about ${v.hours} hours a week each on manual work. That is ${int.format(r.hours)} hours and ${money.format(r.cost)} a year.`;
      cta.href = `${cta.getAttribute('href')!.split('?')[0]}?${new URLSearchParams({ estimate }).toString()}`;
    }

    window.clearTimeout(summaryTimer);
    summaryTimer = window.setTimeout(() => {
      if (summary) {
        summary.textContent = `${int.format(r.hours)} hours a year, ${money.format(r.cost)}, about ${one.format(r.fte)} full-time people.`;
      }
    }, 600);
  };

  // Seed tween state from the server-rendered figures.
  const initial = compute(Object.fromEntries(inputs.map((f) => [f.key, f.value])) as Values);
  Object.assign(shown, { hours: initial.hours, cost: initial.cost, fte: initial.fte });

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();

  // The first time the result comes into view, count up to it.
  if (!reduce && 'IntersectionObserver' in window) {
    const big = out('cost');
    if (big && big.getBoundingClientRect().top > window.innerHeight) {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          const r = compute(values());
          tween('hours', r.hours, (n) => int.format(n), 0, 1400);
          tween('cost', r.cost, (n) => money.format(n), 0, 1400);
          tween('fte', r.fte, (n) => one.format(n), 0, 1400);
        },
        { threshold: 0.6 },
      );
      io.observe(big);
    }
  }
}
