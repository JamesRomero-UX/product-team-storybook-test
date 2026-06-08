import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLogger } from '../../logger';
import { rsNodeId } from './branded-ids';
import type { OrgSyncStats, PermitTenant } from './common';
import {
  createOwnershipSyncHandler,
  executeOwnershipSync,
} from './permit-ownership-sync';
import {
  ResourcesWithRelationshipTuples,
  Users,
} from './test-data/permit-stub-data';
import { StubOwners, StubUserRoles } from './test-data/rs-stub-data';
const logger = getLogger();
describe('permit-ownership-sync', () => {
  let mockOwnerRetriever: ReturnType<typeof vi.fn>;
  let mockContributorRetriever: ReturnType<typeof vi.fn>;
  let mockUserRoleRetriever: ReturnType<typeof vi.fn>;
  let mockRoleAssigner: ReturnType<typeof vi.fn>;
  let mockRoleRemover: ReturnType<typeof vi.fn>;
  let mockOrgStats: OrgSyncStats;
  let mockPermitOrg: PermitTenant;

  const mockOrgKey = 'org_test123';

  beforeEach(() => {
    mockOwnerRetriever = vi.fn();
    mockContributorRetriever = vi.fn();
    mockUserRoleRetriever = vi.fn();
    mockRoleAssigner = vi.fn();
    mockRoleRemover = vi.fn();

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

  describe('createOwnershipSyncHandler', () => {
    it('should create a handler with executeOwnershipSync method', () => {
      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const handler = createOwnershipSyncHandler(dependencies);

      expect(handler).toHaveProperty('executeOwnershipSync');
      expect(typeof handler.executeOwnershipSync).toBe('function');
    });
  });

  describe('executeOwnershipSync', () => {
    const mockOwners = [
      {
        OrgKey: mockOrgKey,
        CreatedAtTimestamp: '2023-01-01T00:00:00Z',
        CreatedByUser: 'user1',
        ModifiedByUser: 'user1',
        ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
        UserId: 'user1',
        ParentId: 'parent1',
        parentNode: {
          OrgKey: mockOrgKey,
          Id: 'node1',
          ObjectType: 'risk' as ParentType,
          SequentialId: 1,
        },
      },
    ];

    const mockContributors = [
      {
        OrgKey: mockOrgKey,
        CreatedAtTimestamp: '2023-01-01T00:00:00Z',
        CreatedByUser: 'user2',
        ModifiedByUser: 'user2',
        ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
        UserId: 'user2',
        ParentId: 'parent2',
        parentNode: {
          OrgKey: mockOrgKey,
          Id: 'node2',
          ObjectType: 'control' as ParentType,
          SequentialId: 2,
        },
      },
    ];

    const mockTopLevelRoles = [
      {
        Id: 'role1',
        OrgKey: mockOrgKey,
        ModifiedByUser: 'user3',
        ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
        UserId: 'user3',
        RoleKey: 'Admin',
        CreatedAtTimestamp: '2023-01-01T00:00:00Z',
        CreatedByUser: 'user3',
        role_type: {
          RoleKey: 'Admin',
          Name: 'Administrator',
          RiskSmartInternal: false,
          TopLevelRoleKey: 'AdminTopLevel',
          InstanceRoleKey: 'AdminInstance',
          Description: 'Admin role',
          resourceTypes: [
            {
              RoleKey: 'Admin',
              ResourceType: 'risk',
            },
          ],
        },
      },
    ];

    beforeEach(() => {
      mockOwnerRetriever.mockResolvedValue(mockOwners);
      mockContributorRetriever.mockResolvedValue(mockContributors);
      mockUserRoleRetriever.mockResolvedValue(mockTopLevelRoles);
      mockRoleAssigner.mockResolvedValue(undefined);
      mockRoleRemover.mockResolvedValue(undefined);
    });

    it('should process ownership assignments correctly', async () => {
      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockOwnerRetriever).toHaveBeenCalledWith(mockOrgKey);
      expect(mockContributorRetriever).toHaveBeenCalledWith(mockOrgKey);
      expect(mockUserRoleRetriever).toHaveBeenCalledWith(mockOrgKey);
    });

    it('should assign roles for owners', async () => {
      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockRoleAssigner).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            resource_instance: 'rs_node:node1',
            role: 'Owner',
            tenant: mockOrgKey,
            user: 'user1',
          }),
        ])
      );
    });

    it('should assign roles for contributors', async () => {
      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockRoleAssigner).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            resource_instance: 'rs_node:node2',
            role: 'Contributor',
            tenant: mockOrgKey,
            user: 'user2',
          }),
        ])
      );
    });

    it('should assign top level roles correctly', async () => {
      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockRoleAssigner).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            resource_instance: 'rs_node:risk-org_test123',
            role: 'AdminInstance',
            tenant: mockOrgKey,
            user: 'user3',
          }),
          expect.objectContaining({
            resource_instance: undefined,
            role: 'AdminTopLevel',
            tenant: mockOrgKey,
            user: 'user3',
          }),
        ])
      );
    });

    it('should update sync stats for assignments', async () => {
      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockOrgStats.ownershipAssigned).toBe(4); // 2 owners + 2 contributors + 2 top level roles
    });

    it('should remove existing roles not in current data', async () => {
      const existingUser = {
        Id: 'user4',
        Roles: ['TopLevelRole'], // Different from resource-specific role
        RoleAssignments: [
          {
            Roles: ['ExistingRole'],
            ResourceInstanceId: rsNodeId('oldnode'),
            OrgKey: mockOrgKey,
          },
        ],
      };

      mockPermitOrg.Users = [existingUser];

      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockRoleRemover).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            resource_instance: 'rs_node:oldnode',
            role: 'ExistingRole',
            tenant: mockOrgKey,
            user: 'user4',
          }),
          expect.objectContaining({
            resource_instance: undefined,
            role: 'TopLevelRole',
            tenant: mockOrgKey,
            user: 'user4',
          }),
        ])
      );
      expect(mockOrgStats.ownershipRemoved).toBe(2); // Both resource-specific and top-level role removed
    });

    it('should handle empty data gracefully', async () => {
      mockOwnerRetriever.mockResolvedValue([]);
      mockContributorRetriever.mockResolvedValue([]);
      mockUserRoleRetriever.mockResolvedValue([]);

      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockOrgStats.ownershipAssigned).toBe(0);
      expect(mockOrgStats.ownershipRemoved).toBe(0);
    });

    it('should handle undefined permitOrg', async () => {
      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: undefined,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockRoleAssigner).toHaveBeenCalled();
      expect(mockOrgStats.ownershipAssigned).toBeGreaterThan(0);
    });

    it('should filter out roles without instance role key from top level assignments', async () => {
      const rolesWithoutInstanceKey = [
        {
          Id: 'role1',
          OrgKey: mockOrgKey,
          ModifiedByUser: 'user3',
          ModifiedAtTimestamp: '2023-01-01T00:00:00Z',
          UserId: 'user3',
          RoleKey: 'NoInstanceRole',
          CreatedAtTimestamp: '2023-01-01T00:00:00Z',
          CreatedByUser: 'user3',
          role_type: {
            RoleKey: 'NoInstanceRole',
            Name: 'No Instance Role',
            RiskSmartInternal: false,
            TopLevelRoleKey: 'TopLevel',
            InstanceRoleKey: null, // No instance role key
            Description: 'Role without instance key',
            resourceTypes: [
              {
                RoleKey: 'NoInstanceRole',
                ResourceType: 'risk',
              },
            ],
          },
        },
      ];

      mockUserRoleRetriever.mockResolvedValue(rolesWithoutInstanceKey);

      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockRoleAssigner).toHaveBeenCalledWith([
        {
          resource_instance: undefined,
          role: 'TopLevel',
          tenant: 'org_test123',
          user: 'user3',
        },
        {
          resource_instance: 'rs_node:node1',
          role: 'Owner',
          tenant: 'org_test123',
          user: 'user1',
        },
        {
          resource_instance: 'rs_node:node2',
          role: 'Contributor',
          tenant: 'org_test123',
          user: 'user2',
        },
      ]);
    });

    it('should not perform any role assignments when no changes are detected', async () => {
      mockOwnerRetriever.mockResolvedValue(StubOwners);
      mockContributorRetriever.mockResolvedValue([]);
      mockUserRoleRetriever.mockResolvedValue(StubUserRoles);

      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: 'org_Qshp7tYsxxAWwhVa',
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: {
          OrgKey: 'org_Qshp7tYsxxAWwhVa',
          Users: Users,
          ResourceInstances: ResourcesWithRelationshipTuples,
        },
      };

      await executeOwnershipSync(dependencies, new Set());

      expect(mockRoleAssigner).not.toHaveBeenCalled();
      expect(mockRoleRemover).not.toHaveBeenCalled();
      expect(mockOrgStats.ownershipAssigned).toBe(0);
      expect(mockOrgStats.ownershipRemoved).toBe(0);
    });

    it('should skip unassigning roles for deleted resources', async () => {
      mockOwnerRetriever.mockResolvedValue([]);
      mockContributorRetriever.mockResolvedValue([]);
      mockUserRoleRetriever.mockResolvedValue([]);

      // Set up existing role assignments in Permit.io
      mockPermitOrg.Users = [
        {
          Id: 'user1',
          Roles: [],
          RoleAssignments: [
            {
              OrgKey: mockOrgKey,
              ResourceInstanceId: rsNodeId('deleted-node'),
              Roles: ['Owner'],
            },
            {
              OrgKey: mockOrgKey,
              ResourceInstanceId: rsNodeId('normal-node'),
              Roles: ['Owner'],
            },
          ],
        },
      ];

      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      // Simulate that 'deleted-node' was deleted by resourceInstanceSync
      const deletedResourceSet = new Set([rsNodeId('deleted-node')]);

      await executeOwnershipSync(dependencies, deletedResourceSet);

      // Should only unassign the role for the non-deleted resource
      expect(mockRoleRemover).toHaveBeenCalledTimes(1);
      expect(mockRoleRemover).toHaveBeenCalledWith([
        {
          resource_instance: 'rs_node:normal-node',
          role: 'Owner',
          tenant: mockOrgKey,
          user: 'user1',
        },
      ]);

      expect(mockOrgStats.ownershipRemoved).toBe(1);
    });

    it('should handle empty deletedResourceSet in ownership sync', async () => {
      mockOwnerRetriever.mockResolvedValue([]);
      mockContributorRetriever.mockResolvedValue([]);
      mockUserRoleRetriever.mockResolvedValue([]);

      mockPermitOrg.Users = [
        {
          Id: 'user1',
          Roles: [],
          RoleAssignments: [
            {
              OrgKey: mockOrgKey,
              ResourceInstanceId: rsNodeId('node1'),
              Roles: ['Owner'],
            },
          ],
        },
      ];

      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      // Empty deletedResourceSet
      await executeOwnershipSync(dependencies, new Set());

      // Should unassign the role normally
      expect(mockRoleRemover).toHaveBeenCalledWith([
        {
          resource_instance: 'rs_node:node1',
          role: 'Owner',
          tenant: mockOrgKey,
          user: 'user1',
        },
      ]);
      expect(mockOrgStats.ownershipRemoved).toBe(1);
    });

    it('should skip unassigning top-level roles (resource_instance undefined) even when resources deleted', async () => {
      mockOwnerRetriever.mockResolvedValue([]);
      mockContributorRetriever.mockResolvedValue([]);
      mockUserRoleRetriever.mockResolvedValue([]);

      // Top-level role (no resource_instance)
      mockPermitOrg.Users = [
        {
          Id: 'user1',
          Roles: ['Admin'], // Top-level role
          RoleAssignments: [],
        },
      ];

      const dependencies = {
        ownerRetriever: mockOwnerRetriever,
        contributorRetriever: mockContributorRetriever,
        userRoleRetriever: mockUserRoleRetriever,
        roleAssigner: mockRoleAssigner,
        roleRemover: mockRoleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const deletedResourceSet = new Set([rsNodeId('deleted-node')]);

      await executeOwnershipSync(dependencies, deletedResourceSet);

      // Should still unassign top-level roles normally (they don't reference resources)
      expect(mockRoleRemover).toHaveBeenCalledWith([
        {
          resource_instance: undefined,
          role: 'Admin',
          tenant: mockOrgKey,
          user: 'user1',
        },
      ]);
      expect(mockOrgStats.ownershipRemoved).toBe(1);
    });
  });
});
