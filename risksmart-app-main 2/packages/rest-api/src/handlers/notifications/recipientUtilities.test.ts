import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import {
  getAncestorContributors,
  getObjectContributors,
  getObjectContributorsGroups,
  getObjectDepartments,
  getObjectModifiedUser,
  getObjectOwnerGroups,
  getObjectOwners,
  getOrgRiskManagerIds,
  getRecipientObjects,
} from './recipientUtilities';

// Mock the GraphQL client
vi.mock('src/graphqlClient', () => ({
  getHasuraClient: vi.fn(),
}));

// Mock the config
vi.mock('sst/node/config', () => ({
  Config: {
    HASURA_ADMIN_SECRET: 'test-secret',
  },
}));

// Mock the logger
vi.mock('../../logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('recipientUtilities', () => {
  let mockQuery: Mock;
  let mockGetHasuraClient: Mock;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockQuery = vi.fn();
    mockGetHasuraClient = vi.fn().mockReturnValue({
      query: mockQuery,
    });
    const { getHasuraClient } = vi.mocked(await import('src/graphqlClient'));
    getHasuraClient.mockImplementation(mockGetHasuraClient);
  });

  describe('getObjectOwners', () => {
    it('should filter out archived users', async () => {
      mockQuery.mockResolvedValue({
        data: {
          owner: [
            {
              user: {
                Id: 'active-user-1',
                Email: 'active@example.com',
                UserName: 'Active User',
                Status: 'active',
              },
            },
            {
              user: {
                Id: 'archived-user-1',
                Email: 'archived@example.com',
                UserName: 'Archived User',
                Status: 'archived',
              },
            },
          ],
        },
        errors: null,
      });

      const result = await getObjectOwners({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('active-user-1');
      expect(result[0]?.email).toBe('active@example.com');
      expect(result[0]?.name).toBe('Active User');
    });

    it('should handle empty results', async () => {
      mockQuery.mockResolvedValue({
        data: {
          owner: [],
        },
        errors: null,
      });

      const result = await getObjectOwners({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(0);
    });

    it('should throw error when query fails', async () => {
      mockQuery.mockResolvedValue({
        data: null,
        errors: [{ message: 'Database error' }],
      });

      await expect(
        getObjectOwners({
          objectId: 'test-object-id',
          tenant: 'test-tenant',
        })
      ).rejects.toThrow('Failed to get owners');
    });
  });

  describe('getObjectContributors', () => {
    it('should filter out archived users', async () => {
      mockQuery.mockResolvedValue({
        data: {
          contributor: [
            {
              user: {
                Id: 'active-user-1',
                Email: 'active@example.com',
                UserName: 'Active User',
                Status: 'active',
              },
            },
            {
              user: {
                Id: 'archived-user-1',
                Email: 'archived@example.com',
                UserName: 'Archived User',
                Status: 'archived',
              },
            },
          ],
        },
        errors: null,
      });

      const result = await getObjectContributors({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('active-user-1');
    });
  });

  describe('getAncestorContributors', () => {
    it('should filter out archived users but keep groups', async () => {
      mockQuery.mockResolvedValue({
        data: {
          ancestor_contributor: [
            {
              AncestorId: 'ancestor-1',
              Id: 'contributor-1',
              user: {
                Id: 'active-user-1',
                Email: 'active@example.com',
                UserName: 'Active User',
                Status: 'active',
              },
              user_group: null,
            },
            {
              AncestorId: 'ancestor-2',
              Id: 'contributor-2',
              user: {
                Id: 'archived-user-1',
                Email: 'archived@example.com',
                UserName: 'Archived User',
                Status: 'archived',
              },
              user_group: null,
            },
            {
              AncestorId: 'ancestor-3',
              Id: 'contributor-3',
              user: null,
              user_group: {
                Id: 'group-1',
                Email: 'group@example.com',
                Name: 'Test Group',
              },
            },
          ],
        },
        errors: null,
      });

      const result = await getAncestorContributors({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(2); // One active user + one group
      expect(result.find((r) => r.group === false)?.id).toBe('active-user-1');
      expect(result.find((r) => r.group === true)?.id).toBe('group-1');
    });
  });

  describe('getObjectModifiedUser', () => {
    it('should return archived users since we want to show who performed the action', async () => {
      mockQuery.mockResolvedValue({
        data: {
          user: [
            {
              Id: 'archived-user-1',
              Email: 'archived@example.com',
              UserName: 'Archived User',
              Status: 'archived',
            },
          ],
        },
        errors: null,
      });

      const result = await getObjectModifiedUser({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
        orgKey: 'test-org',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('archived-user-1');
    });
  });

  describe('getOrgRiskManagerIds', () => {
    it('should filter out archived users', async () => {
      mockQuery.mockResolvedValue({
        data: {
          user: [
            {
              Id: 'active-user-1',
              Status: 'active',
            },
            {
              Id: 'archived-user-1',
              Status: 'archived',
            },
          ],
        },
        errors: null,
      });

      const result = await getOrgRiskManagerIds({
        orgKey: 'test-org',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('active-user-1');
    });
  });

  describe('getObjectDepartments', () => {
    it('should return department type IDs', async () => {
      mockQuery.mockResolvedValue({
        data: {
          department: [
            {
              type: {
                DepartmentTypeId: 'dept-1',
              },
            },
            {
              type: {
                DepartmentTypeId: 'dept-2',
              },
            },
            {
              type: null, // This should be filtered out
            },
          ],
        },
        errors: null,
      });

      const result = await getObjectDepartments({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual(['dept-1', 'dept-2']);
    });

    it('should handle empty results', async () => {
      mockQuery.mockResolvedValue({
        data: {
          department: [],
        },
        errors: null,
      });

      const result = await getObjectDepartments({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(0);
    });

    it('should throw error when query fails', async () => {
      mockQuery.mockResolvedValue({
        data: null,
        errors: [{ message: 'Database error' }],
      });

      await expect(
        getObjectDepartments({
          objectId: 'test-object-id',
          tenant: 'test-tenant',
        })
      ).rejects.toThrow('Failed to get departments');
    });
  });

  describe('getObjectOwnerGroups', () => {
    it('should return owner groups', async () => {
      mockQuery.mockResolvedValue({
        data: {
          owner_group: [
            {
              group: {
                Id: 'group-1',
                Email: 'group1@example.com',
                Name: 'Group 1',
              },
            },
            {
              group: {
                Id: 'group-2',
                Email: 'group2@example.com',
                Name: 'Group 2',
              },
            },
          ],
        },
        errors: null,
      });

      const result = await getObjectOwnerGroups({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('group-1');
      expect(result[0]?.email).toBe('group1@example.com');
      expect(result[0]?.name).toBe('Group 1');
    });

    it('should throw error when query fails', async () => {
      mockQuery.mockResolvedValue({
        data: null,
        errors: [{ message: 'Database error' }],
      });

      await expect(
        getObjectOwnerGroups({
          objectId: 'test-object-id',
          tenant: 'test-tenant',
        })
      ).rejects.toThrow('Failed to get owner groups');
    });
  });

  describe('getObjectContributorsGroups', () => {
    it('should return contributor groups', async () => {
      mockQuery.mockResolvedValue({
        data: {
          contributor_group: [
            {
              group: {
                Id: 'group-1',
                Email: 'group1@example.com',
                Name: 'Group 1',
              },
            },
          ],
        },
        errors: null,
      });

      const result = await getObjectContributorsGroups({
        objectId: 'test-object-id',
        tenant: 'test-tenant',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('group-1');
      expect(result[0]?.email).toBe('group1@example.com');
      expect(result[0]?.name).toBe('Group 1');
    });

    it('should throw error when query fails', async () => {
      mockQuery.mockResolvedValue({
        data: null,
        errors: [{ message: 'Database error' }],
      });

      await expect(
        getObjectContributorsGroups({
          objectId: 'test-object-id',
          tenant: 'test-tenant',
        })
      ).rejects.toThrow('Failed to get contributors');
    });
  });

  describe('getRecipientObjects', () => {
    it('should return recipient objects with departments', async () => {
      const result = await getRecipientObjects({
        objectId: 'test-object',
        orgKey: 'test-org',
        eventKey: 'test-event',
        departmentIds: ['dept-1', 'dept-2'],
      });

      expect(result).toHaveLength(4); // event + object + 2 departments
      expect(result[0]).toEqual({
        id: 'test-org-test-event',
        collection: 'org-events',
        name: 'test-org-test-event',
        org_id: 'test-org',
      });
      expect(result[1]).toEqual({
        id: 'test-org-test-event-test-object',
        collection: 'org-events-objects',
        name: 'test-org-test-event-test-object',
        org_id: 'test-org',
      });
    });

    it('should return recipient objects without departments', async () => {
      const result = await getRecipientObjects({
        objectId: 'test-object',
        orgKey: 'test-org',
        eventKey: 'test-event',
      });

      expect(result).toHaveLength(2); // event + object only
    });
  });
});
