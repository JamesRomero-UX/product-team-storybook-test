import type { QueryConfig } from '../../db';

export const issue = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'issue'>;
