import type { QueryConfig } from '../../db';

export const approval = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'approval'>;
