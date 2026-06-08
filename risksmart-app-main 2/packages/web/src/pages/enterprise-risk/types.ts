import type { GetEnterpriseRisksQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type EnterpriseRiskFields = CollectionData<
  GetEnterpriseRisksQuery['enterprise_risk'][number]
>;

export type EnterpriseRiskRegisterFields = EnterpriseRiskFields & {
  SequentialIdLabelled: string;
  TierLabelled: null | string;
  TreatmentLabelled: null | string;
  ParentTitle: null | string;
  CreatedByUser: null | string;
  ModifiedByUser: null | string;
  InherentMeanLabelled: null | string;
  InherentWorstCaseLabelled: null | string;
  ResidualMeanLabelled: null | string;
  ResidualWorstCaseLabelled: null | string;
};
