import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMockRelationshipTuple,
  createMockRoleAssignment,
  createMockSuccessResponse,
  mockResponseBodies,
} from './test-utils';

// Mock dependencies BEFORE importing the module that uses them
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);
vi.mock('permitio');
vi.mock('../utils/environment.js', () => ({
  getEnv: vi.fn().mockImplementation((key) => {
    if (key === 'PDP_ENDPOINT') {
      return 'http://localhost:7766';
    }

    if (key === 'PERMIT_API_URL') {
      return 'https://api.permit.io';
    }

    return undefined;
  }),
}));
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { Permit } from 'permitio';

import { PermitValidationError } from '../errors';
import { permitSDK } from '../permit-sdk';
import type { RelationshipTuple, RoleAssignment } from '../types';
import { logger } from '../utils/logger';
const mockLogger = vi.mocked(logger);

// Mock Permit SDK
const mockPermitApi = {
  resourceInstances: {
    create: vi.fn(),
    delete: vi.fn(),
  },
  relationshipTuples: {
    list: vi.fn(),
    create: vi.fn(),
  },
};

const mockPermit = {
  api: mockPermitApi,
} as unknown as Permit;

vi.mocked(Permit).mockImplementation(() => mockPermit);

// Test constants
const TEST_TOKEN = 'test-token';
const TEST_PDP_ENDPOINT = 'http://localhost:7766';
const TEST_PERMIT_API_URL = 'https://api.permit.io';
const TEST_ORG_KEY = 'test-org';
const TEST_GROUP_KEY = 'test-group';
const TEST_USER_ID = 'test-user';

