import type { VariablesOf } from '@graphql-typed-document-node/core';

import type { InsertChildActionDocument } from '../generated/graphql';
import { ActionStatusEnum } from '../generated/graphql';

const defaultChildAction: VariablesOf<typeof InsertChildActionDocument> = {
  DateDue: '2023-04-24 22:41:58.03502+00',
  DateRaised: '2023-04-24 22:41:58.03502+00',
  Priority: 1,
  Status: ActionStatusEnum.Open,
  Title: 'Test',
  Description: 'Description',
  ClosedDate: undefined,

  DepartmentTypeIds: [],
  TagTypeIds: [],
  OwnerGroupIds: [],
  ContributorGroupIds: [],
  OwnerUserIds: [],
  ContributorUserIds: [],
  ParentId: undefined,
};

export const buildChildAction = (
  overrides: Partial<VariablesOf<typeof InsertChildActionDocument>> = {}
): VariablesOf<typeof InsertChildActionDocument> => {
  return {
    ...defaultChildAction,
    ...overrides,
  };
};
