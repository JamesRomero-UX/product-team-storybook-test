import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../clients/apiClient';
import { getDefaultOrgId } from '../clients/defaults';
import { getPermissions } from '../clients/permissionClient';
import { insertUserGroup } from '../clients/userGroupClient';
import { buildContributor } from '../data/contributor';
import { buildContributorGroup } from '../data/contributorGroup';
import { buildOwner } from '../data/owner';
import { buildRisk } from '../data/risk';
import { buildUserGroup } from '../data/userGroup';
import { buildUserGroupUser } from '../data/userGroupUser';
import { setup, standardUser1, teardown } from '../initialData';

const mockedDefaults = vi.hoisted(() => {
  return {
    getDefaultOrgId: vi.fn(),
    getAnotherOrgId: vi.fn(),
    getDefaultUserId: vi.fn(),
  };
});

vi.mock('../clients/defaults', () => mockedDefaults);

describe('permission', () => {
  beforeEach(async () => {
    await setup(mockedDefaults);
  }, 10000);

  afterEach(async () => {
    await teardown();
  });

  describe('query', () => {
    it('has no permissions when no items have been created', async () => {
      const permissions = await getPermissions({ orgKey: getDefaultOrgId() });
      expect(permissions.length).toEqual(0);
    });

    it('has no permissions when items have no owners/contributors (separate permission checks required for this)', async () => {
      await apiClient.insertRisk({ objects: buildRisk() });

      const permissions = await getPermissions({ orgKey: getDefaultOrgId() });
      expect(permissions.length).toEqual(0);
    });

    it('returns owner permissions for the risk for the standard user', async () => {
      const risk = buildRisk({
        owners: {
          data: [
            buildOwner({
              UserId: standardUser1.Id,
            }),
          ],
        },
      });
      await apiClient.insertRisk({ objects: risk });

      const permissions = await getPermissions({ orgKey: getDefaultOrgId() });
      expect(permissions.length).toEqual(4);
      expect(permissions[0].UserId).toEqual(standardUser1.Id);
      expect(permissions[0].Id).toEqual(risk.Id);
      expect(permissions[0].AccessType).toEqual('delete');
      expect(permissions[1].AccessType).toEqual('insert');
      expect(permissions[2].AccessType).toEqual('read');
      expect(permissions[3].AccessType).toEqual('update');
    });

    it('returns owner permissions for the risk for the standard user within the group', async () => {
      const userGroup = buildUserGroup({
        users: {
          data: [
            buildUserGroupUser({
              UserId: standardUser1.Id,
            }),
          ],
        },
      });
      await insertUserGroup(userGroup);

      const risk = buildRisk({
        ownerGroups: {
          data: [
            buildContributorGroup({
              UserGroupId: userGroup.Id,
            }),
          ],
        },
      });
      await apiClient.insertRisk({ objects: risk });

      const permissions = await getPermissions({ orgKey: getDefaultOrgId() });
      expect(permissions.length).toEqual(4);
      expect(permissions[0].UserId).toEqual(standardUser1.Id);
      expect(permissions[0].Id).toEqual(risk.Id);
      expect(permissions[0].AccessType).toEqual('delete');
    });

    it('returns contributor permissions for the risk for the standard user', async () => {
      const risk = buildRisk({
        contributors: {
          data: [
            buildContributor({
              UserId: standardUser1.Id,
            }),
          ],
        },
      });
      await apiClient.insertRisk({ objects: risk });

      const permissions = await getPermissions({ orgKey: getDefaultOrgId() });
      expect(permissions.length).toEqual(2);
      expect(permissions[0].UserId).toEqual(standardUser1.Id);
      expect(permissions[0].Id).toEqual(risk.Id);
      expect(permissions[0].AccessType).toEqual('insert');

      expect(permissions[1].UserId).toEqual(standardUser1.Id);
      expect(permissions[1].Id).toEqual(risk.Id);
      expect(permissions[1].AccessType).toEqual('read');
    });

    it('returns contributor permissions for the risk for the standard user within the group', async () => {
      const userGroup = buildUserGroup({
        users: {
          data: [
            buildUserGroupUser({
              UserId: standardUser1.Id,
            }),
          ],
        },
      });
      await insertUserGroup(userGroup);

      const risk = buildRisk({
        contributorGroups: {
          data: [
            buildContributorGroup({
              UserGroupId: userGroup.Id,
            }),
          ],
        },
      });
      await apiClient.insertRisk({ objects: risk });

      const permissions = await getPermissions({ orgKey: getDefaultOrgId() });
      expect(permissions.length).toEqual(2);
      expect(permissions[0].UserId).toEqual(standardUser1.Id);
      expect(permissions[0].Id).toEqual(risk.Id);
      expect(permissions[0].AccessType).toEqual('insert');

      expect(permissions[1].UserId).toEqual(standardUser1.Id);
      expect(permissions[1].Id).toEqual(risk.Id);
      expect(permissions[1].AccessType).toEqual('read');
    });
  });
});
