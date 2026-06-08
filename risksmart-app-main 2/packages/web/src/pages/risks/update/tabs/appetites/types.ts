import type { GetAppetitesByRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type AppetiteFields = CollectionData<
  GetAppetitesByRiskIdQuery['appetite_parent'][number]
>;

export type AppetiteTableFields = {
  Id: string;
  LowerAppetiteLabelled: string;
  UpperAppetiteLabelled: string;
  ImpactAppetiteLabelled: string;
  LikelihoodAppetiteLabelled: string;
  ImpactId?: null | string;
  ImpactName?: null | string;
  LowerAppetite?: null | number;
  UpperAppetite?: null | number;
  EffectiveDate?: null | string;
  StatusLabelled: string;
  Status?: null | string;
  SequentialId: number;
  ImpactAppetite?: null | number | undefined;
  LikelihoodAppetite?: null | number | undefined;
  AppetiteType: string;
};
