import type { PokemonSpec } from '../data/damageCalc';

export interface TeamMember extends PokemonSpec {
  moves: string[];
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}
