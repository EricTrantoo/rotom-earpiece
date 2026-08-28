import type { TournamentSummary, StandingEntry } from './types';

const BASE_URL = 'https://play.limitlesstcg.com/api';
const CHAMPIONS_FORMATS = new Set(['M-A', 'M-B']);

export async function fetchChampionsTournaments(fetchImpl: typeof fetch = fetch): Promise<TournamentSummary[]> {
  const response = await fetchImpl(`${BASE_URL}/tournaments?game=VGC`);
  if (!response.ok) {
    throw new Error(`Limitless tournaments request failed: ${response.status}`);
  }
  const all = (await response.json()) as TournamentSummary[];
  return all.filter((t) => CHAMPIONS_FORMATS.has(t.format));
}

export async function fetchStandings(tournamentId: string, fetchImpl: typeof fetch = fetch): Promise<StandingEntry[]> {
  const response = await fetchImpl(`${BASE_URL}/tournaments/${tournamentId}/standings`);
  if (!response.ok) {
    throw new Error(`Limitless standings request failed for ${tournamentId}: ${response.status}`);
  }
  return (await response.json()) as StandingEntry[];
}
