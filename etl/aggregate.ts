import type { StandingEntry, DecklistEntry } from './types';
import type { MetaSets, SpeciesUsage, SetVariant } from '../src/shared/metaSetsTypes';

function emptyUsage(species: string): SpeciesUsage {
  return { species, usageCount: 0, itemCounts: {}, abilityCounts: {}, moveCounts: {}, natureCounts: {}, variants: [] };
}

function increment(counts: Record<string, number>, key: string | null) {
  if (!key) return;
  counts[key] = (counts[key] ?? 0) + 1;
}

function variantKey(mon: DecklistEntry): string {
  return JSON.stringify({ item: mon.item, ability: mon.ability, moves: [...mon.attacks].sort(), nature: mon.nature });
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
        const usage = species[mon.name] ?? emptyUsage(mon.name);
        usage.usageCount += 1;
        increment(usage.itemCounts, mon.item);
        increment(usage.abilityCounts, mon.ability);
        increment(usage.natureCounts, mon.nature);
        for (const move of mon.attacks) increment(usage.moveCounts, move);
        species[mon.name] = usage;

        const variants = variantsBySpecies[mon.name] ?? new Map<string, SetVariant>();
        const key = variantKey(mon);
        const existing = variants.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          variants.set(key, { item: mon.item, ability: mon.ability, moves: [...mon.attacks], nature: mon.nature, count: 1 });
        }
        variantsBySpecies[mon.name] = variants;
      }
    }
  }

  for (const [name, variants] of Object.entries(variantsBySpecies)) {
    species[name].variants = [...variants.values()].sort((a, b) => b.count - a.count);
  }

  return {
    generatedAt: new Date().toISOString(),
    sampleTournaments: standingsByTournament.length,
    samplePlayers,
    species,
  };
}
