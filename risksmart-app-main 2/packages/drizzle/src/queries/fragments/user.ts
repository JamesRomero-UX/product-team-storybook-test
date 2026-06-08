import type { QueryConfig } from '../../db';

export const user = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'user_view_active'>;
