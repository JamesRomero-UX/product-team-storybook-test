import type { QueryConfig } from '../../db';

export const consequence = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'consequence'>;
