/**
 * Contact page: a one-sentence form with a live brief beside it.
 *
 * - Blanks in the sentence size themselves to what is typed.
 * - The brief mirrors every answer and ticks each row off as it is completed.
 * - "Add your numbers" opens a small version of the time calculator. Visitors who
 *   arrive from the home page calculator (?p=&h=&r=) land with it filled in.
 * - On send, the brief posts to `site.formEndpoint` when one is configured. With no
 *   endpoint it is composed for the visitor to send from their own email.
 */
import { compute, type Values } from '../lib/calc';

const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
const int = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtInput = (format: string, v: number) => (format === 'money' ? `$${v}` : format === 'hours' ? `${v} h` : int.format(v));
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = '1';

  const q = <T extends Element>(sel: string) => form.querySelector<T>(sel)!;
  const name = q<HTMLInputElement>('#cf-name');
  const org = q<HTMLInputElement>('#cf-org');
  const email = q<HTMLInputElement>('#cf-email');
  const type = q<HTMLSelectElement>('#cf-type');
  const size = q<HTMLSelectElement>('#cf-size');
  const message = q<HTMLTextAreaElement>('#cf-message');
  const picks = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="problems"]'));
  const blanks = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('.blank'));

  const brief = q<HTMLElement>('[data-brief]');
  const status = q<HTMLElement>('[data-brief-status]');
  const row = (key: string) => q<HTMLElement>(`[data-row="${key}"]`);
  const seg = (key: string) => q<HTMLElement>(`[data-seg="${key}"]`);
  const tags = q<HTMLElement>('[data-tags]');
  const tagsEmpty = row('problems').querySelector<HTMLElement>('[data-empty]')!;

  const addNumbers = q<HTMLButtonElement>('[data-add-numbers]');
  const removeNumbers = q<HTMLButtonElement>('[data-remove-numbers]');
  const calcPanel = q<HTMLElement>('[data-calc-panel]');
  const ranges = Array.from(calcPanel.querySelectorAll<HTMLInputElement>('input[type="range"]'));
  const numbersField = q<HTMLInputElement>('[data-numbers-field]');
  const calcOut = (key: string) => calcPanel.querySelector<HTMLElement>(`[data-calc-out="${key}"]`)!;

  const errorBox = q<HTMLElement>('[data-form-error]');
  const submit = q<HTMLButtonElement>('[data-submit]');
  const submitLabel = q<HTMLElement>('[data-submit-label]');

  /* ---------- Blanks size to their contents ---------- */
  const ctx = document.createElement('canvas').getContext('2d');
  const fit = (el: HTMLInputElement | HTMLSelectElement) => {
    if (!ctx) return;
    const cs = getComputedStyle(el);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const text = el instanceof HTMLSelectElement ? (el.options[el.selectedIndex]?.text ?? '') : el.value || el.placeholder;
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    el.style.width = `${Math.ceil(ctx.measureText(text).width + pad + 2)}px`;
  };
  const fitAll = () => blanks.forEach(fit);
  fitAll();
  document.fonts?.ready.then(fitAll);
  window.addEventListener('resize', fitAll);

  /* ---------- Optional numbers ---------- */
  let numbersOn = false;
  const values = (): Values => {
    const v = {} as Values;
    for (const r of ranges) v[r.dataset.key as keyof Values] = Number(r.value);
    return v;
  };
  const numbersText = () => {
    const v = values();
    const r = compute(v);
    return `${v.people} people, about ${v.hours} hours a week each, at $${v.rate} an hour. That is ${int.format(r.hours)} hours and ${money.format(r.cost)} a year.`;
  };
  const updateNumbers = () => {
    for (const input of ranges) {
      const min = Number(input.min);
      const max = Number(input.max);
      const v = Number(input.value);
      input.style.setProperty('--p', `${((v - min) / (max - min)) * 100}%`);
      const out = calcPanel.querySelector<HTMLElement>(`[data-mini-out="${input.dataset.key}"]`);
      const text = fmtInput(input.dataset.format ?? 'int', v);
      if (out) out.textContent = text;
      input.setAttribute('aria-valuetext', text);
    }
    const r = compute(values());
    calcOut('cost').textContent = money.format(r.cost);
    calcOut('hours').textContent = int.format(r.hours);
    calcOut('fte').textContent = one.format(r.fte);
    numbersField.value = numbersOn ? numbersText() : '';
  };
  const setNumbers = (on: boolean, focus = false) => {
    numbersOn = on;
    calcPanel.hidden = !on;
    addNumbers.hidden = on;
    addNumbers.setAttribute('aria-expanded', String(on));
    updateNumbers();
    render();
    if (focus) (on ? ranges[0] : addNumbers).focus();
  };
  addNumbers.addEventListener('click', () => setNumbers(true, true));
  removeNumbers.addEventListener('click', () => setNumbers(false, true));
  ranges.forEach((r) => r.addEventListener('input', () => {
    updateNumbers();
    render();
  }));

  /* ---------- The brief ---------- */
  const shown = new Set<string>();
  const setRow = (key: string, text: string, done: boolean) => {
    const el = row(key);
    const v = el.querySelector<HTMLElement>('[data-v]');
    if (v) v.textContent = text || v.dataset.emptyText || '';
    el.classList.toggle('is-empty', !text);
    el.classList.toggle('is-done', done);
    if (done) el.classList.remove('is-missing');
    seg(key).classList.toggle('on', done);
  };
  const render = () => {
    const n = name.value.trim();
    const o = org.value.trim();
    const e = email.value.trim();
    setRow('from', [n, o].filter(Boolean).join(', '), Boolean(n && o));
    setRow('team', `${cap(type.options[type.selectedIndex].text)} of ${size.options[size.selectedIndex].text} people`, true);

    const chosen = picks.filter((p) => p.checked).map((p) => p.value);
    tags.replaceChildren(
      ...chosen.map((c) => {
        const t = document.createElement('span');
        t.className = shown.has(c) ? 'btag' : 'btag is-new';
        t.textContent = c;
        return t;
      }),
    );
    shown.clear();
    chosen.forEach((c) => shown.add(c));
    tagsEmpty.hidden = chosen.length > 0;
    row('problems').classList.toggle('is-done', chosen.length > 0);
    seg('problems').classList.toggle('on', chosen.length > 0);

    row('numbers').classList.toggle('is-done', numbersOn);
    seg('numbers').classList.toggle('on', numbersOn);

    setRow('email', e, validEmail(e));

    const ready = Boolean(n && o && validEmail(e));
    brief.classList.toggle('is-ready', ready);
    status.textContent = ready ? 'Ready to send' : 'Draft';
  };

  /* ---------- Arriving from the calculator, or from the Nonprofits page ---------- */
  const title = document.querySelector<HTMLElement>('[data-contact-title]');
  const lead = document.querySelector<HTMLElement>('[data-contact-lead]');
  const prefill = () => {
    const query = location.search || (location.hash.includes('?') ? `?${location.hash.split('?')[1]}` : '');
    const params = new URLSearchParams(query);
    const keys: Record<string, string> = { people: 'p', hours: 'h', rate: 'r' };
    let fromCalc = false;
    for (const input of ranges) {
      const raw = params.get(keys[input.dataset.key ?? '']);
      if (raw === null || Number.isNaN(Number(raw))) continue;
      input.value = String(Math.min(Number(input.max), Math.max(Number(input.min), Number(raw))));
      fromCalc = true;
    }
    if (fromCalc) {
      setNumbers(true);
      if (title) title.textContent = 'Let’s get that time back.';
      if (lead) lead.textContent = 'Your numbers are already in the brief. Fill in the blanks and we reply within one business day.';
    }
    if (params.get('org') === 'nonprofit') type.value = 'Nonprofit';
    fit(type);
    render();
  };

  /* ---------- Live updates ---------- */
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    if (t.classList.contains('blank')) fit(t as HTMLInputElement);
    if (t.getAttribute('aria-invalid') === 'true' && (t as HTMLInputElement).value.trim()) t.removeAttribute('aria-invalid');
    render();
  });
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLElement;
    if (t instanceof HTMLSelectElement) fit(t);
    render();
  });

  updateNumbers();
  prefill();
  window.addEventListener('hashchange', prefill);

  /* ---------- Sending ---------- */
  const required: [HTMLInputElement, string, (v: string) => boolean][] = [
    [name, 'from', (v) => Boolean(v.trim())],
    [org, 'from', (v) => Boolean(v.trim())],
    [email, 'email', validEmail],
  ];

  const compose = () => {
    const chosen = picks.filter((p) => p.checked).map((p) => p.value);
    return [
      `Name: ${name.value.trim()}`,
      `Organization: ${org.value.trim()}`,
      `Team: ${type.value}, ${size.options[size.selectedIndex].text} people`,
      `Email: ${email.value.trim()}`,
      chosen.length ? `Slowing us down: ${chosen.join(', ')}` : '',
      numbersOn ? `Our numbers: ${numbersText()}` : '',
      message.value.trim() ? `\n${message.value.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    let first: HTMLInputElement | null = null;
    for (const [el, key, ok] of required) {
      if (ok(el.value)) continue;
      el.setAttribute('aria-invalid', 'true');
      row(key).classList.add('is-missing');
      first ??= el;
    }
    if (first) {
      const missing = [!name.value.trim() && 'your name', !org.value.trim() && 'your organization', !validEmail(email.value) && 'a work email']
        .filter(Boolean)
        .join(', ')
        .replace(/, ([^,]*)$/, ' and $1');
      errorBox.textContent = `Add ${missing} to send your brief.`;
      errorBox.hidden = false;
      first.focus();
      return;
    }
    if ((form.elements.namedItem('_gotcha') as HTMLInputElement)?.value) return;

    const endpoint = form.dataset.endpoint ?? '';
    const text = compose();

    if (!endpoint) {
      const panel = document.querySelector<HTMLElement>('[data-compose]');
      const body = document.querySelector<HTMLElement>('[data-compose-body]');
      const mail = document.querySelector<HTMLAnchorElement>('[data-compose-mail]');
      const copy = document.querySelector<HTMLButtonElement>('[data-compose-copy]');
      if (!panel || !body) return;
      body.textContent = text;
      if (mail) {
        const base = mail.getAttribute('href')!.split('?')[0];
        mail.href = `${base}?subject=${encodeURIComponent(`Starting a conversation: ${org.value.trim()}`)}&body=${encodeURIComponent(text)}`;
      }
      copy?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(text);
          copy.textContent = 'Copied';
        } catch {
          const range = document.createRange();
          range.selectNodeContents(body);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }
      });
      form.hidden = true;
      panel.hidden = false;
      const h = panel.querySelector<HTMLElement>('h2');
      h?.setAttribute('tabindex', '-1');
      h?.focus();
      panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }

    submit.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Sending';
    try {
      const chosen = picks.filter((p) => p.checked).map((p) => p.value);
      const payload = {
        name: name.value.trim(),
        organization: org.value.trim(),
        type: type.value,
        size: size.value,
        email: email.value.trim(),
        problems: chosen.join(', '),
        numbers: numbersOn ? numbersText() : '',
        message: message.value.trim(),
      };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      location.href = '/contact/thanks/';
    } catch {
      errorBox.textContent = 'That did not go through. Please try again, or email us directly at the address below.';
      errorBox.hidden = false;
      submit.removeAttribute('aria-busy');
      submitLabel.textContent = 'Send brief';
    }
  });
}
