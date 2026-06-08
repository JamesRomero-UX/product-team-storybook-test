import {
  RATING_TYPE_ASSESSMENT,
  RiskAssessmentResultControlType,
} from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import { appetite } from './fragments/index';
import {
  ancestorContributors,
  ownersAndContributors,
  relationFiles,
} from './utils';

export const getAppetiteParentRegisterQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    appetite: {
      ...appetite,
      with: {
        modifiedByUser: {
          columns: {
            FriendlyName: true,
          },
        },
        createdByUser: {
          columns: {
            FriendlyName: true,
          },
        },
      },
    },
    risk: {
      columns: {
        Id: true,
        Tier: true,
        Title: true,
        SequentialId: true,
      },
      with: {
        ...ownersAndContributors,
        assessmentResults: {
          where: {
            riskAssessmentResult: {
              RatingType: {
                in: RATING_TYPE_ASSESSMENT,
              },
              ControlType: RiskAssessmentResultControlType.Controlled,
            },
          },
          with: {
            riskAssessmentResult: {
              columns: {
                Rating: true,
                Likelihood: true,
                Impact: true,
                TestDate: true,
                CreatedAtTimestamp: true,
              },
            },
          },
        },
        riskScore: {
          columns: {
            InherentScore: true,
            ResidualScore: true,
            InherentRating: true,
            ResidualRating: true,
            InherentLikelihood: true,
            InherentImpact: true,
            ResidualLikelihood: true,
            ResidualImpact: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'appetite_parent'>;

export const getAppetiteListQueryConfig = {
  ...appetite,
  with: {
    ...ancestorContributors,
    parents: {
      columns: {
        Id: true,
      },
      with: {
        parent: {
          columns: {
            Id: true,
            ObjectType: true,
          },
        },
        risk: {
          columns: {
            Id: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'appetite'>;

export const getAppetiteByIdQueryConfig = {
  ...appetite,
  with: {
    ...ancestorContributors,
    ...relationFiles,
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    impact: {
      columns: {
        OrgKey: false,
      },
    },
    parents: {
      columns: {
        Id: true,
      },
      with: {
        risk: {
          columns: {
            Id: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'appetite'>;

export const getActiveAppetitesByParentIdQueryConfig = {
  columns: {
    Status: true,
    Id: true,
  },
  with: {
    appetite: {
      ...appetite,
      with: {
        impact: {
          columns: {
            Id: true,
            Name: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'appetite_parent'>;
