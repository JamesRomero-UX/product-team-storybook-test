import type { QueryConfig } from '../../db';
export const linkedItem = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'linked_item'>;
