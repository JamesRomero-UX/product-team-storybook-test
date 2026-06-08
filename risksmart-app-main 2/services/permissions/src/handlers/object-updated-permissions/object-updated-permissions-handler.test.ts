import type { Logger } from '@aws-lambda-powertools/logger';
import {
  ObjectEvent,
  RelationshipType,
} from '@risksmart-app/events/src/types/common';
import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DataLayerApiClient } from '../../adaptors/database/data-layer-api-client';
import { PermissionsOperation } from '../../types';
import type { ObjectUpdatedPermissionsDependencies } from './object-updated-permissions-handler';
import { createObjectUpdatedPermissionsHandler } from './object-updated-permissions-handler';

describe('ObjectUpdated Permissions Handler', () => {
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

  const mockResourceInstanceExists = vi.fn().mockResolvedValue(true);

  const mockGetEnrichedNodes = vi.fn();
  const mockEmitPermissionsUpdatedEvent = vi.fn();
  const mockEmitPermissionsUpdateFailedEvent = vi.fn();
  const mockProcessGenericPermitResource = vi.fn();
  const mockProcessUserRoleChanges = vi.fn();
  const mockProcessGroupRelationshipChanges = vi.fn();
  const mockGetExistingRelationships = vi.fn().mockResolvedValue({
    roleAssignments: [],
    groupRelationships: [],
  });

  const mockDeps: ObjectUpdatedPermissionsDependencies = {
    dataLayerClient: {
      getEnrichedNodes: mockGetEnrichedNodes,
    } as unknown as DataLayerApiClient,
    emitPermissionsUpdatedEvent: mockEmitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent: mockEmitPermissionsUpdateFailedEvent,
    resourceInstanceExists: mockResourceInstanceExists,
    processGenericPermitResource: mockProcessGenericPermitResource,
    processUserRoleChanges: mockProcessUserRoleChanges,
    processGroupRelationshipChanges: mockProcessGroupRelationshipChanges,
    getExistingRelationships: mockGetExistingRelationships,
    logger: mockLogger as Logger,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResourceInstanceExists.mockResolvedValue(true);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should process ObjectUpdated permissions successfully and emit correct event', async () => {
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

    const handler = createObjectUpdatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectUpdated,
      data: { objectId: 'id1', objectType: 'type1' },
      metadata: createMockMetadata(),
    });

    expect(mockEmitPermissionsUpdatedEvent).toHaveBeenCalled();
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
    expect(mockProcessGenericPermitResource).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      orgKey: 'o1',
      id: 'id1',
      objectType: 'type1',
      parents: [],
      children: [],
    });

    // Verify getExistingRelationships was called to fetch existing data
    expect(mockGetExistingRelationships).toHaveBeenCalledWith({
      objectId: 'id1',
      orgKey: 'o1',
    });

    expect(mockProcessUserRoleChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      desiredUsersForRole: [{ userId: 'u1' }],
      role: 'Owner',
      orgKey: 'o1',
      objectId: 'id1',
      existingRoleAssignments: [],
    });

    expect(mockProcessUserRoleChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      desiredUsersForRole: [],
      role: 'Contributor',
      orgKey: 'o1',
      objectId: 'id1',
      existingRoleAssignments: [],
    });

    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      desiredGroupsWithAccess: [],
      relationType: 'owner',
      orgKey: 'o1',
      objectId: 'id1',
      existingGroupRelationships: [],
    });

    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      desiredGroupsWithAccess: [],
      relationType: 'contributor',
      orgKey: 'o1',
      objectId: 'id1',
      existingGroupRelationships: [],
    });
  });

  it('should not continue if enriched node not found', async () => {
    mockGetEnrichedNodes.mockResolvedValueOnce([]);

    const handler = createObjectUpdatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectUpdated,
      data: { objectId: 'id2', objectType: 'type2' },
      metadata: createMockMetadata({
        tenant: 't2',
        orgKey: 'o2',
        userId: 'u2',
      }),
    });

    expect(mockLogger.warn).toHaveBeenCalledWith('Enriched node not found');
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
    expect(mockProcessGenericPermitResource).not.toHaveBeenCalled();
    expect(mockProcessUserRoleChanges).not.toHaveBeenCalled();
    expect(mockProcessGroupRelationshipChanges).not.toHaveBeenCalled();
  });

  it('should not continue if resource instance does not exist in Permit', async () => {
    mockGetEnrichedNodes.mockResolvedValueOnce([
      {
        owners: [],
        ownerGroups: [],
        contributors: [],
        contributorGroups: [],
        targetLinkedItems: [],
        sourceLinkedItems: [],
      },
    ]);
    mockResourceInstanceExists.mockResolvedValueOnce(false);

    const handler = createObjectUpdatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectUpdated,
      data: { objectId: 'id2', objectType: 'type2' },
      metadata: createMockMetadata({
        tenant: 't2',
        orgKey: 'o2',
        userId: 'u2',
      }),
    });

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Resource instance not found in Permit, skipping update operation'
    );
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
    expect(mockProcessGenericPermitResource).not.toHaveBeenCalled();
    expect(mockProcessUserRoleChanges).not.toHaveBeenCalled();
    expect(mockProcessGroupRelationshipChanges).not.toHaveBeenCalled();
  });

  it('should handle errors and emit failed event', async () => {
    mockGetEnrichedNodes.mockImplementationOnce(() => {
      throw new Error('update failed');
    });

    const handler = createObjectUpdatedPermissionsHandler(mockDeps);
    await expect(
      handler({
        type: ObjectEvent.ObjectUpdated,
        data: { objectId: 'id3', objectType: 'type3' },
        metadata: createMockMetadata({
          tenant: 't3',
          orgKey: 'o3',
          userId: 'u3',
        }),
      })
    ).rejects.toThrow('update failed');

    expect(mockEmitPermissionsUpdateFailedEvent).toHaveBeenCalledWith(
      expect.objectContaining({ tenant: 't3', orgKey: 'o3', userId: 'u3' }),
      {
        objectType: 'type3',
        objectId: 'id3',
        error: 'update failed',
      }
    );

    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
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

    const handler = createObjectUpdatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectUpdated,
      data: { objectId: 'id4', objectType: 'type4' },
      metadata: createMockMetadata(),
    });

    expect(mockProcessGenericPermitResource).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
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

    const handler = createObjectUpdatedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectUpdated,
      data: { objectId: 'id5', objectType: 'type5' },
      metadata: createMockMetadata(),
    });

    // Should be called once for each role type (Owner and Contributor)
    expect(mockProcessUserRoleChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      desiredUsersForRole: [{ userId: 'owner1' }, { userId: 'owner2' }],
      role: 'Owner',
      orgKey: 'o1',
      objectId: 'id5',
      existingRoleAssignments: [],
    });

    expect(mockProcessUserRoleChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      desiredUsersForRole: [{ userId: 'contributor1' }],
      role: 'Contributor',
      orgKey: 'o1',
      objectId: 'id5',
      existingRoleAssignments: [],
    });

    // Should be called once for each group relation type (owner and contributor)
    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      desiredGroupsWithAccess: [{ userGroupId: 'ownerGroup1' }],
      relationType: 'owner',
      orgKey: 'o1',
      objectId: 'id5',
      existingGroupRelationships: [],
    });

    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledWith({
      op: PermissionsOperation.Update,
      desiredGroupsWithAccess: [
        { userGroupId: 'contributorGroup1' },
        { userGroupId: 'contributorGroup2' },
      ],
      relationType: 'contributor',
      orgKey: 'o1',
      objectId: 'id5',
      existingGroupRelationships: [],
    });

    // Total calls: 2 for user roles + 2 for group relationships
    expect(mockProcessUserRoleChanges).toHaveBeenCalledTimes(2);
    expect(mockProcessGroupRelationshipChanges).toHaveBeenCalledTimes(2);
  });
});
