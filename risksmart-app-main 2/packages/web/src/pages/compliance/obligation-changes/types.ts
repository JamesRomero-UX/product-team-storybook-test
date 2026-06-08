import type { GetObligationChangesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type ObligationChangeFields = CollectionData<
  GetObligationChangesQuery['obligation_change'][number]
>;

export type ObligationChangeRegisterFields = ObligationChangeFields & {
  SequentialIdLabel: null | string;
  ObligationTitle: null | string;
  Regulator: string;
  ModifiedBy: string;
  CreatedBy: string;
  ActionsLabelled: (
    | { Id: string; SequentialId?: number | null; Title: string }
    | null
    | undefined
  )[];
  StatusLabelled: string;
  allOwners: LabelledIdArray;
  // allContributors: LabelledIdArray;
};
