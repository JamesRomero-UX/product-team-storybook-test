import type { QueryConfig } from '../../db';

export const appetite = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'appetite'>;
