import type { Logger } from '@aws-lambda-powertools/logger';
import {
  ObjectEvent,
  RelationshipType,
} from '@risksmart-app/events/src/types/common';
import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { ObjectCreatedPermissionsDependencies } from './object-created-permissions-handler';
import { createObjectCreatedPermissionsHandler } from './object-created-permissions-handler';

describe('ObjectCreated permissions handler', () => {
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

  const mockGetEnrichedNodes = vi.fn();
  const mockEmitPermissionsUpdatedEvent = vi.fn();
  const mockEmitPermissionsUpdateFailedEvent = vi.fn();
  const mockProcessGenericPermitResource = vi.fn();
  const mockProcessUserRoleChanges = vi.fn();
  const mockProcessGroupRelationshipChanges = vi.fn();

  const mockDeps: ObjectCreatedPermissionsDependencies = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayerClient: { getEnrichedNodes: mockGetEnrichedNodes } as any,
    emitPermissionsUpdatedEvent: mockEmitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent: mockEmitPermissionsUpdateFailedEvent,
    processGenericPermitResource: mockProcessGenericPermitResource,
    processUserRoleChanges: mockProcessUserRoleChanges,
    processGroupRelationshipChanges: mockProcessGroupRelationshipChanges,
    logger: mockLogger as Logger,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should process ObjectCreated permissions successfully and emit correct event', async () => {
    mockGetEnrichedNodes.mockResolvedValueOnce([
      {
        owners: [{ UserId: 'u1' }],
        ownerGroups: [],
        contributors: [],
        contributorGroups: [],
        targetLinkedItems: [],
        sourceLinkedItems: [],
      },
    ]);

    const handler = createObjectCreatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectCreated,
      data: { objectId: 'id1', objectType: 'type1' },
      metadata: createMockMetadata(),
    });

    expect(mockEmitPermissionsUpdatedEvent).toHaveBeenCalled();
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
    expect(mockProcessGenericPermitResource).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      orgKey: 'o1',
      id: 'id1',
      objectType: 'type1',
      parents: [],
      children: [],
    });

    expect(mockProcessUserRoleChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      desiredUsersForRole: [{ userId: 'u1' }],
      role: 'Owner',
      orgKey: 'o1',
      objectId: 'id1',
    });

    expect(mockProcessUserRoleChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      desiredUsersForRole: [],
      role: 'Contributor',
      orgKey: 'o1',
      objectId: 'id1',
    });

    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      desiredGroupsWithAccess: [],
      relationType: 'owner',
      orgKey: 'o1',
      objectId: 'id1',
    });

    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      desiredGroupsWithAccess: [],
      relationType: 'contributor',
      orgKey: 'o1',
      objectId: 'id1',
    });
  });

  it('should not continue if enriched node not found', async () => {
    mockGetEnrichedNodes.mockResolvedValueOnce([]);

    const handler = createObjectCreatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectCreated,
      data: { objectId: 'id2', objectType: 'type2' },
      metadata: createMockMetadata({
        tenant: 't2',
        orgKey: 'o2',
        userId: 'u2',
      }),
    });
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
    expect(mockProcessGenericPermitResource).not.toHaveBeenCalled();
    expect(mockProcessUserRoleChanges).not.toHaveBeenCalled();
    expect(mockProcessGroupRelationshipChanges).not.toHaveBeenCalled();
  });

  it('should handle errors and emit failed event', async () => {
    mockGetEnrichedNodes.mockImplementationOnce(() => {
      throw new Error('fail');
    });

    const handler = createObjectCreatedPermissionsHandler(mockDeps);
    await expect(
      handler({
        type: ObjectEvent.ObjectCreated,
        data: { objectId: 'id3', objectType: 'type3' },
        metadata: createMockMetadata({
          tenant: 't3',
          orgKey: 'o3',
          userId: 'u3',
        }),
      })
    ).rejects.toThrow('fail');

    expect(mockEmitPermissionsUpdateFailedEvent).toHaveBeenCalledWith(
      expect.objectContaining({ tenant: 't3', orgKey: 'o3', userId: 'u3' }),
      {
        objectType: 'type3',
        objectId: 'id3',
        error: 'fail',
      }
    );
  });

  it('should process parent-child relationships correctly', async () => {
    mockGetEnrichedNodes.mockResolvedValueOnce([
      {
        owners: [],
        ownerGroups: [],
        contributors: [],
        contributorGroups: [],
        targetLinkedItems: [
          { Source: 'parent1', RelationshipType: RelationshipType.ParentChild },
          { Source: 'sibling1', RelationshipType: RelationshipType.Sibling }, // Should be ignored
          { Source: 'child1', RelationshipType: RelationshipType.ChildParent }, // Should be ignored
        ],
        sourceLinkedItems: [
          { Target: 'child2', RelationshipType: RelationshipType.ParentChild },
          { Target: 'child3', RelationshipType: RelationshipType.ParentChild },
          { Target: 'parent2', RelationshipType: RelationshipType.ChildParent }, // Should be ignored
        ],
      },
    ]);

    const handler = createObjectCreatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectCreated,
      data: { objectId: 'id4', objectType: 'type4' },
      metadata: createMockMetadata(),
    });

    expect(mockProcessGenericPermitResource).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      orgKey: 'o1',
      id: 'id4',
      objectType: 'type4',
      parents: [{ parentId: 'parent1', parentType: 'rs_node' }],
      children: [
        { childId: 'child2', childType: 'rs_node' },
        { childId: 'child3', childType: 'rs_node' },
      ],
    });
  });

  it('should call processUserRoleChanges and processGroupRelationshipChanges with correct parameters', async () => {
    const mockEnrichedNode = {
      owners: [{ UserId: 'owner1' }, { UserId: 'owner2' }],
      ownerGroups: [{ UserGroupId: 'ownerGroup1' }],
      contributors: [{ UserId: 'contributor1' }],
      contributorGroups: [
        { UserGroupId: 'contributorGroup1' },
        { UserGroupId: 'contributorGroup2' },
      ],
      targetLinkedItems: [],
      sourceLinkedItems: [],
    };
    mockGetEnrichedNodes.mockResolvedValueOnce([mockEnrichedNode]);

    const handler = createObjectCreatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectCreated,
      data: { objectId: 'id5', objectType: 'type5' },
      metadata: createMockMetadata(),
    });

    // Should be called once for each role type (Owner and Contributor)
    expect(mockProcessUserRoleChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      desiredUsersForRole: [{ userId: 'owner1' }, { userId: 'owner2' }],
      role: 'Owner',
      orgKey: 'o1',
      objectId: 'id5',
    });

    expect(mockProcessUserRoleChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      desiredUsersForRole: [{ userId: 'contributor1' }],
      role: 'Contributor',
      orgKey: 'o1',
      objectId: 'id5',
    });

    // Should be called once for each group relation type (owner and contributor)
    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      desiredGroupsWithAccess: [{ userGroupId: 'ownerGroup1' }],
      relationType: 'owner',
      orgKey: 'o1',
      objectId: 'id5',
    });

    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Insert,
      desiredGroupsWithAccess: [
        { userGroupId: 'contributorGroup1' },
        { userGroupId: 'contributorGroup2' },
      ],
      relationType: 'contributor',
      orgKey: 'o1',
      objectId: 'id5',
    });

    // Total calls: 2 for user roles + 2 for group relationships
    expect(mockProcessUserRoleChanges).toHaveBeenCalledTimes(2);
    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledTimes(2);
  });
});
