import type { MetaSets, SpeciesUsage } from '../shared/metaSetsTypes';
// See src/data/championsData.ts for why this is a namespace import rather than a named import.
import * as calc from '@smogon/calc';
const { toID } = calc;

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
  return metaSets.species[toID(species)];
}
