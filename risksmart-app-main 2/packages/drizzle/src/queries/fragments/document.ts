import type { QueryConfig } from '../../db';

export const document = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'document'>;
