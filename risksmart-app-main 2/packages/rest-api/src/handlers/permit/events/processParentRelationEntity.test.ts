import type { PermitSDK } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { processParentRelationEntity } from './processParentRelationEntity';
import { pollForResourceInstance } from './utils';

vi.mock('./utils');

const mockPermit = {
  api: {
    relationshipTuples: {
      list: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
  },
} as unknown as Permit;

const mockPermitRsSDK = {
  resourceInstanceExists: vi.fn(),
} as unknown as PermitSDK;

beforeEach(() => {
  vi.mocked(pollForResourceInstance).mockResolvedValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('processParentRelationEntity', () => {
  describe('when RelationshipType is not parent_child', () => {
    it('should skip processing', async () => {
      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'other',
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).not.toHaveBeenCalled();
    });
  });

  describe('when RelationshipType is undefined', () => {
    it('should skip processing', async () => {
      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: undefined,
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).not.toHaveBeenCalled();
    });
  });

  describe('when OP is DELETE', () => {
    it('should skip delete operation if resource does not exist', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(false);

      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.delete).not.toHaveBeenCalled();
    });

    it('should delete relationship tuples if resource exists and has parents', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);
      vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue([
        {
          id: 'tuple-1',
          subject: '',
          relation: '',
          object: '',
          subject_id: '',
          relation_id: '',
          object_id: '',
          tenant_id: '',
          organization_id: '',
          project_id: '',
          environment_id: '',
          created_at: '',
          updated_at: '',
        },
      ]);

      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
        Parents: [
          {
            ParentId: 'parent-1',
            ParentType: 'parent_type',
          },
        ],
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.list).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-id',
        tenant: 'test-org',
      });

      expect(mockPermit.api.relationshipTuples.delete).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-id',
      });
    });

    it('should skip deletion if no relationship tuples exist', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);
      vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue([]);

      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
        Parents: [
          {
            ParentId: 'parent-1',
            ParentType: 'parent_type',
          },
        ],
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.delete).not.toHaveBeenCalled();
    });
  });

  describe('when OP is INSERT or UPDATE', () => {
    it('should throw error if main resource does not exist', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(false);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
      };

      await expect(
        processParentRelationEntity(mockPermit, mockPermitRsSDK, config)
      ).rejects.toThrow('Resource does not exist');
    });

    it('should throw error if parent resource does not exist', async () => {
      vi.mocked(pollForResourceInstance)
        .mockResolvedValueOnce(true) // main resource exists
        .mockResolvedValueOnce(false); // parent resource does not exist

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
        Parents: [
          {
            ParentId: 'parent-1',
            ParentType: 'parent_type',
          },
        ],
      };

      await expect(
        processParentRelationEntity(mockPermit, mockPermitRsSDK, config)
      ).rejects.toThrow('Resource does not exist');
    });

    it('should create relationship tuples if resources exist and no existing relationship', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);
      vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue([]);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
        Parents: [
          {
            ParentId: 'parent-1',
            ParentType: 'parent_type',
          },
        ],
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledWith({
        subject: 'parent_type:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-id',
        tenant: 'test-org',
      });
    });

    it('should skip creation if relationship tuple already exists', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);
      vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue([
        {
          id: 'existing-tuple',
          subject: '',
          relation: '',
          object: '',
          subject_id: '',
          relation_id: '',
          object_id: '',
          tenant_id: '',
          organization_id: '',
          project_id: '',
          environment_id: '',
          created_at: '',
          updated_at: '',
        },
      ]);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
        Parents: [
          {
            ParentId: 'parent-1',
            ParentType: 'parent_type',
          },
        ],
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).not.toHaveBeenCalled();
    });

    it('should handle multiple parents', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);
      vi.mocked(mockPermit.api.relationshipTuples.list).mockResolvedValue([]);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
        Parents: [
          {
            ParentId: 'parent-1',
            ParentType: 'parent_type_1',
          },
          {
            ParentId: 'parent-2',
            ParentType: 'parent_type_2',
          },
        ],
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledTimes(2);
      expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledWith({
        subject: 'parent_type_1:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-id',
        tenant: 'test-org',
      });
      expect(mockPermit.api.relationshipTuples.create).toHaveBeenCalledWith({
        subject: 'parent_type_2:parent-2',
        relation: 'rs_parent',
        object: 'rs_node:test-id',
        tenant: 'test-org',
      });
    });

    it('should handle config with no parents', async () => {
      vi.mocked(pollForResourceInstance).mockResolvedValue(true);

      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-id',
        RelationshipType: 'parent_child',
      };

      await processParentRelationEntity(mockPermit, mockPermitRsSDK, config);

      expect(mockPermit.api.relationshipTuples.create).not.toHaveBeenCalled();
    });
  });
});
