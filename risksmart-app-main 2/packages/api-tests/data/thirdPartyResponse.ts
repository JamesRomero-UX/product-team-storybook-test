import { randomUUID } from 'crypto';

import { getDefaultOrgId, getDefaultUserId } from '../clients/defaults';
import type { ThirdPartyResponseInsertInput } from '../generated/graphql';
import { ThirdPartyResponseStatusEnum } from '../generated/graphql';

const defaultThirdPartyResponse: ThirdPartyResponseInsertInput = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Id: null as any as string,
  Status: ThirdPartyResponseStatusEnum.NotStarted,
  ResponseData: {},
  ExpiresAt: new Date().toISOString(),
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
};

export const buildThirdPartyResponse = (
  overrides: Partial<ThirdPartyResponseInsertInput> = {}
): ThirdPartyResponseInsertInput => ({
  ...defaultThirdPartyResponse,
  Id: randomUUID(),
  CreatedByUser: getDefaultUserId(),
  ModifiedByUser: getDefaultUserId(),
  OrgKey: getDefaultOrgId(),
  ...overrides,
});
