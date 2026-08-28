import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BattleTracker as BattleTrackerComponent } from './BattleTracker';

// metaSetsProvider caches the loaded MetaSets in module-level state, so each
// test below (several of which deliberately exercise a different fetch
// response — success, failure, malformed data) needs a fresh module registry
// rather than reusing whatever a previous test's successful load cached.
let BattleTracker: typeof BattleTrackerComponent;

beforeEach(async () => {
  vi.resetModules();
  ({ BattleTracker } = await import('./BattleTracker'));
});

const metaSetsFixture = {
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

  it('still renders the rest of the tab (Team Preview, overrides, damage check) when meta-sets fail to load', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('server error', { status: 500 })));
    render(<BattleTracker />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load meta data/i);
    // The rest of the tab must still be usable — none of these sections depend
    // on meta-sets data being available.
    expect(screen.getByText('Team Preview')).toBeInTheDocument();
    expect(screen.getByLabelText(/opponent pokémon 1/i)).toBeInTheDocument();
    expect(screen.getByText('Override Opponent Set (optional)')).toBeInTheDocument();
    expect(screen.getByText('Damage Check (vs. focused Pokémon)')).toBeInTheDocument();
  });

  it('shows an inline message instead of crashing when computeDamage throws on a bad override', async () => {
    // A meta-sets variant with a nonsense item, exactly the kind of unrecognized
    // value @smogon/calc throws on rather than silently accepting.
    const badVariantFixture = {
      ...metaSetsFixture,
      species: {
        incineroar: {
          ...metaSetsFixture.species.incineroar,
          variants: [
            { item: 'Not A Real Item', ability: 'Intimidate', moves: ['Flare Blitz'], nature: 'Careful', count: 1 },
          ],
        },
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(badVariantFixture), { status: 200 })));
    const user = userEvent.setup();
    render(<BattleTracker />);

    await user.selectOptions(await screen.findByLabelText(/opponent pokémon 1/i), 'Incineroar');
    await user.selectOptions(screen.getByLabelText(/focus on/i), 'Incineroar');
    await user.selectOptions(screen.getByLabelText(/your pokémon/i), 'Incineroar');
    await user.selectOptions(screen.getByLabelText(/your move/i), 'Flare Blitz');

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not calculate damage/i);
    // The rest of the component must still be mounted — no whole-tree crash.
    expect(screen.getByText('Team Preview')).toBeInTheDocument();
  });
});
