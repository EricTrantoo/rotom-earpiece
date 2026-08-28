import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BattleTracker } from './BattleTracker';

const metaSetsFixture = {
  generatedAt: '2026-08-27T00:00:00.000Z',
  sampleTournaments: 1,
  samplePlayers: 2,
  species: {
    Incineroar: {
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

describe('BattleTracker', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('narrows opponent set candidates as evidence is logged', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(metaSetsFixture), { status: 200 })));
    const user = userEvent.setup();
    render(<BattleTracker />);

    await user.selectOptions(await screen.findByLabelText(/opponent pokémon 1/i), 'Incineroar');
    expect(await screen.findByText(/Incineroar \(usage 2\)/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/focus on/i), 'Incineroar');
    expect(await screen.findAllByText(/Sitrus Berry/)).toHaveLength(2);

    await user.selectOptions(screen.getByLabelText(/evidence type/i), 'move');
    await user.type(screen.getByLabelText(/^value$/i), 'Darkest Lariat');
    await user.click(screen.getByRole('button', { name: /log observation/i }));

    expect(await screen.findAllByText(/Sitrus Berry/)).toHaveLength(1);
    expect(screen.getByText(/Relaxed/)).toBeInTheDocument();
  });
});
