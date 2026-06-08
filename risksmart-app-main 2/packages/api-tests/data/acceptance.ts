import type { VariablesOf } from '@graphql-typed-document-node/core';
import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type {
  InsertAcceptanceDocument,
  UpdateAcceptanceDocument,
} from '../generated/graphql';
import { AcceptanceStatusEnum } from '../generated/graphql';

const defaultAcceptance: VariablesOf<typeof InsertAcceptanceDocument> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Id: null as any as string,

  Title: 'Acceptance',
  Details: 'Acceptance details',
  DateAcceptedFrom: '2021-01-01',
  DateAcceptedTo: '2021-01-02',
  Status: AcceptanceStatusEnum.Closed,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ParentId: null as any as string,
  ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
  CreatedAtTimestamp: '2021-01-01T00:00:00Z',
};

export const buildAcceptance = (
  overrides: Partial<VariablesOf<typeof InsertAcceptanceDocument>> = {}
): VariablesOf<typeof InsertAcceptanceDocument> => {
  return {
    ...defaultAcceptance,
    ModifiedAtTimestamp: new Date().toISOString(),
    CreatedAtTimestamp: new Date().toISOString(),
    OrgKey: getDefaultOrgId(),
    CreatedByUser: getDefaultUserId(),
    ModifiedByUser: getDefaultUserId(),
    Id: randomUUID(),
    ...overrides,
  };
};

export const buildUpdateAcceptance = (
  overrides: Partial<VariablesOf<typeof UpdateAcceptanceDocument>> = {}
): VariablesOf<typeof UpdateAcceptanceDocument> => {
  return {
    ...defaultAcceptance,
    LatestModifiedAtTimestamp: defaultAcceptance.ModifiedAtTimestamp!,
    Id: randomUUID(),
    ...overrides,
  };
};
