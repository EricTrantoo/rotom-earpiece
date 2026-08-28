import { describe, it, expect } from 'vitest';
import { loadTeams, upsertTeam, deleteTeam } from './teamStorage';
import type { Team } from './types';

function createFakeStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => { store.set(k, v); },
    removeItem: (k) => { store.delete(k); },
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
}

const sampleTeam: Team = { id: 't1', name: 'Sun Team', members: [] };

describe('teamStorage', () => {
  it('returns an empty array when nothing is saved', () => {
    expect(loadTeams(createFakeStorage())).toEqual([]);
  });

  it('returns an empty array (without throwing) when stored data is corrupt/invalid JSON', () => {
    const storage = createFakeStorage();
    storage.setItem('rotom-earpiece:teams', 'not valid json{{{');

    let result: Team[] | undefined;
    expect(() => {
      result = loadTeams(storage);
    }).not.toThrow();
    expect(result).toEqual([]);
  });

  it('saves and reloads a team', () => {
    const storage = createFakeStorage();
    upsertTeam(sampleTeam, storage);
    expect(loadTeams(storage)).toEqual([sampleTeam]);
  });

  it('updates an existing team by id instead of duplicating it', () => {
    const storage = createFakeStorage();
    upsertTeam(sampleTeam, storage);
    const renamed = { ...sampleTeam, name: 'Rain Team' };
    upsertTeam(renamed, storage);
    expect(loadTeams(storage)).toEqual([renamed]);
  });

  it('deletes a team by id', () => {
    const storage = createFakeStorage();
    upsertTeam(sampleTeam, storage);
    deleteTeam('t1', storage);
    expect(loadTeams(storage)).toEqual([]);
  });
});
