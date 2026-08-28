import type { MetaSets } from '../shared/metaSetsTypes';
// See src/data/championsData.ts for why this is a namespace import rather than a named import.
import * as calc from '@smogon/calc';
const { toID } = calc;

export interface LeadPrediction {
  species: string;
  usageCount: number;
}

/**
 * Ranks an opponent's revealed roster by usage count as a proxy for how
 * likely each Pokemon is to be a lead. Tournament decklists list a full
 * roster, not which mons were actually brought/led, so usage frequency is
 * the best available signal for v1.
 */
export function predictLikelyLeads(revealedRoster: string[], metaSets: MetaSets): LeadPrediction[] {
  return revealedRoster
    .map((species) => ({ species, usageCount: metaSets.species[toID(species)]?.usageCount ?? 0 }))
    .sort((a, b) => b.usageCount - a.usageCount);
}
