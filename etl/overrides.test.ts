// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mergeOverrides } from './overrides';
import type { MetaSets } from '../src/shared/metaSetsTypes';

const base: MetaSets = {
  generatedAt: '2026-08-27T00:00:00.000Z',
  sampleTournaments: 1,
  samplePlayers: 2,
  species: {
    Incineroar: {
      species: 'Incineroar',
      usageCount: 2,
      itemCounts: { 'Sitrus Berry': 2 },
      abilityCounts: {},
      moveCounts: {},
      natureCounts: {},
      variants: [],
    },
  },
};

describe('mergeOverrides', () => {
  it('merges override item counts into an existing species rather than replacing them', () => {
    const merged = mergeOverrides(base, {
      Incineroar: { itemCounts: { 'Assault Vest': 1 } },
    });
    expect(merged.species['Incineroar'].itemCounts).toEqual({ 'Sitrus Berry': 2, 'Assault Vest': 1 });
  });

  it('adds a brand-new species that has no tournament data yet', () => {
    const merged = mergeOverrides(base, {
      'Ursaluna-Bloodmoon': { usageCount: 1, moveCounts: { 'Blood Moon': 1 } },
    });
    expect(merged.species['Ursaluna-Bloodmoon'].usageCount).toBe(1);
    expect(merged.species['Ursaluna-Bloodmoon'].moveCounts).toEqual({ 'Blood Moon': 1 });
  });
});
