import type {
  Acceptance_Status_Enum,
  DepartmentPartsFragment,
  GetAcceptancesQuery,
  TagPartsFragment,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type AcceptanceFlatFields = Omit<
  CollectionData<GetAcceptancesQuery['acceptance'][0]>,
  'Status'
> & {
  Status: 'pending_approval' | Acceptance_Status_Enum;
};

export type AcceptanceTableFields = AcceptanceFlatFields & {
  StatusLabelled: string;
  ParentTitle: null | string;
  Tier: null | string;
  ModifiedByUserName: null | string;
  requestedBy: null | string;
  approvedBy: null | string;
  allOwners: LabelledIdArray;
  allContributors: LabelledIdArray;
  SequentialIdLabel: null | string;
  tags: TagPartsFragment[];
  departments: DepartmentPartsFragment[];
};
