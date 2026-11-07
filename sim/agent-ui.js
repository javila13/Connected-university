// Agentforce mock: the chat window (PLAN.md §5.8). Mounted into the widget
// slot by src/scripts/widgets.js. Lightning-styled, not pixel-identical
// (CLAUDE.md). The conversation is kept in localStorage per agent, tied to
// the simulated device, so it follows the presenter from page to page and
// starts over on Reset visitor or a persona preset.
//
// Chat is an identity moment (Jesse, 2026-11-07): an anonymous visitor is
// asked for a name and email before the conversation (or can skip). The
// answer goes through the same stitch as the demo forms, as form
// "agent-chat", so Identity matching applies.
import * as store from './store.js';
import { greet, reply, fallback, identified, SEARCH_INTRO, IDENTIFY_PROMPT } from './agent.js';
import { recordEvent } from './tracker.js';
import { esc } from './views.js';
import { getSettings, onSettingsChange } from '../src/scripts/settings.js';
import { loadIndex, search, snippet, terms } from '../src/scripts/search.js';
import './agent.css';

const CHAT_KEY = 'cu_sim_chat'; // cleared by /demo Reset visitor with the other cu_sim keys
const UI_KEY = 'cu_agent_ui';
const TYPING_MS = 650;
// Chat questions carry filler that site search would require on the page.
const CHAT_STOPWORDS = new Set(
  'about any anything are does get have help info information know like many much need please question tell there want would'.split(' '),
);

/** Site pages for a chat question: every word if possible, else the pages that match the most words. */
function chatSearch(index, text) {
  const qs = terms(text).filter((t) => !CHAT_STOPWORDS.has(t));
  if (!qs.length) return { qs, results: [] };
  const all = search(index, qs.join(' '), 3);
  if (all.length || qs.length < 2) return { qs, results: all.map((r) => r.entry) };
  const tally = new Map();
  for (const q of qs) {
    for (const { entry, score } of search(index, q, 50)) {
      const t = tally.get(entry) ?? { entry, hits: 0, score: 0 };
      t.hits++;
      t.score += score;
      tally.set(entry, t);
    }
  }
  const need = Math.ceil(qs.length / 2);
  const results = [...tally.values()]
    .filter((t) => t.hits >= need)
    .sort((a, b) => b.hits - a.hits || b.score - a.score)
    .slice(0, 3)
    .map((t) => t.entry);
  return { qs, results };
}
const EMAIL = /[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/i;

const readJson = (storage, key, dflt) => {
  try {
    return JSON.parse(storage.getItem(key)) ?? dflt;
  } catch {
    return dflt;
  }
};
const writeJson = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {}
};

function readCatalog() {
  try {
    return JSON.parse(document.getElementById('cu-sim-catalog')?.textContent || '{}');
  } catch {
    return {};
  }
}

