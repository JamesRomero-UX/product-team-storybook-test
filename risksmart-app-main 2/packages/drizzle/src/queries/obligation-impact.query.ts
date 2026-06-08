import type { QueryConfig } from '../db';

export const getObligationImpactsByParentIdQueryConfig = {
  columns: { OrgKey: false },
  with: {
    createdBy: {
      columns: {
        FriendlyName: true,
        OrgKey: false,
      },
    },
    modifiedBy: {
      columns: {
        FriendlyName: true,
        OrgKey: false,
      },
    },
    parent: {
      columns: {
        Id: true,
        Title: true,
        OrgKey: false,
      },
    },
  },
} as const satisfies QueryConfig<'obligation_impact'>;
