import { describe, it, expect } from 'vitest';
import { computeDamage } from './damageCalc';

describe('computeDamage', () => {
  it('returns zero damage for a type immunity (Normal move vs. pure Ghost-type)', () => {
    const result = computeDamage({ species: 'Snorlax' }, { species: 'Gengar' }, 'Hyper Beam');
    expect(result.maxDamage).toBe(0);
    expect(result.minDamage).toBe(0);
  });

  it('returns nonzero damage for a super-effective matchup', () => {
    const result = computeDamage(
      { species: 'Incineroar', statPoints: { atk: 32 }, nature: 'Adamant' },
      { species: 'Sinistcha' },
      'Flare Blitz'
    );
    expect(result.maxDamage).toBeGreaterThan(0);
    expect(result.minPercent).toBeLessThanOrEqual(result.maxPercent);
  });
});
