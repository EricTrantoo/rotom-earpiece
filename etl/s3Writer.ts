// etl/s3Writer.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Writer } from './publish';

export function createS3Writer(bucket: string): Writer {
  const client = new S3Client({});
  return {
    async write(key, body) {
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'application/json' })
      );
    },
    async read(key) {
      try {
        const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        return (await result.Body?.transformToString()) ?? null;
      } catch {
        return null;
      }
    },
  };
}
