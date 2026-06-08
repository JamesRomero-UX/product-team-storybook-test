import type { GetChangeRequestsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type ChangeRequestRegisterFields = CollectionData<
  GetChangeRequestsQuery['change_request'][0]
> & {
  DateLastActioned?: null | string;
  DateClosed?: null | string;
  ParentType?: string;
  Workflow?: string;
  StatusLabelled: string;
  ParentSequentialId?: null | string;
  ParentName?: null | string;
  RequiresAction: boolean;
  allApprovers: LabelledIdArray;
  allRequesters: LabelledIdArray;
  approvalConfig: string[];
  CurrentLevel: string;
  currentApprovers: LabelledIdArray;
  nextApprovers: LabelledIdArray;
  parentOwners: LabelledIdArray;
};
