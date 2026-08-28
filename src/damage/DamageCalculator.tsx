import { useState } from 'react';
import { computeDamage, type PokemonSpec } from '../data/damageCalc';
import {
  listSpeciesNames,
  listMoveNames,
  listItemNames,
  listAbilityNames,
  listNatureNames,
} from '../data/championsData';
import { PokemonSpecForm } from '../shared/PokemonSpecForm';

const emptySpec: PokemonSpec = { species: '' };

export function DamageCalculator() {
  const [attacker, setAttacker] = useState<PokemonSpec>(emptySpec);
  const [defender, setDefender] = useState<PokemonSpec>(emptySpec);
  const [moveName, setMoveName] = useState('');
  const [result, setResult] = useState<ReturnType<typeof computeDamage> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const speciesOptions = listSpeciesNames();
  const moveOptions = listMoveNames();
  const itemOptions = listItemNames();
  const abilityOptions = listAbilityNames();
  const natureOptions = listNatureNames();

  function handleCalculate() {
    if (!attacker.species || !defender.species || !moveName) {
      setError('Select an attacker, defender, and move.');
      setResult(null);
      return;
    }
    setError(null);
    try {
      setResult(computeDamage(attacker, defender, moveName));
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }

  return (
    <section aria-label="Damage Calculator">
      <PokemonSpecForm
        label="Attacker"
        spec={attacker}
        onChange={setAttacker}
        speciesOptions={speciesOptions}
        itemOptions={itemOptions}
        abilityOptions={abilityOptions}
        natureOptions={natureOptions}
      />
      <label>
        Move
        <select value={moveName} onChange={(e) => setMoveName(e.target.value)}>
          <option value="">Select a move</option>
          {moveOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>
      <PokemonSpecForm
        label="Defender"
        spec={defender}
        onChange={setDefender}
        speciesOptions={speciesOptions}
        itemOptions={itemOptions}
        abilityOptions={abilityOptions}
        natureOptions={natureOptions}
      />
      <button onClick={handleCalculate}>Calculate</button>
      {error && <p role="alert">{error}</p>}
      {result && (
        <div role="status">
          <p>
            {result.minDamage}-{result.maxDamage} damage ({result.minPercent}% - {result.maxPercent}%)
          </p>
          <p>{result.koChance || 'No guaranteed KO'}</p>
          <p>{result.description}</p>
        </div>
      )}
    </section>
  );
}
