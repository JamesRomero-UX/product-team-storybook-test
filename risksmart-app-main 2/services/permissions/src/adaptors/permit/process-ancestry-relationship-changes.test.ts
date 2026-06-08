import type { Logger } from '@aws-lambda-powertools/logger';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type {
  CreateAncestryRelationshipChangesProcessorProps,
  ProcessAncestryRelationshipChangesParams,
} from './process-ancestry-relationship-changes';
import { createAncestryRelationshipChangesProcessor } from './process-ancestry-relationship-changes';

describe('process-ancestry-relationship-changes', () => {
  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockTryCreateRelationshipTuple = vi.fn();
  const mockTryDeleteRelationshipTuple = vi.fn();

  const builderProps: CreateAncestryRelationshipChangesProcessorProps = {
    logger: mockLogger as Logger,
    tryCreateRelationshipTuple: mockTryCreateRelationshipTuple,
    tryDeleteRelationshipTuple: mockTryDeleteRelationshipTuple,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Link operation', () => {
    const linkParams: ProcessAncestryRelationshipChangesParams = {
      op: PermissionsOperation.Link,
      orgKey: 'test-org',
      id: 'test-object-id',
      objectType: 'test-object-type',
    };

    it('should create parent relationships', async () => {
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...linkParams,
        parents: [
          { parentId: 'parent-1', parentType: 'rs_node' },
          { parentId: 'parent-2', parentType: 'rs_node' },
        ],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(2);
      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-2',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
      expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should create child relationships', async () => {
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...linkParams,
        children: [
          { childId: 'child-1', childType: 'rs_node' },
          { childId: 'child-2', childType: 'rs_node' },
        ],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(2);
      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'rs_node:child-1',
        tenant: 'test-org',
      });
      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'rs_node:child-2',
        tenant: 'test-org',
      });
      expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should create both parent and child relationships', async () => {
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...linkParams,
        parents: [{ parentId: 'parent-1', parentType: 'rs_node' }],
        children: [{ childId: 'child-1', childType: 'rs_node' }],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(2);
      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'rs_node:child-1',
        tenant: 'test-org',
      });
      expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should handle empty parents array', async () => {
      const params = {
        ...linkParams,
        parents: [],
        children: [{ childId: 'child-1', childType: 'rs_node' }],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(1);
      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'rs_node:child-1',
        tenant: 'test-org',
      });
    });

    it('should handle empty children array', async () => {
      const params = {
        ...linkParams,
        parents: [{ parentId: 'parent-1', parentType: 'rs_node' }],
        children: [],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledTimes(1);
      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
    });

    it('should handle undefined parents and children', async () => {
      const params = linkParams;
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
      expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should handle relationship tuple already existing gracefully', async () => {
      mockTryCreateRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...linkParams,
        parents: [{ parentId: 'parent-1', parentType: 'rs_node' }],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryCreateRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
        tenant: 'test-org',
      });
      // No error thrown, gracefully handled
    });
  });

  describe('Unlink operation', () => {
    const unlinkParams: ProcessAncestryRelationshipChangesParams = {
      op: PermissionsOperation.Unlink,
      orgKey: 'test-org',
      id: 'test-object-id',
      objectType: 'test-object-type',
    };

    it('should delete parent relationships', async () => {
      mockTryDeleteRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...unlinkParams,
        parents: [
          { parentId: 'parent-1', parentType: 'rs_node' },
          { parentId: 'parent-2', parentType: 'rs_node' },
        ],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(2);
      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
      });
      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-2',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
      });
      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should delete child relationships', async () => {
      mockTryDeleteRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...unlinkParams,
        children: [
          { childId: 'child-1', childType: 'rs_node' },
          { childId: 'child-2', childType: 'rs_node' },
        ],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(2);
      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'rs_node:child-1',
      });
      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'rs_node:child-2',
      });
      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should delete both parent and child relationships', async () => {
      mockTryDeleteRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...unlinkParams,
        parents: [{ parentId: 'parent-1', parentType: 'rs_node' }],
        children: [{ childId: 'child-1', childType: 'rs_node' }],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(2);
      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'rs_node:child-1',
      });
      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
      });
      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should handle empty parents array', async () => {
      const params = {
        ...unlinkParams,
        parents: [],
        children: [{ childId: 'child-1', childType: 'rs_node' }],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(1);
      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:test-object-id',
        relation: 'rs_parent',
        object: 'rs_node:child-1',
      });
    });

    it('should handle empty children array', async () => {
      const params = {
        ...unlinkParams,
        parents: [{ parentId: 'parent-1', parentType: 'rs_node' }],
        children: [],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledTimes(1);
      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
      });
    });

    it('should handle undefined parents and children', async () => {
      const params = unlinkParams;
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryCreateRelationshipTuple).not.toHaveBeenCalled();
      expect(mockTryDeleteRelationshipTuple).not.toHaveBeenCalled();
    });

    it('should handle relationship tuple not existing gracefully', async () => {
      mockTryDeleteRelationshipTuple.mockResolvedValue(undefined);
      const params = {
        ...unlinkParams,
        parents: [{ parentId: 'parent-1', parentType: 'rs_node' }],
      };
      const processAncestryRelationshipChanges =
        createAncestryRelationshipChangesProcessor(builderProps);

      await processAncestryRelationshipChanges(params);

      expect(mockTryDeleteRelationshipTuple).toHaveBeenCalledWith({
        subject: 'rs_node:parent-1',
        relation: 'rs_parent',
        object: 'rs_node:test-object-id',
      });
      // No error thrown, gracefully handled
    });
  });
});
