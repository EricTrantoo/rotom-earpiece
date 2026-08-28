import type { MetaSets, SpeciesUsage } from '../src/shared/metaSetsTypes';
// See src/data/championsData.ts for why this is a namespace import rather than a named import.
import * as calc from '@smogon/calc';
const { toID } = calc;

export type CuratedOverrides = Record<string, Partial<SpeciesUsage>>;

function emptyUsage(species: string): SpeciesUsage {
  return { species, usageCount: 0, itemCounts: {}, abilityCounts: {}, moveCounts: {}, natureCounts: {}, variants: [] };
}

export function mergeOverrides(base: MetaSets, overrides: CuratedOverrides): MetaSets {
  const species = { ...base.species };
  for (const [name, override] of Object.entries(overrides)) {
    // Normalize to the same toID-based key aggregate.ts uses, so a curated
    // override actually merges into the matching species instead of creating
    // a duplicate entry keyed by display name.
    const key = toID(name);
    const existing = species[key] ?? emptyUsage(name);
    species[key] = {
      ...existing,
      ...override,
      itemCounts: { ...existing.itemCounts, ...override.itemCounts },
      abilityCounts: { ...existing.abilityCounts, ...override.abilityCounts },
      moveCounts: { ...existing.moveCounts, ...override.moveCounts },
      natureCounts: { ...existing.natureCounts, ...override.natureCounts },
      variants: override.variants ?? existing.variants,
    };
  }
  return { ...base, species };
}
