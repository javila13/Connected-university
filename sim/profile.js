// Known-profile rows for the inspector's Profile tab: Sofia's attributes at
// her current life stage, from content/sofia.json, with facts.json tokens
// filled and ids turned into names with the build-time catalog.
import sofia from '../content/sofia.json';
import facts from '../content/facts.json';
import { fillFacts } from '../src/lib/fill-facts.js';

const fill = (s) => fillFacts(s, 'content/sofia.json');
const usd = (n) => `$${Number(n).toLocaleString('en-US')}`;
export const fundName = (id) => facts.giving.funds.find((f) => f.id === id)?.name ?? id;

/** [label, value] rows for a stage. Values are plain text; the view escapes them. */
export function stageRows(stageId, catalog = {}) {
  const st = sofia.stages[stageId];
  if (!st) return [];
  const program = catalog.programs?.[sofia.person.program] ?? sofia.person.program;
  switch (stageId) {
    case 'prospect':
      return [
        ['Program of interest', program],
        ['Application decision', st.applicationDecision],
        ['Applicant decision', st.applicantDecision ?? 'Not committed yet'],
        ['High school GPA', String(st.highSchoolGpa)],
        ['SAT', String(st.sat)],
        ['Campus visits', String(st.campusVisits)],
        ['Financial aid offer', st.aid.map((a) => `${a.name}, ${fill(a.amount)}`).join('; ')],
        ...st.deadlines.map((d) => [`${d.label} due`, fill(d.date)]),
      ];
    case 'student':
      return [
        ['Program', program],
        ['Class year', st.classYear],
        ['Standing', st.standing],
        ['Cumulative GPA', st.cumulativeGpa.toFixed(2)],
        ['Credits earned', String(st.creditsEarned)],
        ['Advisor', catalog.faculty?.[st.advisor] ?? st.advisor],
        ['Early alert', `${st.earlyAlert.status}, ${st.earlyAlert.course} (${st.earlyAlert.term})`],
        ['Next advising', st.nextAdvising],
      ];
    case 'alumna': {
      const total = st.gifts.reduce((sum, g) => sum + g.amount, 0);
      return [
        ['Degree', `${st.degreeShort}, ${program}`],
        ['Class of', String(new Date().getFullYear() - st.graduatedYearsAgo)],
        ['Job', `${st.jobTitle}, ${st.employer}`],
        ['City', st.city],
        ['Gifts', st.gifts.map((g) => `${usd(g.amount)} to ${fundName(g.fund)}, ${g.when.toLowerCase()}`).join('; ')],
        ['Gift count', String(st.gifts.length)],
        ['Lifetime giving', usd(total)],
        ['Next ask', fill(st.nextAsk)],
      ];
    }
    case 'learner':
      return [
        ['Credential', `${catalog.certificates?.[st.credential] ?? st.credential}, earned ${st.credentialEarned}`],
        ['Enrollment', st.enrollment],
        ['Email engagement', st.emailEngagement],
        ['Recommended next step', st.nextStep.label],
      ];
    default:
      return [];
  }
}

export const person = sofia.person;
export const stageLabel = (stageId) => sofia.stages[stageId]?.label ?? stageId;
export const stageInfo = (stageId) => sofia.stages[stageId] ?? {};
