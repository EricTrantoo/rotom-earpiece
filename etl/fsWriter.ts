// etl/fsWriter.ts
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Writer } from './publish';

export function createFsWriter(directory: string): Writer {
  return {
    async write(key, body) {
      const filePath = path.join(directory, key);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, body, 'utf-8');
    },
    async read(key) {
      try {
        return await fs.readFile(path.join(directory, key), 'utf-8');
      } catch {
        return null;
      }
    },
  };
}
