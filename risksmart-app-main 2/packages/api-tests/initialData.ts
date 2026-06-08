import { randomUUID } from 'crypto';
import type { Mock } from 'vitest';

import { apiClient } from './clients/apiClient';
import {
  getAnotherOrgId,
  getDefaultOrgId,
  getDefaultUserId,
} from './clients/defaults';
import { insertOrganisation } from './clients/organisationClient';
import { insertUserOrganisation } from './clients/userOrganisationClient';
import { disableEventsForOrg } from './clients/utils';
import { buildOrganisationInsert } from './data/organisation';
import { buildUserInsert } from './data/user';

export const systemUser = buildUserInsert({
  Id: 'SYSTEM',
});
export const customerSupportUser1 = buildUserInsert({
  RoleKey: 'CustomerSupport',
  Id: 'CustomerSupportUser1',
});
export const riskManagerUser1 = buildUserInsert({
  RoleKey: 'RiskManager',
  Id: 'RiskManagerUser1',
});
export const standardUser1 = buildUserInsert({
  RoleKey: 'Standard',
  Id: 'StandardUser1',
});
export const readOnlyUser1 = buildUserInsert({
  RoleKey: 'ReadOnly',
  Id: 'ReadOnlyUser1',
});
export const publicUser1 = buildUserInsert({
  RoleKey: 'Public',
  Id: 'PublicUser1',
});
export const standardEnhancedUser1 = buildUserInsert({
  RoleKey: 'StandardEnhanced',
  Id: 'StandardEnhancedUser1',
});
export const internalAuditUser1 = buildUserInsert({
  RoleKey: 'InternalAudit',
  Id: 'InternalAuditUser1',
});
export const thirdPartyRespondent1 = buildUserInsert({
  RoleKey: 'ThirdPartyRespondent',
  Id: 'ThirdPartyRespondent1',
});

export const anotherUser = buildUserInsert({});

export const approvalWorkflow = 'publish-document-version' as const;

export const teardown = async () => {
  await disableEventsForOrg(getDefaultOrgId());
  await disableEventsForOrg(getAnotherOrgId());
};

export const setup = async (mockedDefaults: {
  getDefaultOrgId: Mock;
  getAnotherOrgId: Mock;
  getDefaultUserId: Mock;
}) => {
  const orgId = randomUUID();
  const anotherOrgId = randomUUID();
  const userId = randomUUID();
  mockedDefaults.getDefaultOrgId.mockImplementation(() => orgId);
  mockedDefaults.getAnotherOrgId.mockImplementation(() => anotherOrgId);
  mockedDefaults.getDefaultUserId.mockImplementation(() => userId);

  const defaultOrg = buildOrganisationInsert({
    Meta: {
      features: 'approvers,policy',
    },
    OrgKey: getDefaultOrgId(),
  });
  await insertOrganisation({
    objects: [defaultOrg],
  });
  await insertOrganisation({
    objects: [
      buildOrganisationInsert({
        OrgKey: getAnotherOrgId(),
        Name: 'Another org',
      }),
    ],
  });

  const defaultUser = buildUserInsert({
    Id: getDefaultUserId(),
  });

  await apiClient.insertUser({
    objects: [
      defaultUser,
      systemUser,
      riskManagerUser1,
      standardUser1,
      readOnlyUser1,
      anotherUser,
      publicUser1,
      customerSupportUser1,
      standardEnhancedUser1,
      internalAuditUser1,
      thirdPartyRespondent1,
    ],
  });
  await insertUserOrganisation({
    objects: [
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: riskManagerUser1.Id,
      },
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: defaultUser.Id,
      },
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: standardUser1.Id,
      },
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: readOnlyUser1.Id,
      },
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: anotherUser.Id,
      },
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: customerSupportUser1.Id,
      },
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: standardEnhancedUser1.Id,
      },
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: internalAuditUser1.Id,
      },
      {
        OrgKey: defaultOrg.OrgKey,
        User_Id: thirdPartyRespondent1.Id,
      },
    ],
  });
};
