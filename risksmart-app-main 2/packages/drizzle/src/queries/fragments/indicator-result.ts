import type { QueryConfig } from '../../db';

export const indicatorResult = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'indicator_result'>;
