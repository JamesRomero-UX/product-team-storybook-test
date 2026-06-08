import type { QueryConfig } from '../../db';

export const impact = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'impact'>;
