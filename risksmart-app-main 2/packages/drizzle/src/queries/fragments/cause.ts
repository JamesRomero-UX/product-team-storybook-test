import type { QueryConfig } from '../../db';

export const cause = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'cause'>;
