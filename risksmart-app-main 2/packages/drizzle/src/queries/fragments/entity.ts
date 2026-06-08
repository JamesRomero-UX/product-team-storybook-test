import type { QueryConfig } from '../../db';

export const entity = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'entity'>;
