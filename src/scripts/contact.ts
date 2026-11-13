/**
 * Contact form. With a Web3Forms access key it sends the message straight to John's inbox (a
 * clear subject line, one field per line, Reply goes to the visitor), then shows the thanks page.
 * Another JSON endpoint works the same way. With neither, it composes the message for the visitor
 * to send by email instead of failing silently.
 */
export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  const key = form.dataset.key ?? '';
  const endpoint = key ? 'https://api.web3forms.com/submit' : (form.dataset.endpoint ?? '');
  const errorBox = form.querySelector<HTMLElement>('[data-form-error]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const message = form.querySelector<HTMLTextAreaElement>('#cf-message')!;
  const type = form.querySelector<HTMLInputElement>('#cf-type')!;
  const estimateField = form.querySelector<HTMLInputElement>('#cf-estimate')!;

  // From the calculator: its numbers travel with the message, out of sight, rather than
  // appearing in the visitor's message box. Parameters arrive in the query string, or after
  // the hash when the site runs as a single page.
  const prefill = () => {
    const query = location.search || (location.hash.includes('?') ? `?${location.hash.split('?')[1]}` : '');
    const params = new URLSearchParams(query);
    const estimate = params.get('estimate');
    if (estimate) estimateField.value = estimate.replace(/^Our numbers:\s*/, '');
    if (params.get('org') === 'nonprofit') type.value = 'Nonprofit';
  };
  prefill();
  window.addEventListener('hashchange', prefill);

  const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[required]'));

  const fieldError = (el: HTMLInputElement | HTMLTextAreaElement): string => {
    const label = form.querySelector(`label[for="${el.id}"]`)?.childNodes[0]?.textContent?.trim() ?? 'This field';
    if (!el.value.trim()) return label.endsWith('?') ? 'Add a sentence or two.' : `${label} is required.`;
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) return 'Enter an email address like name@company.com.';
    return '';
  };

  const showError = (el: HTMLInputElement | HTMLTextAreaElement, msg: string) => {
    const id = `${el.id}-error`;
    let node = document.getElementById(id);
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (!node) {
        node = document.createElement('p');
        node.id = id;
        node.className = 'error-text';
        el.insertAdjacentElement('afterend', node);
      }
      node.textContent = msg;
      const described = new Set((el.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean));
      described.add(id);
      el.setAttribute('aria-describedby', Array.from(described).join(' '));
    } else {
      el.removeAttribute('aria-invalid');
      node?.remove();
    }
  };

  // Errors clear as the visitor fixes them. Validating on blur would shift the layout
  // under the pointer mid-click and swallow the submit.
  fields.forEach((el) =>
    el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') showError(el, fieldError(el));
    }),
  );

  const compose = () => {
    const d = new FormData(form);
    return [
      `Name: ${d.get('name')}`,
      `Organization: ${d.get('organization')}${d.get('type') ? ` (${d.get('type')})` : ''}, team of ${d.get('size')}`,
      `Email: ${d.get('email')}`,
      '',
      String(d.get('message') ?? ''),
      ...(d.get('estimate') ? ['', `From the calculator: ${d.get('estimate')}`] : []),
    ].join('\n');
  };

  // What arrives in the inbox: a subject that says who wrote, then one field per line
  const payload = () => {
    const d = new FormData(form);
    const get = (k: string) => String(d.get(k) ?? '').trim();
    const sizeLabel = form.querySelector<HTMLSelectElement>('#cf-size')?.selectedOptions[0]?.textContent ?? get('size');
    const body: Record<string, string> = {
      Name: get('name'),
      Email: get('email'),
      Organization: get('organization'),
      'Team size': sizeLabel,
      Message: get('message'),
    };
    if (get('type')) body.Type = get('type');
    if (get('estimate')) body['From the calculator'] = get('estimate');
    if (!key) return body;
    return {
      access_key: key,
      subject: `New inquiry from ${get('name')}${get('organization') ? `, ${get('organization')}` : ''}`,
      from_name: 'Spockhart website',
      replyto: get('email'),
      ...body,
    };
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    let first: HTMLElement | null = null;
    for (const el of fields) {
      const msg = fieldError(el);
      showError(el, msg);
      if (msg && !first) first = el;
    }
    if (first) {
      first.focus();
      return;
    }
    if ((form.elements.namedItem('_gotcha') as HTMLInputElement)?.value) return;

    if (!endpoint) {
      const panel = document.querySelector<HTMLElement>('[data-compose]');
      const body = document.querySelector<HTMLElement>('[data-compose-body]');
      const mail = document.querySelector<HTMLAnchorElement>('[data-compose-mail]');
      const copy = document.querySelector<HTMLButtonElement>('[data-compose-copy]');
      if (!panel || !body) return;
      const text = compose();
      body.textContent = text;
      if (mail) {
        const base = mail.getAttribute('href')!.split('?')[0];
        mail.href = `${base}?subject=${encodeURIComponent('Starting a conversation')}&body=${encodeURIComponent(text)}`;
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
      panel.querySelector<HTMLElement>('h2')?.setAttribute('tabindex', '-1');
      panel.querySelector<HTMLElement>('h2')?.focus();
      return;
    }

    submit.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Sending';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload()),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || (key && out.success === false)) throw new Error(String(res.status));
      // The thank-you page shows the visitor what they sent (this browser tab only)
      try {
        const d = new FormData(form);
        const sizeLabel = form.querySelector<HTMLSelectElement>('#cf-size')?.selectedOptions[0]?.textContent ?? '';
        sessionStorage.setItem(
          'spockhart:sent',
          JSON.stringify({
            name: String(d.get('name') ?? '').trim(),
            organization: String(d.get('organization') ?? '').trim(),
            email: String(d.get('email') ?? '').trim(),
            size: sizeLabel,
            message: String(d.get('message') ?? '').trim(),
            at: Date.now(),
          }),
        );
      } catch {
        /* storage blocked: the page simply shows less */
      }
      location.href = '/contact/thanks/';
    } catch {
      errorBox.textContent = 'That did not go through. Please try again, or email us directly at the address on this page.';
      errorBox.hidden = false;
      submit.removeAttribute('aria-busy');
      submitLabel.textContent = 'Send';
    }
  });
}
