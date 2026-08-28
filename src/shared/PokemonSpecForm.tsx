import type { PokemonSpec } from '../data/damageCalc';

const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;

interface Props {
  label: string;
  spec: PokemonSpec;
  onChange: (spec: PokemonSpec) => void;
  speciesOptions: string[];
  itemOptions: string[];
  abilityOptions: string[];
  natureOptions: string[];
}

export function PokemonSpecForm({ label, spec, onChange, speciesOptions, itemOptions, abilityOptions, natureOptions }: Props) {
  function update<K extends keyof PokemonSpec>(key: K, value: PokemonSpec[K]) {
    onChange({ ...spec, [key]: value });
  }

  function updateStatPoint(stat: (typeof STATS)[number], value: number) {
    // A pasted/typed value like "999" or garbage text must not silently
    // corrupt damage calculations with an out-of-range or NaN Stat Point —
    // @smogon/calc doesn't validate this itself.
    const clamped = Math.min(32, Math.max(0, Number.isFinite(value) ? value : 0));
    onChange({ ...spec, statPoints: { ...spec.statPoints, [stat]: clamped } });
  }

  return (
    <fieldset>
      <legend>{label}</legend>
      <label>
        {label} Species
        <select value={spec.species} onChange={(e) => update('species', e.target.value)}>
          <option value="">Select a species</option>
          {speciesOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        {label} Item
        <select value={spec.item ?? ''} onChange={(e) => update('item', e.target.value || undefined)}>
          <option value="">None</option>
          {itemOptions.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>
      <label>
        {label} Ability
        <select value={spec.ability ?? ''} onChange={(e) => update('ability', e.target.value || undefined)}>
          <option value="">None</option>
          {abilityOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </label>
      <label>
        {label} Nature
        <select value={spec.nature ?? ''} onChange={(e) => update('nature', e.target.value || undefined)}>
          <option value="">None</option>
          {natureOptions.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      {STATS.map((stat) => (
        <label key={stat}>
          {label} {stat.toUpperCase()} SP
          <input
            type="number"
            min={0}
            max={32}
            value={spec.statPoints?.[stat] ?? 0}
            onChange={(e) => updateStatPoint(stat, Number(e.target.value))}
          />
        </label>
      ))}
    </fieldset>
  );
}
