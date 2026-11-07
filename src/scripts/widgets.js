// Chat widget slot (PLAN.md §5.8, §6).
//
// The site's only chat widget is the Agentforce mock, and it's off unless
// the presenter turns it on in /demo (or adds ?agentforce=1). When on, every
// page shows the agent for its audience, bottom-right. Qualified Piper isn't
// loaded by the site: presenters add it with a Chrome extension (Jesse,
// 2026-11-07; docs/decisions.md). The bubble is mounted here and
// sim/agent-ui.js fills the panel, loaded on demand so pages without the
// agent don't download it.
import { AGENT_BY_AUDIENCE, AGENT_PERSONAS } from '../lib/taxonomy.js';

/**
 * Decides whether this page shows the agent, and which one.
 * @returns {{ agentforce: boolean, agentPersona: string }}
 */
export function resolveAgent(audience, settings) {
  const agentPersona =
    settings.agentPersona !== 'auto' ? settings.agentPersona : (AGENT_BY_AUDIENCE[audience] ?? AGENT_BY_AUDIENCE.prospect);
  // The Agentforce mock is part of the simulation; switching the simulation off hides it.
  return { agentforce: Boolean(settings.agentforce && settings.simulation), agentPersona };
}

const ICON_CHAT =
  '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 6.5a1.5 1.5 0 1 0 0-.01Zm5 0a1.5 1.5 0 1 0 0-.01Zm5 0a1.5 1.5 0 1 0 0-.01Z"/></svg>';

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function mountBubble({ id, label, title }) {
  const root = el(`
    <div class="cu-widget cu-widget--right cu-widget--agentforce" id="${id}" data-widget="agentforce">
      <div class="cu-widget__panel" role="dialog" aria-label="${title}" hidden>
        <div class="cu-widget__head">
          <span class="cu-widget__title">${title}</span>
          <span class="sim-badge">Simulated</span>
          <button type="button" class="cu-widget__close" aria-label="Close">×</button>
        </div>
        <div class="cu-widget__body"></div>
      </div>
      <button type="button" class="cu-widget__bubble" aria-expanded="false" aria-label="${label}">
        ${ICON_CHAT}
        <span class="sim-badge sim-badge--bubble">Simulated</span>
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

export function unmountWidgets() {
  document.querySelectorAll('.cu-widget').forEach((n) => n.remove());
}

/** Mounts (or removes) the agent for this page. */
export function applyWidgets(audience, settings) {
  const plan = resolveAgent(audience, settings);
  unmountWidgets();
  if (plan.agentforce) {
    const name = AGENT_PERSONAS[plan.agentPersona];
    const root = mountBubble({ id: 'cu-agentforce-mock', label: `Chat with the ${name}`, title: name });
    import('../../sim/agent-ui.js').then(({ mountAgent }) => {
      if (root.isConnected) mountAgent(root, { agentId: plan.agentPersona, name });
    });
  }
  return plan;
}
