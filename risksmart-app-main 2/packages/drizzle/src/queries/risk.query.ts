import { AppetiteType } from '@risksmart-app/domain/src/types/consts/appetite-type';
import {
  ParentTypes,
  RATING_TYPE_ASSESSMENT,
} from '@risksmart-app/domain/src/types/consts/index';

import type { QueryConfig } from '../db';
import { assessment, risk, riskAssessmentResult } from './fragments/index';
import {
  ancestorContributors,
  ownersAndContributors,
  scheduleAndState,
  tagsAndDepartments,
} from './utils';

export const getRiskRegisterQueryConfig = {
  ...risk,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...scheduleAndState,
    createdByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    parent: {
      columns: {
        Title: true,
      },
    },
    parentNode: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
    appetites: {
      where: {
        appetite: {
          AppetiteType: AppetiteType.Risk,
        },
      },
      columns: {
        Id: true,
      },
      with: {
        appetite: {
          columns: {
            LowerAppetite: true,
            UpperAppetite: true,
          },
        },
      },
    },
    impactRatings: {
      columns: {
        ImpactId: true,
        Rating: true,
        TestDate: true,
      },
      orderBy: {
        TestDate: 'desc',
        CreatedAtTimestamp: 'desc',
      },
      limit: 10,
    },
    modifiedByUser: {
      columns: {
        FriendlyName: true,
      },
    },
    assessmentResults: {
      where: {
        riskAssessmentResult: {
          RatingType: {
            in: RATING_TYPE_ASSESSMENT,
          },
        },
      },
      columns: {
        ParentId: true,
      },
      orderBy: {
        CreatedAtTimestamp: 'desc',
      },
      with: {
        riskAssessmentResult: {
          columns: {
            Id: true,
            Rating: true,
            ControlType: true,
            Likelihood: true,
            Impact: true,
            CustomAttributeData: true,
            CreatedAtTimestamp: true,
            TestDate: true,
          },
        },
      },
    },
    riskScore: {
      columns: {
        ResidualScore: true,
        InherentScore: true,
        ResidualRating: true,
        InherentRating: true,
        ResidualImpact: true,
        ResidualLikelihood: true,
        InherentImpact: true,
        InherentLikelihood: true,
      },
    },
    actions: {
      columns: {
        ActionId: true,
      },
    },
    controls: {
      columns: {
        ControlId: true,
      },
    },
    indicators: {
      columns: {
        IndicatorId: true,
      },
    },
    enterpriseRiskInstance: {
      columns: {
        EnterpriseRiskId: true,
      },
      with: {
        entity: {
          columns: {
            Id: true,
            Name: true,
          },
        },
        enterpriseRisk: {
          columns: {
            Id: true,
            Title: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'risk'>;

export const getRiskItemQueryConfig = {
  ...risk,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...ancestorContributors,
    ...scheduleAndState,
    riskScore: {
      columns: {
        OrgKey: false,
      },
    },
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
    parentNode: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
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
} as const satisfies QueryConfig<'risk'>;

export const getRiskByIdQueryConfig = {
  ...risk,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    ...scheduleAndState,
    ...ancestorContributors,
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
    parentNode: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
    assessmentResults: {
      where: {
        riskAssessmentResult: {
          RatingType: {
            in: RATING_TYPE_ASSESSMENT,
          },
        },
      },
      columns: {
        ParentId: true,
      },
      with: {
        riskAssessmentResult: {
          columns: {
            ControlType: true,
            Rating: true,
          },
        },
      },
    },
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
} as const satisfies QueryConfig<'risk'>;

export const getRiskListQueryConfig = {
  ...risk,
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
    createdByUser: {
      columns: {
        Id: true,
      },
    },
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
    parentNode: {
      columns: {
        Id: true,
        ObjectType: true,
        SequentialId: true,
      },
    },
    impactRatings: {
      columns: {
        ImpactId: true,
        Rating: true,
      },
    },
    modifiedByUser: {
      columns: {
        Id: true,
        FriendlyName: true,
      },
    },
    assessmentResults: {
      where: {
        riskAssessmentResult: {
          RatingType: {
            in: RATING_TYPE_ASSESSMENT,
          },
        },
      },
      columns: {
        ParentId: true,
      },
      with: {
        riskAssessmentResult: {
          columns: {
            Id: true,
          },
        },
      },
    },
    riskScore: {
      columns: {
        ResidualScore: true,
        InherentScore: true,
        ResidualRating: true,
        InherentRating: true,
        ResidualImpact: true,
        ResidualLikelihood: true,
        InherentImpact: true,
        InherentLikelihood: true,
      },
    },
    actions: {
      columns: {
        ActionId: true,
      },
    },
    controls: {
      columns: {
        ControlId: true,
      },
    },
    indicators: {
      columns: {
        IndicatorId: true,
      },
    },
    enterpriseRiskInstance: {
      columns: {
        EnterpriseRiskId: true,
      },
      with: {
        entity: {
          columns: {
            Id: true,
          },
        },
        enterpriseRisk: {
          columns: {
            Id: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'risk'>;

export const myRisksQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    Description: true,
  },
  with: {
    ...ownersAndContributors,
    ...tagsAndDepartments,
  },
} as const satisfies QueryConfig<'risk'>;

export const myDueRisksQueryConfig = myRisksQueryConfig;

export const getRiskListOnlyOptimizedQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    SequentialId: true,
  },
} as const satisfies QueryConfig<'risk'>;

export const getRiskListOnlyWithEntitiesOptimizedQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    SequentialId: true,
  },
  with: {
    enterpriseRiskInstance: {
      columns: {
        EntityId: true,
        EnterpriseRiskId: true,
      },
      with: {
        entity: {
          columns: {
            Id: true,
            Name: true,
            ParentId: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'risk'>;

export const getRiskScoreQueryConfig = {
  columns: {
    Id: true,
    Tier: true,
  },
  with: {
    riskScore: {
      columns: {
        ResidualScore: true,
        InherentScore: true,
        ResidualRating: true,
        InherentRating: true,
        ResidualImpact: true,
        ResidualLikelihood: true,
        InherentImpact: true,
        InherentLikelihood: true,
        ModifiedAtTimestamp: true,
      },
    },
    assessmentResults: {
      columns: {
        ParentId: true,
      },
      with: {
        riskAssessmentResult: {
          columns: {
            Id: true,
            Likelihood: true,
            Impact: true,
            Rating: true,
            ControlType: true,
            CustomAttributeData: true,
            Rationale: true,
            TestDate: true,
            CreatedAtTimestamp: true,
          },
        },
      },
    },
  },
} as const satisfies QueryConfig<'risk'>;

export const getRiskScoresByRiskIdQueryConfig = {
  ...riskAssessmentResult,
  with: {
    ...ancestorContributors,
    parents: {
      columns: {},
      where: {
        ParentType: ParentTypes.Assessment,
      },
      with: {
        assessment: {
          ...assessment,
        },
      },
    },
  },
} as const satisfies QueryConfig<'risk_assessment_result'>;

export const getMyDueItemsRisksQueryConfig = {
  columns: {
    Id: true,
    Title: true,
  },
  with: {
    ...ownersAndContributors,
    ...scheduleAndState,
  },
} as const satisfies QueryConfig<'risk'>;
