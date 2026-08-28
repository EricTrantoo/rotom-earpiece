// etl/handler.test.ts
// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { runEtl } from './handler';
import tournamentsFixture from './fixtures/tournaments.sample.json';
import standingsFixture from './fixtures/standings.sample.json';
import type { Writer } from './publish';

function createFakeWriter(): Writer & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    async write(key, body) { store.set(key, body); },
    async read(key) { return store.get(key) ?? null; },
  };
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe('runEtl', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('fetches tournaments and standings, aggregates them, and publishes meta-sets', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(tournamentsFixture))
      .mockResolvedValueOnce(jsonResponse(standingsFixture));
    vi.stubGlobal('fetch', fetchMock);

    const writer = createFakeWriter();
    await runEtl(writer);

    expect(writer.store.get('meta-sets/latest.json')).toContain('Incineroar');
    // 1 call for the tournament list + 1 for the single Champions-format tournament's standings
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
