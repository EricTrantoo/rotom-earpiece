export type { SetVariant, SpeciesUsage, MetaSets } from '../src/shared/metaSetsTypes';

export interface TournamentSummary {
  id: string;
  game: string;
  name: string;
  format: string;
  date: string;
  players: number;
}

export interface DecklistEntry {
  id: string;
  name: string;
  item: string | null;
  ability: string | null;
  attacks: string[];
  nature: string | null;
  tera: string | null;
}

export interface StandingEntry {
  name: string;
  // The Limitless API returns `null` here for tournaments where decklists
  // were never made public — this is not hypothetical, it happens for real,
  // currently-active Champions tournaments. Callers must guard accordingly.
  decklist: DecklistEntry[] | null;
  placing: number;
}
