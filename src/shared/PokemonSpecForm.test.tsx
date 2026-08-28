import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PokemonSpecForm } from './PokemonSpecForm';
import type { PokemonSpec } from '../data/damageCalc';

function renderForm(spec: PokemonSpec, onChange: (spec: PokemonSpec) => void) {
  return render(
    <PokemonSpecForm
      label="Attacker"
      spec={spec}
      onChange={onChange}
      speciesOptions={[]}
      itemOptions={[]}
      abilityOptions={[]}
      natureOptions={[]}
    />
  );
}

describe('PokemonSpecForm Stat Points', () => {
  it('clamps an out-of-range pasted/typed value (e.g. 999) to the [0, 32] max', () => {
    const onChange = vi.fn();
    renderForm({ species: 'Incineroar' }, onChange);

    const hpInput = screen.getByLabelText(/attacker hp sp/i);
    fireEvent.change(hpInput, { target: { value: '999' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const spec = onChange.mock.calls[0][0] as PokemonSpec;
    expect(spec.statPoints?.hp).toBe(32);
  });

  it('falls back to 0 instead of NaN when the input value cannot be parsed as a number', () => {
    const onChange = vi.fn();
    renderForm({ species: 'Incineroar' }, onChange);

    const hpInput = screen.getByLabelText(/attacker hp sp/i);
    fireEvent.change(hpInput, { target: { value: 'not a number' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const spec = onChange.mock.calls[0][0] as PokemonSpec;
    expect(spec.statPoints?.hp).toBe(0);
    expect(Number.isFinite(spec.statPoints?.hp)).toBe(true);
  });
});
