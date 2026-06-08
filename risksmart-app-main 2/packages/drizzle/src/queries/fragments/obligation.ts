import type { QueryConfig } from '../../db';

export const obligation = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'obligation'>;
