import type { QueryConfig } from '../../db';

export const actionUpdate = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'action_update'>;
