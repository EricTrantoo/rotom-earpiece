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
  decklist: DecklistEntry[];
  placing: number;
}
