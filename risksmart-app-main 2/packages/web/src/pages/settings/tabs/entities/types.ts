import type { GetEntitiesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type EntityFields = CollectionData<GetEntitiesQuery['entity'][number]>;

export type EntityRegisterFields = EntityFields & {
  ParentTitle: string;
  CreatedByUser: string;
  ModifiedByUser: string;
  allOwners: LabelledIdArray;
};
