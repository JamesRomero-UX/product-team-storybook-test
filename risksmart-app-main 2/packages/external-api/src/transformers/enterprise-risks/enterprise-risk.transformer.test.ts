import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EnterpriseRiskListQueryResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformItem,
  transformListQueryResponse,
} from './enterprise-risk.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn(),
}));

describe('enterprise-risk.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const {
      firstDefined,
      idToResourceReference,
      nodeObjectTypeToResourceType,
    } = await import('../../utils/transforms');

    vi.mocked(firstDefined).mockImplementation((...vals) =>
      vals.find((v) => v !== null && v !== undefined)
    );

    vi.mocked(idToResourceReference).mockImplementation(
      (id, type, hrefPrefix) => ({
        id,
        type,
        href: `${hrefPrefix}/${id}`,
      })
    );

    vi.mocked(nodeObjectTypeToResourceType).mockImplementation((type) => {
      const resourceTypes = new Map<string, { type: KnownType; path: string }>([
        [
          'enterprise_risk',
          { type: 'enterprise_risk', path: 'enterprise-risks' },
        ],
        ['risk', { type: 'risk', path: 'risks' }],
        ['control', { type: 'control', path: 'controls' }],
      ]);

      return resourceTypes.get(type) || undefined;
    });
  });

  const mockMetadata = {
    nextId: null,
    hasNext: false,
    hasPrev: false,
    prevId: null,
    count: 1,
  };

  describe('transformItem', () => {
    const baseMockEnterpriseRisk = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Enterprise Risk',
      Description: 'Test Description',
      SequentialId: 1,
      Tier: 2,
      Treatment: 'mitigate',
      ParentId: null,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      score: {
        InherentScoreMean: 75.5,
        ResidualScoreMean: 45.2,
        InherentRatingMean: 3.5,
        ResidualRatingMean: 2.1,
      },
    };

    it('should transform a valid enterprise risk item response', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        Title: '  Test Enterprise Risk Item  ',
        Description: '  Detailed enterprise risk description  ',
        Tier: 3,
        Treatment: 'accept',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        title: 'Test Enterprise Risk Item',
        description: 'Detailed enterprise risk description',
        tier: 3,
        treatment: 'accept',
        score: {
          inherentScoreMean: 75.5,
          residualScoreMean: 45.2,
          inherentRatingMean: 3.5,
          residualRatingMean: 2.1,
        },
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: [],
        contributors: [],
        tags: [],
        links: {
          self: {
            href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174000',
          },
          createdBy: {
            id: 'provider|user123',
            type: 'user',
            href: '/api/v1/users/provider|user123',
          },
          updatedBy: {
            id: 'provider|user456',
            type: 'user',
            href: '/api/v1/users/provider|user456',
          },
          owners: [],
          contributors: [],
        },
      });
    });

    it('should handle enterprise risk with null Description and default updatedBy to createdBy', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        Description: null,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.description).toBeNull();
      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle enterprise risk with whitespace-only description string', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        Description: '   ',
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      // Whitespace-only strings are trimmed to empty string, which becomes null
      expect(result.description).toBeNull();
    });

    it('should handle enterprise risk with null Treatment', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        Treatment: null,
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.treatment).toBeNull();
    });

    it('should handle enterprise risk with null score', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        score: null,
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.score).toBeNull();
    });

    it('should handle enterprise risk with score containing null fields', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        score: {
          InherentScoreMean: 75.5,
          ResidualScoreMean: null,
          InherentRatingMean: null,
          ResidualRatingMean: 2.1,
        },
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.score).toEqual({
        inherentScoreMean: 75.5,
        residualScoreMean: null,
        inherentRatingMean: null,
        residualRatingMean: 2.1,
      });
    });

    it('should always return empty arrays for owners and contributors', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        owners: [{ UserId: 'provider|owner1' }],
        contributors: [{ UserId: 'provider|contributor1' }],
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      // Enterprise risk queries don't return owners or contributors
      expect(result.owners).toEqual([]);
      expect(result.contributors).toEqual([]);
      expect(result.links.owners).toEqual([]);
      expect(result.links.contributors).toEqual([]);
    });

    it('should handle enterprise risk with empty tags array', () => {
      const result = transformItem(baseMockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.tags).toEqual([]);
    });

    it('should handle enterprise risk with null CreatedByUser', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });

    it('should handle enterprise risk with null SequentialId', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        SequentialId: null,
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.sequentialId).toBeNull();
    });

    it('should handle tier 0', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        Tier: 0,
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.tier).toBe(0);
    });

    it('should handle large tier values', () => {
      const mockEnterpriseRisk = {
        ...baseMockEnterpriseRisk,
        Tier: 10,
      };

      const result = transformItem(mockEnterpriseRisk as never, {
        basePath: '/api/v1',
      });

      expect(result.tier).toBe(10);
    });
  });

  describe('transformListQueryResponse', () => {
    const baseMockEnterpriseRisk = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Enterprise Risk 1',
      Description: 'Description 1',
      SequentialId: 1,
      Tier: 2,
      Treatment: 'mitigate',
      ParentId: null,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      parent: null,
    };

    it('should transform a valid enterprise risk list query response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [
          {
            ...baseMockEnterpriseRisk,
          },
        ],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: baseMockEnterpriseRisk.Id,
        sequentialId: 1,
        title: 'Enterprise Risk 1',
        description: 'Description 1',
        tier: 2,
        treatment: 'mitigate',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user123',
        owners: [],
        contributors: [],
        tags: [],
        links: {
          self: {
            href: '/api/v1/enterprise-risks/123e4567-e89b-12d3-a456-426614174000',
          },
          createdBy: {
            id: 'provider|user123',
            type: 'user',
            href: '/api/v1/users/provider|user123',
          },
          updatedBy: {
            id: 'provider|user123',
            type: 'user',
            href: '/api/v1/users/provider|user123',
          },
          owners: [],
          contributors: [],
          parents: [],
        },
      });
    });

    it('should handle empty enterprise risk list', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [],
      } as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(0);
    });

    it('should transform multiple enterprise risks', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [
          {
            ...baseMockEnterpriseRisk,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Enterprise Risk 1',
          },
          {
            ...baseMockEnterpriseRisk,
            Id: '123e4567-e89b-12d3-a456-426614174002',
            Title: 'Enterprise Risk 2',
          },
          {
            ...baseMockEnterpriseRisk,
            Id: '123e4567-e89b-12d3-a456-426614174003',
            Title: 'Enterprise Risk 3',
          },
        ],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0]?.title).toBe('Enterprise Risk 1');
      expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[1]?.title).toBe('Enterprise Risk 2');
      expect(result[2]?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(result[2]?.title).toBe('Enterprise Risk 3');
    });

    it('should trim whitespace from titles and descriptions', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [
          {
            ...baseMockEnterpriseRisk,
            Title: '  Enterprise Risk with spaces  ',
            Description: '  Description with spaces  ',
          },
        ],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.title).toBe('Enterprise Risk with spaces');
      expect(result[0]?.description).toBe('Description with spaces');
    });

    it('should handle enterprise risks with null ModifiedByUser and ModifiedAtTimestamp', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [
          {
            ...baseMockEnterpriseRisk,
            ModifiedByUser: null,
            ModifiedAtTimestamp: null,
          },
        ],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.updatedBy).toBe('provider|user123');
      expect(result[0]?.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result[0]?.links.updatedBy).toEqual(result[0]?.links.createdBy);
    });

    it('should return empty parents array when parent is null', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [{ ...baseMockEnterpriseRisk, parent: null }],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toEqual([]);
    });

    it('should transform parent to parents array when parent exists', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [
          {
            ...baseMockEnterpriseRisk,
            parent: {
              Id: '223e4567-e89b-12d3-a456-426614174000',
              Title: 'Parent Enterprise Risk',
            },
          },
        ],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toHaveLength(1);
      expect(result[0]?.links.parents[0]).toEqual({
        id: '223e4567-e89b-12d3-a456-426614174000',
        type: 'enterprise-risk',
        href: '/api/v1/enterprise-risks/223e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should handle null treatment in list response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [
          {
            ...baseMockEnterpriseRisk,
            Treatment: null,
          },
        ],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.treatment).toBeNull();
    });

    it('should handle tier 0 in list response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [
          {
            ...baseMockEnterpriseRisk,
            Tier: 0,
          },
        ],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.tier).toBe(0);
    });

    it('should handle different treatment values', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        enterpriseRisk: [
          {
            ...baseMockEnterpriseRisk,
            Treatment: 'accept',
          },
          {
            ...baseMockEnterpriseRisk,
            Id: '223e4567-e89b-12d3-a456-426614174001',
            Treatment: 'transfer',
          },
          {
            ...baseMockEnterpriseRisk,
            Id: '323e4567-e89b-12d3-a456-426614174002',
            Treatment: 'avoid',
          },
        ],
      } as unknown as EnterpriseRiskListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.enterpriseRisk,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.treatment).toBe('accept');
      expect(result[1]?.treatment).toBe('transfer');
      expect(result[2]?.treatment).toBe('avoid');
    });
  });
});
