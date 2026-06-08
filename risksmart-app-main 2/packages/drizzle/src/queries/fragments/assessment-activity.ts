import type { QueryConfig } from '../../db';

export const assessmentActivity = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'assessment_activity'>;
