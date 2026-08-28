// etl/publish.ts
import type { MetaSets } from '../src/shared/metaSetsTypes';

export interface Writer {
  write(key: string, body: string): Promise<void>;
  read(key: string): Promise<string | null>;
}

export function validateMetaSets(metaSets: MetaSets): string[] {
  const errors: string[] = [];
  if (metaSets.samplePlayers <= 0) errors.push('samplePlayers must be greater than zero');
  if (Object.keys(metaSets.species).length === 0) errors.push('species map is empty');
  return errors;
}

export async function publishMetaSets(metaSets: MetaSets, writer: Writer): Promise<void> {
  const errors = validateMetaSets(metaSets);
  if (errors.length > 0) {
    console.error('Refusing to publish invalid meta-sets data:', errors);
    return;
  }
  const dateKey = metaSets.generatedAt.slice(0, 10);
  const body = JSON.stringify(metaSets, null, 2);
  await writer.write(`meta-sets/meta-sets-${dateKey}.json`, body);
  await writer.write('meta-sets/latest.json', body);
}
