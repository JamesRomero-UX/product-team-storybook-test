import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IssueInsertInput, UpdateIssueInput } from '../generated/graphql';
import { ParentTypeEnum } from '../generated/graphql';

const defaultIssue: IssueInsertInput = {
  Title: 'Issue Tile',
  Details: 'Issue description',
  DateOccurred: '2020-01-01',
  DateIdentified: '2020-01-02',
  ImpactsCustomer: false,
  IsExternalIssue: false,
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  RaisedAtTimestamp: '2020-01-02',
  Type: ParentTypeEnum.Issue,
};

export const buildIssue = (
  overrides: Partial<IssueInsertInput> = {}
): IssueInsertInput => {
  return {
    ...defaultIssue,
    Id: randomUUID(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    ...overrides,
  };
};

const defaultUpdateIssue: UpdateIssueInput = {
  Title: 'Issue Tile',
  Details: 'Issue description',
  DateOccurred: '2020-01-01',
  DateIdentified: '2020-01-02',
  ImpactsCustomer: false,
  IsExternalIssue: false,
  ContributorGroupIds: [],
  ContributorUserIds: [],
  DepartmentTypeIds: [],
  Id: '',
  OriginalTimestamp: '',
  OwnerGroupIds: [],
  OwnerUserIds: [],
  TagTypeIds: [],
};

export const buildUpdateIssue = (
  overrides: Partial<UpdateIssueInput> = {}
): UpdateIssueInput => {
  return {
    ...defaultUpdateIssue,
    Id: randomUUID(),
    ...overrides,
  };
};
