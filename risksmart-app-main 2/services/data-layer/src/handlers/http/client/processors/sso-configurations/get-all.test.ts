import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SsoConfigurationRepository } from '../../../../../repositories/sso-configuration-repository';
import type { ServiceContext } from '../../../../../types/service-context';
import { createProcessor } from './get-all';

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

const mockGetAll = vi.fn<SsoConfigurationRepository['getAll']>();

const mockSsoConfigurationRepository: SsoConfigurationRepository = {
  insert: vi.fn(),
  getAll: mockGetAll,
  getByConnectionId: vi.fn(),
  deleteByConnectionId: vi.fn(),
};

describe('get all SSO configurations processor', () => {
  const deps = {
    ssoConfigurationRepository: mockSsoConfigurationRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all SSO configurations from the repository', async () => {
    const mockRecords = [
      { Id: 'sso-1', ConnectionId: 'conn-1', OrgKey: mockContext.orgKey },
      { Id: 'sso-2', ConnectionId: 'conn-2', OrgKey: mockContext.orgKey },
    ] as Awaited<ReturnType<SsoConfigurationRepository['getAll']>>;

    mockGetAll.mockResolvedValue(mockRecords);

    const processor = createProcessor(deps);
    const result = await processor();

    expect(result).toEqual(mockRecords);
    expect(mockGetAll).toHaveBeenCalledOnce();
  });

  it('returns an empty array when no configurations exist', async () => {
    mockGetAll.mockResolvedValue([]);

    const processor = createProcessor(deps);
    const result = await processor();

    expect(result).toEqual([]);
    expect(mockGetAll).toHaveBeenCalledOnce();
  });

  it('rethrows repository errors', async () => {
    mockGetAll.mockRejectedValue(new Error('db connection failed'));

    const processor = createProcessor(deps);

    await expect(processor()).rejects.toThrow('db connection failed');
  });
});
