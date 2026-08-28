import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DamageCalculator } from './DamageCalculator';

describe('DamageCalculator', () => {
  it('computes and displays zero damage for a type immunity', async () => {
    const user = userEvent.setup();
    render(<DamageCalculator />);

    await user.selectOptions(screen.getByLabelText(/attacker species/i), 'Snorlax');
    await user.selectOptions(screen.getByLabelText(/^move$/i), 'Hyper Beam');
    await user.selectOptions(screen.getByLabelText(/defender species/i), 'Gengar');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(await screen.findByText(/0-0 damage/)).toBeInTheDocument();
  });

  it('shows an error if species or move are missing', async () => {
    const user = userEvent.setup();
    render(<DamageCalculator />);
    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/select an attacker, defender, and move/i);
  });
});
