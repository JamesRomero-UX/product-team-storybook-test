import type { GetThirdPartiesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type ThirdPartyFields = CollectionData<
  GetThirdPartiesQuery['third_party'][number]
>;

export type ThirdPartyRegisterFields = ThirdPartyFields & {
  TypeLabelled: string;
  StatusLabelled: string;
  CriticalityLabelled: string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
};
