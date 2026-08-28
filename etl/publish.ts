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

/** Below this fraction of the previous run's samplePlayers, a "technically valid" run is treated as a degraded/bad run rather than published. */
const MIN_SAMPLE_PLAYERS_RATIO = 0.5;

export async function publishMetaSets(metaSets: MetaSets, writer: Writer): Promise<void> {
  const errors = validateMetaSets(metaSets);

  const previousRaw = await writer.read('meta-sets/latest.json');
  if (previousRaw) {
    const previous = JSON.parse(previousRaw) as MetaSets;
    if (metaSets.samplePlayers < previous.samplePlayers * MIN_SAMPLE_PLAYERS_RATIO) {
      errors.push(
        `samplePlayers dropped from ${previous.samplePlayers} to ${metaSets.samplePlayers}, ` +
          `more than a ${(1 - MIN_SAMPLE_PLAYERS_RATIO) * 100}% drop from the last published run`
      );
    }
  }

  if (errors.length > 0) {
    // Throw rather than resolve normally: a silent `return` here would make
    // the Lambda invocation record as successful even though nothing was
    // published, hiding the failure from error metrics/logs and preventing
    // AWS's built-in retry behavior from kicking in.
    throw new Error(`Refusing to publish invalid meta-sets data: ${errors.join('; ')}`);
  }

  const dateKey = metaSets.generatedAt.slice(0, 10);
  const body = JSON.stringify(metaSets, null, 2);
  await writer.write(`meta-sets/meta-sets-${dateKey}.json`, body);
  await writer.write('meta-sets/latest.json', body);
}
