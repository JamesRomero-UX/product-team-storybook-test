import type { QueryConfig } from '../../db';

export const file = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'file'>;
