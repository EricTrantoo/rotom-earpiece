import type { StandingEntry, DecklistEntry } from './types';
import type { MetaSets, SpeciesUsage, SetVariant } from '../src/shared/metaSetsTypes';
// See src/data/championsData.ts for why this is a namespace import rather than a named import.
import * as calc from '@smogon/calc';
const { toID } = calc;

function emptyUsage(species: string): SpeciesUsage {
  return { species, usageCount: 0, itemCounts: {}, abilityCounts: {}, moveCounts: {}, natureCounts: {}, variants: [] };
}

function increment(counts: Record<string, number>, key: string | null) {
  if (!key) return;
  counts[key] = (counts[key] ?? 0) + 1;
}

function variantKey(mon: DecklistEntry): string {
  const moves = Array.isArray(mon.attacks) ? [...mon.attacks].sort() : [];
  return JSON.stringify({ item: mon.item, ability: mon.ability, moves, nature: mon.nature });
}

export function aggregateUsageStats(standingsByTournament: StandingEntry[][]): MetaSets {
  const species: Record<string, SpeciesUsage> = {};
  const variantsBySpecies: Record<string, Map<string, SetVariant>> = {};
  let samplePlayers = 0;

  for (const standings of standingsByTournament) {
    for (const player of standings) {
      // Some tournaments (confirmed via live API) return `decklist: null`
      // for players whose decklists were never made public. Skip them
      // entirely: they contributed no set data, so they shouldn't count
      // toward samplePlayers either.
      if (!Array.isArray(player.decklist)) continue;
      samplePlayers += 1;
      for (const mon of player.decklist) {
        // `mon.id` matches @smogon/calc's canonical species id convention (e.g.
        // "floette-eternal") once normalized via toID, unlike `mon.name`, which
        // is the Limitless API's human-readable display name (e.g. "Eternal
        // Flower Floette") and does not match how the frontend looks species up.
        const key = toID(mon.id);
        const usage = species[key] ?? emptyUsage(mon.name);
        usage.usageCount += 1;
        increment(usage.itemCounts, mon.item);
        increment(usage.abilityCounts, mon.ability);
        increment(usage.natureCounts, mon.nature);
        // Defensive guard: mon.attacks has always been an array in observed
        // live data, but treat a malformed/missing value the same way we treat
        // a null decklist elsewhere — skip just the move-counting for this mon
        // rather than let a throw here drop the whole player.
        if (Array.isArray(mon.attacks)) {
          for (const move of mon.attacks) increment(usage.moveCounts, move);
        }
        species[key] = usage;

        const variants = variantsBySpecies[key] ?? new Map<string, SetVariant>();
        const variantId = variantKey(mon);
        const existing = variants.get(variantId);
        if (existing) {
          existing.count += 1;
        } else {
          const moves = Array.isArray(mon.attacks) ? [...mon.attacks] : [];
          variants.set(variantId, { item: mon.item, ability: mon.ability, moves, nature: mon.nature, count: 1 });
        }
        variantsBySpecies[key] = variants;
      }
    }
  }

  for (const [key, variants] of Object.entries(variantsBySpecies)) {
    species[key].variants = [...variants.values()].sort((a, b) => b.count - a.count);
  }

  return {
    generatedAt: new Date().toISOString(),
    sampleTournaments: standingsByTournament.length,
    samplePlayers,
    species,
  };
}
