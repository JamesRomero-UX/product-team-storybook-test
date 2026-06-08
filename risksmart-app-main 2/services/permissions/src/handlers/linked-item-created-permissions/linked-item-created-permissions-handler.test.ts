import type { Logger } from '@aws-lambda-powertools/logger';
import {
  LinkedItemEvent,
  RelationshipType,
} from '@risksmart-app/events/src/types/common';
import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { LinkedItemCreatedPermissionsDependencies } from './linked-item-created-permissions-handler';
import { createLinkedItemCreatedPermissionsHandler } from './linked-item-created-permissions-handler';

describe('LinkedItemCreated permissions handler', () => {
  const createMockMetadata = (
    overrides: Partial<OrgUserEventMetadata> = {}
  ): OrgUserEventMetadata => ({
    eventId: 'test-event-id',
    version: '1.0',
    timestamp: '2024-01-01T00:00:00.000Z',
    domain: 'test-domain',
    service: 'test-service',
    correlationId: 'test-correlation-id',
    tenant: 't1',
    orgKey: 'o1',
    userId: 'u1',
    ...overrides,
  });

  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockGetNode = vi.fn();
  const mockEmitPermissionsUpdatedEvent = vi.fn();
  const mockEmitPermissionsUpdateFailedEvent = vi.fn();
  const mockProcessAncestryRelationshipChanges = vi.fn();

  const mockDeps: LinkedItemCreatedPermissionsDependencies = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayerClient: { getNode: mockGetNode } as any,
    emitPermissionsUpdatedEvent: mockEmitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent: mockEmitPermissionsUpdateFailedEvent,
    processAncestryRelationshipChanges: mockProcessAncestryRelationshipChanges,
    logger: mockLogger as Logger,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should skip sibling relationships', async () => {
    const handler = createLinkedItemCreatedPermissionsHandler(mockDeps);
    await handler({
      type: LinkedItemEvent.LinkedItemCreated,
      data: {
        linkedItemId: 'link1',
        relationshipType: RelationshipType.Sibling,
        sourceId: 'source1',
        targetId: 'target1',
      },
      metadata: createMockMetadata(),
    });

    expect(mockGetNode).not.toHaveBeenCalled();
    expect(mockProcessAncestryRelationshipChanges).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
  });

  it('should not process if source node not found', async () => {
    mockGetNode
      .mockResolvedValueOnce(null) // source node
      .mockResolvedValueOnce({ id: 'target1' }); // target node

    const handler = createLinkedItemCreatedPermissionsHandler(mockDeps);
    await handler({
      type: LinkedItemEvent.LinkedItemCreated,
      data: {
        linkedItemId: 'link2',
        relationshipType: RelationshipType.ParentChild,
        sourceId: 'source2',
        targetId: 'target2',
      },
      metadata: createMockMetadata(),
    });

    expect(mockGetNode).toHaveBeenCalledTimes(2);
    expect(mockProcessAncestryRelationshipChanges).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
  });

  it('should not process if target node not found', async () => {
    mockGetNode
      .mockResolvedValueOnce({ id: 'source3' }) // source node
      .mockResolvedValueOnce(null); // target node

    const handler = createLinkedItemCreatedPermissionsHandler(mockDeps);
    await handler({
      type: LinkedItemEvent.LinkedItemCreated,
      data: {
        linkedItemId: 'link3',
        relationshipType: RelationshipType.ParentChild,
        sourceId: 'source3',
        targetId: 'target3',
      },
      metadata: createMockMetadata(),
    });

    expect(mockGetNode).toHaveBeenCalledTimes(2);
    expect(mockProcessAncestryRelationshipChanges).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
  });

  it('should process ancestry relationship correctly', async () => {
    mockGetNode
      .mockResolvedValueOnce({ id: 'parent1' })
      .mockResolvedValueOnce({ id: 'child1' });

    const handler = createLinkedItemCreatedPermissionsHandler(mockDeps);
    await handler({
      type: LinkedItemEvent.LinkedItemCreated,
      data: {
        linkedItemId: 'link4',
        relationshipType: RelationshipType.ParentChild,
        sourceId: 'parent1',
        targetId: 'child1',
      },
      metadata: createMockMetadata(),
    });

    expect(mockProcessAncestryRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Link,
      orgKey: 'o1',
      id: 'parent1',
      objectType: 'rs_node',
      children: [{ childId: 'child1', childType: 'rs_node' }],
      parents: [],
    });

    expect(mockEmitPermissionsUpdatedEvent).toHaveBeenCalledWith(
      expect.objectContaining({ orgKey: 'o1' }),
      {
        linkedItemId: 'link4',
        relationshipType: RelationshipType.ParentChild,
        sourceId: 'parent1',
        targetId: 'child1',
      }
    );
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
  });

  it('should process ChildParent relationship correctly', async () => {
    mockGetNode
      .mockResolvedValueOnce({ id: 'child2' })
      .mockResolvedValueOnce({ id: 'parent2' });

    const handler = createLinkedItemCreatedPermissionsHandler(mockDeps);
    await handler({
      type: LinkedItemEvent.LinkedItemCreated,
      data: {
        linkedItemId: 'link5',
        relationshipType: RelationshipType.ChildParent,
        sourceId: 'child2',
        targetId: 'parent2',
      },
      metadata: createMockMetadata({
        tenant: 't2',
        orgKey: 'o2',
        userId: 'u2',
      }),
    });

    expect(mockProcessAncestryRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Link,
      orgKey: 'o2',
      id: 'child2',
      objectType: 'rs_node',
      children: [],
      parents: [{ parentId: 'parent2', parentType: 'rs_node' }],
    });

    expect(mockEmitPermissionsUpdatedEvent).toHaveBeenCalledWith(
      expect.objectContaining({ orgKey: 'o2' }),
      {
        linkedItemId: 'link5',
        relationshipType: RelationshipType.ChildParent,
        sourceId: 'child2',
        targetId: 'parent2',
      }
    );
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
  });

  it('should handle errors and emit failed event', async () => {
    mockGetNode.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const handler = createLinkedItemCreatedPermissionsHandler(mockDeps);
    await expect(
      handler({
        type: LinkedItemEvent.LinkedItemCreated,
        data: {
          linkedItemId: 'link6',
          relationshipType: RelationshipType.ParentChild,
          sourceId: 'source6',
          targetId: 'target6',
        },
        metadata: createMockMetadata({
          tenant: 't3',
          orgKey: 'o3',
          userId: 'u3',
        }),
      })
    ).rejects.toThrow('Database error');

    expect(mockEmitPermissionsUpdateFailedEvent).toHaveBeenCalledWith(
      expect.objectContaining({ tenant: 't3', orgKey: 'o3', userId: 'u3' }),
      {
        linkedItemId: 'link6',
        relationshipType: RelationshipType.ParentChild,
        sourceId: 'source6',
        targetId: 'target6',
        error: 'Database error',
      }
    );
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
  });

  it('should handle processor errors and emit failed event', async () => {
    mockGetNode
      .mockResolvedValueOnce({ id: 'source7' })
      .mockResolvedValueOnce({ id: 'target7' });

    mockProcessAncestryRelationshipChanges.mockRejectedValueOnce(
      new Error('Permit API error')
    );

    const handler = createLinkedItemCreatedPermissionsHandler(mockDeps);
    await expect(
      handler({
        type: LinkedItemEvent.LinkedItemCreated,
        data: {
          linkedItemId: 'link7',
          relationshipType: RelationshipType.ParentChild,
          sourceId: 'source7',
          targetId: 'target7',
        },
        metadata: createMockMetadata(),
      })
    ).rejects.toThrow('Permit API error');

    expect(mockEmitPermissionsUpdateFailedEvent).toHaveBeenCalledWith(
      expect.objectContaining({ orgKey: 'o1' }),
      {
        linkedItemId: 'link7',
        relationshipType: RelationshipType.ParentChild,
        sourceId: 'source7',
        targetId: 'target7',
        error: 'Permit API error',
      }
    );
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
  });

  it('should call dataLayerClient with correct parameters', async () => {
    mockGetNode
      .mockResolvedValueOnce({ id: 'source8' })
      .mockResolvedValueOnce({ id: 'target8' });

    const handler = createLinkedItemCreatedPermissionsHandler(mockDeps);
    await handler({
      type: LinkedItemEvent.LinkedItemCreated,
      data: {
        linkedItemId: 'link8',
        relationshipType: RelationshipType.ParentChild,
        sourceId: 'source8',
        targetId: 'target8',
      },
      metadata: createMockMetadata({
        tenant: 't4',
        orgKey: 'o4',
        userId: 'u4',
      }),
    });

    expect(mockGetNode).toHaveBeenCalledTimes(2);
    expect(mockGetNode).toHaveBeenNthCalledWith(1, 't4', 'o4', 'u4', 'source8');
    expect(mockGetNode).toHaveBeenNthCalledWith(2, 't4', 'o4', 'u4', 'target8');
  });
});
