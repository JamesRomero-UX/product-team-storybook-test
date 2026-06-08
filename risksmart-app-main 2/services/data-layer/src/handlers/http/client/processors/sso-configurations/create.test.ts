import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { z } from 'zod';

import type { SsoConfigurationRepository } from '../../../../../repositories/sso-configuration-repository';
import type { ServiceContext } from '../../../../../types/service-context';
import type { createSsoConfigurationRequestSchema } from './create';
import { createProcessor } from './create';

vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));

vi.mock('../../../../../utils/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

const mockPayload: z.infer<typeof createSsoConfigurationRequestSchema> = {
  Name: 'Test SSO',
  Strategy: 'oidc',
  ClientId: 'client-abc',
  ConnectionId: 'conn-xyz',
  Domain: 'example.com',
  DomainAliases: ['alias.example.com'],
  IsActive: true,
  IsRestApiEnabled: false,
  IsOrganizationConnected: true,
};

const mockContext: ServiceContext = {
  tenant: 'tenant-1',
  orgKey: 'org-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

const mockInsert = vi.fn<SsoConfigurationRepository['insert']>();

const mockSsoConfigurationRepository: SsoConfigurationRepository = {
  insert: mockInsert,
  getAll: vi.fn(),
  getByConnectionId: vi.fn(),
  deleteByConnectionId: vi.fn(),
};

describe('create SSO configuration processor', () => {
  const deps = {
    ssoConfigurationRepository: mockSsoConfigurationRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists the SSO configuration and returns the inserted record', async () => {
    const insertedRecord = {
      Id: 'sso-123',
      Name: mockPayload.Name,
      Strategy: mockPayload.Strategy,
      ClientId: mockPayload.ClientId,
      ConnectionId: mockPayload.ConnectionId,
      Domain: mockPayload.Domain,
      DomainAliases: mockPayload.DomainAliases,
      IsActive: mockPayload.IsActive,
      IsRestApiEnabled: mockPayload.IsRestApiEnabled,
      IsOrganizationConnected: mockPayload.IsOrganizationConnected,
      CreatedByUser: mockContext.userId,
      ModifiedByUser: mockContext.userId,
      OrgKey: mockContext.orgKey,
    };

    mockInsert.mockResolvedValue([insertedRecord] as Awaited<
      ReturnType<SsoConfigurationRepository['insert']>
    >);

    const processor = createProcessor(deps);
    const result = await processor({
      payload: mockPayload,
      context: mockContext,
    });

    expect(result).toBe(insertedRecord);

    expect(mockInsert).toHaveBeenCalledWith({
      Name: mockPayload.Name,
      Strategy: mockPayload.Strategy,
      ClientId: mockPayload.ClientId,
      ConnectionId: mockPayload.ConnectionId,
      Domain: mockPayload.Domain,
      DomainAliases: mockPayload.DomainAliases,
      IsActive: mockPayload.IsActive,
      IsRestApiEnabled: mockPayload.IsRestApiEnabled,
      IsOrganizationConnected: mockPayload.IsOrganizationConnected,
      CreatedByUser: mockContext.userId,
      ModifiedByUser: mockContext.userId,
      OrgKey: mockContext.orgKey,
    });
  });

  it('throws when insert returns an empty array', async () => {
    mockInsert.mockResolvedValue(
      [] as Awaited<ReturnType<SsoConfigurationRepository['insert']>>
    );

    const processor = createProcessor(deps);

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Failed to retrieve created SSO configuration');
  });

  it('throws when insert returns a record without Id', async () => {
    mockInsert.mockResolvedValue([{}] as Awaited<
      ReturnType<SsoConfigurationRepository['insert']>
    >);

    const processor = createProcessor(deps);

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('Failed to retrieve created SSO configuration');
  });

  it('rethrows repository errors', async () => {
    mockInsert.mockRejectedValue(new Error('db error'));

    const processor = createProcessor(deps);

    await expect(
      processor({ payload: mockPayload, context: mockContext })
    ).rejects.toThrow('db error');
  });
});
