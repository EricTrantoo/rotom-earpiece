// See championsData.ts for why this is a namespace import rather than named imports.
import * as calc from '@smogon/calc';
const { calculate, Pokemon, Move, Field } = calc;
import { CHAMPIONS_GEN } from './championsData';

export interface PokemonSpec {
  species: string;
  level?: number;
  item?: string;
  ability?: string;
  nature?: string;
  /** Stat Points (0-32 each), passed through @smogon/calc's `evs` field for gen 0. */
  statPoints?: Partial<{ hp: number; atk: number; def: number; spa: number; spd: number; spe: number }>;
}

export interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  koChance: string;
  description: string;
}

function buildPokemon(spec: PokemonSpec) {
  return new Pokemon(CHAMPIONS_GEN, spec.species, {
    level: spec.level ?? 50,
    item: spec.item,
    ability: spec.ability,
    nature: spec.nature,
    evs: spec.statPoints,
  });
}

export function computeDamage(attacker: PokemonSpec, defender: PokemonSpec, moveName: string): DamageResult {
  const atk = buildPokemon(attacker);
  const def = buildPokemon(defender);
  const move = new Move(CHAMPIONS_GEN, moveName);
  const field = new Field();

  const result = calculate(CHAMPIONS_GEN, atk, def, move, field);
  const [minDamage, maxDamage] = result.range();
  const defenderMaxHP = def.maxHP();

  return {
    minDamage,
    maxDamage,
    minPercent: Math.floor((minDamage / defenderMaxHP) * 1000) / 10,
    maxPercent: Math.floor((maxDamage / defenderMaxHP) * 1000) / 10,
    koChance: result.kochance(false).text,
    description: result.fullDesc(undefined, false),
  };
}
