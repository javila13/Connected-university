// Automatic identity stitch (PLAN.md §5.5, widened by Jesse 2026-11-06):
// every demo form that collects an email, and the Student Portal sign-in,
// stitches the visitor to Sofia at the life stage that fits. The recruiting
// questionnaire is the exception (it's for high-school athletes). Gifts and
// ticket orders are also logged as conversions.
//
// /demo "Identity matching" decides whose profile a form's email opens:
//   sofia (default)  every email resolves to Sofia, so every story beat works
//   typed            Sofia's email -> Sofia; any other email -> a new contact
// The portal's demo sign-in always signs in as Sofia. The Agentforce mock's
// sign-in form (form "agent-chat", Jesse 2026-11-07) works like an RSVP: the
// stage comes from the page's audience.
import { getSettings } from '../src/scripts/settings.js';
import { isGranted } from '../src/scripts/consent.js';
import { stitch, stitchVisitor, SOFIA_EMAIL } from './identity.js';
import { update } from './store.js';

/** Form -> Sofia stage. RSVP uses the event page's audience instead. */
export const FORM_STAGES = {
  'request-info': 'prospect',
  apply: 'prospect',
  visit: 'prospect',
  'update-info': 'alumna',
  give: 'alumna',
  tickets: 'alumna',
  'ce-inquiry': 'learner',
};

export const FORM_LABELS = {
  'request-info': 'Request Information form',
  apply: 'Apply form',
  visit: 'Campus Tour request',
  'update-info': 'Update Your Info form',
  give: 'Give Now gift',
  tickets: 'Tickets order',
  'ce-inquiry': 'CE Inquiry form',
  rsvp: 'Event registration',
  'agent-chat': 'Agentforce chat',
};

/** Page audience -> Sofia stage, for RSVPs and chat. */
export const AUDIENCE_STAGES = {
  prospect: 'prospect',
  student: 'student',
  alumni: 'alumna',
  donor: 'alumna',
  learner: 'learner',
  fan: 'alumna',
};

const active = () => isGranted() && getSettings().simulation;

function recordConversion(form, fields) {
  const ts = new Date().toISOString();
  let conversion = null;
  if (form === 'give') {
    conversion = { ts, type: 'gift', amount: Number(fields.amount), frequency: fields.frequency ?? 'one-time', fund: fields.designation };
  } else if (form === 'tickets') {
    const select = document.querySelector('form[data-cu-form="tickets"] select[name="game"]');
    conversion = { ts, type: 'tickets', game: select?.selectedOptions[0]?.textContent ?? fields.game, total: Number(fields.total ?? 0) };
  }
  if (conversion) update((s) => s.conversions.push(conversion));
}

let started = false;

export function startStitching() {
  if (started) return;
  started = true;
  document.addEventListener('cu:form-submit', (e) => {
    if (!active()) return;
    const { form, fields = {} } = e.detail ?? {};
    const byAudience = form === 'rsvp' || form === 'agent-chat';
    const stage = byAudience ? AUDIENCE_STAGES[document.body.dataset.audience] : FORM_STAGES[form];
    if (!stage) return;
    recordConversion(form, fields);
    const via = FORM_LABELS[form] ?? form;
    const typed = fields.email?.trim().toLowerCase();
    if (getSettings().identityMatching === 'typed' && typed && typed !== SOFIA_EMAIL) {
      stitchVisitor({ via, fields });
    } else {
      stitch({ stage, via, email: fields.email });
    }
  });
  document.addEventListener('cu:portal-sign-in', () => {
    if (active()) stitch({ stage: 'student', via: 'Student Portal sign-in' });
  });
}
