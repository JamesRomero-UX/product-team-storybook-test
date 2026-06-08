import type { Compat } from '../types/versioning';

export const isCompat = (version: string): version is Compat =>
  /^\d{4}-\d{2}-\d{2}$/.test(version);

export const compareCompat = (compA: Compat, compB: Compat) =>
  compA.localeCompare(compB);
