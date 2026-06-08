import type { GetAllDataResult } from '@risksmart-app/permitio/src/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment variables before any imports that might use them
vi.mock('../utils/environment', () => ({
  getEnv: vi.fn((name: string) => {
    switch (name) {
      case 'PDP_ENDPOINT':
        return 'http://localhost:7766';
      case 'PDP_API_KEY':
        return 'test-api-key';
      default:
        return 'test-value';
    }
  }),
  getEnvBoolean: vi.fn(() => false),
}));

// Mock the permitio package's environment utility as well
vi.mock('@risksmart-app/permitio/src/utils/environment', () => ({
  getEnv: vi.fn((name: string) => {
    switch (name) {
      case 'PDP_ENDPOINT':
        return 'http://localhost:7766';
      case 'PDP_API_KEY':
        return 'test-api-key';
      default:
        return 'test-value';
    }
  }),
  getEnvBoolean: vi.fn(() => false),
}));

// Mock the entire permitio SDK to prevent actual API calls
vi.mock('@risksmart-app/permitio/src/permit-sdk', () => ({
  permitSDK: vi.fn(() => ({
    getAllDataOptimized: vi.fn(),
    createGroup: vi.fn(),
    resourceInstanceExists: vi.fn(),
    userExists: vi.fn(),
    deleteGroup: vi.fn(),
    listGroups: vi.fn(),
    addUserToGroup: vi.fn(),
    removeUserFromGroup: vi.fn(),
    bulkCreateUsers: vi.fn(),
    bulkCreateTenants: vi.fn(),
    bulkReplaceResourceInstances: vi.fn(),
    bulkDeleteResourceInstances: vi.fn(),
  })),
}));

// Mock the permit service to avoid actual API calls
vi.mock('./permit.service', () => ({
  PermitService: vi.fn().mockImplementation(() => ({
    getAllData: vi.fn(),
    roleRemover: vi.fn(),
    roleAssigner: vi.fn(),
    relationshipCreator: vi.fn(),
    relationshipRemover: vi.fn(),
    resourceInstanceRemover: vi.fn(),
    resourceInstanceCreator: vi.fn(),
    userCreator: vi.fn(),
    userGroupCreator: vi.fn(),
    userGroupUserAssigner: vi.fn(),
    userGroupUserRemover: vi.fn(),
    userGroupDeleter: vi.fn(),
    orgCreator: vi.fn(),
  })),
  permit: {},
  permitRsSDK: {},
}));

import {
  contributorGroupId,
  ownerGroupId,
  rsNodeId,
  userGroupId,
} from './branded-ids';
import type { PermitTenant } from './common';
import { PermitService } from './permit.service';

