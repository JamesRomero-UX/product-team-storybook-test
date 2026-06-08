import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AppetiteByIdResponse,
  RiskListAppetiteResponse,
} from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformAppetiteByIdResponse,
  transformAppetiteListQueryResponse,
} from './appetite.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
}));

vi.mock('../common/base.transformer', () => ({
  transformParents: vi.fn(),
}));

describe('appetite.transformer', () => {
  // Mock UUID constants for test data
  const MOCK_ANCESTOR_ID_1 = '11111111-1111-1111-1111-111111111111';
  const MOCK_ANCESTOR_ID_2 = '22222222-2222-2222-2222-222222222222';
  const MOCK_ANCESTOR_PARENT_ID_1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const MOCK_ANCESTOR_PARENT_ID_2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const {
      firstDefined,
      idToResourceReference,
      nodeObjectTypeToResourceType,
    } = await import('../../utils/transforms');
    const { transformParents } = await import('../common/base.transformer');

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
        ['risk', { type: 'risk', path: 'risks' }],
        ['control', { type: 'control', path: 'controls' }],
      ]);

      return resourceTypes.get(type) || undefined;
    });

    vi.mocked(transformParents).mockImplementation(() => {
      // transformParents is called but appetite parents don't have the nested parent structure
      // so it returns empty array
      return [];
    });
  });

  const mockMetadata = {
    nextId: null,
    hasNext: false,
    hasPrev: false,
    prevId: null,
    count: 1,
  };

  describe('transformAppetiteListQueryResponse', () => {
    it('should transform a valid appetite list query response', () => {
      const mockQueryResponse = {
        appetite: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            SequentialId: 1,
            Statement: 'Test appetite statement',
            EffectiveDate: '2023-06-01T00:00:00.000Z',
            LowerAppetite: 10,
            UpperAppetite: 90,
            AppetiteType: 'risk',
            ImpactAppetite: 50,
            LikelihoodAppetite: 30,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
            CreatedByUser: 'provider|user123',
            ModifiedByUser: 'provider|user456',
            parents: [
              {
                Id: 'parent-1',
                risk: {
                  Id: 'risk-1',
                },
                parent: null,
              },
            ],
          },
        ],
        pageMetadata: mockMetadata,
      } as unknown as RiskListAppetiteResponse;

      const result = transformAppetiteListQueryResponse(
        {
          data: mockQueryResponse.appetite,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        statement: 'Test appetite statement',
        effectiveDate: '2023-06-01T00:00:00.000Z',
        lowerAppetite: 10,
        upperAppetite: 90,
        appetiteType: 'risk',
        impactAppetite: 50,
        likelihoodAppetite: 30,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        links: {
          self: {
            href: '/api/v1/appetites/123e4567-e89b-12d3-a456-426614174000',
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
          parents: [
            {
              id: 'risk-1',
              type: 'risk',
              href: '/api/v1/risks/risk-1',
            },
          ],
        },
      });
    });

    it('should handle appetite with null values', () => {
      const mockQueryResponse = {
        appetite: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            SequentialId: 1,
            Statement: null,
            EffectiveDate: null,
            LowerAppetite: null,
            UpperAppetite: null,
            AppetiteType: null,
            ImpactAppetite: null,
            LikelihoodAppetite: null,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
            CreatedByUser: null,
            ModifiedByUser: null,
            parents: [],
          },
        ],
        pageMetadata: mockMetadata,
      } as unknown as RiskListAppetiteResponse;

      const result = transformAppetiteListQueryResponse(
        {
          data: mockQueryResponse.appetite,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.statement).toBeNull();
      expect(result[0]?.effectiveDate).toBeNull();
      expect(result[0]?.lowerAppetite).toBeNull();
      expect(result[0]?.upperAppetite).toBeNull();
      expect(result[0]?.appetiteType).toBeNull();
      expect(result[0]?.impactAppetite).toBeNull();
      expect(result[0]?.likelihoodAppetite).toBeNull();
      expect(result[0]?.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result[0]?.updatedBy).toBe(null);
    });

    it('should handle appetite with no ModifiedByUser (fallback to CreatedByUser)', () => {
      const mockQueryResponse = {
        appetite: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            SequentialId: 1,
            Statement: 'Test',
            EffectiveDate: null,
            LowerAppetite: null,
            UpperAppetite: null,
            AppetiteType: 'Risk',
            ImpactAppetite: null,
            LikelihoodAppetite: null,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
            CreatedByUser: 'provider|user123',
            ModifiedByUser: null,
            parents: [],
          },
        ],
        pageMetadata: mockMetadata,
      } as unknown as RiskListAppetiteResponse;

      const result = transformAppetiteListQueryResponse(
        {
          data: mockQueryResponse.appetite,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.updatedBy).toEqual({
        id: 'provider|user123',
        type: 'user',
        href: '/api/v1/users/provider|user123',
      });
    });

    it('should handle appetite with null CreatedByUser', () => {
      const mockQueryResponse = {
        appetite: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            SequentialId: 1,
            Statement: 'Test',
            EffectiveDate: null,
            LowerAppetite: null,
            UpperAppetite: null,
            AppetiteType: 'Risk',
            ImpactAppetite: null,
            LikelihoodAppetite: null,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
            CreatedByUser: null,
            ModifiedByUser: null,
            parents: [],
          },
        ],
        pageMetadata: mockMetadata,
      } as unknown as RiskListAppetiteResponse;

      const result = transformAppetiteListQueryResponse(
        {
          data: mockQueryResponse.appetite,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.createdBy).toBeNull();
      expect(result[0]?.links.updatedBy).toBeNull();
    });

    it('should handle appetite with linkId in props', () => {
      const mockQueryResponse = {
        appetite: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            SequentialId: 1,
            Statement: 'Test',
            EffectiveDate: null,
            LowerAppetite: null,
            UpperAppetite: null,
            AppetiteType: 'Risk',
            ImpactAppetite: null,
            LikelihoodAppetite: null,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
            CreatedByUser: 'provider|user123',
            ModifiedByUser: 'provider|user123',
            parents: [],
          },
        ],
        pageMetadata: mockMetadata,
      } as unknown as RiskListAppetiteResponse;

      const result = transformAppetiteListQueryResponse(
        {
          data: mockQueryResponse.appetite,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: 'risk-123',
        }
      );

      expect(result[0]?.links.self.href).toBe(
        '/api/v1/risks/risk-123/appetites/123e4567-e89b-12d3-a456-426614174000'
      );
    });

    it('should handle empty appetite list', () => {
      const mockQueryResponse: RiskListAppetiteResponse = {
        appetite: [],
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      };

      const result = transformAppetiteListQueryResponse(
        {
          data: mockQueryResponse.appetite,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toEqual([]);
    });

    it('should filter out parents with null risk', () => {
      const mockQueryResponse = {
        appetite: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            SequentialId: 1,
            Statement: 'Test',
            EffectiveDate: null,
            LowerAppetite: null,
            UpperAppetite: null,
            AppetiteType: 'Risk',
            ImpactAppetite: null,
            LikelihoodAppetite: null,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
            CreatedByUser: 'provider|user123',
            ModifiedByUser: 'provider|user123',
            parents: [
              {
                Id: 'parent-1',
                risk: {
                  Id: 'risk-1',
                },
              },
              {
                Id: 'parent-2',
                risk: null,
              },
            ],
          },
        ],
        pageMetadata: mockMetadata,
      } as unknown as RiskListAppetiteResponse;

      const result = transformAppetiteListQueryResponse(
        {
          data: mockQueryResponse.appetite,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      // Should filter out parent-2 because risk is null
      expect(result[0]?.links.parents).toHaveLength(1);
    });
  });

  describe('transformAppetiteByIdResponse', () => {
    it('should transform a valid appetite by ID response', () => {
      const mockAppetite = {
        appetite: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          SequentialId: 1,
          Statement: 'Detailed appetite statement',
          EffectiveDate: '2023-06-01T00:00:00.000Z',
          LowerAppetite: 10,
          UpperAppetite: 90,
          AppetiteType: 'risk',
          ImpactAppetite: 50,
          LikelihoodAppetite: 30,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user456',
          ancestorContributors: [
            {
              Id: MOCK_ANCESTOR_ID_1,
              ObjectType: 'risk',
              ContributorType: 'owner',
              AncestorId: MOCK_ANCESTOR_PARENT_ID_1,
              UserGroupId: 'group-1',
              UserId: 'provider|ancestor-user1',
            },
            {
              Id: MOCK_ANCESTOR_ID_2,
              ObjectType: 'control',
              ContributorType: 'contributor',
              AncestorId: MOCK_ANCESTOR_PARENT_ID_2,
              UserGroupId: null,
              UserId: null,
            },
          ],
          parents: [
            {
              Id: 'parent-1',
              risk: {
                Id: 'risk-1',
              },
            },
          ],
        },
      } as unknown as NonNullable<AppetiteByIdResponse>;

      const result = transformAppetiteByIdResponse(mockAppetite.appetite, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        statement: 'Detailed appetite statement',
        effectiveDate: '2023-06-01T00:00:00.000Z',
        lowerAppetite: 10,
        upperAppetite: 90,
        appetiteType: 'risk',
        impactAppetite: 50,
        likelihoodAppetite: 30,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        ancestorContributors: [
          {
            id: MOCK_ANCESTOR_ID_1,
            objectType: 'risk',
            contributorType: 'owner',
            ancestorId: MOCK_ANCESTOR_PARENT_ID_1,
            userGroupId: 'group-1',
            user: {
              id: 'provider|ancestor-user1',
              type: 'user',
              href: '/api/v1/users/provider|ancestor-user1',
            },
          },
          {
            id: MOCK_ANCESTOR_ID_2,
            objectType: 'control',
            contributorType: 'contributor',
            ancestorId: MOCK_ANCESTOR_PARENT_ID_2,
            userGroupId: null,
            user: null,
          },
        ],
        links: {
          self: {
            href: '/api/v1/appetites/123e4567-e89b-12d3-a456-426614174000',
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

    it('should handle appetite with empty ancestorContributors', () => {
      const mockAppetite = {
        appetite: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          SequentialId: 1,
          Statement: 'Test',
          EffectiveDate: null,
          LowerAppetite: null,
          UpperAppetite: null,
          AppetiteType: 'Risk',
          ImpactAppetite: null,
          LikelihoodAppetite: null,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          ancestorContributors: [],
          parents: [],
        },
      } as unknown as NonNullable<AppetiteByIdResponse>;

      const result = transformAppetiteByIdResponse(mockAppetite.appetite, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors).toEqual([]);
    });

    it('should handle appetite with null ancestorContributors', () => {
      const mockAppetite = {
        appetite: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          SequentialId: 1,
          Statement: 'Test',
          EffectiveDate: null,
          LowerAppetite: null,
          UpperAppetite: null,
          AppetiteType: 'Risk',
          ImpactAppetite: null,
          LikelihoodAppetite: null,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          ancestorContributors: null,
          parents: [],
        },
      } as unknown as NonNullable<AppetiteByIdResponse>;

      const result = transformAppetiteByIdResponse(mockAppetite.appetite, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors).toEqual([]);
    });

    it('should handle ancestorContributor with unknown ObjectType', async () => {
      const { nodeObjectTypeToResourceType } =
        await import('../../utils/transforms');

      // Mock to return undefined for unknown types
      vi.mocked(nodeObjectTypeToResourceType).mockImplementation((type) => {
        if (type === 'risk') {
          return { type: 'risk', path: 'risks' };
        }
        if (type === 'control') {
          return { type: 'control', path: 'controls' };
        }

        return undefined;
      });

      const mockAppetite = {
        appetite: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          SequentialId: 1,
          Statement: 'Test',
          EffectiveDate: null,
          LowerAppetite: null,
          UpperAppetite: null,
          AppetiteType: 'Risk',
          ImpactAppetite: null,
          LikelihoodAppetite: null,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          ancestorContributors: [
            {
              Id: MOCK_ANCESTOR_ID_1,
              ObjectType: 'unknown-type',
              ContributorType: 'owner',
              AncestorId: MOCK_ANCESTOR_PARENT_ID_1,
              UserGroupId: null,
              UserId: 'provider|user123',
            },
          ],
          parents: [],
        },
      } as unknown as NonNullable<AppetiteByIdResponse>;

      const result = transformAppetiteByIdResponse(mockAppetite.appetite, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors?.[0]?.objectType).toBeNull();
    });

    it('should handle ancestorContributor with null ObjectType', () => {
      const mockAppetite = {
        appetite: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          SequentialId: 1,
          Statement: 'Test',
          EffectiveDate: null,
          LowerAppetite: null,
          UpperAppetite: null,
          AppetiteType: 'Risk',
          ImpactAppetite: null,
          LikelihoodAppetite: null,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          ancestorContributors: [
            {
              Id: MOCK_ANCESTOR_ID_1,
              ObjectType: null,
              ContributorType: 'owner',
              AncestorId: MOCK_ANCESTOR_PARENT_ID_1,
              UserGroupId: null,
              UserId: 'provider|user123',
            },
          ],
          parents: [],
        },
      } as unknown as NonNullable<AppetiteByIdResponse>;

      const result = transformAppetiteByIdResponse(mockAppetite.appetite, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors?.[0]?.objectType).toBeNull();
    });

    it('should handle ancestorContributor with null UserId', () => {
      const mockAppetite = {
        appetite: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          SequentialId: 1,
          Statement: 'Test',
          EffectiveDate: null,
          LowerAppetite: null,
          UpperAppetite: null,
          AppetiteType: 'Risk',
          ImpactAppetite: null,
          LikelihoodAppetite: null,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          ancestorContributors: [
            {
              Id: MOCK_ANCESTOR_ID_1,
              ObjectType: 'risk',
              ContributorType: 'owner',
              AncestorId: MOCK_ANCESTOR_PARENT_ID_1,
              UserGroupId: null,
              UserId: null,
            },
          ],
          parents: [],
        },
      } as unknown as NonNullable<AppetiteByIdResponse>;

      const result = transformAppetiteByIdResponse(mockAppetite.appetite, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors?.[0]?.user).toBeNull();
    });
  });
});
