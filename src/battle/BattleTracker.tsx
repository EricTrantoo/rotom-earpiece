import { useEffect, useState } from 'react';
import { loadMetaSets } from '../data/metaSetsProvider';
import type { MetaSets } from '../shared/metaSetsTypes';
import { predictLikelyLeads } from './leadPredictor';
import { inferSets, type Evidence } from './setInference';
import {
  listSpeciesNames,
  listMoveNames,
  listItemNames,
  listAbilityNames,
  listNatureNames,
} from '../data/championsData';
import { computeDamage } from '../data/damageCalc';

export function BattleTracker() {
  const [metaSets, setMetaSets] = useState<MetaSets | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [opponentRoster, setOpponentRoster] = useState<string[]>(['', '', '', '']);
  const [focusedSpecies, setFocusedSpecies] = useState('');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evidenceKind, setEvidenceKind] = useState<Evidence['kind']>('move');
  const [evidenceValue, setEvidenceValue] = useState('');
  const [overrideItem, setOverrideItem] = useState('');
  const [overrideAbility, setOverrideAbility] = useState('');
  const [overrideNature, setOverrideNature] = useState('');
  const [attackerSpecies, setAttackerSpecies] = useState('');
  const [attackerMove, setAttackerMove] = useState('');
  const [overridesRevealed, setOverridesRevealed] = useState(false);

  useEffect(() => {
    loadMetaSets()
      .then(setMetaSets)
      .catch((e) => setLoadError((e as Error).message));
  }, []);

  const speciesOptions = listSpeciesNames();
  const moveOptions = listMoveNames();
  const itemOptions = listItemNames();
  const abilityOptions = listAbilityNames();
  const natureOptions = listNatureNames();
  const revealed = opponentRoster.filter(Boolean);

  const leads = metaSets ? predictLikelyLeads(revealed, metaSets) : [];
  const candidates = metaSets && focusedSpecies ? inferSets(focusedSpecies, evidence, metaSets) : [];
  const topCandidate = candidates[0];

  const effectiveItem = overrideItem || topCandidate?.item || undefined;
  const effectiveAbility = overrideAbility || topCandidate?.ability || undefined;
  const effectiveNature = overrideNature || topCandidate?.nature || undefined;

  let damage: ReturnType<typeof computeDamage> | null = null;
  let damageError: string | null = null;
  if (attackerSpecies && attackerMove && focusedSpecies) {
    try {
      damage = computeDamage(
        { species: attackerSpecies },
        { species: focusedSpecies, item: effectiveItem, ability: effectiveAbility, nature: effectiveNature },
        attackerMove
      );
    } catch {
      damageError = 'Could not calculate damage for this matchup — check the override values.';
    }
  }

  function addEvidence() {
    if (!evidenceValue) return;
    setEvidence([...evidence, { kind: evidenceKind, value: evidenceValue }]);
    setEvidenceValue('');
  }

  return (
    <section aria-label="Battle Tracker">
      {loadError && <p role="alert">Could not load meta data: {loadError}</p>}

      <h2>Team Preview</h2>
      {opponentRoster.map((species, i) => (
        <label key={i}>
          Opponent Pokémon {i + 1}
          <select
            value={species}
            onChange={(e) => {
              const next = [...opponentRoster];
              next[i] = e.target.value;
              setOpponentRoster(next);
            }}
          >
            <option value="">Unrevealed</option>
            {speciesOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      ))}

      <h2>Likely Leads</h2>
      <ol>
        {leads.map((l) => (
          <li key={l.species}>
            {l.species} (usage {l.usageCount})
          </li>
        ))}
      </ol>

      <h2>Set Inference</h2>
      <label>
        Focus on
        <select
          value={focusedSpecies}
          onChange={(e) => {
            setFocusedSpecies(e.target.value);
            setEvidence([]);
          }}
        >
          <option value="">Select revealed Pokémon</option>
          {revealed.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Evidence type
        <select value={evidenceKind} onChange={(e) => setEvidenceKind(e.target.value as Evidence['kind'])}>
          <option value="move">Move used</option>
          <option value="item">Item revealed</option>
          <option value="ability">Ability revealed</option>
          <option value="nature">Nature known</option>
        </select>
      </label>
      <label>
        Value
        <input value={evidenceValue} onChange={(e) => setEvidenceValue(e.target.value)} />
      </label>
      <button onClick={addEvidence}>Log observation</button>

      <ul>
        {candidates.map((c, i) => (
          <li key={i}>
            {c.count}x — Item: {c.item ?? 'unknown'}, Ability: {c.ability ?? 'unknown'}, Nature: {c.nature ?? 'unknown'}, Moves: {c.moves.join(', ')}
            {!c.matchesEvidence && ' (ruled out by evidence)'}
          </li>
        ))}
      </ul>

      <h2>Override Opponent Set (optional)</h2>
      {!overridesRevealed ? (
        <button type="button" onClick={() => setOverridesRevealed(true)}>
          Set manual overrides
        </button>
      ) : (
        <>
          <label>
            Item override
            <select value={overrideItem} onChange={(e) => setOverrideItem(e.target.value)}>
              <option value="">Use inferred item</option>
              {itemOptions.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </label>
          <label>
            Ability override
            <select value={overrideAbility} onChange={(e) => setOverrideAbility(e.target.value)}>
              <option value="">Use inferred ability</option>
              {abilityOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            Nature override
            <select value={overrideNature} onChange={(e) => setOverrideNature(e.target.value)}>
              <option value="">Use inferred nature</option>
              {natureOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </>
      )}

      <h2>Damage Check (vs. focused Pokémon)</h2>
      <label>
        Your Pokémon
        <select value={attackerSpecies} onChange={(e) => setAttackerSpecies(e.target.value)}>
          <option value="">Select species</option>
          {speciesOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Your move
        <select value={attackerMove} onChange={(e) => setAttackerMove(e.target.value)}>
          <option value="">Select move</option>
          {moveOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>
      {damageError && <p role="alert">{damageError}</p>}
      {damage && (
        <p>
          {damage.minDamage}-{damage.maxDamage} damage ({damage.minPercent}% - {damage.maxPercent}%)
        </p>
      )}
    </section>
  );
}
