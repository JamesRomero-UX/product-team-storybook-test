import type {
  GetLinkedItemsQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type LinkedItemsTableFields = CollectionData<
  GetLinkedItemsQuery['linked_item'][number] & {
    parentId?: string;
    parentType?: Parent_Type_Enum;
  }
> & {
  SequentialId: string;
  Id: string;
  Target: string;
  Source: string;
  Name: string;
  Type: string;
  allOwners: LabelledIdArray;
  url: string;
};
