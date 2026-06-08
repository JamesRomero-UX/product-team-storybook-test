import type { Logger } from '@aws-lambda-powertools/logger';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type {
  CreateGenericPermitResourceProcessorProps,
  ProcessGenericPermitResourceParams,
} from './process-generic-permit-resource';
import { createGenericPermitResourceProcessor } from './process-generic-permit-resource';

describe('process-generic-permit-resource', () => {
  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockListRelationshipTuples = vi.fn();

  const mockTryCreateResourceInstance = vi.fn();
  const mockTryDeleteResourceInstance = vi.fn();
  const mockTryCreateRelationshipTuple = vi.fn();
  const mockTryDeleteRelationshipTuple = vi.fn();

  const builderProps: CreateGenericPermitResourceProcessorProps = {
    logger: mockLogger as Logger,
    tryCreateResourceInstance: mockTryCreateResourceInstance,
    tryDeleteResourceInstance: mockTryDeleteResourceInstance,
    tryCreateRelationshipTuple: mockTryCreateRelationshipTuple,
    tryDeleteRelationshipTuple: mockTryDeleteRelationshipTuple,
    listRelationshipTuples: mockListRelationshipTuples,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Insert operation', () => {
    const insertParams: ProcessGenericPermitResourceParams = {
      op: PermissionsOperation.Insert,
      orgKey: 'test-org',
      id: 'test-object-id',
      objectType: 'test-object-type',
    };

    it('should return early and not process any relationships when resource instance already exists', async () => {
      mockTryCreateResourceInstance.mockResolvedValueOnce(false);

      const params = {
        ...insertParams,
        parents: [{ parentId: 'parent-1', parentType: 'parent_type' }],
      };
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(params);

      expect(mockTryCreateResourceInstance).toHaveBeenCalledWith({
        key: 'test-object-id',
        resource: 'rs_node',
        tenant: 'test-org',
        attributes: {
          ObjectType: 'test-object-type',
        },
      });
      // Resource already exists, processor returns early - no relationships processed
      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should create new resource instance', async () => {
      mockTryCreateResourceInstance.mockResolvedValueOnce(true);

      const params = insertParams;
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(params);

      expect(mockTryCreateResourceInstance).toHaveBeenCalledWith({
        key: 'test-object-id',
        resource: 'rs_node',
        tenant: 'test-org',
        attributes: {
          ObjectType: 'test-object-type',
        },
      });
    });

    it('should create root relationship tuple for root object types', async () => {
      mockTryCreateResourceInstance.mockResolvedValueOnce(true);
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      const params = insertParams;
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource({ ...params, objectType: 'risk' }); //risk is a root object type

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:risk-test-org',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
    });

    it('should not create root relationship tuple for non-root object types', async () => {
      mockTryCreateResourceInstance.mockResolvedValue(true);

      const params = insertParams;
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(params);

      // No root relationship for non-root types
      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should create parent relationships', async () => {
      mockTryCreateResourceInstance.mockResolvedValue(true);
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...insertParams,
        parents: [{ parentId: 'parent-1', parentType: 'parent_type' }],
      };
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'parent_type:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
    });

    it('should create child relationships', async () => {
      mockTryCreateResourceInstance.mockResolvedValue(true);
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...insertParams,
        children: [{ childId: 'child-1', childType: 'child_type' }],
      };
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'child_type:child-1',
        tenant: 'test-org',
      });
    });

    it('should handle relationship tuple already existing gracefully', async () => {
      mockTryCreateResourceInstance.mockResolvedValueOnce(true);
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...insertParams,
        parents: [{ parentId: 'parent-1', parentType: 'parent_type' }],
      };
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'parent_type:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
      // No error thrown, gracefully handled
    });

    it('should handle empty parents array', async () => {
      mockTryCreateResourceInstance.mockResolvedValueOnce(true);

      const params = {
        ...insertParams,
        Parents: [],
      };
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(params);

      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should handle empty children array', async () => {
      mockTryCreateResourceInstance.mockResolvedValueOnce(true);

      const params = {
        ...insertParams,
        Children: [],
      };
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(params);

      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
    });
  });

  describe('Delete operation', () => {
    const deleteParams: ProcessGenericPermitResourceParams = {
      op: PermissionsOperation.Delete,
      orgKey: 'test-org',
      id: 'test-object-id',
      objectType: 'test-object-type',
    };

    it('should delete the resource instance', async () => {
      mockTryDeleteResourceInstance.mockResolvedValue(undefined);

      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource(deleteParams);

      expect(mockTryDeleteResourceInstance).toHaveBeenCalledWith({
        instanceKey: 'rs_node:test-object-id',
      });
      expect(mockTryCreateResourceInstance).not.toHaveBeenCalled();
      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
      expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();
    });
  });

  describe('Update operation', () => {
    const updateParams: ProcessGenericPermitResourceParams = {
      op: PermissionsOperation.Update,
      orgKey: 'test-org',
      id: 'test-object-id',
      objectType: 'test-object-type',
    };

    beforeEach(() => {
      mockListRelationshipTuples.mockResolvedValue([]);
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      mockTryDeleteRelationshipTuple.mockResolvedValue(undefined);
    });

    it('should not create resource instance or root relationship on update', async () => {
      const processGenericPermitResource =
        createGenericPermitResourceProcessor(builderProps);

      await processGenericPermitResource({
        ...updateParams,
        objectType: 'risk',
      });

      expect(mockTryCreateResourceInstance).not.toHaveBeenCalled();
      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('rs_node:risk-'),
        })
      );
    });

    describe('parents', () => {
      it('should remove stale parent relationships and create new ones', async () => {
        mockListRelationshipTuples
          .mockResolvedValueOnce([
            {
              subject: 'rs_node:stale-parent-id',
              relation: 'rs_parent',
              object: 'rs_node:test-object-id',
            },
          ])
          .mockResolvedValueOnce([]);

        const params = {
          ...updateParams,
          parents: [{ parentId: 'new-parent-id', parentType: 'rs_node' }],
        };

        const processGenericPermitResource =
          createGenericPermitResourceProcessor(builderProps);

        await processGenericPermitResource(params);

        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'rs_node:stale-parent-id',
          relation: 'rs_parent',
          object: 'rs_node:test-object-id',
        });

        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'rs_node:new-parent-id',
          relation: 'rs_parent',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
      });

      it('should remove stale parent relationships without creating new ones if not needed', async () => {
        mockListRelationshipTuples
          .mockResolvedValueOnce([
            {
              subject: 'rs_node:stale-parent-id',
              relation: 'rs_parent',
              object: 'rs_node:test-object-id',
            },
          ])
          .mockResolvedValueOnce([]);

        const params = {
          ...updateParams,
          parents: [],
        };

        const processGenericPermitResource =
          createGenericPermitResourceProcessor(builderProps);

        await processGenericPermitResource(params);

        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'rs_node:stale-parent-id',
          relation: 'rs_parent',
          object: 'rs_node:test-object-id',
        });
        expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
      });

      it('should not remove stale parent relationships if none present but create new ones as needed', async () => {
        mockListRelationshipTuples
          .mockResolvedValueOnce([]) // No existing parent relationships
          .mockResolvedValueOnce([]);

        const params = {
          ...updateParams,
          parents: [{ parentId: 'new-parent-id', parentType: 'rs_node' }],
        };

        const processGenericPermitResource =
          createGenericPermitResourceProcessor(builderProps);

        await processGenericPermitResource(params);

        expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();

        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'rs_node:new-parent-id',
          relation: 'rs_parent',
          object: 'rs_node:test-object-id',
          tenant: 'test-org',
        });
      });
    });

    describe('children', () => {
      it('should remove stale child relationships and create new ones', async () => {
        mockListRelationshipTuples
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([
            {
              subject: 'rs_node:test-object-id',
              relation: 'rs_parent',
              object: 'rs_node:stale-child-id',
            },
          ]);

        const params = {
          ...updateParams,
          children: [{ childId: 'new-child-id', childType: 'rs_node' }],
        };

        const processGenericPermitResource =
          createGenericPermitResourceProcessor(builderProps);

        await processGenericPermitResource(params);

        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'rs_node:test-object-id',
          relation: 'rs_parent',
          object: 'rs_node:stale-child-id',
        });

        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'rs_node:test-object-id',
          relation: 'rs_parent',
          object: 'rs_node:new-child-id',
          tenant: 'test-org',
        });
      });

      it('should remove stale child relationships without creating new ones if not needed', async () => {
        mockListRelationshipTuples
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([
            {
              subject: 'rs_node:test-object-id',
              relation: 'rs_parent',
              object: 'rs_node:stale-child-id',
            },
          ]);

        const params = {
          ...updateParams,
          children: [],
        };

        const processGenericPermitResource =
          createGenericPermitResourceProcessor(builderProps);

        await processGenericPermitResource(params);

        expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
          subject: 'rs_node:test-object-id',
          relation: 'rs_parent',
          object: 'rs_node:stale-child-id',
        });
        expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
      });

      it('should not remove stale child relationships if none present but create new ones as needed', async () => {
        mockListRelationshipTuples
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]); // No existing child relationships

        const params = {
          ...updateParams,
          children: [{ childId: 'new-child-id', childType: 'rs_node' }],
        };

        const processGenericPermitResource =
          createGenericPermitResourceProcessor(builderProps);

        await processGenericPermitResource(params);

        expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();

        expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
          subject: 'rs_node:test-object-id',
          relation: 'rs_parent',
          object: 'rs_node:new-child-id',
          tenant: 'test-org',
        });
      });
    });
  });
});
