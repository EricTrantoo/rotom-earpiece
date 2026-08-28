import type { Team } from './types';

const STORAGE_KEY = 'rotom-earpiece:teams';

export function loadTeams(storage: Storage = window.localStorage): Team[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Team[];
  } catch {
    // Corrupt/malformed stored data — treat it the same as "nothing saved
    // yet" rather than letting the parse failure crash TeamBuilder, which
    // calls loadTeams() inside a useState initializer during render.
    return [];
  }
}

export function saveTeams(teams: Team[], storage: Storage = window.localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

export function upsertTeam(team: Team, storage: Storage = window.localStorage): Team[] {
  const teams = loadTeams(storage);
  const index = teams.findIndex((t) => t.id === team.id);
  const next = index === -1 ? [...teams, team] : teams.map((t, i) => (i === index ? team : t));
  saveTeams(next, storage);
  return next;
}

export function deleteTeam(teamId: string, storage: Storage = window.localStorage): Team[] {
  const next = loadTeams(storage).filter((t) => t.id !== teamId);
  saveTeams(next, storage);
  return next;
}
