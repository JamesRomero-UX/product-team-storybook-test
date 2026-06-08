import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrganisationRepository } from '../../../../../repositories/organisation-repository';
import { createProcessor, pathParamsSchema } from './get-by-org-key';

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

const mockGetByOrgKey = vi.fn<OrganisationRepository['getByOrgKey']>();

const mockOrganisationRepository: OrganisationRepository = {
  getAll: vi.fn(),
  getByOrgKey: mockGetByOrgKey,
};

describe('get organisation by org key processor', () => {
  const deps = {
    organisationRepository: mockOrganisationRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('input validation (pathParamsSchema)', () => {
    it('accepts a valid orgKey', () => {
      const result = pathParamsSchema.safeParse({ orgKey: 'my-org' });
      expect(result.success).toBe(true);
    });

    it('rejects an empty orgKey', () => {
      const result = pathParamsSchema.safeParse({ orgKey: '' });
      expect(result.success).toBe(false);
    });

    it('rejects a missing orgKey', () => {
      const result = pathParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('processor', () => {
    it('returns the organisation matching the orgKey', async () => {
      const mockOrg = {
        OrgKey: 'my-org',
        Name: 'My Organisation',
      } as Awaited<ReturnType<OrganisationRepository['getByOrgKey']>>;

      mockGetByOrgKey.mockResolvedValue(mockOrg);

      const processor = createProcessor(deps);
      const result = await processor({ orgKey: 'my-org' });

      expect(result).toEqual(mockOrg);
      expect(mockGetByOrgKey).toHaveBeenCalledWith('my-org');
    });

    it('returns null when the organisation does not exist', async () => {
      mockGetByOrgKey.mockResolvedValue(null);

      const processor = createProcessor(deps);
      const result = await processor({ orgKey: 'unknown-org' });

      expect(result).toBeNull();
      expect(mockGetByOrgKey).toHaveBeenCalledWith('unknown-org');
    });

    it('rethrows repository errors', async () => {
      mockGetByOrgKey.mockRejectedValue(new Error('db connection failed'));

      const processor = createProcessor(deps);

      await expect(processor({ orgKey: 'my-org' })).rejects.toThrow(
        'db connection failed'
      );
    });
  });
});
