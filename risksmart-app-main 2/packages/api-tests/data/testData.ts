import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { IssueInsertInput } from '../generated/graphql';

const defaultIssue: IssueInsertInput = {
  DateIdentified: '2023-04-24 22:41:58.03502+00',
  DateOccurred: '2023-04-24 22:41:58.03502+00',
  Details: 'Some details',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Id: null as any as string,
  ImpactsCustomer: true,
  IsExternalIssue: true,
  Meta: undefined,
  ModifiedAtTimestamp: '2022-04-24 22:41:58.03502+00',
  CreatedAtTimestamp: '2022-04-24 22:41:58.03502+00',
  Title: 'Issue 1',
  SequentialId: 1,
};

export const buildIssueTableInsert = (
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
