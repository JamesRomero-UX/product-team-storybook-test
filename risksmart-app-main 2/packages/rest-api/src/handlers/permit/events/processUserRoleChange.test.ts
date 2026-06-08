import type { PermitSDK } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { processUserRoleChange } from './processUserRoleChange';
import { pollForResourceInstance } from './utils';

// Mock dependencies
vi.mock('./utils');
vi.mock('src/adminGraphqlClient');
vi.mock('../../../services/role/roleService');
vi.mock('../../../services/user/userService');

// Import mocked functions for typing
import { UserStatusEnum } from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';

import { getRoleById } from '../../../services/role/roleService';
import { getUserById } from '../../../services/user/userService';

const mockPermit = {
  api: {
    roles: {
      get: vi.fn(),
    },
    roleAssignments: {
      assign: vi.fn(),
      unassign: vi.fn(),
    },
    resourceInstances: {
      create: vi.fn(),
    },
  },
} as unknown as Permit;

const mockPermitRsSDK = {
  userExists: vi.fn(),
} as unknown as PermitSDK;

const mockHasuraClient = {
  query: vi.fn(),
} as unknown as ReturnType<typeof getHasuraAdminClient>;

// Mock objects with proper types
const mockPermitRole = {
  name: 'test-role-key',
  key: 'test-role-key',
  id: 'role-uuid',
  organization_id: 'org-uuid',
  project_id: 'project-uuid',
  environment_id: 'env-uuid',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const mockUser = {
  Id: 'test-user-id',
  Email: 'test@example.com',
  UserName: null,
  FirstName: null,
  LastName: null,
  DisplayName: null,
  OfficeLocation: null,
  Department: null,
  JobTitle: null,
  RoleKey: null,
  Status: UserStatusEnum.Active,
  organisationusers: [],
};

beforeEach(() => {
  vi.mocked(pollForResourceInstance).mockResolvedValue(false);
  vi.mocked(getHasuraAdminClient).mockReturnValue(mockHasuraClient);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('processUserRoleChange', () => {
  describe('when required fields are missing', () => {
    it('should skip processing if UserId is missing', async () => {
      const config = {
        OP: 'INSERT' as const,
        PermitAction: 'USER-ROLE' as const,
        Id: 'test-id',
        RoleKey: 'test-role-id',
        OrgKey: 'test-org',
      };

      await processUserRoleChange(
        mockPermit,
        mockPermitRsSDK,
        config,
        'test-tenant'
      );

      expect(mockPermitRsSDK.userExists).not.toHaveBeenCalled();
      expect(getRoleById).not.toHaveBeenCalled();
    });

    it('should skip processing if RoleKey is missing', async () => {
      const config = {
        OP: 'INSERT' as const,
        PermitAction: 'USER-ROLE' as const,
        Id: 'test-id',
        UserId: 'test-user-id',
        OrgKey: 'test-org',
      };

      await processUserRoleChange(
        mockPermit,
        mockPermitRsSDK,
        config,
        'test-tenant'
      );

      expect(mockPermitRsSDK.userExists).not.toHaveBeenCalled();
      expect(getRoleById).not.toHaveBeenCalled();
    });

    it('should skip processing if OrgKey is missing', async () => {
      const config = {
        OP: 'INSERT' as const,
        PermitAction: 'USER-ROLE' as const,
        Id: 'test-id',
        UserId: 'test-user-id',
        RoleKey: 'test-role-id',
      };

      await processUserRoleChange(
        mockPermit,
        mockPermitRsSDK,
        config,
        'test-tenant'
      );

      expect(mockPermitRsSDK.userExists).not.toHaveBeenCalled();
      expect(getRoleById).not.toHaveBeenCalled();
    });
  });

  describe('when user does not exist in permit', () => {
    it('should skip processing', async () => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(false);

      const config = {
        OP: 'INSERT' as const,
        PermitAction: 'USER-ROLE' as const,
        Id: 'test-id',
        UserId: 'test-user-id',
        RoleKey: 'test-role-id',
        OrgKey: 'test-org',
      };

      await processUserRoleChange(
        mockPermit,
        mockPermitRsSDK,
        config,
        'test-tenant'
      );

      expect(mockPermitRsSDK.userExists).toHaveBeenCalledWith('test-user-id');
      expect(getRoleById).not.toHaveBeenCalled();
      expect(getUserById).not.toHaveBeenCalled();
    });
  });

  describe('when role is not found in database', () => {
    beforeEach(() => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(true);
    });

    it('should skip processing', async () => {
      vi.mocked(getRoleById).mockResolvedValue(null);

      const config = {
        OP: 'INSERT' as const,
        PermitAction: 'USER-ROLE' as const,
        Id: 'test-id',
        UserId: 'test-user-id',
        RoleKey: 'test-role-id',
        OrgKey: 'test-org',
      };

      await processUserRoleChange(
        mockPermit,
        mockPermitRsSDK,
        config,
        'test-tenant'
      );

      expect(getRoleById).toHaveBeenCalledWith(
        mockHasuraClient,
        'test-role-id'
      );
      expect(getUserById).not.toHaveBeenCalled();
    });
  });

  describe('when user is not found in database', () => {
    beforeEach(() => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(true);
    });

    it('should skip processing', async () => {
      const mockRole = {
        Name: 'Test Role',
        Description: 'Test Description',
        RoleKey: 'test-role-key',
        InstanceRoleKey: 'test-instance-role-key',
        TopLevelRoleKey: 'test-top-level-key',
        RiskSmartInternal: false,
        resourceTypes: [
          {
            ResourceType: 'test-resource',
          },
        ],
      };

      vi.mocked(getRoleById).mockResolvedValue(mockRole);
      vi.mocked(getUserById).mockResolvedValue(null);

      const config = {
        OP: 'INSERT' as const,
        PermitAction: 'USER-ROLE' as const,
        Id: 'test-id',
        UserId: 'test-user-id',
        RoleKey: 'test-role-id',
        OrgKey: 'test-org',
      };

      await processUserRoleChange(
        mockPermit,
        mockPermitRsSDK,
        config,
        'test-tenant'
      );

      expect(getUserById).toHaveBeenCalledWith(
        mockHasuraClient,
        'test-user-id'
      );
      expect(mockPermit.api.roleAssignments.assign).not.toHaveBeenCalled();
    });
  });

  describe('INSERT operation', () => {
    const mockRole = {
      Name: 'Test Role',
      Description: 'Test Description',
      RoleKey: 'test-role-key',
      InstanceRoleKey: 'test-instance-role-key',
      TopLevelRoleKey: 'test-top-level-key',
      RiskSmartInternal: false,
      resourceTypes: [
        {
          ResourceType: 'test-resource',
        },
      ],
    };

    beforeEach(() => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(true);
      vi.mocked(getRoleById).mockResolvedValue(mockRole);
      vi.mocked(getUserById).mockResolvedValue(mockUser);
    });

    describe('top-level roles', () => {
      it('should assign top-level role if role exists in permit', async () => {
        const topLevelRole = {
          ...mockRole,
          InstanceRoleKey: null, // No instance role for this test
          PermitEntityType: null, // This makes it a top-level role only
        };
        vi.mocked(getRoleById).mockResolvedValue(topLevelRole);
        vi.mocked(mockPermit.api.roles.get).mockResolvedValue(mockPermitRole);

        const config = {
          OP: 'INSERT' as const,
          PermitAction: 'USER-ROLE' as const,
          Id: 'test-id',
          UserId: 'test-user-id',
          RoleKey: 'test-role-id',
          OrgKey: 'test-org',
        };

        await processUserRoleChange(
          mockPermit,
          mockPermitRsSDK,
          config,
          'test-tenant'
        );

        expect(mockPermit.api.roles.get).toHaveBeenCalledWith(
          'test-top-level-key'
        );
        expect(mockPermit.api.roleAssignments.assign).toHaveBeenCalledWith({
          role: 'test-top-level-key',
          tenant: 'test-org',
          user: 'test-user-id',
        });
      });

      it('should skip top-level role assignment if role does not exist in permit, but throw error for missing resource instance', async () => {
        const roleWithBothTypes = {
          ...mockRole,
          resourceTypes: [
            {
              ResourceType: 'test-resource',
            },
          ],
        };
        vi.mocked(getRoleById).mockResolvedValue(roleWithBothTypes);
        vi.mocked(mockPermit.api.roles.get).mockRejectedValue(
          new Error('Role not found')
        );

        const config = {
          OP: 'INSERT' as const,
          PermitAction: 'USER-ROLE' as const,
          Id: 'test-id',
          UserId: 'test-user-id',
          RoleKey: 'test-role-id',
          OrgKey: 'test-org',
        };

        // Should throw error when resource instance doesn't exist
        await expect(
          processUserRoleChange(
            mockPermit,
            mockPermitRsSDK,
            config,
            'test-tenant'
          )
        ).rejects.toThrow(
          "Resource instance 'test-resource-test-org' of type 'rs_node' does not exist in tenant 'test-org'. Cannot assign role without existing resource instance."
        );

        // Should not assign any roles since resource instance doesn't exist
        expect(mockPermit.api.roleAssignments.assign).not.toHaveBeenCalled();
      });

      it('should skip assignment completely if role only has top-level key and does not exist in permit', async () => {
        const topLevelOnlyRole = {
          ...mockRole,
          InstanceRoleKey: null, // Only has top-level role
          PermitEntityType: null,
        };
        vi.mocked(getRoleById).mockResolvedValue(topLevelOnlyRole);
        vi.mocked(mockPermit.api.roles.get).mockRejectedValue(
          new Error('Role not found')
        );

        const config = {
          OP: 'INSERT' as const,
          PermitAction: 'USER-ROLE' as const,
          Id: 'test-id',
          UserId: 'test-user-id',
          RoleKey: 'test-role-id',
          OrgKey: 'test-org',
        };

        await processUserRoleChange(
          mockPermit,
          mockPermitRsSDK,
          config,
          'test-tenant'
        );

        // Should not assign any roles since top-level role doesn't exist and there's no instance role
        expect(mockPermit.api.roleAssignments.assign).not.toHaveBeenCalled();
      });
    });

    describe('instance roles', () => {
      it('should throw error if resource instance does not exist', async () => {
        vi.mocked(pollForResourceInstance).mockResolvedValue(false);
        vi.mocked(mockPermit.api.roles.get).mockResolvedValue(mockPermitRole);

        const config = {
          OP: 'INSERT' as const,
          PermitAction: 'USER-ROLE' as const,
          Id: 'test-id',
          UserId: 'test-user-id',
          RoleKey: 'test-role-id',
          OrgKey: 'test-org',
        };

        await expect(
          processUserRoleChange(
            mockPermit,
            mockPermitRsSDK,
            config,
            'test-tenant'
          )
        ).rejects.toThrow(
          "Resource instance 'test-resource-test-org' of type 'rs_node' does not exist in tenant 'test-org'. Cannot assign role without existing resource instance."
        );

        expect(pollForResourceInstance).toHaveBeenCalledWith(
          expect.anything(),
          mockPermitRsSDK,
          'rs_node',
          'test-resource-test-org',
          'test-org',
          1
        );
        expect(mockPermit.api.resourceInstances.create).not.toHaveBeenCalled();
        expect(mockPermit.api.roleAssignments.assign).not.toHaveBeenCalled();
      });

      it('should assign both top-level and instance roles', async () => {
        vi.mocked(pollForResourceInstance).mockResolvedValue(true);
        vi.mocked(mockPermit.api.roles.get).mockResolvedValue(mockPermitRole);

        const config = {
          OP: 'INSERT' as const,
          PermitAction: 'USER-ROLE' as const,
          Id: 'test-id',
          UserId: 'test-user-id',
          RoleKey: 'test-role-id',
          OrgKey: 'test-org',
        };

        await processUserRoleChange(
          mockPermit,
          mockPermitRsSDK,
          config,
          'test-tenant'
        );

        // Should assign top-level role
        expect(mockPermit.api.roleAssignments.assign).toHaveBeenCalledWith({
          role: 'test-top-level-key',
          tenant: 'test-org',
          user: 'test-user-id',
        });

        // Should assign instance role
        expect(mockPermit.api.roleAssignments.assign).toHaveBeenCalledWith({
          role: 'test-instance-role-key',
          resource_instance: 'rs_node:test-resource-test-org',
          tenant: 'test-org',
          user: 'test-user-id',
        });
      });
    });
  });

  describe('DELETE operation', () => {
    const mockRole = {
      Name: 'Test Role',
      Description: 'Test Description',
      RoleKey: 'test-role-key',
      InstanceRoleKey: 'test-instance-role-key',
      TopLevelRoleKey: 'test-top-level-key',
      RiskSmartInternal: false,
      resourceTypes: [
        {
          ResourceType: 'test-resource',
        },
      ],
    };

    beforeEach(() => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(true);
      vi.mocked(getRoleById).mockResolvedValue(mockRole);
      vi.mocked(getUserById).mockResolvedValue(mockUser);
    });

    describe('top-level roles', () => {
      it('should unassign top-level role', async () => {
        const topLevelRole = {
          ...mockRole,
        };
        vi.mocked(getRoleById).mockResolvedValue(topLevelRole);

        const config = {
          OP: 'DELETE' as const,
          PermitAction: 'USER-ROLE' as const,
          Id: 'test-id',
          UserId: 'test-user-id',
          RoleKey: 'test-role-id',
          OrgKey: 'test-org',
        };

        await processUserRoleChange(
          mockPermit,
          mockPermitRsSDK,
          config,
          'test-tenant'
        );

        expect(mockPermit.api.roleAssignments.unassign).toHaveBeenCalledWith({
          role: 'test-top-level-key',
          tenant: 'test-org',
          user: 'test-user-id',
        });
      });
    });

    describe('instance roles', () => {
      it('should unassign instance role and try to unassign top-level role', async () => {
        vi.mocked(mockPermit.api.roles.get).mockResolvedValue(mockPermitRole);

        const config = {
          OP: 'DELETE' as const,
          PermitAction: 'USER-ROLE' as const,
          Id: 'test-id',
          UserId: 'test-user-id',
          RoleKey: 'test-role-id',
          OrgKey: 'test-org',
        };

        await processUserRoleChange(
          mockPermit,
          mockPermitRsSDK,
          config,
          'test-tenant'
        );

        // Should try to unassign associated top-level role
        expect(mockPermit.api.roleAssignments.unassign).toHaveBeenCalledWith({
          role: 'test-top-level-key',
          tenant: 'test-org',
          user: 'test-user-id',
        });

        // Should unassign instance role
        expect(mockPermit.api.roleAssignments.unassign).toHaveBeenCalledWith({
          role: 'test-instance-role-key',
          resource_instance: 'rs_node:test-resource-test-org',
          tenant: 'test-org',
          user: 'test-user-id',
        });
      });

      it('should handle errors when unassigning top-level role', async () => {
        vi.mocked(mockPermit.api.roles.get).mockResolvedValue(mockPermitRole);
        vi.mocked(mockPermit.api.roleAssignments.unassign)
          .mockResolvedValueOnce(undefined) // First call (instance role) succeeds
          .mockRejectedValueOnce(new Error('Unassign failed')); // Second call (top-level role) fails

        const config = {
          OP: 'DELETE' as const,
          PermitAction: 'USER-ROLE' as const,
          Id: 'test-id',
          UserId: 'test-user-id',
          RoleKey: 'test-role-id',
          OrgKey: 'test-org',
        };

        // Should not throw error, just log warning
        await expect(
          processUserRoleChange(
            mockPermit,
            mockPermitRsSDK,
            config,
            'test-tenant'
          )
        ).resolves.not.toThrow();
      });
    });
  });

  describe('UPDATE operation', () => {
    it('should skip processing', async () => {
      const config = {
        OP: 'UPDATE' as const,
        PermitAction: 'USER-ROLE' as const,
        Id: 'test-id',
        UserId: 'test-user-id',
        RoleKey: 'test-role-id',
        OrgKey: 'test-org',
      };

      await processUserRoleChange(
        mockPermit,
        mockPermitRsSDK,
        config,
        'test-tenant'
      );

      expect(mockPermit.api.roleAssignments.assign).not.toHaveBeenCalled();
      expect(mockPermit.api.roleAssignments.unassign).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    const mockRole = {
      Name: 'Test Role',
      Description: 'Test Description',
      RoleKey: 'test-role-key',
      InstanceRoleKey: 'test-instance-role-key',
      TopLevelRoleKey: 'test-top-level-key',
      RiskSmartInternal: false,
      resourceTypes: [
        {
          ResourceType: 'test-resource',
        },
      ],
    };

    beforeEach(() => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(true);
      vi.mocked(getRoleById).mockResolvedValue(mockRole);
      vi.mocked(getUserById).mockResolvedValue(mockUser);
    });

    it('should propagate errors during role assignment', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);
      vi.mocked(mockPermit.api.roles.get).mockResolvedValue(mockPermitRole);
      vi.mocked(mockPermit.api.roleAssignments.assign).mockRejectedValue(
        new Error('Assignment failed')
      );

      const config = {
        OP: 'INSERT' as const,
        PermitAction: 'USER-ROLE' as const,
        Id: 'test-id',
        UserId: 'test-user-id',
        RoleKey: 'test-role-id',
        OrgKey: 'test-org',
      };

      await expect(
        processUserRoleChange(
          mockPermit,
          mockPermitRsSDK,
          config,
          'test-tenant'
        )
      ).rejects.toThrow('Assignment failed');
    });
  });
});
