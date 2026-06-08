import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RiskRatingByIdResponse } from '../../clients/client.interface';
import {
  transformRatingsItemResponse,
  transformRatingsListQueryResponse,
} from './risk-rating.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  idToResourceReference: vi.fn(),
}));

vi.mock('../common/base.transformer', () => ({
  buildBaseLinks: vi.fn(),
  transformParents: vi.fn(),
}));

describe('risk-rating.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const { idToResourceReference } = await import('../../utils/transforms');
    const { buildBaseLinks, transformParents } =
      await import('../common/base.transformer');

    vi.mocked(idToResourceReference).mockImplementation(
      (id, type, hrefPrefix) => ({
        id,
        type,
        href: `${hrefPrefix}/${id}`,
      })
    );

    vi.mocked(buildBaseLinks).mockImplementation(
      (resourcePath, id, userRefs) => ({
        self: { href: resourcePath },
        createdBy: userRefs.createdBy,
        updatedBy: userRefs.updatedBy,
        owners: [],
        contributors: [],
      })
    );

    vi.mocked(transformParents).mockImplementation((parents) =>
      parents.map((p) => {
        // Ensure parent IDs are in the correct format (UUID or provider|id)
        const id = p.parent?.Id.includes('|')
          ? p.parent.Id
          : p.parent?.Id || '';

        return {
          id: id,
          type: `${p.parent?.ObjectType || ''}`,
          href: `/api/v1/${p.parent?.ObjectType}s/${id}`,
        };
      })
    );
  });

  const baseMockRating = {
    Id: '123e4567-e89b-12d3-a456-426614174000',
    CreatedAtTimestamp: '2023-01-01T00:00:00.000+00:00',
    ModifiedAtTimestamp: '2023-01-02T00:00:00.000+00:00',
    CreatedByUser: 'provider|user123',
    ModifiedByUser: 'provider|user456',
    ControlType: 'Controlled',
    Likelihood: 3,
    Impact: 4,
    Rating: 12,
    RatingType: 'inherent',
    TestDate: '2023-01-15T00:00:00.000+00:00',
    Rationale: 'Initial risk assessment',
    CustomAttributeData: null,
    parents: [
      {
        ParentId: '789e4567-e89b-12d3-a456-426614174001',
        ParentType: 'risk' as const,
      },
      {
        ParentId: '789e4567-e89b-12d3-a456-426614174002',
        ParentType: 'control' as const,
      },
    ],
  } as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

  describe('transformRatingsItemResponse', () => {
    it('should transform a valid risk rating item response', () => {
      const result = transformRatingsItemResponse(baseMockRating, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2023-01-01T00:00:00.000+00:00',
        updatedAt: '2023-01-02T00:00:00.000+00:00',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: [],
        contributors: [],
        tags: [],
        controlType: 'Controlled',
        likelihood: 3,
        impact: 4,
        rating: 12,
        ratingType: 'inherent',
        testDate: '2023-01-15T00:00:00.000+00:00',
        rationale: 'Initial risk assessment',
        links: {
          self: { href: '/api/v1/risks/risk-123/ratings' },
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
              id: '789e4567-e89b-12d3-a456-426614174001',
              type: 'risk',
              href: '/api/v1/risks/789e4567-e89b-12d3-a456-426614174001',
            },
            {
              id: '789e4567-e89b-12d3-a456-426614174002',
              type: 'control',
              href: '/api/v1/controls/789e4567-e89b-12d3-a456-426614174002',
            },
          ],
        },
      });
    });

    it('should throw error when linkId is missing', () => {
      expect(() =>
        transformRatingsItemResponse(baseMockRating, {
          basePath: '/api/v1',
        })
      ).toThrow('Link ID required for risk rating transforms');
    });

    it('should throw error when linkId is undefined', () => {
      expect(() =>
        transformRatingsItemResponse(baseMockRating, {
          basePath: '/api/v1',
          linkId: undefined,
        })
      ).toThrow('Link ID required for risk rating transforms');
    });

    it('should handle null ModifiedAtTimestamp by using CreatedAtTimestamp', () => {
      const ratingWithoutModifiedAt = {
        ...baseMockRating,
        ModifiedAtTimestamp: null,
      };

      const result = transformRatingsItemResponse(ratingWithoutModifiedAt, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000+00:00');
    });

    it('should handle null ModifiedByUser by using CreatedByUser', () => {
      const ratingWithoutModifiedBy = {
        ...baseMockRating,
        ModifiedByUser: null,
      } as unknown as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

      const result = transformRatingsItemResponse(ratingWithoutModifiedBy, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.updatedBy).toBe('provider|user123');
    });

    it('should handle null likelihood value', () => {
      const ratingWithNullLikelihood = {
        ...baseMockRating,
        Likelihood: null,
      };

      const result = transformRatingsItemResponse(ratingWithNullLikelihood, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.likelihood).toBeNull();
    });

    it('should handle null impact value', () => {
      const ratingWithNullImpact = {
        ...baseMockRating,
        Impact: null,
      };

      const result = transformRatingsItemResponse(ratingWithNullImpact, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.impact).toBeNull();
    });

    it('should handle null rating value', () => {
      const ratingWithNullRating = {
        ...baseMockRating,
        Rating: null,
      };

      const result = transformRatingsItemResponse(ratingWithNullRating, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.rating).toBeNull();
    });

    it('should handle null testDate value', () => {
      const ratingWithNullTestDate = {
        ...baseMockRating,
        TestDate: null,
      };

      const result = transformRatingsItemResponse(ratingWithNullTestDate, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.testDate).toBeNull();
    });

    it('should handle null rationale value', () => {
      const ratingWithNullRationale = {
        ...baseMockRating,
        Rationale: null,
      };

      const result = transformRatingsItemResponse(ratingWithNullRationale, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.rationale).toBeNull();
    });

    it('should handle empty parents array', () => {
      const ratingWithoutParents = {
        ...baseMockRating,
        parents: [],
      };

      const result = transformRatingsItemResponse(ratingWithoutParents, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.links.parents).toEqual([]);
    });

    it('should handle null CreatedByUser', () => {
      const ratingWithoutCreatedBy = {
        ...baseMockRating,
        CreatedByUser: null,
        ModifiedByUser: null,
      } as unknown as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

      const result = transformRatingsItemResponse(ratingWithoutCreatedBy, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
    });

    it('should use different basePath correctly', () => {
      const result = transformRatingsItemResponse(baseMockRating, {
        basePath: '/custom/api/v2',
        linkId: 'risk-456',
      });

      expect(result.links.self.href).toBe(
        '/custom/api/v2/risks/risk-456/ratings'
      );
    });

    it('should handle residual rating type', () => {
      const residualRating = {
        ...baseMockRating,
        RatingType: 'residual',
      };

      const result = transformRatingsItemResponse(residualRating, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.ratingType).toBe('residual');
    });

    it('should handle Uncontrolled control type', () => {
      const uncontrolledRating = {
        ...baseMockRating,
        ControlType: 'Uncontrolled',
      } as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

      const result = transformRatingsItemResponse(uncontrolledRating, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result.controlType).toBe('Uncontrolled');
    });
  });

  describe('transformRatingsListQueryResponse', () => {
    const mockListResponse = {
      data: [
        baseMockRating,
        {
          ...baseMockRating,
          Id: '456e7890-e89b-12d3-a456-426614174001',
          ControlType: 'Uncontrolled',
          Likelihood: 2,
          Impact: 3,
          Rating: 6,
          RatingType: 'residual',
          TestDate: null,
          Rationale: null,
          ModifiedAtTimestamp: null,
          ModifiedByUser: null,
          parents: [],
        } as unknown as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'],
      ],
      metadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    };

    it('should transform a valid risk rating list response', () => {
      const result = transformRatingsListQueryResponse(mockListResponse, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2023-01-01T00:00:00.000+00:00',
        updatedAt: '2023-01-02T00:00:00.000+00:00',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: [],
        contributors: [],
        tags: [],
        links: {
          self: { href: '/api/v1/risks/risk-123/ratings' },
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
              id: '789e4567-e89b-12d3-a456-426614174001',
              type: 'risk',
              href: '/api/v1/risks/789e4567-e89b-12d3-a456-426614174001',
            },
            {
              id: '789e4567-e89b-12d3-a456-426614174002',
              type: 'control',
              href: '/api/v1/controls/789e4567-e89b-12d3-a456-426614174002',
            },
          ],
        },
      });
    });

    it('should throw error when linkId is missing', () => {
      expect(() =>
        transformRatingsListQueryResponse(mockListResponse, {
          basePath: '/api/v1',
        })
      ).toThrow('Link ID required for risk rating transforms');
    });

    it('should throw error when linkId is undefined', () => {
      expect(() =>
        transformRatingsListQueryResponse(mockListResponse, {
          basePath: '/api/v1',
          linkId: undefined,
        })
      ).toThrow('Link ID required for risk rating transforms');
    });

    it('should handle empty data array', () => {
      const emptyResponse = {
        data: [],
        metadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      };

      const result = transformRatingsListQueryResponse(emptyResponse, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result).toEqual([]);
    });

    it('should handle multiple ratings with different null values', () => {
      const result = transformRatingsListQueryResponse(mockListResponse, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      // First rating has all values
      expect(result[0]?.updatedAt).toBe('2023-01-02T00:00:00.000+00:00');
      expect(result[0]?.updatedBy).toBe('provider|user456');

      // Second rating has null ModifiedAtTimestamp and ModifiedByUser
      expect(result[1]?.updatedAt).toBe('2023-01-01T00:00:00.000+00:00');
      expect(result[1]?.updatedBy).toBe('provider|user123');
    });

    it('should handle single rating in list', () => {
      const singleRatingResponse = {
        data: [baseMockRating],
        metadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 1,
        },
      };

      const result = transformRatingsListQueryResponse(singleRatingResponse, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should use different basePath for all items', () => {
      const result = transformRatingsListQueryResponse(mockListResponse, {
        basePath: '/custom/api/v2',
        linkId: 'risk-999',
      });

      result.forEach((rating) => {
        expect(rating.links.self.href).toBe(
          '/custom/api/v2/risks/risk-999/ratings'
        );
      });
    });

    it('should preserve distinct IDs for multiple ratings', () => {
      const result = transformRatingsListQueryResponse(mockListResponse, {
        basePath: '/api/v1',
        linkId: 'risk-123',
      });

      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result[1]?.id).toBe('456e7890-e89b-12d3-a456-426614174001');
      expect(result[0]?.id).not.toBe(result[1]?.id);
    });
  });
});
