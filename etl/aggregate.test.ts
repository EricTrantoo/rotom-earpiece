// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { aggregateUsageStats } from './aggregate';
import standingsFixture from './fixtures/standings.sample.json';
import type { StandingEntry } from './types';

describe('aggregateUsageStats', () => {
  it('counts species usage and item/move/nature frequency across tournaments', () => {
    const result = aggregateUsageStats([standingsFixture as StandingEntry[]]);

    expect(result.samplePlayers).toBe(2);
    expect(result.species['Incineroar'].usageCount).toBe(2);
    expect(result.species['Incineroar'].itemCounts['Sitrus Berry']).toBe(2);
    expect(result.species['Incineroar'].moveCounts['Flare Blitz']).toBe(2);
    expect(result.species['Sinistcha'].natureCounts['Bold']).toBe(1);
    expect(result.species['Kingambit'].usageCount).toBe(1);
  });

  it('groups identical decklist entries into ranked set variants', () => {
    const result = aggregateUsageStats([standingsFixture as StandingEntry[]]);
    const incineroarVariants = result.species['Incineroar'].variants;

    // tsumi88 and joniaco ran different natures/movesets on Incineroar, so
    // they should be counted as two distinct variants, not merged together.
    expect(incineroarVariants).toHaveLength(2);
    expect(incineroarVariants[0].count + incineroarVariants[1].count).toBe(2);
  });
});
