import { createHash } from 'node:crypto';

export const createContentHash = (json: string) =>
  createHash('sha256').update(json).digest('hex');
