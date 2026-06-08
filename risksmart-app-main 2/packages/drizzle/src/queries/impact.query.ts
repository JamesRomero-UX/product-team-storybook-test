import { RATING_TYPE_ASSESSMENT } from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import { appetite, impact, impactRating } from './fragments/index';
import { ancestorContributors, owners, ownersAndContributors } from './utils';

export const getAppetitesGroupedByImpactQueryConfig = {
  columns: {
    Id: true,
  },
  with: {
    appetites: {
      ...appetite,
      with: {
        parents: {
          columns: {},
          with: {
            risk: {
              columns: {
                Id: true,
              },
            },
          },
        },
      },
      orderBy: {
        EffectiveDate: 'desc',
        CreatedAtTimestamp: 'desc',
      },
    },
  },
} as const satisfies QueryConfig<'impact'>;

export const getImpactsByInternalAuditReportIdQueryConfig = {
  ...impact,
  with: {
    ...owners,
    appetites: {
      ...appetite,
      with: {
        parents: {
          columns: {},
          with: {
            risk: {
              columns: {
                Id: true,
              },
            },
          },
        },
      },
      orderBy: {
        EffectiveDate: 'desc',
        CreatedAtTimestamp: 'desc',
      },
    },
  },
} as const satisfies QueryConfig<'impact'>;

export const getImpactQueryConfig = {
  ...impact,
  with: {
    ...ownersAndContributors,
    ...ancestorContributors,
    appetites: {
      columns: {
        Id: true,
        SequentialId: true,
      },
      with: {
        parents: {
          columns: {},
          with: {
            risk: {
              columns: {
                Id: true,
              },
            },
          },
        },
      },
    },
    parents: {
      with: {
        parent: {
          columns: {
            Id: true,
            SequentialId: true,
            ObjectType: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'impact'>;

export const getLatestImpactRatingsForRatedImpactsByRatedItemIdQueryConfig = {
  columns: {
    Name: true,
    Rationale: true,
    Id: true,
  },
  with: {
    ratings: {
      where: {
        RatingType: { in: RATING_TYPE_ASSESSMENT },
      },
      orderBy: { TestDate: 'desc' },
      limit: 1,
      ...impactRating,
      with: {
        createdByUser: {
          columns: {
            FriendlyName: true,
          },
        },
        completedBy: {
          columns: {
            FriendlyName: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'impact'>;
