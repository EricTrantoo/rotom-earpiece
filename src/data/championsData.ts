import { Generations, toID } from '@smogon/calc';

/** Generation index 0 is Champions in @smogon/calc's data tables. */
export const CHAMPIONS_GEN = Generations.get(0);

function sortedNames(items: Iterable<{ name: string }>): string[] {
  return [...items].map((item) => item.name).sort((a, b) => a.localeCompare(b));
}

export function listSpeciesNames(): string[] {
  return sortedNames(CHAMPIONS_GEN.species);
}

export function getSpecies(name: string) {
  return CHAMPIONS_GEN.species.get(toID(name));
}

export function listMoveNames(): string[] {
  return sortedNames(CHAMPIONS_GEN.moves);
}

export function getMove(name: string) {
  return CHAMPIONS_GEN.moves.get(toID(name));
}

export function listAbilityNames(): string[] {
  return sortedNames(CHAMPIONS_GEN.abilities);
}

export function listItemNames(): string[] {
  return sortedNames(CHAMPIONS_GEN.items);
}

export function listNatureNames(): string[] {
  return sortedNames(CHAMPIONS_GEN.natures);
}
