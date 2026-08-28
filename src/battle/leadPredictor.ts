import type { MetaSets } from '../shared/metaSetsTypes';

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
    .map((species) => ({ species, usageCount: metaSets.species[species]?.usageCount ?? 0 }))
    .sort((a, b) => b.usageCount - a.usageCount);
}
