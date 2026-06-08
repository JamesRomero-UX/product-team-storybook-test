import type { Logger } from '@aws-lambda-powertools/logger';
import { UserEvent } from '@risksmart-app/events/src/types/common';
import type { TenantEventMetadata } from '@risksmart-app/events/src/types/tenant-events';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { UserDeletedPermissionsDependencies } from './user-deleted-permissions-handler';
import { createUserDeletedPermissionsHandler } from './user-deleted-permissions-handler';

describe('UserDeleted permissions handler', () => {
  const createMockMetadata = (
    overrides: Partial<TenantEventMetadata> = {}
  ): TenantEventMetadata => ({
    eventId: 'test-event-id',
    version: '1.0',
    timestamp: '2024-01-01T00:00:00.000Z',
    domain: 'test-domain',
    service: 'test-service',
    correlationId: 'test-correlation-id',
    tenant: 'test-tenant',
    userId: 'SYSTEM',
    ...overrides,
  });

  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockProcessUserChanges = vi.fn();
  const mockEmitPermissionsUpdatedEvent = vi.fn();
  const mockEmitPermissionsUpdateFailedEvent = vi.fn();

  const mockDeps: UserDeletedPermissionsDependencies = {
    processUserChanges: mockProcessUserChanges,
    emitPermissionsUpdatedEvent: mockEmitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent: mockEmitPermissionsUpdateFailedEvent,
    logger: mockLogger as Logger,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessUserChanges.mockResolvedValue(undefined);
    mockEmitPermissionsUpdatedEvent.mockResolvedValue(undefined);
    mockEmitPermissionsUpdateFailedEvent.mockResolvedValue(undefined);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should call processUserChanges with Delete op and emit permissions updated event on success', async () => {
    const handler = createUserDeletedPermissionsHandler(mockDeps);

    await handler({
      type: UserEvent.UserDeleted,
      data: { userId: 'deleted-user-id' },
      metadata: createMockMetadata(),
    });

    expect(mockProcessUserChanges).toHaveBeenCalledExactlyOnceWith({
      op: PermissionsOperation.Delete,
      userId: 'deleted-user-id',
    });
    expect(mockEmitPermissionsUpdatedEvent).toHaveBeenCalledExactlyOnceWith(
      createMockMetadata(),
      { userId: 'deleted-user-id' }
    );
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
  });

  it('should emit permissions update failed event and rethrow on error', async () => {
    mockProcessUserChanges.mockRejectedValueOnce(new Error('Permit API error'));

    const handler = createUserDeletedPermissionsHandler(mockDeps);

    await expect(
      handler({
        type: UserEvent.UserDeleted,
        data: { userId: 'deleted-user-id' },
        metadata: createMockMetadata(),
      })
    ).rejects.toThrow('Permit API error');

    expect(
      mockEmitPermissionsUpdateFailedEvent
    ).toHaveBeenCalledExactlyOnceWith(createMockMetadata(), {
      userId: 'deleted-user-id',
      error: 'Permit API error',
    });
    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
  });
});
