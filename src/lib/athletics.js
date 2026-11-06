// Build-time helpers for Athletics: schedules, game ids and dates.
import { getCollection } from 'astro:content';

const iso = (d) => d.toISOString().slice(0, 10);

/** "Nov 15": month and day only, so pages don't show a year. Dates are UTC. */
export const shortDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Stable id for a game, used by ?game= links and the tickets form. */
export const gameId = (teamId, date) => `${teamId}-${iso(date)}`;

/** Every game on every team's schedule, by date. */
export async function allGames() {
  const teams = await getCollection('teams');
  return teams
    .flatMap((team) =>
      team.data.schedule.map((g) => ({ ...g, team, id: gameId(team.id, g.date), label: gameLabel(team, g) })),
    )
    .sort((a, b) => a.date - b.date || a.team.data.name.localeCompare(b.team.data.name));
}

export const gameLabel = (team, g) => `${team.data.name} vs. ${g.opponent}, ${shortDate(g.date)}, ${g.time}`;

export async function homeGames() {
  return (await allGames()).filter((g) => g.home);
}

/** One team's games, by date, with ids. */
export function teamGames(team) {
  return [...team.data.schedule]
    .sort((a, b) => a.date - b.date)
    .map((g) => ({ ...g, team, id: gameId(team.id, g.date), label: gameLabel(team, g) }));
}
