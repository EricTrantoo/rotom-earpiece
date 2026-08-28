import { describe, it, expect } from 'vitest';
import { inferSets } from './setInference';
import type { MetaSets } from '../shared/metaSetsTypes';

const metaSets: MetaSets = {
  generatedAt: '2026-08-27T00:00:00.000Z',
  sampleTournaments: 1,
  samplePlayers: 2,
  species: {
    incineroar: {
      species: 'Incineroar',
      usageCount: 2,
      itemCounts: {}, abilityCounts: {}, moveCounts: {}, natureCounts: {},
      variants: [
        { item: 'Sitrus Berry', ability: 'Intimidate', moves: ['Parting Shot', 'Flare Blitz', 'Helping Hand', 'Fake Out'], nature: 'Careful', count: 5 },
        { item: 'Sitrus Berry', ability: 'Intimidate', moves: ['Flare Blitz', 'Parting Shot', 'Fake Out', 'Darkest Lariat'], nature: 'Relaxed', count: 3 },
      ],
    },
  },
};

describe('inferSets', () => {
  it('ranks all known variants by usage when there is no evidence yet', () => {
    const result = inferSets('Incineroar', [], metaSets);
    expect(result.map((r) => r.count)).toEqual([5, 3]);
  });

  it('eliminates variants inconsistent with observed evidence', () => {
    const result = inferSets('Incineroar', [{ kind: 'move', value: 'Darkest Lariat' }], metaSets);
    expect(result).toHaveLength(1);
    expect(result[0].nature).toBe('Relaxed');
  });

  it('falls back to the full variant list, all flagged non-matching, if evidence rules out everything on file', () => {
    const result = inferSets('Incineroar', [{ kind: 'move', value: 'Never Seen Move' }], metaSets);
    expect(result).toHaveLength(2);
    expect(result.every((r) => !r.matchesEvidence)).toBe(true);
  });

  it('returns an empty list for a species with no meta-sets data', () => {
    expect(inferSets('Totally Unknown Mon', [], metaSets)).toEqual([]);
  });
});
