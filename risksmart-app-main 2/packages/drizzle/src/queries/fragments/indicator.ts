import type { QueryConfig } from '../../db';

export const indicator = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'indicator'>;
