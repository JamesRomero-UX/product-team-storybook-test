import type { QueryConfig } from '../db';

export const getBusinessAreasQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    SequentialId: true,
    CreatedAtTimestamp: true,
    ModifiedAtTimestamp: true,
  },
  with: {
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
  },
} as const satisfies QueryConfig<'business_area'>;
