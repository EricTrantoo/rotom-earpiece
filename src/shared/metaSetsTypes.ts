export interface SetVariant {
  item: string | null;
  ability: string | null;
  moves: string[];
  nature: string | null;
  count: number;
}

export interface SpeciesUsage {
  species: string;
  usageCount: number;
  itemCounts: Record<string, number>;
  abilityCounts: Record<string, number>;
  moveCounts: Record<string, number>;
  natureCounts: Record<string, number>;
  variants: SetVariant[];
}

export interface MetaSets {
  generatedAt: string;
  sampleTournaments: number;
  samplePlayers: number;
  species: Record<string, SpeciesUsage>;
}
