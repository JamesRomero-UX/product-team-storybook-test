import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLogger } from '../../logger';
import { rsNodeId, userGroupId } from './branded-ids';
import type { OrgSyncStats, PermitTenant } from './common';
import {
  createRelationshipSyncHandler,
  executeRelationshipSync,
} from './permit-relationship-sync';
import { ResourcesWithRelationshipTuples } from './test-data/permit-stub-data';
import { StubLinkedItems } from './test-data/rs-stub-data';
const logger = getLogger();

describe('permit-relationship-sync', () => {
  let mockLinkedItemRetriever: ReturnType<typeof vi.fn>;
  let mockOwnerGroupRetriever: ReturnType<typeof vi.fn>;
  let mockContributorGroupRetriever: ReturnType<typeof vi.fn>;
  let mockRelationshipTupleCreator: ReturnType<typeof vi.fn>;
  let mockRelationshipTupleRemover: ReturnType<typeof vi.fn>;
  let mockOrgStats: OrgSyncStats;
  let mockPermitOrg: PermitTenant;

  const mockOrgKey = 'org_test123';

  beforeEach(() => {
    mockLinkedItemRetriever = vi.fn();
    mockOwnerGroupRetriever = vi.fn();
    mockContributorGroupRetriever = vi.fn();
    mockRelationshipTupleCreator = vi.fn();
    mockRelationshipTupleRemover = vi.fn();

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

  describe('createRelationshipSyncHandler', () => {
    it('should create a handler with executeRelationshipSync method', () => {
      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      const handler = createRelationshipSyncHandler(dependencies);

      expect(handler).toHaveProperty('executeRelationshipSync');
      expect(typeof handler.executeRelationshipSync).toBe('function');
    });
  });

  describe('executeRelationshipSync', () => {
    const mockLinkedItems = [
      {
        Id: 'link1',
        OrgKey: mockOrgKey,
        RelationshipType: 'parent_child',
        source_node: {
          Id: 'source1',
          OrgKey: mockOrgKey,
          ObjectType: 'risk',
        },
        target_node: {
          Id: 'target1',
          OrgKey: mockOrgKey,
          ObjectType: 'control',
        },
      },
      {
        Id: 'link2',
        OrgKey: mockOrgKey,
        RelationshipType: 'parent_child',
        source_node: null, // Should be filtered out
        target_node: {
          Id: 'target2',
          OrgKey: mockOrgKey,
          ObjectType: 'control',
        },
      },
    ];

    const mockOwnerGroups = [
      {
        OrgKey: mockOrgKey,
        UserGroupId: 'owner-group-1',
        parentNode: {
          Id: 'node1',
          OrgKey: mockOrgKey,
          ObjectType: 'risk',
        },
      },
    ];

    const mockContributorGroups = [
      {
        OrgKey: mockOrgKey,
        UserGroupId: 'contributor-group-1',
        parentNode: {
          Id: 'node2',
          OrgKey: mockOrgKey,
          ObjectType: 'control',
        },
      },
    ];

    beforeEach(() => {
      mockLinkedItemRetriever.mockResolvedValue(mockLinkedItems);
      mockOwnerGroupRetriever.mockResolvedValue(mockOwnerGroups);
      mockContributorGroupRetriever.mockResolvedValue(mockContributorGroups);
      mockRelationshipTupleCreator.mockResolvedValue(undefined);
      mockRelationshipTupleRemover.mockResolvedValue(undefined);
    });

    it('should process relationship tuples correctly', async () => {
      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockLinkedItemRetriever).toHaveBeenCalledWith(mockOrgKey);
      expect(mockOwnerGroupRetriever).toHaveBeenCalledWith(mockOrgKey);
      expect(mockContributorGroupRetriever).toHaveBeenCalledWith(mockOrgKey);
    });

    it('should add linked item relationship tuples', async () => {
      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockRelationshipTupleCreator).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            object: 'rs_node:target1',
            relation: 'rs_parent',
            subject: 'rs_node:source1',
            tenant: mockOrgKey,
          }),
        ])
      );
    });

    it('should add owner group relationship tuples', async () => {
      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockRelationshipTupleCreator).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            object: 'rs_node:node1',
            relation: 'owner',
            subject: 'owner_group:owner-group-1',
            tenant: mockOrgKey,
          }),
        ])
      );
    });

    it('should add contributor group relationship tuples', async () => {
      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockRelationshipTupleCreator).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            object: 'rs_node:node2',
            relation: 'contributor',
            subject: 'contributor_group:contributor-group-1',
            tenant: mockOrgKey,
          }),
        ])
      );
    });

    it('should create new relationship tuples', async () => {
      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockRelationshipTupleCreator).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            object: 'rs_node:target1',
            relation: 'rs_parent',
            subject: 'rs_node:source1',
            tenant: mockOrgKey,
          }),
        ])
      );

      expect(mockOrgStats.relationshipTuplesCreated).toBe(3); // 1 linked item + 1 owner group + 1 contributor group
    });

    it('should delete relationship tuples that exist in permit but not in current data', async () => {
      const existingResourceInstance = {
        InstanceType: 'rs_node' as const,
        Id: 'existing-node',
        ObjectType: 'risk',
        OrgKey: mockOrgKey,
        Relations: [
          {
            Subject: rsNodeId('old-subject'),
            Relation: 'rs_parent',
            OrgKey: mockOrgKey,
          },
        ],
      };

      mockPermitOrg.ResourceInstances.set(
        rsNodeId('existing-node'),
        existingResourceInstance
      );

      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockRelationshipTupleRemover).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'rs_node:old-subject',
            relation: 'rs_parent',
            object: 'rs_node:existing-node',
          }),
        ])
      );

      expect(mockOrgStats.relationshipTuplesDeleted).toBe(1);
    });

    it('should filter out linked items without source or target nodes', async () => {
      const incompleteLinkedItems = [
        {
          Id: 'link1',
          OrgKey: mockOrgKey,
          RelationshipType: 'parent_child',
          source_node: null,
          target_node: {
            Id: 'target1',
            OrgKey: mockOrgKey,
            ObjectType: 'control',
          },
        },
        {
          Id: 'link2',
          OrgKey: mockOrgKey,
          RelationshipType: 'parent_child',
          source_node: {
            Id: 'source2',
            OrgKey: mockOrgKey,
            ObjectType: 'risk',
          },
          target_node: null,
        },
      ];

      mockLinkedItemRetriever.mockResolvedValue(incompleteLinkedItems);

      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      // Should not contain any linked item tuples
      const linkedItemTuples = relationshipTuples.filter(
        (tuple) => tuple.relation === 'rs_parent'
      );
      expect(linkedItemTuples).toHaveLength(0);
    });

    it('should only delete tuples with rs_node subjects', async () => {
      const existingResourceInstance = {
        InstanceType: 'rs_node' as const,
        Id: 'existing-node',
        ObjectType: 'risk',
        OrgKey: mockOrgKey,
        Relations: [
          {
            Subject: userGroupId('some-user-id'),
            Relation: 'owner',
            OrgKey: mockOrgKey,
          },
          {
            Subject: rsNodeId('old-subject'),
            Relation: 'rs_parent',
            OrgKey: mockOrgKey,
          },
        ],
      };

      mockPermitOrg.ResourceInstances.set(
        rsNodeId('existing-node'),
        existingResourceInstance
      );

      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockRelationshipTupleRemover).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'rs_node:old-subject',
            relation: 'rs_parent',
            object: 'rs_node:existing-node',
          }),
        ])
      );

      // Should not include the user_group relation
      expect(mockRelationshipTupleRemover).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            subject: 'user_group:some-user-id',
            relation: 'owner',
            object: 'rs_node:existing-node',
          }),
        ])
      );
    });

    it('should handle empty data gracefully', async () => {
      mockLinkedItemRetriever.mockResolvedValue([]);
      mockOwnerGroupRetriever.mockResolvedValue([]);
      mockContributorGroupRetriever.mockResolvedValue([]);

      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(relationshipTuples).toHaveLength(0);
      expect(mockOrgStats.relationshipTuplesCreated).toBe(0);
      expect(mockOrgStats.relationshipTuplesDeleted).toBe(0);
    });

    it('should handle undefined permitOrg', async () => {
      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [];

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: undefined,
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockRelationshipTupleCreator).toHaveBeenCalled();
      expect(mockOrgStats.relationshipTuplesCreated).toBeGreaterThan(0);
    });

    it('should not modify relationship tuples if both datasets match', async () => {
      const relationshipTuples: {
        object: string;
        relation: string;
        subject: string;
        tenant: string;
      }[] = [
        {
          object: 'rs_node:a1d30192-8100-46b1-a584-6db81b22f935',
          relation: 'rs_parent',
          subject: 'rs_node:risk-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:d1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
          relation: 'rs_parent',
          subject: 'rs_node:risk-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:c938bde6-460c-4b2a-af42-0d0f8c06a011',
          relation: 'rs_parent',
          subject: 'rs_node:risk-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:9f33de3f-3f3c-485e-a8d7-af16d1a72e94',
          relation: 'rs_parent',
          subject: 'rs_node:risk-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:b2781d16-4827-4d81-a9ba-9402e0c56f7f',
          relation: 'rs_parent',
          subject: 'rs_node:risk-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:50f6d4b7-4d5e-4b52-b5fa-e6dd4c4def44',
          relation: 'rs_parent',
          subject: 'rs_node:action-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:92884517-4731-4446-abb8-b0cbed0e9842',
          relation: 'rs_parent',
          subject: 'rs_node:action-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:12fffadd-8a01-4cb7-ac2b-888d1aa5ee54',
          relation: 'rs_parent',
          subject: 'rs_node:action-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b5',
          relation: 'rs_parent',
          subject: 'rs_node:control-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:f1d30192-8100-46b1-a584-6db81b22f935',
          relation: 'rs_parent',
          subject: 'rs_node:control-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:f2781d16-4827-4d81-a9ba-9402e0c56f7f',
          relation: 'rs_parent',
          subject: 'rs_node:control-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
          relation: 'rs_parent',
          subject: 'rs_node:control-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:f938bde6-460c-4b2a-af42-0d0f8c06a011',
          relation: 'rs_parent',
          subject: 'rs_node:control-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
          relation: 'rs_parent',
          subject: 'rs_node:control-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:71c1e1c6-186a-4660-9fb3-1ba1cfa12593',
          relation: 'rs_parent',
          subject: 'rs_node:control_group-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:190b0c12-d127-4e89-b5db-ff57195273a6',
          relation: 'rs_parent',
          subject: 'rs_node:control_group-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:42bbc0fc-f949-4c40-a2db-86abfdc69d2b',
          relation: 'rs_parent',
          subject: 'rs_node:control_group-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:146eea61-5ddf-4ac6-b6f7-8981afa168a8',
          relation: 'rs_parent',
          subject: 'rs_node:issue-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:2d1a8512-fa2e-4f8c-9c07-8b89e4d074a4',
          relation: 'rs_parent',
          subject: 'rs_node:issue-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
          relation: 'rs_parent',
          subject: 'rs_node:issue-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:cb030e81-9941-44e3-af98-4599e85201e0',
          relation: 'rs_parent',
          subject: 'rs_node:obligation-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:89571185-0342-4614-9f84-ef775cca29bb',
          relation: 'rs_parent',
          subject: 'rs_node:obligation-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:bc02463e-ab36-4224-bad9-bda519df42b0',
          relation: 'rs_parent',
          subject: 'rs_node:obligation-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:68873565-c665-4e4d-b086-763c59da1e68',
          relation: 'rs_parent',
          subject: 'rs_node:obligation-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:651a29fd-019f-44b3-9bdc-bc820a9f1cab',
          relation: 'rs_parent',
          subject: 'rs_node:document-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:0d3a9abc-dd17-4036-ab52-47d13db75128',
          relation: 'rs_parent',
          subject: 'rs_node:document-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:1fd6d8ed-c8b6-4d31-b07d-14c96e5f163f',
          relation: 'rs_parent',
          subject: 'rs_node:document-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:5735b222-82cc-4548-98ab-12d0d8e9feb3',
          relation: 'rs_parent',
          subject: 'rs_node:assessment-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:b8694ef8-2f4c-4b41-9c77-60fb44163736',
          relation: 'rs_parent',
          subject: 'rs_node:indicator-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:b557bd57-0a17-4981-8559-9809296b1975',
          relation: 'rs_parent',
          subject: 'rs_node:indicator-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
        {
          object: 'rs_node:032f6146-8dd7-4f07-b8fd-06156eeaed62',
          relation: 'rs_parent',
          subject: 'rs_node:indicator-org_Qshp7tYsxxAWwhVa',
          tenant: 'org_Qshp7tYsxxAWwhVa',
        },
      ];
      mockLinkedItemRetriever.mockResolvedValue(StubLinkedItems);
      mockOwnerGroupRetriever.mockResolvedValue([]);
      mockContributorGroupRetriever.mockResolvedValue([]);

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: 'org_Qshp7tYsxxAWwhVa',
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: {
          OrgKey: 'org_Qshp7tYsxxAWwhVa',
          Users: [],
          ResourceInstances: ResourcesWithRelationshipTuples,
        },
      };

      await executeRelationshipSync(
        dependencies,
        relationshipTuples,
        new Set()
      );

      expect(mockRelationshipTupleRemover).not.toHaveBeenCalled();
      expect(mockRelationshipTupleCreator).not.toHaveBeenCalled();
      expect(mockOrgStats.relationshipTuplesCreated).toBe(0);
      expect(mockOrgStats.relationshipTuplesDeleted).toBe(0);
    });

    it('should skip deleting relationships that reference deleted resources', async () => {
      // Set up existing relationships in Permit.io
      mockPermitOrg.ResourceInstances.set(rsNodeId('node1'), {
        InstanceType: 'rs_node',
        Id: 'node1',
        ObjectType: 'risk',
        OrgKey: mockOrgKey,
        Relations: [
          {
            Subject: rsNodeId('deleted-node'),
            Relation: 'rs_parent',
          },
        ],
      });

      mockPermitOrg.ResourceInstances.set(rsNodeId('node2'), {
        InstanceType: 'rs_node',
        Id: 'node2',
        ObjectType: 'control',
        OrgKey: mockOrgKey,
        Relations: [
          {
            Subject: rsNodeId('normal-node'),
            Relation: 'rs_parent',
          },
        ],
      });

      // Database has no linked items (all relationships should be deleted)
      mockLinkedItemRetriever.mockResolvedValue([]);
      mockOwnerGroupRetriever.mockResolvedValue([]);
      mockContributorGroupRetriever.mockResolvedValue([]);

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      // Simulate that 'deleted-node' was deleted by resourceInstanceSync
      const deletedResourceSet = new Set([rsNodeId('deleted-node')]);

      await executeRelationshipSync(dependencies, [], deletedResourceSet);

      // Should only delete the relationship that doesn't reference a deleted resource
      expect(mockRelationshipTupleRemover).toHaveBeenCalledTimes(1);
      expect(mockRelationshipTupleRemover).toHaveBeenCalledWith([
        {
          subject: 'rs_node:normal-node',
          relation: 'rs_parent',
          object: 'rs_node:node2',
        },
      ]);

      // The relationship referencing 'deleted-node' should NOT be in the delete call
      const deleteCalls = mockRelationshipTupleRemover.mock.calls[0]?.[0];
      expect(deleteCalls).toBeDefined();
      expect(deleteCalls).not.toContainEqual(
        expect.objectContaining({
          subject: 'rs_node:deleted-node',
        })
      );

      expect(mockOrgStats.relationshipTuplesDeleted).toBe(1);
    });

    it('should skip deleting relationships where the object is a deleted resource', async () => {
      // Set up existing relationship where the object (not subject) is deleted
      mockPermitOrg.ResourceInstances.set(rsNodeId('deleted-node'), {
        InstanceType: 'rs_node',
        Id: 'deleted-node',
        ObjectType: 'risk',
        OrgKey: mockOrgKey,
        Relations: [
          {
            Subject: rsNodeId('parent-node'),
            Relation: 'rs_parent',
          },
        ],
      });

      mockLinkedItemRetriever.mockResolvedValue([]);
      mockOwnerGroupRetriever.mockResolvedValue([]);
      mockContributorGroupRetriever.mockResolvedValue([]);

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      // Simulate that the node was deleted
      const deletedResourceSet = new Set([rsNodeId('deleted-node')]);

      await executeRelationshipSync(dependencies, [], deletedResourceSet);

      // Should NOT try to delete the relationship since the object was deleted
      expect(mockRelationshipTupleRemover).not.toHaveBeenCalled();
      expect(mockOrgStats.relationshipTuplesDeleted).toBe(0);
    });

    it('should handle empty deletedResourceSet', async () => {
      mockPermitOrg.ResourceInstances.set(rsNodeId('node1'), {
        InstanceType: 'rs_node',
        Id: 'node1',
        ObjectType: 'risk',
        OrgKey: mockOrgKey,
        Relations: [
          {
            Subject: rsNodeId('parent-node'),
            Relation: 'rs_parent',
          },
        ],
      });

      mockLinkedItemRetriever.mockResolvedValue([]);
      mockOwnerGroupRetriever.mockResolvedValue([]);
      mockContributorGroupRetriever.mockResolvedValue([]);

      const dependencies = {
        linkedItemRetriever: mockLinkedItemRetriever,
        ownerGroupRetriever: mockOwnerGroupRetriever,
        contributorGroupRetriever: mockContributorGroupRetriever,
        relationshipTupleCreator: mockRelationshipTupleCreator,
        relationshipTupleRemover: mockRelationshipTupleRemover,
        orgKey: mockOrgKey,
        orgStats: mockOrgStats,
        orgLogger: logger,
        permitOrg: mockPermitOrg,
      };

      // Empty deletedResourceSet
      await executeRelationshipSync(dependencies, [], new Set());

      // Should delete the relationship normally
      expect(mockRelationshipTupleRemover).toHaveBeenCalledWith([
        {
          subject: 'rs_node:parent-node',
          relation: 'rs_parent',
          object: 'rs_node:node1',
        },
      ]);
      expect(mockOrgStats.relationshipTuplesDeleted).toBe(1);
    });
  });
});
