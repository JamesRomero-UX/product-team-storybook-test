import type { QueryConfig } from '../../db';

export const acceptance = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'acceptance'>;
