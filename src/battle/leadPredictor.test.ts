// src/battle/leadPredictor.test.ts
import { describe, it, expect } from 'vitest';
import { predictLikelyLeads } from './leadPredictor';
import type { MetaSets } from '../shared/metaSetsTypes';

const metaSets: MetaSets = {
  generatedAt: '2026-08-27T00:00:00.000Z',
  sampleTournaments: 1,
  samplePlayers: 10,
  species: {
    incineroar: { species: 'Incineroar', usageCount: 8, itemCounts: {}, abilityCounts: {}, moveCounts: {}, natureCounts: {}, variants: [] },
    sinistcha: { species: 'Sinistcha', usageCount: 3, itemCounts: {}, abilityCounts: {}, moveCounts: {}, natureCounts: {}, variants: [] },
  },
};

describe('predictLikelyLeads', () => {
  it('ranks revealed roster by usage count, most-used first', () => {
    const result = predictLikelyLeads(['Sinistcha', 'Incineroar'], metaSets);
    expect(result.map((r) => r.species)).toEqual(['Incineroar', 'Sinistcha']);
  });

  it('treats species missing from meta-sets data as zero usage', () => {
    const result = predictLikelyLeads(['Unknown Mon', 'Incineroar'], metaSets);
    expect(result[0].species).toBe('Incineroar');
    expect(result[1].usageCount).toBe(0);
  });
});
