import { RulebookEvent } from '@risksmart-app/events/src/types/common';
import type { SystemEvent } from '@risksmart-app/events/src/types/system-events';
import type { TenantConfig } from 'src/domain/types';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createPropagateToRegionalTenants } from './propagate-to-regional-tenants';

describe('Propagate to regional tenants', () => {
  const mockGetTenantConfigs = vi.fn();
  const mockDispatchEvents = vi.fn();

  const mockSystemEvent: SystemEvent<{ location: string }> = {
    type: RulebookEvent.ExternalObligationsUpdated,
    data: {
      location: 's3://bucket/path/to/changes.json',
    },
    metadata: {
      eventId: 'system-event-123',
      version: '1.0',
      timestamp: '2026-01-20T10:00:00Z',
      domain: 'compliance',
      service: 'rulebook-ingestion',
      correlationId: 'correlation-456',
      userId: 'SYSTEM',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should dispatch one event per returned tenant', async () => {
    const mockTenants: TenantConfig[] = [
      {
        tenant: 'acme',
        region: '',
        databases: [],
      },
      {
        tenant: 'globex',
        region: '',
        databases: [],
      },
      {
        tenant: 'initech',
        region: '',
        databases: [],
      },
    ];

    mockGetTenantConfigs.mockResolvedValue(mockTenants);

    const service = createPropagateToRegionalTenants({
      getTenantConfigs: mockGetTenantConfigs,
      dispatchEvents: mockDispatchEvents,
    });

    await service.execute(mockSystemEvent);

    // Verify getTenantConfigs was called once
    expect(mockGetTenantConfigs).toHaveBeenCalledTimes(1);

    // Verify dispatchEvents was called once
    expect(mockDispatchEvents).toHaveBeenCalledTimes(1);
    expect(mockDispatchEvents).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          metadata: expect.objectContaining({ tenant: 'acme' }),
        }),
        expect.objectContaining({
          metadata: expect.objectContaining({ tenant: 'globex' }),
        }),
        expect.objectContaining({
          metadata: expect.objectContaining({ tenant: 'initech' }),
        }),
      ])
    );
  });

  test('should handle empty tenant list', async () => {
    mockGetTenantConfigs.mockResolvedValue([]);

    const service = createPropagateToRegionalTenants({
      getTenantConfigs: mockGetTenantConfigs,
      dispatchEvents: mockDispatchEvents,
    });

    await service.execute(mockSystemEvent);

    expect(mockGetTenantConfigs).toHaveBeenCalledTimes(1);
    expect(mockDispatchEvents).not.toHaveBeenCalled();
  });

  test('should preserve all metadata fields except tenant and orgKey', async () => {
    const mockTenants: TenantConfig[] = [
      {
        tenant: 'test-tenant',
        region: '',
        databases: [],
      },
    ];

    const eventWithCausation: SystemEvent<unknown> = {
      ...mockSystemEvent,
      metadata: {
        ...mockSystemEvent.metadata,
        causationId: 'original-causation-id',
      },
    };

    mockGetTenantConfigs.mockResolvedValue(mockTenants);

    const service = createPropagateToRegionalTenants({
      getTenantConfigs: mockGetTenantConfigs,
      dispatchEvents: mockDispatchEvents,
    });

    await service.execute(eventWithCausation);

    expect(mockDispatchEvents).toHaveBeenCalledTimes(1);
    expect(mockDispatchEvents).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          metadata: expect.objectContaining({
            eventId: expect.any(String),
            version: eventWithCausation.metadata.version,
            timestamp: eventWithCausation.metadata.timestamp,
            domain: eventWithCausation.metadata.domain,
            service: eventWithCausation.metadata.service,
            correlationId: eventWithCausation.metadata.correlationId,
            tenant: 'test-tenant',
            causationId: eventWithCausation.metadata.eventId, // Should be set to system eventId
          }),
        }),
      ])
    );
  });
});
