// etl/handler.ts
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fetchChampionsTournaments, fetchStandings } from './limitlessClient';
import { aggregateUsageStats } from './aggregate';
import { mergeOverrides, type CuratedOverrides } from './overrides';
import { publishMetaSets, type Writer } from './publish';

export async function runEtl(writer: Writer): Promise<void> {
  const tournaments = await fetchChampionsTournaments();
  const standingsByTournament = await Promise.all(tournaments.map((t) => fetchStandings(t.id)));
  const aggregated = aggregateUsageStats(standingsByTournament);

  const overridesRaw = await fs.readFile(path.join(__dirname, 'curated-overrides.json'), 'utf-8');
  const overrides = JSON.parse(overridesRaw) as CuratedOverrides;

  const merged = mergeOverrides(aggregated, overrides);
  await publishMetaSets(merged, writer);
}

/** AWS Lambda entry point — wired to a real S3 writer in Task 18. */
export async function handler(): Promise<void> {
  const { createS3Writer } = await import('./s3Writer');
  const bucket = process.env.META_SETS_BUCKET;
  if (!bucket) throw new Error('META_SETS_BUCKET environment variable is required');
  await runEtl(createS3Writer(bucket));
}
