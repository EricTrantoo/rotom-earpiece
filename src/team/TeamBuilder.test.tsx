import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamBuilder } from './TeamBuilder';

describe('TeamBuilder', () => {
  beforeEach(() => localStorage.clear());

  it('saves a team with a Pokemon and shows it in the team list', async () => {
    const user = userEvent.setup();
    render(<TeamBuilder />);

    await user.type(screen.getByLabelText(/team name/i), 'Sun Team');
    await user.click(screen.getByRole('button', { name: /add pokémon/i }));
    await user.selectOptions(screen.getByLabelText(/pokemon 1 species/i), 'Torkoal');
    await user.click(screen.getByRole('button', { name: /save team/i }));

    expect(await screen.findByText('Sun Team')).toBeInTheDocument();
  });
});
