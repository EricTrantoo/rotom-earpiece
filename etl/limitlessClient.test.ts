// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { fetchChampionsTournaments, fetchStandings } from './limitlessClient';
import tournamentsFixture from './fixtures/tournaments.sample.json';
import standingsFixture from './fixtures/standings.sample.json';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe('limitlessClient', () => {
  it('filters tournaments down to Champions formats only', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(tournamentsFixture));
    const result = await fetchChampionsTournaments(fetchImpl);
    expect(result).toHaveLength(1);
    expect(result[0].format).toBe('M-B');
  });

  it('fetches standings for a given tournament id', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(standingsFixture));
    const result = await fetchStandings('6a7dcc97cdc0391d7fa6551e', fetchImpl);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('tsumi88');
  });

  it('throws if the tournaments request fails', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('', { status: 500 }));
    await expect(fetchChampionsTournaments(fetchImpl)).rejects.toThrow(/failed: 500/i);
  });
});
