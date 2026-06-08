import type { QueryConfig } from '../../db';

export const thirdParty = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'third_party'>;
