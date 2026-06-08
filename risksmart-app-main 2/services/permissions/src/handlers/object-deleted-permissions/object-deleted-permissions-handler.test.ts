import type { Logger } from '@aws-lambda-powertools/logger';
import { ObjectEvent } from '@risksmart-app/events/src/types/common';
import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { ObjectDeletedPermissionsDependencies } from './object-deleted-permissions-handler';
import { createObjectDeletedPermissionsHandler } from './object-deleted-permissions-handler';

describe('ObjectDeleted Permissions Handler', () => {
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

  const mockEmitPermissionsUpdatedEvent = vi.fn();
  const mockEmitPermissionsUpdateFailedEvent = vi.fn();
  const mockProcessGenericPermitResource = vi.fn();

  const mockDeps: ObjectDeletedPermissionsDependencies = {
    emitPermissionsUpdatedEvent: mockEmitPermissionsUpdatedEvent,
    emitPermissionsUpdateFailedEvent: mockEmitPermissionsUpdateFailedEvent,
    processGenericPermitResource: mockProcessGenericPermitResource,
    logger: mockLogger as Logger,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should process ObjectDeleted permissions successfully and emit correct event', async () => {
    mockProcessGenericPermitResource.mockResolvedValueOnce(undefined);

    const handler = createObjectDeletedPermissionsHandler(mockDeps);
    await handler({
      type: ObjectEvent.ObjectDeleted,
      data: { objectId: 'id1', objectType: 'type1' },
      metadata: createMockMetadata(),
    });

    expect(mockProcessGenericPermitResource).toHaveBeenCalledWith({
      op: PermissionsOperation.Delete,
      orgKey: 'o1',
      id: 'id1',
      objectType: 'type1',
    });

    expect(mockEmitPermissionsUpdatedEvent).toHaveBeenCalled();
    expect(mockEmitPermissionsUpdateFailedEvent).not.toHaveBeenCalled();
  });

  it('should handle errors and emit failed event', async () => {
    mockProcessGenericPermitResource.mockImplementationOnce(() => {
      throw new Error('deletion failed');
    });

    const handler = createObjectDeletedPermissionsHandler(mockDeps);
    await expect(
      handler({
        type: ObjectEvent.ObjectDeleted,
        data: { objectId: 'id3', objectType: 'type3' },
        metadata: createMockMetadata({
          tenant: 't3',
          orgKey: 'o3',
          userId: 'u3',
        }),
      })
    ).rejects.toThrow('deletion failed');

    expect(mockEmitPermissionsUpdateFailedEvent).toHaveBeenCalledWith(
      expect.objectContaining({ tenant: 't3', orgKey: 'o3', userId: 'u3' }),
      {
        objectType: 'type3',
        objectId: 'id3',
        error: 'deletion failed',
      }
    );

    expect(mockEmitPermissionsUpdatedEvent).not.toHaveBeenCalled();
  });
});
