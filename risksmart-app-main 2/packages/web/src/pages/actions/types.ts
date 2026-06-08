import type { GetActionsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';
import type { LinkItem } from '@/utils/table/hooks/useLinkArrayField';

export type ActionFields = CollectionData<GetActionsQuery['action'][0]>;

export type ActionTableFields = ActionFields & {
  StatusLabelled: string;
  PriorityLabelled: string;
  ParentTitle: LinkItem[];
  ParentId: null | string;
  ModifiedByUserName: null | string;
  CreatedByUserName: null | string;
  SequentialIdLabel: null | string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  UpdateCount: null | number;
  LatestUpdateTitle: null | string;
  LatestUpdateDescription: null | string;
  LatestUpdateCreatedAtTimestamp: null | string;
};
