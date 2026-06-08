import type { QueryConfig } from '../../db';

export const assessment = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'assessment'>;
