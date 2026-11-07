// Chat widget slots (PLAN.md D6, §5.8, §6).
//
// - Piper (Qualified) is the only live embed. With no token in
//   public/demo-config.js a stub bubble stands in for it.
// - The Agentforce widget is a client-side mock: the bubble is mounted here
//   and sim/agent-ui.js fills the panel with the scripted agent, loaded on
//   demand so pages without the agent don't download it.
import { AUDIENCE_ROUTING, AGENT_PERSONAS } from '../lib/taxonomy.js';

/**
 * Decides which widgets a page shows.
 * @returns {{ piper: boolean, agentforce: boolean, agentPersona: string, agentCorner: 'right'|'left' }}
 */
export function resolveWidgets(audience, settings) {
  const route = AUDIENCE_ROUTING[audience] ?? AUDIENCE_ROUTING.prospect;
  let piper;
  let agentforce;
  switch (settings.widgetMode) {
    case 'piper':
      [piper, agentforce] = [true, false];
      break;
    case 'agentforce':
      [piper, agentforce] = [false, true];
      break;
    case 'both':
      [piper, agentforce] = [true, true];
      break;
    default: // auto
      piper = route.widget === 'piper' || route.widget === 'both';
      agentforce = route.widget === 'agentforce' || route.widget === 'both';
  }
  if (typeof settings.forcePiper === 'boolean') piper = settings.forcePiper;
  if (typeof settings.forceAgentforce === 'boolean') agentforce = settings.forceAgentforce;
  // The Agentforce mock is part of the simulation; switching the simulation off hides it.
  if (!settings.simulation) agentforce = false;

  const agentPersona = settings.agentPersona !== 'auto' ? settings.agentPersona : route.agent;
  return { piper, agentforce, agentPersona, agentCorner: piper && agentforce ? 'left' : 'right' };
}

export function getConfig() {
  const cfg = window.CU_DEMO_CONFIG || {};
  const token = typeof cfg.qualified?.token === 'string' ? cfg.qualified.token.trim() : '';
  return { qualifiedToken: token };
}

// --- Piper -----------------------------------------------------------------

let piperLoaded = false;
export const isPiperLoaded = () => piperLoaded;

function loadQualified(token) {
  if (piperLoaded) return;
  piperLoaded = true;
  // Standard Qualified snippet shape: a command queue, then the async loader.
  // (hypothesis — needs validation against the snippet in Jesse's Qualified workspace)
  (function (w, q) {
    w.QualifiedObject = q;
    w[q] =
      w[q] ||
      function () {
        (w[q].q = w[q].q || []).push(arguments);
      };
  })(window, 'qualified');
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://js.qualified.com/qualified.js?token=${encodeURIComponent(token)}`;
  s.id = 'cu-qualified-loader';
  document.head.appendChild(s);
}

// --- Stub bubbles ----------------------------------------------------------

const ICON_CHAT =
  '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 6.5a1.5 1.5 0 1 0 0-.01Zm5 0a1.5 1.5 0 1 0 0-.01Zm5 0a1.5 1.5 0 1 0 0-.01Z"/></svg>';

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function mountBubble({ id, corner, variant, label, badge, title, body = '' }) {
  const root = el(`
    <div class="cu-widget cu-widget--${corner} cu-widget--${variant}" id="${id}" data-widget="${variant}">
      <div class="cu-widget__panel" role="dialog" aria-label="${title}" hidden>
        <div class="cu-widget__head">
          <span class="cu-widget__title">${title}</span>
          ${badge ? '<span class="sim-badge">Simulated</span>' : ''}
          <button type="button" class="cu-widget__close" aria-label="Close">×</button>
        </div>
        <div class="cu-widget__body">${body}</div>
      </div>
      <button type="button" class="cu-widget__bubble" aria-expanded="false" aria-label="${label}">
        ${ICON_CHAT}
        ${badge ? '<span class="sim-badge sim-badge--bubble">Simulated</span>' : ''}
      </button>
    </div>`);
  const panel = root.querySelector('.cu-widget__panel');
  const bubble = root.querySelector('.cu-widget__bubble');
  const toggle = (open) => {
    panel.hidden = !open;
    bubble.setAttribute('aria-expanded', String(open));
  };
  bubble.addEventListener('click', () => toggle(panel.hidden));
  root.querySelector('.cu-widget__close').addEventListener('click', () => toggle(false));
  document.body.appendChild(root);
  return root;
}

export function unmountStubs() {
  document.querySelectorAll('.cu-widget').forEach((n) => n.remove());
}

/**
 * Mounts the widgets for this page. Returns 'reload' when a live Piper embed
 * would have to be removed, which can only be done by reloading the page.
 */
export function applyWidgets(audience, settings) {
  const plan = resolveWidgets(audience, settings);
  const { qualifiedToken } = getConfig();
  if (piperLoaded && !plan.piper) return 'reload';
  unmountStubs();

  if (plan.piper) {
    if (qualifiedToken) loadQualified(qualifiedToken);
    else
      mountBubble({
        id: 'cu-piper-stub',
        corner: 'right',
        variant: 'piper',
        label: 'Chat with us (Piper placeholder)',
        badge: false,
        title: 'Piper · placeholder',
        body: '<p>The Qualified Piper widget loads here once a Qualified token is set in <code>public/demo-config.js</code>.</p>',
      });
  }

  if (plan.agentforce) {
    const name = AGENT_PERSONAS[plan.agentPersona];
    const root = mountBubble({
      id: 'cu-agentforce-mock',
      corner: plan.agentCorner,
      variant: 'agentforce',
      label: `Chat with the ${name}`,
      badge: true,
      title: name,
    });
    import('../../sim/agent-ui.js').then(({ mountAgent }) => {
      if (root.isConnected) mountAgent(root, { agentId: plan.agentPersona, name });
    });
  }
  return plan;
}
