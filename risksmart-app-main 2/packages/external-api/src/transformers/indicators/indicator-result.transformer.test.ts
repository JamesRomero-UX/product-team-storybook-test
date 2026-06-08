import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  transformIndicatorResultItem,
  transformIndicatorResultListQueryResponse,
} from './indicator-result.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  idToResourceReference: vi.fn(),
}));

vi.mock('../common/base.transformer', () => ({
  buildBaseLinks: vi.fn(),
}));

describe('indicator-result.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const { idToResourceReference } = await import('../../utils/transforms');
    const { buildBaseLinks } = await import('../common/base.transformer');

    vi.mocked(idToResourceReference).mockImplementation(
      (id, type, hrefPrefix) => ({
        id,
        type,
        href: `${hrefPrefix}/${id}`,
      })
    );

    vi.mocked(buildBaseLinks).mockImplementation(
      (resourcePath, resourceId) => ({
        self: { href: `${resourcePath}/${resourceId}` },
        createdBy: null,
        updatedBy: null,
        owners: [],
        contributors: [],
      })
    );
  });

  // Common mock objects
  const baseMockIndicatorResult = {
    Id: '123e4567-e89b-12d3-a456-426614174000',
    Description: 'Test Result Description',
    ResultDate: '2023-01-15T00:00:00.000Z',
    TargetValueTxt: 'On Track',
    TargetValueNum: 95,
    CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
    ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
    CreatedByUser: 'provider|user123',
    ModifiedByUser: 'provider|user456',
    parent: {
      Id: '223e4567-e89b-12d3-a456-426614174000',
    },
  };

  const baseTransformOpts = {
    basePath: '/api/v1',
    linkId: '223e4567-e89b-12d3-a456-426614174000',
  };

  describe('transformIndicatorResultItem', () => {
    it('should transform a valid indicator result item response', () => {
      const result = transformIndicatorResultItem(
        baseMockIndicatorResult as never,
        baseTransformOpts
      );

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Test Result Description',
        resultDate: '2023-01-15T00:00:00.000Z',
        targetValueText: 'On Track',
        targetValueNumber: 95,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        links: {
          self: {
            href: '/api/v1/indicators/223e4567-e89b-12d3-a456-426614174000/results/123e4567-e89b-12d3-a456-426614174000',
          },
          createdBy: null,
          updatedBy: null,
          owners: [],
          contributors: [],
        },
      });
    });

    it('should handle indicator result with null Description', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        Description: null,
      };

      const result = transformIndicatorResultItem(
        mockResult as never,
        baseTransformOpts
      );

      expect(result.description).toBeNull();
    });

    it('should handle indicator result with null TargetValueTxt', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        TargetValueTxt: null,
      };

      const result = transformIndicatorResultItem(
        mockResult as never,
        baseTransformOpts
      );

      expect(result.targetValueText).toBeNull();
    });

    it('should handle indicator result with null TargetValueNum', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        TargetValueNum: null,
      };

      const result = transformIndicatorResultItem(
        mockResult as never,
        baseTransformOpts
      );

      expect(result.targetValueNumber).toBeNull();
    });

    it('should handle indicator result with null ModifiedByUser', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        ModifiedByUser: null,
      };

      const result = transformIndicatorResultItem(
        mockResult as never,
        baseTransformOpts
      );

      // Should default to CreatedByUser
      expect(result.updatedBy).toBe('provider|user123');
    });

    it('should handle indicator result with different CreatedByUser', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        CreatedByUser: 'provider|user789',
        ModifiedByUser: null,
      };

      const result = transformIndicatorResultItem(
        mockResult as never,
        baseTransformOpts
      );

      expect(result.createdBy).toBe('provider|user789');
      expect(result.updatedBy).toBe('provider|user789');
    });

    it('should throw error when linkId is missing', () => {
      expect(() =>
        transformIndicatorResultItem(baseMockIndicatorResult as never, {
          basePath: '/api/v1',
        })
      ).toThrow(
        'Link ID (indicatorId) required for indicator result transforms'
      );
    });

    it('should throw error when linkId is undefined', () => {
      expect(() =>
        transformIndicatorResultItem(baseMockIndicatorResult as never, {
          basePath: '/api/v1',
          linkId: undefined,
        })
      ).toThrow(
        'Link ID (indicatorId) required for indicator result transforms'
      );
    });

    it('should throw error when linkId is empty string', () => {
      expect(() =>
        transformIndicatorResultItem(baseMockIndicatorResult as never, {
          basePath: '/api/v1',
          linkId: '',
        })
      ).toThrow(
        'Link ID (indicatorId) required for indicator result transforms'
      );
    });
  });

  describe('transformIndicatorResultListQueryResponse', () => {
    const mockMetadata = {
      nextId: null,
      nextDateTime: null,
      hasNext: false,
      hasPrev: false,
      prevId: null,
      prevDateTime: null,
      count: 1,
    };

    it('should transform a valid indicator result list query response', () => {
      const result = transformIndicatorResultListQueryResponse(
        {
          data: [baseMockIndicatorResult] as never,
          metadata: mockMetadata,
        },
        baseTransformOpts
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Test Result Description',
        resultDate: '2023-01-15T00:00:00.000Z',
        targetValueText: 'On Track',
        targetValueNumber: 95,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        links: {
          self: {
            href: '/api/v1/indicators/223e4567-e89b-12d3-a456-426614174000/results/123e4567-e89b-12d3-a456-426614174000',
          },
          createdBy: null,
          updatedBy: null,
          owners: [],
          contributors: [],
          parents: [
            {
              id: '223e4567-e89b-12d3-a456-426614174000',
              type: 'indicator',
              href: '/api/v1/indicators/223e4567-e89b-12d3-a456-426614174000',
            },
          ],
        },
      });
    });

    it('should handle empty indicator result list', () => {
      const result = transformIndicatorResultListQueryResponse(
        {
          data: [] as never,
          metadata: mockMetadata,
        },
        baseTransformOpts
      );

      expect(result).toHaveLength(0);
    });

    it('should transform multiple indicator results', () => {
      const mockResults = [
        {
          ...baseMockIndicatorResult,
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Description: 'Result 1',
        },
        {
          ...baseMockIndicatorResult,
          Id: '123e4567-e89b-12d3-a456-426614174002',
          Description: 'Result 2',
        },
        {
          ...baseMockIndicatorResult,
          Id: '123e4567-e89b-12d3-a456-426614174003',
          Description: 'Result 3',
        },
      ];

      const result = transformIndicatorResultListQueryResponse(
        {
          data: mockResults as never,
          metadata: mockMetadata,
        },
        baseTransformOpts
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0]?.description).toBe('Result 1');
      expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[1]?.description).toBe('Result 2');
      expect(result[2]?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(result[2]?.description).toBe('Result 3');
    });

    it('should handle indicator results with null parent', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        parent: null,
      };

      const result = transformIndicatorResultListQueryResponse(
        {
          data: [mockResult] as never,
          metadata: mockMetadata,
        },
        baseTransformOpts
      );

      expect(result[0]?.links.parents).toEqual([]);
    });

    it('should handle indicator results with undefined parent', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        parent: undefined,
      };

      const result = transformIndicatorResultListQueryResponse(
        {
          data: [mockResult] as never,
          metadata: mockMetadata,
        },
        baseTransformOpts
      );

      expect(result[0]?.links.parents).toEqual([]);
    });

    it('should handle indicator results with null ModifiedByUser', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        ModifiedByUser: null,
      };

      const result = transformIndicatorResultListQueryResponse(
        {
          data: [mockResult] as never,
          metadata: mockMetadata,
        },
        baseTransformOpts
      );

      // Should default to CreatedByUser
      expect(result[0]?.updatedBy).toBe('provider|user123');
    });

    it('should throw error when linkId is missing', () => {
      expect(() =>
        transformIndicatorResultListQueryResponse(
          {
            data: [baseMockIndicatorResult] as never,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
          }
        )
      ).toThrow(
        'Link ID (indicatorId) required for indicator result transforms'
      );
    });

    it('should throw error when linkId is undefined', () => {
      expect(() =>
        transformIndicatorResultListQueryResponse(
          {
            data: [baseMockIndicatorResult] as never,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: undefined,
          }
        )
      ).toThrow(
        'Link ID (indicatorId) required for indicator result transforms'
      );
    });

    it('should throw error when linkId is empty string', () => {
      expect(() =>
        transformIndicatorResultListQueryResponse(
          {
            data: [baseMockIndicatorResult] as never,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: '',
          }
        )
      ).toThrow(
        'Link ID (indicatorId) required for indicator result transforms'
      );
    });

    it('should handle indicator results with null values for all nullable fields', () => {
      const mockResult = {
        ...baseMockIndicatorResult,
        Description: null,
        TargetValueTxt: null,
        TargetValueNum: null,
        ModifiedByUser: null,
      };

      const result = transformIndicatorResultListQueryResponse(
        {
          data: [mockResult] as never,
          metadata: mockMetadata,
        },
        baseTransformOpts
      );

      expect(result[0]?.description).toBeNull();
      expect(result[0]?.targetValueText).toBeNull();
      expect(result[0]?.targetValueNumber).toBeNull();
      expect(result[0]?.updatedBy).toBe('provider|user123');
    });

    it('should use correct base path in generated links', () => {
      const customBasePath = '/api/v2';
      const result = transformIndicatorResultListQueryResponse(
        {
          data: [baseMockIndicatorResult] as never,
          metadata: mockMetadata,
        },
        {
          basePath: customBasePath,
          linkId: '223e4567-e89b-12d3-a456-426614174000',
        }
      );

      expect(result[0]?.links.self.href).toContain(customBasePath);
      expect(result[0]?.links.parents?.[0]?.href).toContain(customBasePath);
    });
  });
});
