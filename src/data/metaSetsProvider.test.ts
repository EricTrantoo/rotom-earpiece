import { describe, it, expect, vi } from 'vitest';
import { loadMetaSets, getSpeciesUsage } from './metaSetsProvider';
import type { MetaSets } from '../shared/metaSetsTypes';

const sample: MetaSets = {
  generatedAt: '2026-08-27T00:00:00.000Z',
  sampleTournaments: 1,
  samplePlayers: 2,
  species: {
    incineroar: { species: 'Incineroar', usageCount: 2, itemCounts: { 'Sitrus Berry': 2 }, abilityCounts: {}, moveCounts: {}, natureCounts: {}, variants: [] },
  },
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe('metaSetsProvider', () => {
  it('loads meta-sets data and caches it, only fetching once', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(sample));
    const first = await loadMetaSets(fetchImpl);
    const second = await loadMetaSets(fetchImpl);
    expect(first).toEqual(sample);
    expect(second).toEqual(sample);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('looks up usage data for a species, returning undefined for the unknown', () => {
    expect(getSpeciesUsage(sample, 'Incineroar')?.usageCount).toBe(2);
    expect(getSpeciesUsage(sample, 'Snorlax')).toBeUndefined();
  });
});
