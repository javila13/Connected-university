// Student Portal demo sign-in and Sofia's dashboard (src/pages/portal.astro).
// Any sign-in signs you in as Sofia; the session lasts for the browser tab.
// Sofia's record comes from content/sofia.json, bundled here rather than
// written into the page, so crawlers never see it. Nothing leaves the browser.
//
// Events on document, for the Phase 2 simulation (identity moment, §5.5):
//   cu:portal-sign-in   detail { persona: 'sofia', stage: 'student' }
//   cu:portal-sign-out
//   cu:portal-action    detail { action: 'book-advising' }
import sofia from '../../content/sofia.json';
import { fillFacts } from '../lib/fill-facts.js';

const SESSION_KEY = 'cu_portal_user';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const emit = (type, detail) => document.dispatchEvent(new CustomEvent(type, { detail }));

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}
function writeSession(value) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, value);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: the dashboard still works for this page view */
  }
}

function dashboardHtml(catalog) {
  const s = sofia.stages.student;
  const program = catalog.programs[sofia.person.program];
  const advisor = catalog.faculty[s.advisor];
  const alert = s.earlyAlert;
  const pct = Math.min(100, Math.round((s.creditsEarned / program.credits) * 100));
  const course = (code) => catalog.courses[code] ?? code;
  const contact = s.smsOptIn ? 'Email and text' : 'Email';

  return `
    <div class="dash__top">
      <div>
        <p class="eyebrow">Student Portal</p>
        <h2 id="dash-heading" tabindex="-1">Welcome back, ${esc(sofia.person.firstName)}</h2>
        <p class="dash__sub">${esc(program.degree)} · ${esc(s.classYear)} · ${esc(s.standing)}</p>
        <p class="dash__sub dash__muted">Reminders by: ${esc(contact)}</p>
      </div>
      <button class="btn btn--ghost" type="button" data-portal-signout>Sign out</button>
    </div>

    <div class="dash__grid">
      <section class="dash-card" aria-labelledby="dash-progress">
        <h3 id="dash-progress">Academic progress</h3>
        <p class="dash-stat"><span class="dash-stat__value">${esc(s.cumulativeGpa.toFixed(2))}</span> cumulative GPA</p>
        <p class="dash-stat__label">${esc(s.creditsEarned)} of ${esc(program.credits)} credits earned</p>
        <div class="dash-bar" role="progressbar" aria-label="Credits toward degree" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
          <span style="width:${pct}%"></span>
        </div>
        <p><a href="${esc(program.url)}">${esc(program.title)} program page</a></p>
      </section>

      <section class="dash-card" aria-labelledby="dash-advisor">
        <h3 id="dash-advisor">Your advisor</h3>
        <p class="dash-card__name"><a href="${esc(advisor.url)}">${esc(advisor.name)}</a></p>
        <p class="dash__muted">${esc(advisor.role)}</p>
        <p>${esc(advisor.office)}<br />Office hours: ${esc(advisor.officeHours)}</p>
        <p>Next appointment: <strong>${esc(s.nextAdvising)}</strong></p>
        <button class="btn btn--navy" type="button" data-portal-book>Book an appointment</button>
        <p class="dash-card__status" role="status" data-portal-book-status></p>
      </section>

      <section class="dash-card" aria-labelledby="dash-deadlines">
        <h3 id="dash-deadlines">Upcoming deadlines</h3>
        <ul class="dash-list">
          ${s.deadlines
            .map((d) => `<li><span>${esc(d.label)}</span><strong>${esc(fillFacts(d.date, 'content/sofia.json'))}</strong></li>`)
            .join('')}
        </ul>
        <p><a href="${esc(catalog.links.registrar)}">All registrar dates</a></p>
      </section>
    </div>

    <section class="dash-card" aria-labelledby="dash-courses">
      <h3 id="dash-courses">This term's courses</h3>
      <ul class="course-list">
        ${s.currentCourses
          .map((c) => {
            const who = c.instructor ? ` <span class="dash__muted">· ${esc(catalog.faculty[c.instructor].name)}</span>` : '';
            return `<li><span class="course-list__code">${esc(c.code)}</span> ${esc(course(c.code))}${who}</li>`;
          })
          .join('')}
      </ul>
    </section>

    <section class="dash-card" aria-labelledby="dash-alert">
      <h3 id="dash-alert">Early alert <span class="badge badge--ok">${esc(alert.status)}</span></h3>
      <p class="dash__muted">${esc(alert.course)} ${esc(course(alert.course))} · raised by ${esc(catalog.faculty[alert.raisedBy].name)} · ${esc(alert.term)}</p>
      <ol class="timeline">
        ${alert.timeline
          .map(
            (t) => `<li><p class="timeline__when">${esc(t.when)}</p><p class="timeline__step">${esc(t.step)}</p><p>${esc(t.detail)}</p></li>`,
          )
          .join('')}
      </ol>
    </section>

    <section class="dash-card" aria-labelledby="dash-support">
      <h3 id="dash-support">Support</h3>
      <ul class="dash-links">
        <li><a href="${esc(catalog.links.advising)}">Academic advising</a></li>
        <li><a href="${esc(catalog.links.tutoring)}">Tutoring & Learning Center</a></li>
        <li><a href="${esc(catalog.links.wellness)}">Health & wellness</a></li>
        <li><a href="${esc(catalog.links.careers)}">Career services</a></li>
      </ul>
    </section>

    <p class="form-note">Demo data: Sofia Sanders is a fictional student.</p>
  `;
}

function setup() {
  const signin = document.querySelector('[data-portal-signin]');
  const dash = document.querySelector('[data-portal-dashboard]');
  const catalogEl = document.getElementById('portal-catalog');
  if (!signin || !dash || !catalogEl) return;
  const catalog = JSON.parse(catalogEl.textContent);

  const show = (signedIn, focus) => {
    if (signedIn) {
      dash.innerHTML = dashboardHtml(catalog);
      dash.hidden = false;
      signin.hidden = true;
      if (focus) dash.querySelector('#dash-heading')?.focus();
    } else {
      dash.hidden = true;
      dash.innerHTML = '';
      signin.hidden = false;
      if (focus) signin.querySelector('input')?.focus();
    }
  };

  const signIn = () => {
    writeSession('sofia');
    show(true, true);
    emit('cu:portal-sign-in', { persona: 'sofia', stage: 'student' });
  };

  signin.querySelector('[data-portal-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    signIn();
  });
  signin.querySelector('[data-portal-demo]').addEventListener('click', signIn);

  dash.addEventListener('click', (e) => {
    if (e.target.closest('[data-portal-signout]')) {
      writeSession(null);
      show(false, true);
      emit('cu:portal-sign-out');
    } else if (e.target.closest('[data-portal-book]')) {
      const advisor = catalog.faculty[sofia.stages.student.advisor];
      dash.querySelector('[data-portal-book-status]').textContent = `Appointment request sent to ${advisor.name}.`;
      emit('cu:portal-action', { action: 'book-advising' });
    }
  });

  if (readSession() === 'sofia') show(true, false);
}

setup();
