import type { QueryConfig } from '../../db';

export const obligation_change = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'obligation_change'>;
