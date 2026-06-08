import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createGetExistingRelationships } from './get-existing-relationships';

describe('get-existing-relationships', () => {
  const mockListRoleAssignments = vi.fn();
  const mockListRelationshipTuples = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGetExistingRelationships', () => {
    it('should fetch role assignments and relationship tuples in parallel', async () => {
      mockListRoleAssignments.mockResolvedValue([
        { user: 'user-1', role: 'Owner', id: 'ra-1' },
        { user: 'user-2', role: 'Contributor', id: 'ra-2' },
      ]);
      mockListRelationshipTuples.mockResolvedValue([
        { subject: 'owner_group:group-1', relation: 'owner', id: 'rt-1' },
        {
          subject: 'contributor_group:group-2',
          relation: 'contributor',
          id: 'rt-2',
        },
      ]);

      const getExistingRelationships = createGetExistingRelationships({
        listRoleAssignments: mockListRoleAssignments,
        listRelationshipTuples: mockListRelationshipTuples,
      });

      const result = await getExistingRelationships({
        objectId: 'object-123',
        orgKey: 'org-1',
      });

      expect(mockListRoleAssignments).toHaveBeenCalledWith({
        resource_instance: 'rs_node:object-123',
        tenant: 'org-1',
      });
      expect(mockListRelationshipTuples).toHaveBeenCalledWith({
        object: 'rs_node:object-123',
        tenant: 'org-1',
      });

      expect(result).toEqual({
        roleAssignments: [
          { user: 'user-1', role: 'Owner' },
          { user: 'user-2', role: 'Contributor' },
        ],
        groupRelationships: [
          { subject: 'owner_group:group-1', relation: 'owner' },
          { subject: 'contributor_group:group-2', relation: 'contributor' },
        ],
      });
    });

    it('should return empty arrays when no role assignments or relationship tuples exist', async () => {
      mockListRoleAssignments.mockResolvedValue([]);
      mockListRelationshipTuples.mockResolvedValue([]);

      const getExistingRelationships = createGetExistingRelationships({
        listRoleAssignments: mockListRoleAssignments,
        listRelationshipTuples: mockListRelationshipTuples,
      });

      const result = await getExistingRelationships({
        objectId: 'object-456',
        orgKey: 'org-2',
      });

      expect(result).toEqual({
        roleAssignments: [],
        groupRelationships: [],
      });
    });

    it('should map role assignments to only user and role fields', async () => {
      mockListRoleAssignments.mockResolvedValue([
        {
          id: 'ra-1',
          user: 'user-1',
          role: 'Owner',
          tenant: 'org-1',
          resource_instance: 'rs_node:object-123',
          resource_id: 'resource-id',
          organization_id: 'org-id',
          project_id: 'project-id',
          environment_id: 'env-id',
          created_at: '2025-01-01T00:00:00Z',
        },
      ]);
      mockListRelationshipTuples.mockResolvedValue([]);

      const getExistingRelationships = createGetExistingRelationships({
        listRoleAssignments: mockListRoleAssignments,
        listRelationshipTuples: mockListRelationshipTuples,
      });

      const result = await getExistingRelationships({
        objectId: 'object-123',
        orgKey: 'org-1',
      });

      expect(result.roleAssignments).toEqual([
        { user: 'user-1', role: 'Owner' },
      ]);
    });

    it('should map relationship tuples to only subject and relation fields', async () => {
      mockListRoleAssignments.mockResolvedValue([]);
      mockListRelationshipTuples.mockResolvedValue([
        {
          id: 'rt-1',
          subject: 'owner_group:group-1',
          relation: 'owner',
          object: 'rs_node:object-123',
          subject_id: 'subject-id',
          relation_id: 'relation-id',
          object_id: 'object-id',
          tenant_id: 'org-1',
          organization_id: 'org-id',
          project_id: 'project-id',
          environment_id: 'env-id',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ]);

      const getExistingRelationships = createGetExistingRelationships({
        listRoleAssignments: mockListRoleAssignments,
        listRelationshipTuples: mockListRelationshipTuples,
      });

      const result = await getExistingRelationships({
        objectId: 'object-123',
        orgKey: 'org-1',
      });

      expect(result.groupRelationships).toEqual([
        { subject: 'owner_group:group-1', relation: 'owner' },
      ]);
    });

    it('should propagate errors from listRoleAssignments', async () => {
      const error = new Error('Failed to fetch role assignments');
      mockListRoleAssignments.mockRejectedValue(error);
      mockListRelationshipTuples.mockResolvedValue([]);

      const getExistingRelationships = createGetExistingRelationships({
        listRoleAssignments: mockListRoleAssignments,
        listRelationshipTuples: mockListRelationshipTuples,
      });

      await expect(
        getExistingRelationships({
          objectId: 'object-123',
          orgKey: 'org-1',
        })
      ).rejects.toThrow('Failed to fetch role assignments');
    });

    it('should propagate errors from listRelationshipTuples', async () => {
      const error = new Error('Failed to fetch relationship tuples');
      mockListRoleAssignments.mockResolvedValue([]);
      mockListRelationshipTuples.mockRejectedValue(error);

      const getExistingRelationships = createGetExistingRelationships({
        listRoleAssignments: mockListRoleAssignments,
        listRelationshipTuples: mockListRelationshipTuples,
      });

      await expect(
        getExistingRelationships({
          objectId: 'object-123',
          orgKey: 'org-1',
        })
      ).rejects.toThrow('Failed to fetch relationship tuples');
    });

    it('should use RS_NODE_ID format for instance key', async () => {
      mockListRoleAssignments.mockResolvedValue([]);
      mockListRelationshipTuples.mockResolvedValue([]);

      const getExistingRelationships = createGetExistingRelationships({
        listRoleAssignments: mockListRoleAssignments,
        listRelationshipTuples: mockListRelationshipTuples,
      });

      await getExistingRelationships({
        objectId: 'my-object-uuid',
        orgKey: 'my-org',
      });

      expect(mockListRoleAssignments).toHaveBeenCalledWith(
        expect.objectContaining({
          resource_instance: 'rs_node:my-object-uuid',
        })
      );
      expect(mockListRelationshipTuples).toHaveBeenCalledWith(
        expect.objectContaining({
          object: 'rs_node:my-object-uuid',
        })
      );
    });
  });
});
