import { getHasuraClient } from 'src/graphqlClient';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('sst/node/config', () => ({
  Config: { HASURA_ADMIN_SECRET: 'test-secret' },
}));
// Import after mocking Config
import { getOrgDetails } from './orgUtilities';

vi.mock('src/graphqlClient', () => ({
  getHasuraClient: vi.fn(),
}));

// Cast to a Vitest mock type so we can control return values
const mockGetHasura = getHasuraClient as unknown as {
  mockReturnValue: (v: unknown) => void;
};

describe('getOrgDetails baseUrl defaulting', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('preserves existing custom baseUrl when set', async () => {
    mockGetHasura.mockReturnValue({
      query: vi.fn().mockResolvedValue({
        data: {
          auth_organisation_by_pk: {
            OrgKey: 'ORG_B',
            Name: 'Org B',
            Meta: { baseUrl: 'https://custom.example.com' },
          },
        },
      }),
    });

    const details = await getOrgDetails({ orgKey: 'ORG_B', tenant: 'TenantA' });
    expect(details.Meta?.baseUrl).toBe('https://custom.example.com');
  });

  it('throws when org not found', async () => {
    mockGetHasura.mockReturnValue({
      query: vi.fn().mockResolvedValue({
        data: { auth_organisation_by_pk: null },
      }),
    });

    await expect(
      getOrgDetails({ orgKey: 'MISSING', tenant: 'TenantA' })
    ).rejects.toThrow('Org not found');
  });
});
