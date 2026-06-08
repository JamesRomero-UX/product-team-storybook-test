import type { QueryConfig } from '../../db';

export const testResult = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'test_result'>;
