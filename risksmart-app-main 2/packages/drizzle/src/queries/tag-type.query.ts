import type { QueryConfig } from '../db';

export const getTagTypesQueryConfig = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'tag_type'>;