describe('Permit SDK', () => {
  let sdk: ReturnType<typeof permitSDK>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks - don't change getEnv since it's set in module mock
    mockLogger.info.mockImplementation(vi.fn());
    mockLogger.warn.mockImplementation(vi.fn());
    mockLogger.error.mockImplementation(vi.fn());

    // Mock successful fetch responses
    mockFetch.mockResolvedValue(
      createMockSuccessResponse(mockResponseBodies.permitKeyScope)
    );

    // Initialize SDK
    sdk = permitSDK(TEST_TOKEN);
  });

  describe('Initialization', () => {
    it('should create SDK instance with correct configuration', () => {
      expect(Permit).toHaveBeenCalledWith({
        pdp: TEST_PDP_ENDPOINT,
        token: TEST_TOKEN,
        apiUrl: TEST_PERMIT_API_URL,
      });
    });

    it('should initialize key scope on first API call', async () => {
      await sdk.init();

      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_PERMIT_API_URL}/v2/api-key/scope`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${TEST_TOKEN}`,
          }) as Record<string, unknown>,
        })
      );
    });
  });

  describe('Resource Instance Management', () => {
    beforeEach(async () => {
      // Initialize SDK first
      await sdk.init();
      vi.clearAllMocks();
    });

    it('should check if resource instance exists', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.resourceInstance)
      );

      const result = await sdk.resourceInstanceExists(
        TEST_GROUP_KEY,
        'user_group',
        TEST_ORG_KEY
      );

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/resource_instances'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return false when resource instance does not exist', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyArray)
      );

      const result = await sdk.resourceInstanceExists(
        'non-existent',
        'user_group',
        TEST_ORG_KEY
      );

      expect(result).toBe(false);
    });

    it('should return false when resource instance exists but wrong type', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse([
          {
            key: TEST_GROUP_KEY,
            resource: 'different_type',
            tenant: TEST_ORG_KEY,
          },
        ])
      );

      const result = await sdk.resourceInstanceExists(
        TEST_GROUP_KEY,
        'user_group',
        TEST_ORG_KEY
      );

      expect(result).toBe(false);
    });
  });

  describe('Relationship Tuple Management', () => {
    beforeEach(async () => {
      await sdk.init();
      vi.clearAllMocks();
    });

    it('should return true if relationship tuple exists', async () => {
      const relationshipTuples: RelationshipTuple[] = [
        createMockRelationshipTuple(),
      ];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(relationshipTuples)
      );

      const result = await sdk.relationshipTupleExists({
        subject: 'parent_type:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/relationship_tuples'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return false if relationship tuple does not exist', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyArray)
      );

      const result = await sdk.relationshipTupleExists({
        subject: 'parent_type:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });

      expect(result).toBe(false);
    });

    it('should return false if relationship tuple exists but does not match exactly', async () => {
      const relationshipTuples: RelationshipTuple[] = [
        createMockRelationshipTuple({
          object: 'rs_node:different-object-id',
        }),
      ];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(relationshipTuples)
      );

      const result = await sdk.relationshipTupleExists({
        subject: 'parent_type:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });

      expect(result).toBe(false);
    });

    it('should throw error if response data has invalid structure', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse([{ invalid: 'data' }])
      );

      await expect(
        sdk.relationshipTupleExists({
          subject: 'parent_type:parent-1',
          relation: 'rs_parent',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        })
      ).rejects.toThrow(PermitValidationError);
    });

    it('should find exact match in array with multiple tuples', async () => {
      const relationshipTuples: RelationshipTuple[] = [
        createMockRelationshipTuple({
          id: 'test-tuple-id-1',
          object: 'rs_node:other-object-id',
          objectId: 'test-object-id-1',
        }),
        createMockRelationshipTuple({
          id: 'test-tuple-id-2',
          objectId: 'test-object-id-2',
        }),
      ];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(relationshipTuples)
      );

      const result = await sdk.relationshipTupleExists({
        subject: 'parent_type:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });

      expect(result).toBe(true);
    });

    it('should handle additional keys in API response gracefully', async () => {
      const relationshipTuplesWithExtraKeys = [
        createMockRelationshipTuple({
          overrides: {
            // Simulating future API additions
            new_field_v2: 'some-value',
            metadata: { extra: 'data' },
          },
        }),
      ];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(relationshipTuplesWithExtraKeys)
      );

      const result = await sdk.relationshipTupleExists({
        subject: 'parent_type:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });

      expect(result).toBe(true);
    });

    it('should throw error if response is undefined', async () => {
      mockFetch.mockResolvedValueOnce(createMockSuccessResponse(undefined));

      await expect(
        sdk.relationshipTupleExists({
          subject: 'parent_type:parent-1',
          relation: 'rs_parent',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        })
      ).rejects.toThrow(PermitValidationError);
    });

    it('should throw error if response is not an array', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse({ data: 'not-an-array' })
      );

      await expect(
        sdk.relationshipTupleExists({
          subject: 'parent_type:parent-1',
          relation: 'rs_parent',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        })
      ).rejects.toThrow(PermitValidationError);
    });

    it('should throw error if response array contains items with missing required fields', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse([
          {
            id: 'test-tuple-id',
            subject: 'parent_type:parent-1',
            // Missing relation field
            object: 'rs_node:test-object-id',
          },
        ])
      );

      await expect(
        sdk.relationshipTupleExists({
          subject: 'parent_type:parent-1',
          relation: 'rs_parent',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        })
      ).rejects.toThrow(PermitValidationError);
    });

    describe('listRelationshipTuples', () => {
      it('should list relationship tuples with only tenant parameter', async () => {
        const relationshipTuples: RelationshipTuple[] = [
          createMockRelationshipTuple({
            id: 'test-tuple-id-1',
            object: 'rs_node:child-1',
            subjectId: 'test_subject-id-1',
            objectId: 'test-object-id-1',
            tenantId: TEST_ORG_KEY,
          }),
          createMockRelationshipTuple({
            id: 'test-tuple-id-2',
            subject: 'parent_type:parent-2',
            object: 'rs_node:child-2',
            subjectId: 'test_subject-id-2',
            objectId: 'test-object-id-2',
            tenantId: TEST_ORG_KEY,
          }),
        ];

        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(relationshipTuples)
        );

        const result = await sdk.listRelationshipTuples({
          tenant: TEST_ORG_KEY,
        });

        expect(result).toEqual(relationshipTuples);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/relationship_tuples\?tenant=test-org$/),
          expect.objectContaining({
            method: 'GET',
          })
        );
      });

      it('should list relationship tuples with all filter parameters', async () => {
        const relationshipTuples: RelationshipTuple[] = [
          createMockRelationshipTuple({
            object: 'rs_node:child-1',
            tenantId: TEST_ORG_KEY,
          }),
        ];

        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(relationshipTuples)
        );

        const result = await sdk.listRelationshipTuples({
          tenant: TEST_ORG_KEY,
          object: 'rs_node:child-1',
          subject: 'parent_type:parent-1',
          relation: 'rs_parent',
        });

        expect(result).toEqual(relationshipTuples);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('tenant=test-org'),
          expect.objectContaining({
            method: 'GET',
          })
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('object=rs_node%3Achild-1'),
          expect.objectContaining({
            method: 'GET',
          })
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('subject=parent_type%3Aparent-1'),
          expect.objectContaining({
            method: 'GET',
          })
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('relation=rs_parent'),
          expect.objectContaining({
            method: 'GET',
          })
        );
      });

      it('should return empty array when no tuples match', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyArray)
        );

        const result = await sdk.listRelationshipTuples({
          tenant: TEST_ORG_KEY,
        });

        expect(result).toEqual([]);
      });

      it('should throw PermitValidationError for invalid response structure', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse([{ invalid: 'data' }])
        );

        await expect(
          sdk.listRelationshipTuples({
            tenant: TEST_ORG_KEY,
          })
        ).rejects.toThrow(PermitValidationError);
      });

      it('should throw PermitValidationError when response is not an array', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse({ data: 'not-an-array' })
        );

        await expect(
          sdk.listRelationshipTuples({
            tenant: TEST_ORG_KEY,
          })
        ).rejects.toThrow(PermitValidationError);
      });

      it('should handle additional keys in API response gracefully', async () => {
        const relationshipTuplesWithExtraKeys = [
          createMockRelationshipTuple({
            object: 'rs_node:child-1',
            tenantId: TEST_ORG_KEY,
            overrides: {
              new_field_v2: 'some-value',
              metadata: { extra: 'data' },
            },
          }),
        ];

        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(relationshipTuplesWithExtraKeys)
        );

        const result = await sdk.listRelationshipTuples({
          tenant: TEST_ORG_KEY,
        });

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe('test-tuple-id');
      });
    });
  });

  describe('User Management', () => {
    beforeEach(async () => {
      await sdk.init();
      vi.clearAllMocks();
    });

    it('should check if user exists', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.userExists)
      );

      const result = await sdk.userExists(TEST_USER_ID);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return false when user does not exist', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.userNotExists)
      );

      const result = await sdk.userExists('non-existent-user');

      expect(result).toBe(false);
    });

    it('should add user to group', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      await sdk.addUserToGroup(TEST_GROUP_KEY, TEST_USER_ID, TEST_ORG_KEY);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/groups/user_group:${TEST_GROUP_KEY}/users/${TEST_USER_ID}`
        ),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ tenant: TEST_ORG_KEY }),
        })
      );
    });

    it('should remove user from group', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      await sdk.removeUserFromGroup(TEST_GROUP_KEY, TEST_USER_ID, TEST_ORG_KEY);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/groups/user_group:${TEST_GROUP_KEY}/users/${TEST_USER_ID}`
        ),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ tenant: TEST_ORG_KEY }),
        })
      );
    });
  });

  describe('Role Assignment Management', () => {
    beforeEach(async () => {
      await sdk.init();
      vi.clearAllMocks();
    });

    describe('listRoleAssignments', () => {
      it('should list role assignments with only tenant parameter', async () => {
        const roleAssignments: RoleAssignment[] = [
          createMockRoleAssignment({
            id: 'role-assignment-1',
            user: 'user-1',
            role: 'Owner',
            tenant: TEST_ORG_KEY,
          }),
          createMockRoleAssignment({
            id: 'role-assignment-2',
            user: 'user-2',
            role: 'Contributor',
            tenant: TEST_ORG_KEY,
          }),
        ];

        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(roleAssignments)
        );

        const result = await sdk.listRoleAssignments({
          tenant: TEST_ORG_KEY,
        });

        expect(result).toEqual(roleAssignments);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/role_assignments\?tenant=test-org$/),
          expect.objectContaining({
            method: 'GET',
          })
        );
      });

      it('should list role assignments with all filter parameters', async () => {
        const roleAssignments: RoleAssignment[] = [
          createMockRoleAssignment({
            user: 'user-1',
            role: 'Owner',
            resourceInstance: 'rs_node:object-1',
            tenant: TEST_ORG_KEY,
          }),
        ];

        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(roleAssignments)
        );

        const result = await sdk.listRoleAssignments({
          tenant: TEST_ORG_KEY,
          resource_instance: 'rs_node:object-1',
          user: 'user-1',
          role: 'Owner',
        });

        expect(result).toEqual(roleAssignments);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('tenant=test-org'),
          expect.objectContaining({
            method: 'GET',
          })
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('resource_instance=rs_node%3Aobject-1'),
          expect.objectContaining({
            method: 'GET',
          })
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('user=user-1'),
          expect.objectContaining({
            method: 'GET',
          })
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('role=Owner'),
          expect.objectContaining({
            method: 'GET',
          })
        );
      });

      it('should return empty array when no role assignments match', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyArray)
        );

        const result = await sdk.listRoleAssignments({
          tenant: TEST_ORG_KEY,
        });

        expect(result).toEqual([]);
      });

      it('should throw PermitValidationError for invalid response structure', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse([{ invalid: 'data' }])
        );

        await expect(
          sdk.listRoleAssignments({
            tenant: TEST_ORG_KEY,
          })
        ).rejects.toThrow(PermitValidationError);
      });

      it('should throw PermitValidationError when response is not an array', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse({ data: 'not-an-array' })
        );

        await expect(
          sdk.listRoleAssignments({
            tenant: TEST_ORG_KEY,
          })
        ).rejects.toThrow(PermitValidationError);
      });

      it('should handle additional keys in API response gracefully', async () => {
        const roleAssignmentsWithExtraKeys = [
          createMockRoleAssignment({
            id: 'role-assignment-1',
            user: 'user-1',
            role: 'Owner',
            tenant: TEST_ORG_KEY,
            overrides: {
              new_field_v2: 'some-value',
              metadata: { extra: 'data' },
            },
          }),
        ];

        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(roleAssignmentsWithExtraKeys)
        );

        const result = await sdk.listRoleAssignments({
          tenant: TEST_ORG_KEY,
        });

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe('role-assignment-1');
        expect(result[0]!.user).toBe('user-1');
        expect(result[0]!.role).toBe('Owner');
      });
    });

    describe('tryAssignRole', () => {
      it('should assign role successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        );

        await sdk.tryAssignRole({
          resource_instance: 'rs_node:test-id',
          role: 'Owner',
          tenant: TEST_ORG_KEY,
          user: TEST_USER_ID,
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/role_assignments'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              resource_instance: 'rs_node:test-id',
              role: 'Owner',
              tenant: TEST_ORG_KEY,
              user: TEST_USER_ID,
            }),
          })
        );
      });

      it('should handle 409 Conflict gracefully without throwing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 409,
          statusText: 'Conflict',
          json: () =>
            Promise.resolve({ detail: 'Role assignment already exists' }),
        } as Response);

        await sdk.tryAssignRole({
          resource_instance: 'rs_node:test-id',
          role: 'Owner',
          tenant: TEST_ORG_KEY,
          user: TEST_USER_ID,
        });

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            resource_instance: 'rs_node:test-id',
            role: 'Owner',
            tenant: TEST_ORG_KEY,
            user: TEST_USER_ID,
          }),
          'Role assignment already exists (409 Conflict)'
        );
      });

      it('should throw error for non-409 errors', async () => {
        // 400 errors are not retryable
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ detail: 'Bad request' }),
        } as Response);

        await expect(
          sdk.tryAssignRole({
            resource_instance: 'rs_node:test-id',
            role: 'Owner',
            tenant: TEST_ORG_KEY,
            user: TEST_USER_ID,
          })
        ).rejects.toThrow('HTTP 400: Bad Request');
      });
    });
  });

  describe('Group Management', () => {
    beforeEach(async () => {
      await sdk.init();
      vi.clearAllMocks();
    });

    it('should create group when it does not exist', async () => {
      // Mock resource instance checks to return false (group doesn't exist)
      mockFetch
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyArray)
        ) // user_group doesn't exist
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        ) // create user_group
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyArray)
        ) // owner_group doesn't exist
        .mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyArray)
        ); // contributor_group doesn't exist

      // Mock Permit SDK operations
      mockPermitApi.resourceInstances.create.mockResolvedValue(
        mockResponseBodies.emptyObject
      );
      mockPermitApi.relationshipTuples.list.mockResolvedValue(
        mockResponseBodies.emptyArray
      );
      mockPermitApi.relationshipTuples.create.mockResolvedValue(
        mockResponseBodies.emptyObject
      );

      await sdk.createGroup(TEST_GROUP_KEY, TEST_ORG_KEY);

      // Verify user group creation
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/groups'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            group_resource_type_key: 'user_group',
            group_instance_key: TEST_GROUP_KEY,
            group_tenant: TEST_ORG_KEY,
          }),
        })
      );

      // Verify resource instance creations
      expect(mockPermitApi.resourceInstances.create).toHaveBeenCalledWith({
        key: TEST_GROUP_KEY,
        resource: 'owner_group',
        tenant: TEST_ORG_KEY,
      });

      expect(mockPermitApi.resourceInstances.create).toHaveBeenCalledWith({
        key: TEST_GROUP_KEY,
        resource: 'contributor_group',
        tenant: TEST_ORG_KEY,
      });

      // Verify relationship creations
      expect(mockPermitApi.relationshipTuples.create).toHaveBeenCalledWith({
        subject: `user_group:${TEST_GROUP_KEY}`,
        relation: 'parent',
        object: `owner_group:${TEST_GROUP_KEY}`,
        tenant: TEST_ORG_KEY,
      });

      expect(mockPermitApi.relationshipTuples.create).toHaveBeenCalledWith({
        subject: `user_group:${TEST_GROUP_KEY}`,
        relation: 'parent',
        object: `contributor_group:${TEST_GROUP_KEY}`,
        tenant: TEST_ORG_KEY,
      });
    });

    it('should skip creation when group already exists', async () => {
      // Mock all resource instances to exist (user_group, owner_group, contributor_group)
      mockFetch
        .mockResolvedValueOnce(
          createMockSuccessResponse([
            {
              key: TEST_GROUP_KEY,
              resource: 'user_group',
              tenant: TEST_ORG_KEY,
            },
          ])
        )
        .mockResolvedValueOnce(
          createMockSuccessResponse([
            {
              key: TEST_GROUP_KEY,
              resource: 'owner_group',
              tenant: TEST_ORG_KEY,
            },
          ])
        )
        .mockResolvedValueOnce(
          createMockSuccessResponse([
            {
              key: TEST_GROUP_KEY,
              resource: 'contributor_group',
              tenant: TEST_ORG_KEY,
            },
          ])
        );

      // Mock relationships to exist
      mockPermitApi.relationshipTuples.list.mockResolvedValue([
        { subject: 'test', relation: 'parent', object: 'test' },
      ]);

      await sdk.createGroup(TEST_GROUP_KEY, TEST_ORG_KEY);

      // Should not create any resources
      expect(mockPermitApi.resourceInstances.create).not.toHaveBeenCalled();
      expect(mockPermitApi.relationshipTuples.create).not.toHaveBeenCalled();
    });

    it('should delete group and all related resources', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      mockPermitApi.resourceInstances.delete.mockResolvedValue(
        mockResponseBodies.emptyObject
      );

      await sdk.deleteGroup(TEST_GROUP_KEY);

      // Verify main group deletion
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/groups/user_group:${TEST_GROUP_KEY}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      // Verify resource deletions
      expect(mockPermitApi.resourceInstances.delete).toHaveBeenCalledWith(
        `owner_group:${TEST_GROUP_KEY}`
      );
      expect(mockPermitApi.resourceInstances.delete).toHaveBeenCalledWith(
        `contributor_group:${TEST_GROUP_KEY}`
      );
      expect(mockPermitApi.resourceInstances.delete).toHaveBeenCalledWith(
        `user_group:${TEST_GROUP_KEY}`
      );
    });
  });

  describe('tryCreateUserGroup', () => {
    beforeEach(async () => {
      await sdk.init();
      vi.clearAllMocks();
    });

    it('should create user group successfully', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      await sdk.tryCreateUserGroup(TEST_GROUP_KEY, TEST_ORG_KEY);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/groups'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            group_resource_type_key: 'user_group',
            group_instance_key: TEST_GROUP_KEY,
            group_tenant: TEST_ORG_KEY,
          }),
        })
      );
    });

    it('should handle 409 Conflict gracefully without throwing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: () => Promise.resolve({ detail: 'User group already exists' }),
      } as Response);

      await sdk.tryCreateUserGroup(TEST_GROUP_KEY, TEST_ORG_KEY);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          userGroupKey: TEST_GROUP_KEY,
          orgKey: TEST_ORG_KEY,
        }),
        'User group already exists (409 Conflict)'
      );
    });

    it('should throw error for non-409 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ detail: 'Bad request' }),
      } as Response);

      await expect(
        sdk.tryCreateUserGroup(TEST_GROUP_KEY, TEST_ORG_KEY)
      ).rejects.toThrow('HTTP 400: Bad Request');
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(async () => {
      await sdk.init();
      vi.clearAllMocks();
    });

    it('should perform bulk resource instance replacement', async () => {
      const resourceInstances = [
        {
          key: 'test1',
          tenant: TEST_ORG_KEY,
          resource: 'test_resource',
          attributes: { name: 'Test 1' },
        },
        {
          key: 'test2',
          tenant: TEST_ORG_KEY,
          resource: 'test_resource',
          attributes: { name: 'Test 2' },
        },
      ];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      await sdk.bulkReplaceResourceInstances(resourceInstances);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bulk/resource_instances'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ operations: resourceInstances }),
        })
      );
    });

    it('should perform bulk resource instance deletion', async () => {
      const keys = ['key1', 'key2', 'key3'];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      await sdk.bulkDeleteResourceInstances(keys);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bulk/resource_instances'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ idents: keys }),
        })
      );
    });

    it('should perform bulk tenant creation', async () => {
      const tenants = [
        {
          key: 'tenant1',
          name: 'Tenant 1',
          description: 'First tenant',
          attributes: {},
        },
        {
          key: 'tenant2',
          name: 'Tenant 2',
          description: 'Second tenant',
          attributes: {},
        },
      ];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      await sdk.bulkCreateTenants(tenants);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bulk/tenants'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ operations: tenants }),
        })
      );
    });

    it('should perform bulk user creation', async () => {
      const users = [
        {
          key: 'user1',
          email: 'user1@example.com',
          role_assignments: [{ role: 'admin', tenant: TEST_ORG_KEY }],
          attributes: {},
        },
        {
          key: 'user2',
          email: 'user2@example.com',
          role_assignments: [{ role: 'user', tenant: TEST_ORG_KEY }],
          attributes: {},
        },
      ];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      await sdk.bulkCreateUsers(users);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bulk/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ operations: users }),
        })
      );
    });

    it('should perform bulk user deletion', async () => {
      const userIds = ['user1', 'user2', 'user3'];

      mockFetch.mockResolvedValueOnce(
        createMockSuccessResponse(mockResponseBodies.emptyObject)
      );

      await sdk.bulkDeleteUsers(userIds);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/bulk/users'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ idents: userIds }),
        })
      );
    });
  });

  describe('Optimistic Create Operations', () => {
    describe('tryCreateResourceInstance', () => {
      it('should create resource instance and return true on success', async () => {
        const createdResource = {
          resource_id: 'created-resource-id',
          key: 'test-key',
          tenant: TEST_ORG_KEY,
          resource: 'rs_node',
          id: 'test-id',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          attributes: { ObjectType: 'risk' },
        };

        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(createdResource)
        );

        const result = await sdk.tryCreateResourceInstance({
          key: 'test-key',
          resource: 'rs_node',
          tenant: TEST_ORG_KEY,
          attributes: { ObjectType: 'risk' },
        });

        expect(result).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/resource_instances'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              key: 'test-key',
              resource: 'rs_node',
              tenant: TEST_ORG_KEY,
              attributes: { ObjectType: 'risk' },
            }),
          })
        );
      });

      it('should return false when resource already exists (409 Conflict)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 409,
          statusText: 'Conflict',
          json: () => Promise.resolve({ detail: 'Resource already exists' }),
        } as Response);

        const result = await sdk.tryCreateResourceInstance({
          key: 'existing-key',
          resource: 'rs_node',
          tenant: TEST_ORG_KEY,
        });

        expect(result).toBe(false);
        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'existing-key',
            resource: 'rs_node',
            tenant: TEST_ORG_KEY,
          }),
          'Resource instance already exists (409 Conflict)'
        );
      });

      it('should throw error for non-409 errors', async () => {
        // 400 errors are not retryable
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ detail: 'Bad request' }),
        } as Response);

        await expect(
          sdk.tryCreateResourceInstance({
            key: 'test-key',
            resource: 'rs_node',
            tenant: TEST_ORG_KEY,
          })
        ).rejects.toThrow('HTTP 400: Bad Request');
      });
    });

    describe('tryCreateUser', () => {
      it('should create user successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        );

        await sdk.tryCreateUser({ key: TEST_USER_ID });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/users'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              key: TEST_USER_ID,
            }),
          })
        );
      });

      it('should handle 409 Conflict gracefully without throwing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 409,
          statusText: 'Conflict',
          json: () => Promise.resolve({ detail: 'User already exists' }),
        } as Response);

        await sdk.tryCreateUser({ key: TEST_USER_ID });

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({ key: TEST_USER_ID }),
          'User already exists (409 Conflict)'
        );
      });

      it('should throw error for non-409 errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ detail: 'Bad request' }),
        } as Response);

        await expect(sdk.tryCreateUser({ key: TEST_USER_ID })).rejects.toThrow(
          'HTTP 400: Bad Request'
        );
      });
    });

    describe('tryDeleteUser', () => {
      it('should delete user successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        );

        await sdk.tryDeleteUser({ key: TEST_USER_ID });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`/users/${TEST_USER_ID}`),
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      it('should handle 404 Not Found gracefully without throwing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ detail: 'User not found' }),
        } as Response);

        await sdk.tryDeleteUser({ key: TEST_USER_ID });

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({ key: TEST_USER_ID }),
          'User does not exist (404 Not Found)'
        );
      });

      it('should throw error for non-404 errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ detail: 'Bad request' }),
        } as Response);

        await expect(sdk.tryDeleteUser({ key: TEST_USER_ID })).rejects.toThrow(
          'HTTP 400: Bad Request'
        );
      });
    });

    describe('tryCreateRelationshipTuple', () => {
      it('should create relationship tuple successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        );

        await sdk.tryCreateRelationshipTuple({
          subject: 'rs_node:parent-id',
          relation: 'rs_parent',
          object: 'rs_node:child-id',
          tenant: TEST_ORG_KEY,
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/relationship_tuples'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              subject: 'rs_node:parent-id',
              relation: 'rs_parent',
              object: 'rs_node:child-id',
              tenant: TEST_ORG_KEY,
            }),
          })
        );
      });

      it('should handle 409 Conflict gracefully without throwing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 409,
          statusText: 'Conflict',
          json: () =>
            Promise.resolve({ detail: 'Relationship already exists' }),
        } as Response);

        await sdk.tryCreateRelationshipTuple({
          subject: 'rs_node:parent-id',
          relation: 'rs_parent',
          object: 'rs_node:child-id',
          tenant: TEST_ORG_KEY,
        });

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: 'rs_node:parent-id',
            relation: 'rs_parent',
            object: 'rs_node:child-id',
            tenant: TEST_ORG_KEY,
          }),
          'Relationship tuple already exists (409 Conflict)'
        );
      });

      it('should throw error for non-409 errors', async () => {
        // 400 errors are not retryable
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ detail: 'Bad request' }),
        } as Response);

        await expect(
          sdk.tryCreateRelationshipTuple({
            subject: 'rs_node:parent-id',
            relation: 'rs_parent',
            object: 'rs_node:child-id',
            tenant: TEST_ORG_KEY,
          })
        ).rejects.toThrow('HTTP 400: Bad Request');
      });
    });
  });

  describe('Optimistic Delete Operations', () => {
    describe('tryDeleteRelationshipTuple', () => {
      it('should delete relationship tuple successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        );

        await sdk.tryDeleteRelationshipTuple({
          subject: 'rs_node:parent-id',
          relation: 'rs_parent',
          object: 'rs_node:child-id',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/relationship_tuples'),
          expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({
              subject: 'rs_node:parent-id',
              relation: 'rs_parent',
              object: 'rs_node:child-id',
            }),
          })
        );
      });

      it('should handle 404 Not Found gracefully without throwing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ detail: 'Relationship not found' }),
        } as Response);

        await sdk.tryDeleteRelationshipTuple({
          subject: 'rs_node:parent-id',
          relation: 'rs_parent',
          object: 'rs_node:child-id',
        });

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: 'rs_node:parent-id',
            relation: 'rs_parent',
            object: 'rs_node:child-id',
          }),
          'Relationship tuple does not exist (404 Not Found)'
        );
      });

      it('should throw error for non-404 errors', async () => {
        // 400 errors are not retryable
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ detail: 'Bad request' }),
        } as Response);

        await expect(
          sdk.tryDeleteRelationshipTuple({
            subject: 'rs_node:parent-id',
            relation: 'rs_parent',
            object: 'rs_node:child-id',
          })
        ).rejects.toThrow('HTTP 400: Bad Request');
      });
    });

    describe('tryDeleteResourceInstance', () => {
      it('should delete resource instance successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        );

        await sdk.tryDeleteResourceInstance({
          instanceKey: 'rs_node:test-id',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/resource_instances/rs_node:test-id'),
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      it('should handle 404 Not Found gracefully without throwing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () =>
            Promise.resolve({ detail: 'Resource instance not found' }),
        } as Response);

        await sdk.tryDeleteResourceInstance({
          instanceKey: 'rs_node:test-id',
        });

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            instanceKey: 'rs_node:test-id',
          }),
          'Resource instance does not exist (404 Not Found)'
        );
      });

      it('should throw error for non-404 errors', async () => {
        // 400 errors are not retryable
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ detail: 'Bad request' }),
        } as Response);

        await expect(
          sdk.tryDeleteResourceInstance({
            instanceKey: 'rs_node:test-id',
          })
        ).rejects.toThrow('HTTP 400: Bad Request');
      });
    });

    describe('tryUnassignRole', () => {
      it('should unassign role successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockSuccessResponse(mockResponseBodies.emptyObject)
        );

        await sdk.tryUnassignRole({
          resource_instance: 'rs_node:test-id',
          role: 'Owner',
          tenant: TEST_ORG_KEY,
          user: TEST_USER_ID,
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/role_assignments'),
          expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({
              resource_instance: 'rs_node:test-id',
              role: 'Owner',
              tenant: TEST_ORG_KEY,
              user: TEST_USER_ID,
            }),
          })
        );
      });

      it('should handle 404 Not Found gracefully without throwing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ detail: 'Role assignment not found' }),
        } as Response);

        await sdk.tryUnassignRole({
          resource_instance: 'rs_node:test-id',
          role: 'Owner',
          tenant: TEST_ORG_KEY,
          user: TEST_USER_ID,
        });

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            resource_instance: 'rs_node:test-id',
            role: 'Owner',
            tenant: TEST_ORG_KEY,
            user: TEST_USER_ID,
          }),
          'Role assignment does not exist (404 Not Found)'
        );
      });

      it('should throw error for non-404 errors', async () => {
        // 400 errors are not retryable
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ detail: 'Bad request' }),
        } as Response);

        await expect(
          sdk.tryUnassignRole({
            resource_instance: 'rs_node:test-id',
            role: 'Owner',
            tenant: TEST_ORG_KEY,
            user: TEST_USER_ID,
          })
        ).rejects.toThrow('HTTP 400: Bad Request');
      });
    });
  });
});
