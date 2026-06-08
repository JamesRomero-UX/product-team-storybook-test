import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLogger } from '../../logger';
import { userGroupId } from './branded-ids';
import type { OrgSyncStats, PermitTenant } from './common';
import {
  createUserGroupSyncHandler,
  executeUserGroupSync,
} from './permit-user-group-sync';
import {
  ResourcesWithRelationshipTuples,
  Users,
} from './test-data/permit-stub-data';
import { UserGroupsStub, UserGroupUsersStub } from './test-data/rs-stub-data';
const logger = getLogger();
describe('permit-user-group-sync', () => {
  let mockUserGroupRetriever: ReturnType<typeof vi.fn>;
  let mockUserGroupUserRetriever: ReturnType<typeof vi.fn>;
  let mockUserGroupCreator: ReturnType<typeof vi.fn>;
  let mockUserGroupUserAssigner: ReturnType<typeof vi.fn>;
  let mockUserGroupUserRemover: ReturnType<typeof vi.fn>;
  let mockUserGroupDeleter: ReturnType<typeof vi.fn>;
  let mockOrgStats: OrgSyncStats;
  let mockPermitOrg: PermitTenant;

  const mockOrgKey = 'org_test123';

  beforeEach(() => {
    mockUserGroupRetriever = vi.fn();
    mockUserGroupUserRetriever = vi.fn();
    mockUserGroupCreator = vi.fn();
    mockUserGroupUserAssigner = vi.fn();
    mockUserGroupUserRemover = vi.fn();
    mockUserGroupDeleter = vi.fn();

    mockOrgStats = {
      tenant: mockOrgKey,
      orgKey: mockOrgKey,
      ownershipAssigned: 0,
      ownershipRemoved: 0,
      resourceInstancesCreated: 0,
      resourceInstancesDeleted: 0,
      relationshipTuplesCreated: 0,
      relationshipTuplesDeleted: 0,
      userGroupsCreated: 0,
      userGroupsDeleted: 0,
      userGroupUsersAssigned: 0,
      userGroupUsersRemoved: 0,
      timeMs: 0,
    };

    mockPermitOrg = {
      OrgKey: mockOrgKey,
      Users: [],
      ResourceInstances: new Map(),
    };
  });

  describe('createUserGroupSyncHandler', () => {
    it('should create a handler with executeUserSync method', () => {
      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const handler = createUserGroupSyncHandler(dependencies);

      expect(handler).toHaveProperty('executeUserSync');
      expect(typeof handler.executeUserSync).toBe('function');
    });
  });

  describe('executeUserGroupSync', () => {
    const mockUserGroups = [
      {
        Id: 'group1',
        OrgKey: mockOrgKey,
        Name: 'Test Group 1',
        Description: 'First test group',
      },
      {
        Id: 'group2',
        OrgKey: mockOrgKey,
        Name: 'Test Group 2',
        Description: null,
      },
    ];

    const mockUserGroupUsers = [
      {
        OrgKey: mockOrgKey,
        UserGroupId: 'group1',
        UserId: 'user1',
      },
      {
        OrgKey: mockOrgKey,
        UserGroupId: 'group1',
        UserId: 'user2',
      },
      {
        OrgKey: mockOrgKey,
        UserGroupId: 'group2',
        UserId: 'user2',
      },
    ];

    beforeEach(() => {
      mockUserGroupRetriever.mockResolvedValue(mockUserGroups);
      mockUserGroupUserRetriever.mockResolvedValue(mockUserGroupUsers);
      mockUserGroupCreator.mockResolvedValue(undefined);
      mockUserGroupUserAssigner.mockResolvedValue(undefined);
      mockUserGroupUserRemover.mockResolvedValue(undefined);
      mockUserGroupDeleter.mockResolvedValue(undefined);
    });

    it('should process user groups correctly', async () => {
      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupRetriever).toHaveBeenCalledWith(mockOrgKey);
      expect(mockUserGroupUserRetriever).toHaveBeenCalledWith(mockOrgKey);
    });

    it('should create new user groups', async () => {
      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupCreator).toHaveBeenCalledWith('group1', mockOrgKey);
      expect(mockUserGroupCreator).toHaveBeenCalledWith('group2', mockOrgKey);
      expect(mockOrgStats.userGroupsCreated).toBe(2);
    });

    it('should not create user groups that already exist', async () => {
      // Add existing group to permit org
      mockPermitOrg.ResourceInstances.set(userGroupId('group1'), {
        InstanceType: 'user_group',
        Id: 'group1',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupCreator).not.toHaveBeenCalledWith(
        'group1',
        mockOrgKey
      );
      expect(mockUserGroupCreator).toHaveBeenCalledWith('group2', mockOrgKey);
      expect(mockOrgStats.userGroupsCreated).toBe(1);
    });

    it('should assign users to groups', async () => {
      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupUserAssigner).toHaveBeenCalledWith(
        'group1',
        'user1',
        mockOrgKey
      );
      expect(mockUserGroupUserAssigner).toHaveBeenCalledWith(
        'group1',
        'user2',
        mockOrgKey
      );
      expect(mockUserGroupUserAssigner).toHaveBeenCalledWith(
        'group2',
        'user2',
        mockOrgKey
      );
      expect(mockOrgStats.userGroupUsersAssigned).toBe(3);
    });

    it('should not assign users that are already assigned', async () => {
      mockUserGroupRetriever.mockResolvedValue(UserGroupsStub);
      mockUserGroupUserRetriever.mockResolvedValue(UserGroupUsersStub);
      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: 'org_Qshp7tYsxxAWwhVa',
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: {
          OrgKey: 'org_Qshp7tYsxxAWwhVa',
          Users: Users,
          ResourceInstances: ResourcesWithRelationshipTuples,
        },
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupUserAssigner).not.toHaveBeenCalled();
      expect(mockUserGroupUserRemover).not.toHaveBeenCalled();
    });

    it('should remove users from groups when they are no longer assigned', async () => {
      // Add existing group with user assignments
      mockPermitOrg.ResourceInstances.set(userGroupId('group1'), {
        InstanceType: 'user_group',
        Id: 'group1',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      mockPermitOrg.Users = [
        {
          Id: 'user3', // User not in current assignments
          Roles: [],
          RoleAssignments: [
            {
              Roles: ['member'],
              ResourceInstanceId: userGroupId('group1'),
              OrgKey: mockOrgKey,
            },
          ],
        },
      ];

      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupUserRemover).toHaveBeenCalledWith(
        'group1',
        'user3',
        mockOrgKey
      );
      expect(mockOrgStats.userGroupUsersRemoved).toBe(1);
    });

    it('should delete groups that no longer exist', async () => {
      // Add group that should be deleted
      mockPermitOrg.ResourceInstances.set(userGroupId('old-group'), {
        InstanceType: 'user_group',
        Id: 'old-group',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupDeleter).toHaveBeenCalledWith('old-group');
      expect(mockOrgStats.userGroupsDeleted).toBe(1);
    });

    it('should remove users from groups that are being deleted', async () => {
      // Add group that should be deleted with user assignments
      mockPermitOrg.ResourceInstances.set(userGroupId('old-group'), {
        InstanceType: 'user_group',
        Id: 'old-group',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      mockPermitOrg.Users = [
        {
          Id: 'user-in-deleted-group',
          Roles: [],
          RoleAssignments: [
            {
              Roles: ['member'],
              ResourceInstanceId: userGroupId('old-group'),
              OrgKey: mockOrgKey,
            },
          ],
        },
      ];

      // The user group and user group user retrievers should return current data
      // Since the group is being deleted, it should not be in current data
      mockUserGroupRetriever.mockResolvedValue(mockUserGroups); // existing groups, not including old-group
      mockUserGroupUserRetriever.mockResolvedValue(mockUserGroupUsers); // existing assignments, not including old-group assignments

      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      // Note: The current implementation actually removes users from groups being deleted
      // before deleting the group itself
      expect(mockUserGroupUserRemover).toHaveBeenCalledWith(
        'old-group',
        'user-in-deleted-group',
        mockOrgKey
      );
      expect(mockUserGroupDeleter).toHaveBeenCalledWith('old-group');
    });

    it('should handle empty data gracefully', async () => {
      mockUserGroupRetriever.mockResolvedValue([]);
      mockUserGroupUserRetriever.mockResolvedValue([]);

      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      expect(mockOrgStats.userGroupsCreated).toBe(0);
      expect(mockOrgStats.userGroupUsersAssigned).toBe(0);
      expect(mockOrgStats.userGroupUsersRemoved).toBe(0);
      expect(mockOrgStats.userGroupsDeleted).toBe(0);
    });

    it('should handle undefined permitOrg', async () => {
      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: undefined,
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupCreator).toHaveBeenCalledTimes(2);
      expect(mockUserGroupUserAssigner).toHaveBeenCalledTimes(3);
      expect(mockOrgStats.userGroupsCreated).toBe(2);
      expect(mockOrgStats.userGroupUsersAssigned).toBe(3);
    });

    it('should handle user group creation errors', async () => {
      mockUserGroupCreator.mockRejectedValue(new Error('Creation failed'));

      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await expect(executeUserGroupSync(dependencies)).rejects.toThrow(
        'Creation failed'
      );
    });

    it('should handle complex user group scenarios', async () => {
      // Complex scenario with overlapping users and groups
      const complexUserGroups = [
        {
          Id: 'admin-group',
          OrgKey: mockOrgKey,
          Name: 'Administrators',
          Description: 'Admin users',
        },
        {
          Id: 'readonly-group',
          OrgKey: mockOrgKey,
          Name: 'Read Only',
          Description: 'Read-only users',
        },
      ];

      const complexUserGroupUsers = [
        { OrgKey: mockOrgKey, UserGroupId: 'admin-group', UserId: 'admin1' },
        { OrgKey: mockOrgKey, UserGroupId: 'admin-group', UserId: 'admin2' },
        {
          OrgKey: mockOrgKey,
          UserGroupId: 'readonly-group',
          UserId: 'readonly1',
        },
        { OrgKey: mockOrgKey, UserGroupId: 'readonly-group', UserId: 'admin1' }, // User in multiple groups
      ];

      mockUserGroupRetriever.mockResolvedValue(complexUserGroups);
      mockUserGroupUserRetriever.mockResolvedValue(complexUserGroupUsers);

      const dependencies = {
        userGroupRetriever: mockUserGroupRetriever,
        userGroupUserRetriever: mockUserGroupUserRetriever,
        userGroupCreator: mockUserGroupCreator,
        userGroupUserAssigner: mockUserGroupUserAssigner,
        userGroupUserRemover: mockUserGroupUserRemover,
        userGroupDeleter: mockUserGroupDeleter,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeUserGroupSync(dependencies);

      expect(mockUserGroupCreator).toHaveBeenCalledTimes(2);
      expect(mockUserGroupUserAssigner).toHaveBeenCalledTimes(4);
      expect(mockOrgStats.userGroupsCreated).toBe(2);
      expect(mockOrgStats.userGroupUsersAssigned).toBe(4);
    });
  });
});
