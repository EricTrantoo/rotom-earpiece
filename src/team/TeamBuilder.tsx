import { useState } from 'react';
import { loadTeams, upsertTeam, deleteTeam } from './teamStorage';
import type { Team, TeamMember } from './types';
import { PokemonSpecForm } from '../shared/PokemonSpecForm';
import {
  listSpeciesNames,
  listMoveNames,
  listItemNames,
  listAbilityNames,
  listNatureNames,
} from '../data/championsData';

function emptyMember(): TeamMember {
  return { species: '', moves: [] };
}

function emptyTeam(): Team {
  return { id: crypto.randomUUID(), name: '', members: [] };
}

export function TeamBuilder() {
  const [teams, setTeams] = useState<Team[]>(() => loadTeams());
  const [editing, setEditing] = useState<Team>(emptyTeam());

  const speciesOptions = listSpeciesNames();
  const moveOptions = listMoveNames();
  const itemOptions = listItemNames();
  const abilityOptions = listAbilityNames();
  const natureOptions = listNatureNames();

  function addMember() {
    if (editing.members.length >= 6) return;
    setEditing({ ...editing, members: [...editing.members, emptyMember()] });
  }

  function updateMember(index: number, member: TeamMember) {
    setEditing({ ...editing, members: editing.members.map((m, i) => (i === index ? member : m)) });
  }

  function save() {
    setTeams(upsertTeam(editing));
  }

  function remove(teamId: string) {
    setTeams(deleteTeam(teamId));
  }

  return (
    <section aria-label="Team Builder">
      <h2>My Teams</h2>
      <ul>
        {teams.map((t) => (
          <li key={t.id}>
            {t.name}{' '}
            <button onClick={() => setEditing(t)}>Edit</button>{' '}
            <button onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Edit Team</h2>
      <label>
        Team name
        <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
      </label>

      {editing.members.map((member, i) => (
        <fieldset key={i}>
          <legend>Pokémon {i + 1}</legend>
          <PokemonSpecForm
            label={`Pokemon ${i + 1}`}
            spec={member}
            onChange={(spec) => updateMember(i, { ...member, ...spec })}
            speciesOptions={speciesOptions}
            itemOptions={itemOptions}
            abilityOptions={abilityOptions}
            natureOptions={natureOptions}
          />
          {[0, 1, 2, 3].map((slot) => (
            <label key={slot}>
              Pokemon {i + 1} Move {slot + 1}
              <select
                value={member.moves[slot] ?? ''}
                onChange={(e) => {
                  const moves = [...member.moves];
                  moves[slot] = e.target.value;
                  updateMember(i, { ...member, moves });
                }}
              >
                <option value="">None</option>
                {moveOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
          ))}
        </fieldset>
      ))}
      <button onClick={addMember} disabled={editing.members.length >= 6}>Add Pokémon</button>
      <button onClick={save}>Save Team</button>
    </section>
  );
}
