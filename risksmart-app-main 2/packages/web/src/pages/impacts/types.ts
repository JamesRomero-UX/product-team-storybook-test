import type { GetImpactsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type Impact = CollectionData<GetImpactsQuery['impact'][number]>;

export type ImpactTableFields = Impact & {
  SequentialIdLabel: null | string;
  allOwners: LabelledIdArray;
  CreatedByUserName: null | string;
  RatedItems: null | string;
  PerformanceScore: null | number;
};
