import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  DashboardInsertInput,
  InsertChildDashboardMutationVariables,
} from '../generated/graphql';
import {
  DashboardSharingTypeEnum,
  DashboardSharingTypeEnumAction,
} from '../generated/graphql';

const defaultDashboard: DashboardInsertInput = {
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  Name: 'Dashboard 1 ',
  Sharing: DashboardSharingTypeEnum.UserOnly,
  Content: {},
};

export const buildDashboard = (
  overrides: Partial<DashboardInsertInput> = {}
): DashboardInsertInput => {
  return {
    ...defaultDashboard,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};

export const defaultChildDashboard: InsertChildDashboardMutationVariables = {
  Name: 'Dashboard 1 ',
  Sharing: DashboardSharingTypeEnumAction.UserOnly,
  Content: '',
  Description: '',
  ContributorUserIds: [],
  ContributorGroupIds: [],
};

export const buildChildDashboard = (
  overrides: Partial<InsertChildDashboardMutationVariables> = {}
): InsertChildDashboardMutationVariables => {
  return {
    ...defaultChildDashboard,
    ...overrides,
  };
};
