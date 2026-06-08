import type { QueryConfig } from '../../db';

export const action = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'action'>;
