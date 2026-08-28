// etl/publish.test.ts
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { publishMetaSets, type Writer } from './publish';
import type { MetaSets } from '../src/shared/metaSetsTypes';

function createFakeWriter(): Writer & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    async write(key, body) { store.set(key, body); },
    async read(key) { return store.get(key) ?? null; },
  };
}

const validMetaSets: MetaSets = {
  generatedAt: '2026-08-27T00:00:00.000Z',
  sampleTournaments: 1,
  samplePlayers: 2,
  species: {
    Incineroar: { species: 'Incineroar', usageCount: 2, itemCounts: {}, abilityCounts: {}, moveCounts: {}, natureCounts: {}, variants: [] },
  },
};

describe('publishMetaSets', () => {
  it('writes a versioned file and updates latest.json for valid data', async () => {
    const writer = createFakeWriter();
    await publishMetaSets(validMetaSets, writer);
    expect(writer.store.get('meta-sets/meta-sets-2026-08-27.json')).toContain('Incineroar');
    expect(writer.store.get('meta-sets/latest.json')).toContain('Incineroar');
  });

  it('does not overwrite latest.json with invalid (empty) data', async () => {
    const writer = createFakeWriter();
    writer.store.set('meta-sets/latest.json', JSON.stringify(validMetaSets));
    const invalid: MetaSets = { ...validMetaSets, samplePlayers: 0, species: {} };

    await publishMetaSets(invalid, writer);

    expect(writer.store.get('meta-sets/latest.json')).toContain('Incineroar');
  });
});