/** Mounts the scripted agent into a widget root built by widgets.js. */
export function mountAgent(root, { agentId, name }) {
  const catalog = readCatalog();
  const panel = root.querySelector('.cu-widget__panel');
  const bubble = root.querySelector('.cu-widget__bubble');
  const body = root.querySelector('.cu-widget__body');
  root.classList.add('cu-widget--agent');
  body.innerHTML = `
    <div class="cu-agent">
      <ol class="cu-agent__log" aria-live="polite" aria-label="Conversation with the ${esc(name)}"></ol>
      <div class="cu-agent__chips" role="group" aria-label="Suggested replies"></div>
      <form class="cu-agent__input">
        <input type="text" name="message" autocomplete="off" placeholder="Type a message…" aria-label="Message the ${esc(name)}" />
        <button type="submit" aria-label="Send">Send</button>
      </form>
    </div>`;
  const log = body.querySelector('.cu-agent__log');
  const chipsEl = body.querySelector('.cu-agent__chips');
  const form = body.querySelector('.cu-agent__input');
  const input = form.querySelector('input');
  let busy = false;

  // ---- Conversation state ----
  function load() {
    const deviceId = store.getState().deviceId;
    const all = readJson(localStorage, CHAT_KEY, {});
    if (all.deviceId !== deviceId) return { deviceId, chats: {} };
    return all;
  }
  function chat() {
    const all = load();
    return all.chats[agentId] ?? { messages: [], prechat: null };
  }
  function save(c) {
    const all = load();
    all.chats[agentId] = c;
    writeJson(localStorage, CHAT_KEY, all);
  }
  const push = (...msgs) => {
    const c = chat();
    c.messages.push(...msgs.map((m) => ({ ts: new Date().toISOString(), ...m })));
    save(c);
  };

  // ---- Rendering ----
  const known = () => !!store.getState().identity?.known;

  function messageHtml(m, i, last) {
    if (m.from === 'user') return `<li class="cu-agent__msg cu-agent__msg--user"><p>${esc(m.text)}</p></li>`;
    const showWhy = getSettings().showWhy;
    const links = m.links?.length
      ? `<p class="cu-agent__links">${m.links.map((l) => `<a class="cu-agent__link" href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</p>`
      : '';
    const card = m.card
      ? `<div class="cu-agent__card"><p class="cu-agent__card-title">${esc(m.card.title)}</p><p class="cu-agent__card-value">${esc(m.card.value)}</p><p class="cu-agent__card-note">${esc(m.card.note)}</p></div>`
      : '';
    const sources = m.sources?.length
      ? `<ul class="cu-agent__sources">${m.sources.map((s) => `<li><a href="${esc(s.url)}">${esc(s.title)}</a><span>${esc(s.snippet)}</span></li>`).join('')}</ul>`
      : '';
    const grounding =
      showWhy && m.grounding?.length
        ? `<p class="cu-agent__grounding">Grounded in Data 360: ${m.grounding.map(esc).join(' · ')}</p>`
        : '';
    const identify = m.identify && last && !known() ? identifyForm(m.prechat) : '';
    return `<li class="cu-agent__msg cu-agent__msg--agent" data-msg="${i}"><p>${esc(m.text)}</p>${card}${sources}${links}${identify}${grounding}</li>`;
  }

  function identifyForm(prechat) {
    return `
      <form class="cu-agent__identify" novalidate>
        <label>First name<input name="firstName" autocomplete="given-name" required /></label>
        <label>Last name<input name="lastName" autocomplete="family-name" /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required /></label>
        <p class="cu-agent__error" hidden></p>
        <div class="cu-agent__identify-actions">
          <button type="submit" class="cu-agent__primary">${prechat ? 'Start chat' : 'Share'}</button>
          ${prechat ? '<button type="button" class="cu-agent__skip" data-skip>Skip</button>' : ''}
        </div>
      </form>`;
  }

  function render() {
    if (!root.isConnected) return;
    const c = chat();
    log.innerHTML =
      c.messages.map((m, i) => messageHtml(m, i, i === c.messages.length - 1)).join('') +
      (busy ? '<li class="cu-agent__msg cu-agent__msg--agent cu-agent__typing" aria-label="The agent is typing"><span></span><span></span><span></span></li>' : '');
    const lastAgent = [...c.messages].reverse().find((m) => m.from === 'agent');
    const awaitingPrechat = c.messages.at(-1)?.prechat && !known();
    chipsEl.innerHTML =
      !busy && !awaitingPrechat && lastAgent?.chips?.length
        ? lastAgent.chips.map((ch) => `<button type="button" class="cu-agent__chip">${esc(ch)}</button>`).join('')
        : '';
    input.disabled = busy || awaitingPrechat;
    log.scrollTop = log.scrollHeight;
    log.querySelector('.cu-agent__identify input')?.focus({ preventScroll: true });
  }

  // ---- Starting a conversation ----
  function start() {
    const c = chat();
    if (c.messages.length) return;
    if (!known() && c.prechat === null) {
      push({ from: 'agent', text: IDENTIFY_PROMPT(), identify: true, prechat: true });
    } else {
      push(greet(agentId, store.getState(), catalog));
    }
  }

  // ---- Identity moment ----
  function identify(fields, { prechat }) {
    document.dispatchEvent(
      new CustomEvent('cu:form-submit', { detail: { form: 'agent-chat', page: location.pathname, fields } }),
    );
    const c = chat();
    if (prechat) c.prechat = 'shared';
    save(c);
    const who = [fields.firstName, fields.lastName].filter(Boolean).join(' ');
    push({ from: 'user', text: who ? `${who} · ${fields.email}` : fields.email });
    const state = store.getState();
    if (!state.identity?.known) {
      // Consent or the simulation is off, so nothing was stitched.
      push(greet(agentId, state, catalog));
      return;
    }
    push(identified(state, catalog), greet(agentId, state, catalog));
  }

  // ---- Replies ----
  async function answer(text) {
    const said = reply(agentId, text, store.getState(), catalog);
    let message = said.message;
    let detail = said.intent;
    if (said.search) {
      detail = 'site-search';
      try {
        const { qs, results } = chatSearch(await loadIndex(), text);
        if (results.length) {
          message = {
            from: 'agent',
            text: SEARCH_INTRO(),
            sources: results.map((entry) => ({ url: entry.url, title: entry.title, snippet: snippet(entry, qs, 140) })),
            chips: fallback(agentId, store.getState(), catalog).chips,
          };
        }
      } catch {}
      if (!message) {
        detail = 'fallback';
        message = fallback(agentId, store.getState(), catalog);
      }
    }
    // Chat is engagement too: the page's affinities, plus a program or certificate the visitor named.
    const extra = [];
    if (said.said?.program) extra.push({ type: 'academic-interest', value: said.said.program, label: catalog.programs?.[said.said.program] });
    if (said.said?.certificate) extra.push({ type: 'topic', value: said.said.certificate, label: catalog.topics?.[said.said.certificate] });
    recordEvent('AGENT_INTERACTION', detail, extra);
    return message;
  }

  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    if (!known() && EMAIL.test(text)) {
      identify({ email: text.match(EMAIL)[0] }, { prechat: false });
      render();
      return;
    }
    push({ from: 'user', text });
    busy = true;
    render();
    const [message] = await Promise.all([answer(text), new Promise((r) => setTimeout(r, TYPING_MS))]);
    busy = false;
    if (!root.isConnected) return;
    push(message);
    render();
  }

  // ---- Events ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = '';
    send(text);
  });
  chipsEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.cu-agent__chip');
    if (chip) send(chip.textContent);
  });
  log.addEventListener('click', (e) => {
    if (e.target.closest('[data-skip]')) {
      const c = chat();
      c.prechat = 'skipped';
      save(c);
      push(greet(agentId, store.getState(), catalog));
      render();
    }
  });
  log.addEventListener('submit', (e) => {
    const f = e.target.closest('.cu-agent__identify');
    if (!f) return;
    e.preventDefault();
    const fields = Object.fromEntries(
      [...new FormData(f).entries()].map(([k, v]) => [k, String(v).trim()]).filter(([, v]) => v),
    );
    const error = f.querySelector('.cu-agent__error');
    if (!fields.firstName || !EMAIL.test(fields.email ?? '')) {
      error.textContent = 'Please enter your first name and a valid email.';
      error.hidden = false;
      return;
    }
    const prechat = !!chat().messages.at(-1)?.prechat;
    identify(fields, { prechat });
    render();
  });

  // Open state follows the presenter between pages (this tab only).
  const setOpen = (open) => {
    panel.hidden = !open;
    bubble.setAttribute('aria-expanded', String(open));
    writeJson(sessionStorage, UI_KEY, { open });
    if (open) {
      start();
      render();
    }
  };
  root.querySelector('.cu-widget__close').addEventListener('click', () => setOpen(false));
  // widgets.js toggles the panel first; this runs after it and records the new state.
  bubble.addEventListener('click', () => {
    writeJson(sessionStorage, UI_KEY, { open: !panel.hidden });
    if (!panel.hidden) {
      start();
      render();
      input.focus({ preventScroll: true });
    }
  });

  // A reset or preset in another tab gives a new device: start over.
  let device = store.getState().deviceId;
  const unsubscribe = store.subscribe((s) => {
    if (!root.isConnected) return unsubscribe();
    if (s.deviceId !== device) {
      device = s.deviceId;
      if (!panel.hidden) start();
      render();
    } else if (chat().messages.at(-1)?.prechat && s.identity?.known) {
      // Identified some other way (a form, a preset) while the sign-in form was waiting.
      push(greet(agentId, s, catalog));
      render();
    }
  });
  onSettingsChange(render);

  if (readJson(sessionStorage, UI_KEY, {}).open) setOpen(true);
  else render();
}
