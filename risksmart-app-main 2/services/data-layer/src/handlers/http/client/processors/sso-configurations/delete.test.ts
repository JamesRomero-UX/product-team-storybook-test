import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SsoConfigurationRepository } from '../../../../../repositories/sso-configuration-repository';
import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor } from './delete';

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

const mockContext: ServiceContext = {
  tenant: 'tenant-1',
  orgKey: 'org-1',
  userId: 'user-1',
  correlationId: 'corr-1',
};

const mockDeleteByConnectionId =
  vi.fn<SsoConfigurationRepository['deleteByConnectionId']>();

const mockSsoConfigurationRepository: SsoConfigurationRepository = {
  insert: vi.fn(),
  getAll: vi.fn(),
  getByConnectionId: vi.fn(),
  deleteByConnectionId: mockDeleteByConnectionId,
};

describe('delete SSO configuration processor', () => {
  const deps = {
    ssoConfigurationRepository: mockSsoConfigurationRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the SSO configuration and returns deleted IDs', async () => {
    mockDeleteByConnectionId.mockResolvedValue(['sso-123']);

    const processor = createProcessor(deps);
    const result = await processor({
      connectionId: 'conn-xyz',
      context: mockContext,
    });

    expect(result).toEqual(['sso-123']);
    expect(mockDeleteByConnectionId).toHaveBeenCalledWith('conn-xyz');
  });

  it('throws NotFound when no records are deleted', async () => {
    mockDeleteByConnectionId.mockResolvedValue([]);

    const processor = createProcessor(deps);

    await expect(
      processor({ connectionId: 'conn-xyz', context: mockContext })
    ).rejects.toThrow('SSO configuration not found');
  });

  it('rethrows repository errors', async () => {
    mockDeleteByConnectionId.mockRejectedValue(new Error('db error'));

    const processor = createProcessor(deps);

    await expect(
      processor({ connectionId: 'conn-xyz', context: mockContext })
    ).rejects.toThrow('db error');
  });
});
