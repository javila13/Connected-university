// Demo forms (components/DemoForm.astro, components/GiftForm.astro). Nothing is
// sent or stored: a valid submit swaps the form for its confirmation and fires
// an event. Phase 2's simulation listens for these events to log FORM_START /
// FORM_SUBMIT rows, run the identity stitch and record gifts as conversions
// (PLAN.md §5.2, §5.5).
//
//   document 'cu:form-start'   detail { form, page }
//   document 'cu:form-submit'  detail { form, page, fields }
//
// Links can preselect fields: ?program=<program id>, ?type=<student type>,
// ?amount=<whole dollars>, ?frequency=one-time|monthly, ?designation=<fund id>.
//
// In a confirmation, [data-first-name] shows the first name and
// [data-field="<name>"] shows a field (a select shows its option's label;
// data-format="usd" formats dollars). [data-show-if="<name>=<value>"] is
// shown only when that field has that value.

const PARAMS = { program: 'program', type: 'studentType', amount: 'amount', frequency: 'frequency', designation: 'designation' };

function setField(form, name, value) {
  const el = form.elements.namedItem(name);
  if (!el || !value) return;
  if (el instanceof RadioNodeList) {
    const radio = [...el].find((r) => r.value === value);
    if (radio) radio.checked = true;
  } else if (el instanceof HTMLSelectElement) {
    if ([...el.options].some((o) => o.value === value)) el.value = value;
  } else if (el instanceof HTMLInputElement) {
    el.value = value;
    if (!el.checkValidity()) el.value = '';
  }
}

function preselect(form) {
  const params = new URLSearchParams(location.search);
  for (const [param, name] of Object.entries(PARAMS)) setField(form, name, params.get(param));
}

function fieldsOf(form) {
  const fields = {};
  for (const [key, value] of new FormData(form)) {
    if (typeof value === 'string' && value.trim()) fields[key] = value.trim();
  }
  return fields;
}

function displayValue(form, name, fields, format) {
  const value = fields[name] ?? '';
  const el = form.elements.namedItem(name);
  if (el instanceof HTMLSelectElement) return el.selectedOptions[0]?.textContent ?? value;
  if (format === 'usd' && value) return `$${Number(value).toLocaleString('en-US')}`;
  return value;
}

// Preset amount buttons fill the amount field.
function setupAmountButtons(form) {
  const amount = form.elements.namedItem('amount');
  const buttons = [...form.querySelectorAll('[data-amount]')];
  if (!amount || !buttons.length) return;
  const sync = () => {
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.amount === amount.value));
  };
  for (const b of buttons) {
    b.addEventListener('click', () => {
      amount.value = b.dataset.amount;
      amount.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  amount.addEventListener('input', sync);
  sync();
}

function setup(form) {
  const kind = form.dataset.cuForm;
  const confirm = document.querySelector(`[data-cu-form-confirm="${kind}"]`);
  const error = form.querySelector('.form-error');
  let started = false;

  preselect(form);
  setupAmountButtons(form);

  form.addEventListener('input', () => {
    if (started) return;
    started = true;
    document.dispatchEvent(new CustomEvent('cu:form-start', { detail: { form: kind, page: location.pathname } }));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
    for (const el of form.elements) {
      if (el.willValidate) el.toggleAttribute('aria-invalid', !el.checkValidity());
    }
    if (invalid.length) {
      error.hidden = false;
      invalid[0].focus();
      return;
    }
    error.hidden = true;
    const fields = fieldsOf(form);
    document.dispatchEvent(
      new CustomEvent('cu:form-submit', { detail: { form: kind, page: location.pathname, fields } }),
    );
    if (confirm) {
      for (const el of confirm.querySelectorAll('[data-first-name]')) el.textContent = fields.firstName ?? '';
      for (const el of confirm.querySelectorAll('[data-field]')) {
        el.textContent = displayValue(form, el.dataset.field, fields, el.dataset.format);
      }
      for (const el of confirm.querySelectorAll('[data-show-if]')) {
        const [name, value] = el.dataset.showIf.split('=');
        el.hidden = fields[name] !== value;
      }
      form.hidden = true;
      confirm.hidden = false;
      confirm.focus();
    }
  });
}

for (const form of document.querySelectorAll('form[data-cu-form]')) setup(form);
