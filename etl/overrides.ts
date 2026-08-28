import type { MetaSets, SpeciesUsage } from '../src/shared/metaSetsTypes';

export type CuratedOverrides = Record<string, Partial<SpeciesUsage>>;

function emptyUsage(species: string): SpeciesUsage {
  return { species, usageCount: 0, itemCounts: {}, abilityCounts: {}, moveCounts: {}, natureCounts: {}, variants: [] };
}

export function mergeOverrides(base: MetaSets, overrides: CuratedOverrides): MetaSets {
  const species = { ...base.species };
  for (const [name, override] of Object.entries(overrides)) {
    const existing = species[name] ?? emptyUsage(name);
    species[name] = {
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
