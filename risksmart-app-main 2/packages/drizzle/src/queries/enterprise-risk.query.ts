import type { QueryConfig } from '../db';
import { enterpriseRisk } from './fragments/index';

export const getEnterpriseRiskRegisterQueryConfig = {
  ...enterpriseRisk,
  with: {
    score: {
      columns: {
        InherentScoreMean: true,
        ResidualScoreMean: true,
        InherentRatingMean: true,
        ResidualRatingMean: true,
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
} as const satisfies QueryConfig<'enterprise_risk'>;

export const getEnterpriseRiskListQueryConfig = {
  ...enterpriseRisk,
  with: {
    parent: {
      columns: {
        Id: true,
        Title: true,
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
} as const satisfies QueryConfig<'enterprise_risk'>;

export const getEnterpriseRiskByIdQueryConfig = {
  ...enterpriseRisk,
  with: {
    parent: {
      columns: {
        Id: true,
        Title: true,
      },
    },
    children: {
      columns: {
        Id: true,
      },
    },
    score: {
      columns: {
        InherentScoreMean: true,
        ResidualScoreMean: true,
        InherentRatingMean: true,
        ResidualRatingMean: true,
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
} as const satisfies QueryConfig<'enterprise_risk'>;

export const getEnterpriseRiskByTierQueryConfig = {
  columns: {
    Id: true,
    Title: true,
    SequentialId: true,
  },
} as const satisfies QueryConfig<'enterprise_risk'>;