// Create mock instance for tests
let mockPermitService: PermitService;
import { getLogger } from '../../logger';
import {
  parseAllPermitData,
  parseResourceInstanceDataOptimized,
  parseUserData,
} from './permit-all-data-parser';
import { GetAllDataResultStub } from './test-data/permit-stub-data';
const logger = getLogger();
describe('parseAllPermitData', () => {
  beforeEach(() => {
    // Create a new mock instance before each test
    mockPermitService = new PermitService({} as never);
    // Mock getAllData to return stub data
    vi.spyOn(mockPermitService, 'getAllData').mockResolvedValue(
      GetAllDataResultStub
    );
  });

  describe('parseAllPermitData', () => {
    it('should successfully parse permit data and return all expected maps', async () => {
      const result = await parseAllPermitData(logger, mockPermitService);

      expect(result).toHaveProperty('permitTenants');
      expect(result).toHaveProperty('permitUserMap');
      expect(result).toHaveProperty('permitOrgMap');
      expect(result).toHaveProperty('permitResourceInstanceMap');
      expect(result).toHaveProperty('permitRoleAssignmentMap');
      expect(result).toHaveProperty('permitRelationshipMap');

      // Check map sizes
      expect(result.permitUserMap.size).toBe(5);
      expect(result.permitOrgMap.size).toBe(2);
      expect(result.permitResourceInstanceMap.size).toBe(10);
      expect(result.permitRoleAssignmentMap.size).toBe(2);
      expect(result.permitRelationshipMap.size).toBe(3);
      expect(result.permitTenants.size).toBe(2);
    });

    it('should initialize tenants correctly', async () => {
      const result = await parseAllPermitData(logger, mockPermitService);
      const tenant = result.permitTenants.get('org_Qshp7tYsxxAWwhVa');

      expect(tenant).toBeDefined();
      expect(tenant!.OrgKey).toBe('org_Qshp7tYsxxAWwhVa');
      expect(tenant!.Users).toHaveLength(2); // Two users with role assignments
      expect(tenant!.ResourceInstances.size).toBe(8); // All resource instances
    });

    it('should handle users with role assignments correctly', async () => {
      const result = await parseAllPermitData(logger, mockPermitService);
      const tenantA = result.permitTenants.get('org_Qshp7tYsxxAWwhVa');

      const user1a = tenantA!.Users.find(
        (u) => u.Id === 'auth0|644151efc3a961d2784456d9'
      );
      expect(user1a).toBeDefined();
      expect(user1a!.Roles).toEqual([
        'ActionManager',
        'IssueManager',
        'AssessmentManager',
        'PolicyManager',
        'RiskManager',
        'IndicatorManager',
        'CustomDataSourceManager',
        'SettingsManager',
        'Standard',
        'ControlManager',
        'InternalAuditManager',
        'ComplianceManager',
        'ThirdPartyManager',
      ]);
      expect(user1a!.RoleAssignments).toHaveLength(3); // Tenant assignments filtered out
      expect(user1a!.RoleAssignments[0]!.ResourceInstanceId).toBe(
        'rs_node:b3977083-5828-4d25-812b-09e772277bff'
      );
      expect(user1a!.RoleAssignments[0]!.Roles).toEqual([
        'Standard',
        'RiskManager',
      ]);
      expect(user1a!.RoleAssignments[1]!.ResourceInstanceId).toBe(
        'rs_node:control-org_Qshp7tYsxxAWwhVa'
      );
      expect(user1a!.RoleAssignments[1]!.Roles).toEqual(['Owner', 'Reader']);
      expect(user1a!.RoleAssignments[2]!.ResourceInstanceId).toBe(
        'rs_node:control_group-org_Qshp7tYsxxAWwhVa'
      );
      expect(user1a!.RoleAssignments[2]!.Roles).toEqual(['Owner']);

      const user2a = tenantA!.Users.find(
        (u) => u.Id === 'auth0|644152102c766a09dd585d2e'
      );
      expect(user2a).toBeDefined();
      expect(user2a!.Roles).toEqual(['Standard', 'ComplianceManager']);
      expect(user2a!.RoleAssignments).toHaveLength(4);

      const tenantB = result.permitTenants.get('org_Qshp7tYsxxAWwhVb');
      const user1b = tenantB!.Users.find(
        (u) => u.Id === 'auth0|644151efc3a961d2784456d9'
      );
      expect(user1b).toBeDefined();
      expect(user1b!.Roles).toEqual(['ComplianceManager', 'Standard']);
      // User1b should only have tenant B assignments, not tenant A assignments
      expect(user1b!.RoleAssignments).toHaveLength(2); // Only tenant B resources
      expect(user1b!.RoleAssignments[0]!.ResourceInstanceId).toBe(
        'rs_node:risk-b-1'
      );
      expect(user1b!.RoleAssignments[0]!.Roles).toEqual(['Standard']);
      expect(user1b!.RoleAssignments[1]!.ResourceInstanceId).toBe(
        'rs_node:control-org_Qshp7tYsxxAWwhVb'
      );
      expect(user1b!.RoleAssignments[1]!.Roles).toEqual(['Reader']);

      const user2b = tenantA!.Users.find(
        (u) => u.Id === 'auth0|644152102c766a09dd585d2e'
      );
      expect(user2b).toBeDefined();
      expect(user2b!.Roles).toEqual(['Standard', 'ComplianceManager']);
      expect(user2b!.RoleAssignments).toHaveLength(4);
    });

    it('should handle resource instances with different types correctly', async () => {
      const result = await parseAllPermitData(logger, mockPermitService);
      const tenant = result.permitTenants.get('org_Qshp7tYsxxAWwhVa');

      // Check rs_node
      const rsNode = tenant!.ResourceInstances.get(
        rsNodeId('b3977083-5828-4d25-812b-09e772277bff')
      );
      expect(rsNode).toBeDefined();
      expect(rsNode!.InstanceType).toBe('rs_node');
      expect(rsNode!.Id).toBe('b3977083-5828-4d25-812b-09e772277bff');
      expect(rsNode!.ObjectType).toBe('risk');
      expect(rsNode!.Relations).toHaveLength(2);

      // Check user_group
      const userGroup = tenant!.ResourceInstances.get(
        userGroupId('5bdce249-61b4-40e0-8336-3d086e15de64')
      );
      expect(userGroup).toBeDefined();
      expect(userGroup!.InstanceType).toBe('user_group');
      expect(userGroup!.Id).toBe('5bdce249-61b4-40e0-8336-3d086e15de64');

      // Check contributor_group
      const contributorGroup = tenant!.ResourceInstances.get(
        contributorGroupId('contrib-123')
      );
      expect(contributorGroup).toBeDefined();
      expect(contributorGroup!.InstanceType).toBe('contributor_group');

      // Check owner_group
      const ownerGroup = tenant!.ResourceInstances.get(
        ownerGroupId('owner-123')
      );
      expect(ownerGroup).toBeDefined();
      expect(ownerGroup!.InstanceType).toBe('owner_group');
    });

    it('should throw error when permit data is null', async () => {
      vi.spyOn(mockPermitService, 'getAllData').mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        parseAllPermitData(logger, mockPermitService)
      ).rejects.toThrow('API Error');
    });

    it('should handle empty permit data gracefully', async () => {
      const emptyData: GetAllDataResult = {
        users: {},
        tenants: {},
        roles: {},
        relationships: {},
        resource_instances: {},
        role_assignments: {},
      };

      vi.spyOn(mockPermitService, 'getAllData').mockResolvedValue(emptyData);

      const result = await parseAllPermitData(logger, mockPermitService);
      expect(result.permitTenants.size).toBe(0);
      expect(result.permitUserMap.size).toBe(0);
      expect(result.permitOrgMap.size).toBe(0);
      expect(result.permitResourceInstanceMap.size).toBe(0);
      expect(result.permitRoleAssignmentMap.size).toBe(0);
      expect(result.permitRelationshipMap.size).toBe(0);
    });

    it('should capture users without any organisation assignments', async () => {
      const dataWithUnassignedUsers: GetAllDataResult = {
        users: {
          'email|6938228175fde6ec9949b70f': {
            roleAssignments: {},
            attributes: {
              email: null,
              key: 'email|6938228175fde6ec9949b70f',
            },
          },
          'auth0|user-with-org': {
            roleAssignments: {
              org_test: ['Standard'],
            },
            attributes: {
              email: 'test@example.com',
              key: 'auth0|user-with-org',
            },
          },
          'google-oauth2|unassigned-user': {
            roleAssignments: {},
            attributes: {
              email: 'unassigned@example.com',
              key: 'google-oauth2|unassigned-user',
            },
          },
        },
        tenants: {
          org_test: {
            attributes: {},
          },
        },
        roles: {},
        relationships: {},
        resource_instances: {},
        role_assignments: {
          'user:auth0|user-with-org': {
            __tenant_org_test: ['Standard'],
          },
        },
      };

      vi.spyOn(mockPermitService, 'getAllData').mockResolvedValue(
        dataWithUnassignedUsers
      );

      const result = await parseAllPermitData(logger, mockPermitService);

      // Check that unassigned users are captured
      expect(result.unassignedUsers).toHaveLength(2);
      expect(result.unassignedUsers).toContain(
        'email|6938228175fde6ec9949b70f'
      );
      expect(result.unassignedUsers).toContain('google-oauth2|unassigned-user');

      // Check that the user with org assignment is not in unassigned users
      expect(result.unassignedUsers.has('auth0|user-with-org')).toBe(false);

      // Check that the tenant still has its assigned user
      const tenant = result.permitTenants.get('org_test');
      expect(tenant).toBeDefined();
      expect(tenant!.Users).toHaveLength(1);
      expect(tenant!.Users[0]!.Id).toBe('auth0|user-with-org');
    });
  });

  describe('parseResourceInstanceDataOptimized', () => {
    let permitTenants: Map<string, PermitTenant>;
    let permitRelationshipMap: Map<
      string,
      {
        [relation: string]: {
          [targetKey: string]: string[];
        };
      }
    >;

    beforeEach(() => {
      permitTenants = new Map();
      permitTenants.set('org_Qshp7tYsxxAWwhVa', {
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
        Users: [],
        ResourceInstances: new Map(),
      });

      permitRelationshipMap = new Map([
        [
          'rs_node:test-id',
          {
            'relation:rs_parent': {
              rs_node: ['parent-id'],
            },
            'relation:contributor': {
              user_group: ['group-id'],
            },
          },
        ],
      ]);
    });

    it('should parse rs_node resource instance correctly', () => {
      const instanceData = {
        tenant: 'org_Qshp7tYsxxAWwhVa',
        attributes: {
          ObjectType: 'risk',
        },
      };

      parseResourceInstanceDataOptimized(
        logger,
        'rs_node:test-id',
        instanceData,
        permitTenants,
        permitRelationshipMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      const resourceInstance = tenant.ResourceInstances.get(
        rsNodeId('test-id')
      )!;

      expect(resourceInstance.InstanceType).toBe('rs_node');
      expect(resourceInstance.Id).toBe('test-id');
      expect(resourceInstance.ObjectType).toBe('risk');
      expect(resourceInstance.Relations).toHaveLength(2);
      expect(resourceInstance.Relations[0]).toEqual({
        Subject: 'rs_node:parent-id',
        Relation: 'rs_parent',
      });
      expect(resourceInstance.Relations[1]).toEqual({
        Subject: 'user_group:group-id',
        Relation: 'contributor',
      });
    });

    it('should parse user_group resource instance correctly', () => {
      const instanceData = {
        tenant: 'org_Qshp7tYsxxAWwhVa',
        attributes: {
          ObjectType: undefined,
        },
      };

      parseResourceInstanceDataOptimized(
        logger,
        'user_group:group-id',
        instanceData,
        permitTenants,
        permitRelationshipMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      const resourceInstance = tenant.ResourceInstances.get(
        userGroupId('group-id')
      )!;

      expect(resourceInstance.InstanceType).toBe('user_group');
      expect(resourceInstance.Id).toBe('group-id');
      expect(resourceInstance.ObjectType).toBeUndefined();
      expect(resourceInstance.Relations).toHaveLength(0);
    });

    it('should parse contributor_group resource instance correctly', () => {
      const instanceData = {
        tenant: 'org_Qshp7tYsxxAWwhVa',
        attributes: {
          ObjectType: undefined,
        },
      };

      parseResourceInstanceDataOptimized(
        logger,
        'contributor_group:contrib-id',
        instanceData,
        permitTenants,
        permitRelationshipMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      const resourceInstance = tenant.ResourceInstances.get(
        contributorGroupId('contrib-id')
      )!;

      expect(resourceInstance.InstanceType).toBe('contributor_group');
      expect(resourceInstance.Id).toBe('contrib-id');
    });

    it('should parse owner_group resource instance correctly', () => {
      const instanceData = {
        tenant: 'org_Qshp7tYsxxAWwhVa',
        attributes: {
          ObjectType: undefined,
        },
      };

      parseResourceInstanceDataOptimized(
        logger,
        'owner_group:owner-id',
        instanceData,
        permitTenants,
        permitRelationshipMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      const resourceInstance = tenant.ResourceInstances.get(
        ownerGroupId('owner-id')
      )!;

      expect(resourceInstance.InstanceType).toBe('owner_group');
      expect(resourceInstance.Id).toBe('owner-id');
    });

    it('should handle invalid instance ID format gracefully', () => {
      const instanceData = {
        tenant: 'org_Qshp7tYsxxAWwhVa',
        attributes: {
          ObjectType: 'risk',
        },
      };

      parseResourceInstanceDataOptimized(
        logger,
        'invalid-format',
        instanceData,
        permitTenants,
        permitRelationshipMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      expect(tenant.ResourceInstances.size).toBe(0);
    });

    it('should handle non-existent tenant gracefully', () => {
      const instanceData = {
        tenant: 'non-existent-tenant',
        attributes: {
          ObjectType: 'risk',
        },
      };

      parseResourceInstanceDataOptimized(
        logger,
        'rs_node:test-id',
        instanceData,
        permitTenants,
        permitRelationshipMap
      );

      // Should not add resource instance to any tenant
      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      expect(tenant.ResourceInstances.size).toBe(0);
    });

    it('should handle resource instance without relationships', () => {
      const instanceData = {
        tenant: 'org_Qshp7tYsxxAWwhVa',
        attributes: {
          ObjectType: 'action',
        },
      };

      parseResourceInstanceDataOptimized(
        logger,
        'rs_node:no-relations',
        instanceData,
        permitTenants,
        permitRelationshipMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      const resourceInstance = tenant.ResourceInstances.get(
        rsNodeId('no-relations')
      )!;

      expect(resourceInstance.Relations).toHaveLength(0);
    });

    it('should handle invalid relation format gracefully', () => {
      permitRelationshipMap.set('rs_node:test-id', {
        'invalid-relation-format': {
          rs_node: ['parent-id'],
        },
      });

      const instanceData = {
        tenant: 'org_Qshp7tYsxxAWwhVa',
        attributes: {
          ObjectType: 'risk',
        },
      };

      parseResourceInstanceDataOptimized(
        logger,
        'rs_node:test-id',
        instanceData,
        permitTenants,
        permitRelationshipMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      const resourceInstance = tenant.ResourceInstances.get(
        rsNodeId('test-id')
      )!;

      expect(resourceInstance.Relations).toHaveLength(0);
    });
  });

  describe('parseUserData', () => {
    let permitTenants: Map<string, PermitTenant>;
    let permitRoleAssignmentMap: Map<
      string,
      {
        [nodeId: string]: string[];
      }
    >;

    beforeEach(() => {
      permitTenants = new Map();
      permitTenants.set('org_Qshp7tYsxxAWwhVa', {
        OrgKey: 'org_Qshp7tYsxxAWwhVa',
        Users: [],
        ResourceInstances: new Map(),
      });

      permitRoleAssignmentMap = new Map([
        [
          'user:test-user',
          {
            'rs_node:resource-1': ['Standard', 'RiskManager'],
            '__tenant:org_Qshp7tYsxxAWwhVa': ['Standard'],
            'rs_node:resource-2': ['ComplianceManager'],
          },
        ],
      ]);
    });

    it('should parse user data with role assignments correctly', () => {
      const userData = {
        roleAssignments: {
          org_Qshp7tYsxxAWwhVa: ['Standard', 'RiskManager'],
        },
        attributes: {
          key: 'test@example.com',
        },
      };

      // Create a resource instance map for the test
      const permitResourceInstanceMap = new Map([
        [
          'rs_node:resource-1',
          {
            tenant: 'org_Qshp7tYsxxAWwhVa',
            attributes: { ObjectType: 'risk' },
          },
        ],
        [
          'rs_node:resource-2',
          {
            tenant: 'org_Qshp7tYsxxAWwhVa',
            attributes: { ObjectType: 'control' },
          },
        ],
      ]);

      parseUserData(
        logger,
        'test-user',
        userData,
        permitTenants,
        permitRoleAssignmentMap,
        permitResourceInstanceMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      expect(tenant.Users).toHaveLength(1);

      const user = tenant.Users[0]!;
      expect(user.Id).toBe('test-user');
      expect(user.Roles).toEqual(['Standard', 'RiskManager']);
      expect(user.RoleAssignments).toHaveLength(2); // Tenant assignments filtered out

      const resourceAssignment1 = user.RoleAssignments.find(
        (ra) => ra.ResourceInstanceId === 'rs_node:resource-1'
      );
      expect(resourceAssignment1).toBeDefined();
      expect(resourceAssignment1!.Roles).toEqual(['Standard', 'RiskManager']);

      const resourceAssignment2 = user.RoleAssignments.find(
        (ra) => ra.ResourceInstanceId === 'rs_node:resource-2'
      );
      expect(resourceAssignment2).toBeDefined();
      expect(resourceAssignment2!.Roles).toEqual(['ComplianceManager']);
    });

    it('should filter out tenant assignments starting with __tenant', () => {
      const userData = {
        roleAssignments: {
          org_Qshp7tYsxxAWwhVa: ['Standard'],
        },
        attributes: {
          key: 'test@example.com',
        },
      };

      parseUserData(
        logger,
        'test-user',
        userData,
        permitTenants,
        permitRoleAssignmentMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      const user = tenant.Users[0]!;

      // Should not include the __tenant assignment
      const tenantAssignment = user.RoleAssignments.find((ra) =>
        ra.ResourceInstanceId.startsWith('__tenant')
      );
      expect(tenantAssignment).toBeUndefined();
    });

    it('should handle user without role assignments', () => {
      const userData = {
        roleAssignments: {
          org_Qshp7tYsxxAWwhVa: ['Standard'],
        },
        attributes: {
          key: 'test@example.com',
        },
      };

      // No role assignments for this user
      const emptyRoleAssignmentMap = new Map<
        string,
        {
          [nodeId: string]: string[];
        }
      >();

      parseUserData(
        logger,
        'user-without-assignments',
        userData,
        permitTenants,
        emptyRoleAssignmentMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      expect(tenant.Users).toHaveLength(0); // User should not be added
    });

    it('should handle user with no roleAssignments property', () => {
      const userData = {
        roleAssignments: {},
        attributes: {
          key: 'test@example.com',
        },
      };

      parseUserData(
        logger,
        'test-user',
        userData,
        permitTenants,
        permitRoleAssignmentMap
      );

      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      expect(tenant.Users).toHaveLength(0);
    });

    it('should handle non-existent tenant gracefully', () => {
      const userData = {
        roleAssignments: {
          'non-existent-tenant': ['Standard'],
        },
        attributes: {
          key: 'test@example.com',
        },
      };

      parseUserData(
        logger,
        'test-user',
        userData,
        permitTenants,
        permitRoleAssignmentMap
      );

      // Should not add user to any tenant
      const tenant = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      expect(tenant.Users).toHaveLength(0);
    });

    it('should handle multiple tenants for the same user', () => {
      // Add another tenant
      permitTenants.set('org_AnotherTenant', {
        OrgKey: 'org_AnotherTenant',
        Users: [],
        ResourceInstances: new Map(),
      });

      const userData = {
        roleAssignments: {
          org_Qshp7tYsxxAWwhVa: ['Standard'],
          org_AnotherTenant: ['RiskManager'],
        },
        attributes: {
          key: 'test@example.com',
        },
      };

      // Add role assignments for both tenants
      permitRoleAssignmentMap.set('user:multi-tenant-user', {
        'rs_node:resource-1': ['Standard'],
        'rs_node:resource-2': ['RiskManager'],
      });

      parseUserData(
        logger,
        'multi-tenant-user',
        userData,
        permitTenants,
        permitRoleAssignmentMap
      );

      const tenant1 = permitTenants.get('org_Qshp7tYsxxAWwhVa')!;
      const tenant2 = permitTenants.get('org_AnotherTenant')!;

      expect(tenant1.Users).toHaveLength(1);
      expect(tenant2.Users).toHaveLength(1);
      expect(tenant1.Users[0]!.Id).toBe('multi-tenant-user');
      expect(tenant2.Users[0]!.Id).toBe('multi-tenant-user');
      expect(tenant1.Users[0]!.Roles).toEqual(['Standard']);
      expect(tenant2.Users[0]!.Roles).toEqual(['RiskManager']);
    });
  });

  describe('tenant isolation for role assignments', () => {
    it('should properly isolate role assignments by tenant for multi-tenant users', () => {
      // Setup test data with a user that has role assignments in multiple tenants
      const permitTenants: Map<string, PermitTenant> = new Map();
      permitTenants.set('org_TenantA', {
        OrgKey: 'org_TenantA',
        Users: [],
        ResourceInstances: new Map(),
      });
      permitTenants.set('org_TenantB', {
        OrgKey: 'org_TenantB',
        Users: [],
        ResourceInstances: new Map(),
      });

      // Setup resource instances map to define which resources belong to which tenant
      const permitResourceInstanceMap = new Map([
        [
          'rs_node:resource-tenant-a-1',
          { tenant: 'org_TenantA', attributes: { ObjectType: 'risk' } },
        ],
        [
          'rs_node:resource-tenant-a-2',
          { tenant: 'org_TenantA', attributes: { ObjectType: 'control' } },
        ],
        [
          'rs_node:resource-tenant-b-1',
          { tenant: 'org_TenantB', attributes: { ObjectType: 'risk' } },
        ],
        [
          'rs_node:resource-tenant-b-2',
          { tenant: 'org_TenantB', attributes: { ObjectType: 'issue' } },
        ],
        [
          'user_group:some-group',
          { tenant: 'org_TenantA', attributes: { ObjectType: undefined } },
        ],
        [
          'user_group:some-group-b',
          { tenant: 'org_TenantB', attributes: { ObjectType: undefined } },
        ],
      ]);

      // Setup role assignments map with cross-tenant assignments
      const permitRoleAssignmentMap = new Map([
        [
          'user:cross-tenant-user',
          {
            // Tenant A resources
            'rs_node:resource-tenant-a-1': ['Owner', 'Contributor'],
            'rs_node:resource-tenant-a-2': ['Reader'],
            // Tenant B resources
            'rs_node:resource-tenant-b-1': ['Standard', 'RiskManager'],
            'rs_node:resource-tenant-b-2': ['IssueManager'],
            // Tenant assignments (filtered out)
            '__tenant:org_TenantA': ['Standard'],
            '__tenant:org_TenantB': ['RiskManager'],
            // Non rs_node assignments (should be included)
            'user_group:some-group': ['Member'],
            'user_group:some-group-b': ['Member'],
          },
        ],
      ]);

      // User belongs to both tenants
      const userData = {
        roleAssignments: {
          org_TenantA: ['Standard', 'PolicyManager'],
          org_TenantB: ['RiskManager', 'IssueManager'],
        },
        attributes: {
          key: 'cross-tenant-user',
        },
      };

      // Call the function under test
      parseUserData(
        logger,
        'cross-tenant-user',
        userData,
        permitTenants,
        permitRoleAssignmentMap,
        permitResourceInstanceMap
      );

      // Validate tenant A user
      const tenantA = permitTenants.get('org_TenantA')!;
      expect(tenantA.Users).toHaveLength(1);
      const userA = tenantA.Users[0]!;
      expect(userA.Id).toBe('cross-tenant-user');
      expect(userA.Roles).toEqual(['Standard', 'PolicyManager']);

      // Should only have role assignments for tenant A resources + non-rs_node assignments
      expect(userA.RoleAssignments).toHaveLength(3);

      // Check specific assignments
      const assignmentA1 = userA.RoleAssignments.find(
        (ra) => ra.ResourceInstanceId === 'rs_node:resource-tenant-a-1'
      );
      expect(assignmentA1).toBeDefined();
      expect(assignmentA1!.Roles).toEqual(['Owner', 'Contributor']);

      const assignmentA2 = userA.RoleAssignments.find(
        (ra) => ra.ResourceInstanceId === 'rs_node:resource-tenant-a-2'
      );
      expect(assignmentA2).toBeDefined();
      expect(assignmentA2!.Roles).toEqual(['Reader']);

      const assignmentUserGroup = userA.RoleAssignments.find(
        (ra) => ra.ResourceInstanceId === 'user_group:some-group'
      );
      expect(assignmentUserGroup).toBeDefined();
      expect(assignmentUserGroup!.Roles).toEqual(['Member']);

      // Should NOT have tenant B assignments
      const hasTenantBAssignment = userA.RoleAssignments.some(
        (ra) =>
          ra.ResourceInstanceId === 'rs_node:resource-tenant-b-1' ||
          ra.ResourceInstanceId === 'rs_node:resource-tenant-b-2'
      );
      expect(hasTenantBAssignment).toBe(false);

      // Validate tenant B user
      const tenantB = permitTenants.get('org_TenantB')!;
      expect(tenantB.Users).toHaveLength(1);
      const userB = tenantB.Users[0]!;
      expect(userB.Id).toBe('cross-tenant-user');
      expect(userB.Roles).toEqual(['RiskManager', 'IssueManager']);

      // Should only have role assignments for tenant B resources + non-rs_node assignments
      expect(userB.RoleAssignments).toHaveLength(3);

      // Check specific assignments
      const assignmentB1 = userB.RoleAssignments.find(
        (ra) => ra.ResourceInstanceId === 'rs_node:resource-tenant-b-1'
      );
      expect(assignmentB1).toBeDefined();
      expect(assignmentB1!.Roles).toEqual(['Standard', 'RiskManager']);

      const assignmentB2 = userB.RoleAssignments.find(
        (ra) => ra.ResourceInstanceId === 'rs_node:resource-tenant-b-2'
      );
      expect(assignmentB2).toBeDefined();
      expect(assignmentB2!.Roles).toEqual(['IssueManager']);

      const assignmentUserGroupB = userB.RoleAssignments.find(
        (ra) => ra.ResourceInstanceId === 'user_group:some-group-b'
      );
      expect(assignmentUserGroupB).toBeDefined();
      expect(assignmentUserGroupB!.Roles).toEqual(['Member']);

      // Should NOT have tenant A assignments
      const hasTenantAAssignment = userB.RoleAssignments.some(
        (ra) =>
          ra.ResourceInstanceId === 'rs_node:resource-tenant-a-1' ||
          ra.ResourceInstanceId === 'rs_node:resource-tenant-a-2'
      );
      expect(hasTenantAAssignment).toBe(false);
    });

    it('should handle assignments with missing resource instances gracefully', () => {
      const permitTenants: Map<string, PermitTenant> = new Map();
      permitTenants.set('org_TestTenant', {
        OrgKey: 'org_TestTenant',
        Users: [],
        ResourceInstances: new Map(),
      });

      // Empty resource instances map
      const permitResourceInstanceMap = new Map();

      // Role assignments with resources that don't exist in resource instances
      const permitRoleAssignmentMap = new Map([
        [
          'user:test-user',
          {
            'rs_node:missing-resource': ['Owner'],
            'user_group:missing-group': ['Member'],
          },
        ],
      ]);

      const userData = {
        roleAssignments: {
          org_TestTenant: ['Standard'],
        },
        attributes: {
          key: 'test-user',
        },
      };

      parseUserData(
        logger,
        'test-user',
        userData,
        permitTenants,
        permitRoleAssignmentMap,
        permitResourceInstanceMap
      );

      const tenant = permitTenants.get('org_TestTenant')!;
      expect(tenant.Users).toHaveLength(1);
      const user = tenant.Users[0]!;

      // Should exclude all assignments when their resource instances are missing
      expect(user.RoleAssignments).toHaveLength(0);
    });

    it('should safely exclude all assignments when permitResourceInstanceMap is not provided', () => {
      const permitTenants: Map<string, PermitTenant> = new Map();
      permitTenants.set('org_TestTenant', {
        OrgKey: 'org_TestTenant',
        Users: [],
        ResourceInstances: new Map(),
      });

      const permitRoleAssignmentMap = new Map([
        [
          'user:test-user',
          {
            'rs_node:some-resource': ['Owner'],
            'user_group:some-group': ['Member'],
            '__tenant:org_TestTenant': ['Standard'],
          },
        ],
      ]);

      const userData = {
        roleAssignments: {
          org_TestTenant: ['Standard'],
        },
        attributes: {
          key: 'test-user',
        },
      };

      // Call without permitResourceInstanceMap (undefined)
      parseUserData(
        logger,
        'test-user',
        userData,
        permitTenants,
        permitRoleAssignmentMap
      );

      const tenant = permitTenants.get('org_TestTenant')!;
      expect(tenant.Users).toHaveLength(1);
      const user = tenant.Users[0]!;

      // Should exclude all assignments when no resource instance map is provided (safer approach)
      expect(user.RoleAssignments).toHaveLength(0);
    });
  });
});
