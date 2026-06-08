import type { QueryConfig } from '../../db';

export const risk = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'risk'>;
