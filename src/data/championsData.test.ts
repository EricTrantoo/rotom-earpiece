// src/data/championsData.test.ts
import { describe, it, expect } from 'vitest';
import { getSpecies, listSpeciesNames, getMove, listAbilityNames, listItemNames, listNatureNames } from './championsData';

describe('championsData', () => {
  it('exposes a Champions species with correct types', () => {
    const gengar = getSpecies('Gengar');
    expect(gengar?.types).toEqual(['Ghost', 'Poison']);
  });

  it('lists species names including known Champions picks', () => {
    const names = listSpeciesNames();
    expect(names).toContain('Incineroar');
    expect(names).toContain('Snorlax');
  });

  it('exposes moves with the correct type', () => {
    const hyperBeam = getMove('Hyper Beam');
    expect(hyperBeam?.type).toBe('Normal');
  });

  it('lists non-empty ability, item, and nature names', () => {
    expect(listAbilityNames().length).toBeGreaterThan(0);
    expect(listItemNames().length).toBeGreaterThan(0);
    expect(listNatureNames()).toContain('Adamant');
  });
});
