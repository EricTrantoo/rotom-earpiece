import type { MetaSets, SetVariant } from '../shared/metaSetsTypes';
// See src/data/championsData.ts for why this is a namespace import rather than a named import.
import * as calc from '@smogon/calc';
const { toID } = calc;

export type EvidenceKind = 'move' | 'item' | 'ability' | 'nature';

export interface Evidence {
  kind: EvidenceKind;
  value: string;
}

export interface RankedCandidate extends SetVariant {
  matchesEvidence: boolean;
}

function isConsistent(variant: SetVariant, evidence: Evidence[]): boolean {
  return evidence.every((e) => {
    switch (e.kind) {
      case 'move':
        return variant.moves.includes(e.value);
      case 'item':
        return variant.item === e.value;
      case 'ability':
        return variant.ability === e.value;
      case 'nature':
        return variant.nature === e.value;
    }
  });
}

/**
 * Ranks known set variants for a species by usage count, filtering out any
 * variant that contradicts observed evidence. If no variant survives (e.g. a
 * genuinely new/unlisted set), all variants are returned, flagged as
 * non-matching, rather than an empty list — "no confident guess" is more
 * honest than silently hiding data.
 */
export function inferSets(species: string, evidence: Evidence[], metaSets: MetaSets): RankedCandidate[] {
  const variants = metaSets.species[toID(species)]?.variants ?? [];
  const surviving = variants.filter((v) => isConsistent(v, evidence));
  const pool = surviving.length > 0 ? surviving : variants;

  return pool
    .map((v) => ({ ...v, matchesEvidence: isConsistent(v, evidence) }))
    .sort((a, b) => b.count - a.count);
}
