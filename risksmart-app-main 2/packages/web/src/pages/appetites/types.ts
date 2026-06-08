import type { GetActiveRiskAppetitesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type ActiveRiskAppetiteFields = CollectionData<
  GetActiveRiskAppetitesQuery['appetite_parent'][number]
>;

export type AppetiteTableFields = {
  Id: string;
  LowerAppetiteLabelled: string;
  UpperAppetiteLabelled: string;
  ControlledRatingLabelled: string;
  ControlledRating?: null | number;
  ControlledLikelihoodValue?: null | number;
  ControlledImpactValue?: null | number;
  PerformanceLabelled: string;
  ParentTitle?: null | string;
  LowerAppetite?: null | number;
  UpperAppetite?: null | number;
  Performance?: null | string;
  ParentRiskId?: null | string;
  ParentRiskGuid?: null | string;
  Statement?: null | string;
  CreatedAtTimestamp?: null | string;
  ModifiedAtTimestamp?: null | string;
  ModifiedByUserName?: null | string;
  ModifiedByUser?: null | string;
  TierLabelled?: null | string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  SequentialId: string;
  EffectiveDate?: string;
};
