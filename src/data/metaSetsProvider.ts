import type { MetaSets, SpeciesUsage } from '../shared/metaSetsTypes';

const META_SETS_URL = import.meta.env.VITE_META_SETS_URL ?? '/meta-sets.json';

let cache: MetaSets | null = null;

export async function loadMetaSets(fetchImpl: typeof fetch = fetch): Promise<MetaSets> {
  if (cache) return cache;
  const response = await fetchImpl(META_SETS_URL);
  if (!response.ok) {
    throw new Error(`Failed to load meta-sets data: ${response.status}`);
  }
  cache = (await response.json()) as MetaSets;
  return cache;
}

export function getSpeciesUsage(metaSets: MetaSets, species: string): SpeciesUsage | undefined {
  return metaSets.species[species];
}
