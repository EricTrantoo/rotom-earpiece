// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { aggregateUsageStats } from './aggregate';
import standingsFixture from './fixtures/standings.sample.json';
import type { StandingEntry } from './types';
// See src/data/championsData.ts for why this is a namespace import rather than a named import.
import * as calc from '@smogon/calc';
const { toID } = calc;

describe('aggregateUsageStats', () => {
  it('counts species usage and item/move/nature frequency across tournaments', () => {
    const result = aggregateUsageStats([standingsFixture as StandingEntry[]]);

    expect(result.samplePlayers).toBe(2);
    expect(result.species['incineroar'].usageCount).toBe(2);
    expect(result.species['incineroar'].itemCounts['Sitrus Berry']).toBe(2);
    expect(result.species['incineroar'].moveCounts['Flare Blitz']).toBe(2);
    expect(result.species['sinistcha'].natureCounts['Bold']).toBe(1);
    expect(result.species['kingambit'].usageCount).toBe(1);
  });

  it('groups identical decklist entries into ranked set variants', () => {
    const result = aggregateUsageStats([standingsFixture as StandingEntry[]]);
    const incineroarVariants = result.species['incineroar'].variants;

    // tsumi88 and joniaco ran different natures/movesets on Incineroar, so
    // they should be counted as two distinct variants, not merged together.
    expect(incineroarVariants).toHaveLength(2);
    expect(incineroarVariants[0].count + incineroarVariants[1].count).toBe(2);
  });

  it('skips players with a null decklist (undisclosed decklist tournaments) without throwing', () => {
    const standings = [
      {
        name: 'GreenAppleTCG',
        placing: 1,
        decklist: null,
      },
      standingsFixture[0],
    ] as unknown as StandingEntry[];

    let result;
    expect(() => {
      result = aggregateUsageStats([standings]);
    }).not.toThrow();

    // Only the player with a real decklist array should count as a sample player.
    expect(result!.samplePlayers).toBe(1);

    // The null-decklist player contributes nothing: usage counts and variants
    // should reflect only tsumi88 (standingsFixture[0]), i.e. 1 count each,
    // not 2 as would happen if the null player were double-counted.
    expect(result!.species['incineroar'].usageCount).toBe(1);
    expect(result!.species['incineroar'].variants).toHaveLength(1);
    expect(result!.species['incineroar'].variants[0].count).toBe(1);
  });

  it('keys species by the @smogon/calc-style toID of the decklist id, not the Limitless display name', () => {
    // Regression test for the species-key mismatch bug: the fixture's
    // "Eternal Flower Floette" entry has id "floette-eternal", which matches
    // @smogon/calc's canonical species name "Floette-Eternal" once both are
    // run through toID (both -> "floetteeternal") — but the raw display name
    // "Eternal Flower Floette" normalizes to something entirely different
    // ("eternalflowerfloette"). The aggregated map must be retrievable via
    // the @smogon/calc convention, not the Limitless display-name convention.
    const result = aggregateUsageStats([standingsFixture as StandingEntry[]]);

    const calcStyleKey = toID('Floette-Eternal');
    const limitlessDisplayNameKey = toID('Eternal Flower Floette');

    expect(calcStyleKey).not.toBe(limitlessDisplayNameKey);
    expect(result.species[calcStyleKey]).toBeDefined();
    expect(result.species[calcStyleKey].usageCount).toBe(1);
    expect(result.species[limitlessDisplayNameKey]).toBeUndefined();
  });
});
