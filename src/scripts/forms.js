// Demo forms (components/DemoForm.astro). Nothing is sent or stored: a valid
// submit swaps the form for its confirmation and fires an event. Phase 2's
// simulation listens for these events to log FORM_START / FORM_SUBMIT rows and
// run the identity stitch (PLAN.md §5.2, §5.5).
//
//   document 'cu:form-start'   detail { form, page }
//   document 'cu:form-submit'  detail { form, page, fields }
//
// Links can preselect fields: ?program=<program id>, ?type=<student type>.

function preselect(form) {
  const params = new URLSearchParams(location.search);
  for (const [param, name] of [['program', 'program'], ['type', 'studentType']]) {
    const value = params.get(param);
    const select = form.elements.namedItem(name);
    if (value && select && [...select.options].some((o) => o.value === value)) select.value = value;
  }
}

function fieldsOf(form) {
  const fields = {};
  for (const [key, value] of new FormData(form)) {
    if (typeof value === 'string' && value.trim()) fields[key] = value.trim();
  }
  return fields;
}

function setup(form) {
  const kind = form.dataset.cuForm;
  const confirm = document.querySelector(`[data-cu-form-confirm="${kind}"]`);
  const error = form.querySelector('.form-error');
  let started = false;

  preselect(form);

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
      form.hidden = true;
      confirm.hidden = false;
      confirm.focus();
    }
  });
}

for (const form of document.querySelectorAll('form[data-cu-form]')) setup(form);
