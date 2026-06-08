import type { Logger } from '@aws-lambda-powertools/logger';
import { UserGroupEvent } from '@risksmart-app/events/src/types/common';
import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { UserGroupCreatedPermissionsDependencies } from './user-group-created-permissions-handler';
import { createUserGroupCreatedPermissionsHandler } from './user-group-created-permissions-handler';

describe('UserGroupCreated permissions handler', () => {
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
    orgKey: 'org_abc123',
    userId: 'test-user-id',
    ...overrides,
  });

  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockProcessUserGroupChanges = vi.fn();
  const mockEmitPermissionsUpdatedEvent = vi.fn();
  const mockEmitPermissionsUpdateFailedEvent = vi.fn();

  const mockDeps: UserGroupCreatedPermissionsDependencies = {
    processUserGroupChanges: mockProcessUserGroupChanges,
    emitPermissionsUpdatedEvent: mockEmitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent: mockEmitPermissionsUpdateFailedEvent,
    logger: mockLogger as Logger,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessUserGroupChanges.mockResolvedValue(undefined);
    mockEmitPermissionsUpdatedEvent.mockResolvedValue(undefined);
    mockEmitPermissionsUpdateFailedEvent.mockResolvedValue(undefined);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should call processUserGroupChanges with Insert op and emit permissions updated event on success', async () => {
    const handler = createUserGroupCreatedPermissionsHandler(mockDeps);

    await handler({
      type: UserGroupEvent.UserGroupCreated,
      data: { groupId: 'group-uuid' },
      metadata: createMockMetadata(),
    });

    expect(mockProcessUserGroupChanges).toHaveBeenCalledExactlyOnceWith({
      op: PermissionsOperation.Insert,
      userGroupId: 'group-uuid',
      orgKey: 'org_abc123',
    });
    expect(mockEmitPermissionsUpdatedEvent).toHaveBeenCalledExactlyOnceWith(
      createMockMetadata(),
      { groupId: 'group-uuid' }
    );
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
  });

  it('should emit permissions update failed event and rethrow on error', async () => {
    mockProcessUserGroupChanges.mockRejectedValueOnce(
      new Error('Permit API error')
    );

    const handler = createUserGroupCreatedPermissionsHandler(mockDeps);

    await expect(
      handler({
        type: UserGroupEvent.UserGroupCreated,
        data: { groupId: 'group-uuid' },
        metadata: createMockMetadata(),
      })
    ).rejects.toThrow('Permit API error');

    expect(
      mockEmitPermissionsUpdateFailedEvent
    ).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ orgKey: 'org_abc123' }),
      { groupId: 'group-uuid', error: 'Permit API error' }
    );
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
  });
});
