import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLogger } from '../../logger';
import {
  contributorGroupId,
  ownerGroupId,
  rsNodeId,
  userGroupId,
} from './branded-ids';
import type { OrgSyncStats, PermitTenant } from './common';
import {
  createResourceInstanceSyncHandler,
  executeResourceInstanceSync,
} from './permit-resource-instance-sync';
import { ResourcesWithRelationshipTuples } from './test-data/permit-stub-data';
import { StubNodes } from './test-data/rs-stub-data';
const logger = getLogger();
describe('permit-resource-instance-sync', () => {
  let mockNodeRetriever: ReturnType<typeof vi.fn>;
  let mockResourceInstanceCreator: ReturnType<typeof vi.fn>;
  let mockResourceInstanceRemover: ReturnType<typeof vi.fn>;
  let mockOrgStats: OrgSyncStats;
  let mockPermitOrg: PermitTenant;

  const mockOrgKey = 'org_test123';

  beforeEach(() => {
    mockNodeRetriever = vi.fn();
    mockResourceInstanceCreator = vi.fn();
    mockResourceInstanceRemover = vi.fn();

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

  describe('createResourceInstanceSyncHandler', () => {
    it('should create a handler with executeResourceInstanceSync method', () => {
      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const handler = createResourceInstanceSyncHandler(dependencies);

      expect(handler).toHaveProperty('executeResourceInstanceSync');
      expect(typeof handler.executeResourceInstanceSync).toBe('function');
    });
  });

  describe('executeResourceInstanceSync', () => {
    const mockNodes = [
      {
        Id: 'node1',
        OrgKey: mockOrgKey,
        ObjectType: 'risk',
      },
      {
        Id: 'node2',
        OrgKey: mockOrgKey,
        ObjectType: 'control',
      },
      {
        Id: 'node3',
        OrgKey: mockOrgKey,
        ObjectType: 'action',
      },
    ];

    beforeEach(() => {
      mockNodeRetriever.mockResolvedValue(mockNodes);
      mockResourceInstanceCreator.mockResolvedValue(undefined);
      mockResourceInstanceRemover.mockResolvedValue(undefined);
    });

    it('should process resource instances correctly', async () => {
      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const result = await executeResourceInstanceSync(dependencies);

      expect(mockNodeRetriever).toHaveBeenCalledWith(mockOrgKey);
      expect(result).toHaveProperty('relationshipTuples');
      expect(Array.isArray(result.relationshipTuples)).toBe(true);
    });

    it('should create resource instances for nodes', async () => {
      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeResourceInstanceSync(dependencies);

      expect(mockResourceInstanceCreator).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'node1',
            tenant: mockOrgKey,
            resource: 'rs_node',
            attributes: {
              ObjectType: 'risk',
            },
          }),
          expect.objectContaining({
            key: 'node2',
            tenant: mockOrgKey,
            resource: 'rs_node',
            attributes: {
              ObjectType: 'control',
            },
          }),
          expect.objectContaining({
            key: 'node3',
            tenant: mockOrgKey,
            resource: 'rs_node',
            attributes: {
              ObjectType: 'action',
            },
          }),
        ])
      );
    });

    it('should create root object type instances', async () => {
      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeResourceInstanceSync(dependencies);

      expect(mockResourceInstanceCreator).toHaveBeenCalled();
      expect(mockResourceInstanceCreator).toHaveBeenCalledWith([
        {
          key: 'node1',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'risk',
          },
        },
        {
          key: 'node2',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'control',
          },
        },
        {
          key: 'node3',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'action',
          },
        },
        {
          key: 'risk-org_test123',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'risk',
          },
        },
        {
          key: 'action-org_test123',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'action',
          },
        },
        {
          attributes: {
            ObjectType: 'control',
          },
          key: 'control-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'control_group',
          },
          key: 'control_group-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'issue',
          },
          key: 'issue-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'obligation',
          },
          key: 'obligation-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'obligation_change',
          },
          key: 'obligation_change-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'document',
          },
          key: 'document-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'third_party',
          },
          key: 'third_party-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'assessment',
          },
          key: 'assessment-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'indicator',
          },
          key: 'indicator-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'internal_audit_entity',
          },
          key: 'internal_audit_entity-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'internal_audit_report',
          },
          key: 'internal_audit_report-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'custom_datasource',
          },
          key: 'custom_datasource-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
      ]);
    });

    it('should create relationship tuples between nodes and root object types', async () => {
      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const result = await executeResourceInstanceSync(dependencies);

      expect(result.relationshipTuples).toContainEqual({
        object: 'rs_node:node1',
        relation: 'rs_parent',
        subject: 'rs_node:risk-org_test123',
        tenant: mockOrgKey,
      });

      expect(result.relationshipTuples).toContainEqual({
        object: 'rs_node:node2',
        relation: 'rs_parent',
        subject: 'rs_node:control-org_test123',
        tenant: mockOrgKey,
      });

      expect(result.relationshipTuples).toContainEqual({
        object: 'rs_node:node3',
        relation: 'rs_parent',
        subject: 'rs_node:action-org_test123',
        tenant: mockOrgKey,
      });
    });

    it('should update sync stats for created resources', async () => {
      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeResourceInstanceSync(dependencies);

      // 3 nodes + all root object types (14 total)
      const expectedCreatedCount = 3 + 14; // nodes  all root object types
      expect(mockOrgStats.resourceInstancesCreated).toBe(expectedCreatedCount);
    });

    it('should skip creating resources that already exist in permit', async () => {
      // Add existing resource to permit org
      mockPermitOrg.ResourceInstances.set(rsNodeId('node1'), {
        InstanceType: 'rs_node',
        Id: 'node1',
        ObjectType: 'risk',
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeResourceInstanceSync(dependencies);

      // Should still include node2 and node3
      expect(mockResourceInstanceCreator).toHaveBeenCalledWith([
        {
          key: 'node2',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'control',
          },
        },
        {
          key: 'node3',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'action',
          },
        },
        {
          key: 'risk-org_test123',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'risk',
          },
        },
        {
          key: 'action-org_test123',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'action',
          },
        },
        {
          attributes: {
            ObjectType: 'control',
          },
          key: 'control-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'control_group',
          },
          key: 'control_group-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'issue',
          },
          key: 'issue-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'obligation',
          },
          key: 'obligation-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'obligation_change',
          },
          key: 'obligation_change-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'document',
          },
          key: 'document-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'third_party',
          },
          key: 'third_party-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'assessment',
          },
          key: 'assessment-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'indicator',
          },
          key: 'indicator-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'internal_audit_entity',
          },
          key: 'internal_audit_entity-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'internal_audit_report',
          },
          key: 'internal_audit_report-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'custom_datasource',
          },
          key: 'custom_datasource-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
      ]);
    });

    it('should delete resources that exist in permit but not in current nodes', async () => {
      // Add resource that should be deleted
      mockPermitOrg.ResourceInstances.set(rsNodeId('old-node'), {
        InstanceType: 'rs_node',
        Id: 'old-node',
        ObjectType: 'risk',
        Relations: [],
        OrgKey: mockOrgKey,
      });

      // Add user_group resource that should NOT be deleted
      mockPermitOrg.ResourceInstances.set(userGroupId('some-group'), {
        InstanceType: 'user_group',
        Id: 'some-group',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const result = await executeResourceInstanceSync(dependencies);

      // Should delete resources immediately
      expect(mockResourceInstanceRemover).toHaveBeenCalledWith([
        'rs_node:old-node',
      ]);
      expect(mockOrgStats.resourceInstancesDeleted).toBe(1);

      // Should return deletedResourceSet for relationship and ownership sync to reuse
      expect(result.deletedResourceSet).toBeInstanceOf(Set);
      expect(result.deletedResourceSet.size).toBe(1);
      expect(result.deletedResourceSet.has(rsNodeId('old-node'))).toBe(true);
    });

    it('should not delete user_group resource instances', async () => {
      // Add user_group resource that should NOT be deleted
      mockPermitOrg.ResourceInstances.set(userGroupId('some-group'), {
        InstanceType: 'user_group',
        Id: 'some-group',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeResourceInstanceSync(dependencies);

      expect(mockResourceInstanceRemover).not.toHaveBeenCalled();
    });

    it('should not delete owner_group resource instances', async () => {
      mockPermitOrg.ResourceInstances.set(ownerGroupId('some-group'), {
        InstanceType: 'owner_group',
        Id: 'some-group',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeResourceInstanceSync(dependencies);

      expect(mockResourceInstanceRemover).not.toHaveBeenCalled();
      expect(mockOrgStats.resourceInstancesDeleted).toBe(0);
    });

    it('should not delete contributor_group resource instances', async () => {
      mockPermitOrg.ResourceInstances.set(contributorGroupId('some-group'), {
        InstanceType: 'contributor_group',
        Id: 'some-group',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeResourceInstanceSync(dependencies);

      expect(mockResourceInstanceRemover).not.toHaveBeenCalled();
      expect(mockOrgStats.resourceInstancesDeleted).toBe(0);
    });

    it('should only delete stale rs_node instances when group instances are also present', async () => {
      // Add a stale rs_node that should be deleted
      mockPermitOrg.ResourceInstances.set(rsNodeId('old-node'), {
        InstanceType: 'rs_node',
        Id: 'old-node',
        ObjectType: 'risk',
        Relations: [],
        OrgKey: mockOrgKey,
      });

      // Add group instances that must NOT be deleted
      mockPermitOrg.ResourceInstances.set(userGroupId('group-1'), {
        InstanceType: 'user_group',
        Id: 'group-1',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });
      mockPermitOrg.ResourceInstances.set(ownerGroupId('group-1'), {
        InstanceType: 'owner_group',
        Id: 'group-1',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });
      mockPermitOrg.ResourceInstances.set(contributorGroupId('group-1'), {
        InstanceType: 'contributor_group',
        Id: 'group-1',
        ObjectType: undefined,
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const result = await executeResourceInstanceSync(dependencies);

      // Should only delete the stale rs_node, not the group instances
      expect(mockResourceInstanceRemover).toHaveBeenCalledWith([
        'rs_node:old-node',
      ]);
      expect(mockOrgStats.resourceInstancesDeleted).toBe(1);
      expect(result.deletedResourceSet.size).toBe(1);
    });

    it('should handle empty nodes gracefully', async () => {
      mockNodeRetriever.mockResolvedValue([]);

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const result = await executeResourceInstanceSync(dependencies);

      expect(result.relationshipTuples).toHaveLength(0);
      expect(mockOrgStats.resourceInstancesCreated).toBeGreaterThan(0); // Still creates root object types
    });

    it('should handle undefined permitOrg', async () => {
      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: undefined,
      };

      await executeResourceInstanceSync(dependencies);

      expect(mockResourceInstanceCreator).toHaveBeenCalled();
      expect(mockOrgStats.resourceInstancesCreated).toBeGreaterThan(0);
    });

    it('should create all root object types even if no nodes of that type exist', async () => {
      // Mock nodes with only one object type
      mockNodeRetriever.mockResolvedValue([
        {
          Id: 'node1',
          OrgKey: mockOrgKey,
          ObjectType: 'risk',
        },
      ]);

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeResourceInstanceSync(dependencies);

      // Should still create root instances for all object types
      expect(mockResourceInstanceCreator).toHaveBeenCalledWith([
        {
          key: 'node1',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'risk',
          },
        },
        {
          key: 'risk-org_test123',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'risk',
          },
        },
        {
          key: 'action-org_test123',
          tenant: mockOrgKey,
          resource: 'rs_node',
          attributes: {
            ObjectType: 'action',
          },
        },
        {
          attributes: {
            ObjectType: 'control',
          },
          key: 'control-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'control_group',
          },
          key: 'control_group-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'issue',
          },
          key: 'issue-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'obligation',
          },
          key: 'obligation-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'obligation_change',
          },
          key: 'obligation_change-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'document',
          },
          key: 'document-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'third_party',
          },
          key: 'third_party-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'assessment',
          },
          key: 'assessment-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'indicator',
          },
          key: 'indicator-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'internal_audit_entity',
          },
          key: 'internal_audit_entity-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'internal_audit_report',
          },
          key: 'internal_audit_report-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
        {
          attributes: {
            ObjectType: 'custom_datasource',
          },
          key: 'custom_datasource-org_test123',
          resource: 'rs_node',
          tenant: 'org_test123',
        },
      ]);
    });

    it('should only create relationship tuples for object types that have nodes', async () => {
      // Mock nodes with only one object type
      mockNodeRetriever.mockResolvedValue([
        {
          Id: 'node1',
          OrgKey: mockOrgKey,
          ObjectType: 'risk',
        },
      ]);

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const result = await executeResourceInstanceSync(dependencies);

      // Should only have one relationship tuple for the risk node
      expect(result.relationshipTuples).toHaveLength(1);
      expect(result.relationshipTuples[0]).toEqual({
        object: 'rs_node:node1',
        relation: 'rs_parent',
        subject: 'rs_node:risk-org_test123',
        tenant: mockOrgKey,
      });
    });

    it('should return empty deletedResourceSet when no resources are deleted', async () => {
      mockNodeRetriever.mockResolvedValue(mockNodes);

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const result = await executeResourceInstanceSync(dependencies);

      expect(result.deletedResourceSet.size).toBe(0);
      expect(mockResourceInstanceRemover).not.toHaveBeenCalled();
    });

    it('should return multiple deleted resources in deletedResourceSet', async () => {
      mockNodeRetriever.mockResolvedValue([
        {
          Id: 'node1',
          OrgKey: mockOrgKey,
          ObjectType: 'risk',
        },
      ]);

      // Add multiple resources that should be deleted
      mockPermitOrg.ResourceInstances.set(rsNodeId('old-node-1'), {
        InstanceType: 'rs_node',
        Id: 'old-node-1',
        ObjectType: 'risk',
        Relations: [],
        OrgKey: mockOrgKey,
      });

      mockPermitOrg.ResourceInstances.set(rsNodeId('old-node-2'), {
        InstanceType: 'rs_node',
        Id: 'old-node-2',
        ObjectType: 'control',
        Relations: [],
        OrgKey: mockOrgKey,
      });

      mockPermitOrg.ResourceInstances.set(rsNodeId('old-node-3'), {
        InstanceType: 'rs_node',
        Id: 'old-node-3',
        ObjectType: 'action',
        Relations: [],
        OrgKey: mockOrgKey,
      });

      const dependencies = {
        nodeRetriever: mockNodeRetriever,
        resourceInstanceCreator: mockResourceInstanceCreator,
        resourceInstanceRemover: mockResourceInstanceRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const result = await executeResourceInstanceSync(dependencies);

      // Should delete all three old resources
      expect(mockResourceInstanceRemover).toHaveBeenCalledWith([
        'rs_node:old-node-1',
        'rs_node:old-node-2',
        'rs_node:old-node-3',
      ]);
      expect(mockOrgStats.resourceInstancesDeleted).toBe(3);

      // Should return all three deleted resources in the Set
      expect(result.deletedResourceSet).toBeInstanceOf(Set);
      expect(result.deletedResourceSet.size).toBe(3);
      expect(result.deletedResourceSet.has(rsNodeId('old-node-1'))).toBe(true);
      expect(result.deletedResourceSet.has(rsNodeId('old-node-2'))).toBe(true);
      expect(result.deletedResourceSet.has(rsNodeId('old-node-3'))).toBe(true);
    });
  });

  it('should not recreate root instances when they already exist in permit', async () => {
    // Mock nodes with only one object type
    mockNodeRetriever.mockResolvedValue(StubNodes);

    const dependencies = {
      nodeRetriever: mockNodeRetriever,
      resourceInstanceCreator: mockResourceInstanceCreator,
      resourceInstanceRemover: mockResourceInstanceRemover,
      orgKey: 'org_Qshp7tYsxxAWwhVa', // Use the same orgKey as StubNodes
      orgStats: mockOrgStats,
      orgLogger: logger,
      permitOrg: {
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
        Users: [],
        ResourceInstances: ResourcesWithRelationshipTuples,
      },
    };

    await executeResourceInstanceSync(dependencies);

    // Should not make any changes to resource instances
    expect(mockResourceInstanceCreator).not.toHaveBeenCalled();
    expect(mockResourceInstanceRemover).not.toHaveBeenCalled();
  });
});
