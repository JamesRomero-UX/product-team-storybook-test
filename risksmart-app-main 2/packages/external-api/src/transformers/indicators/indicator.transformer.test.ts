import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IndicatorListQueryResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformItem,
  transformListQueryResponse,
} from './indicator.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn().mockReturnValue({ href: 'href/path' }),
}));

describe('indicator.transformer', () => {
  const mockedLinkedItem = {
    linkedItems: { href: 'href/path' },
    results: { href: 'href/path' },
  };
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
        ['risk', { type: 'risk', path: 'risks' }],
        ['control', { type: 'control', path: 'controls' }],
        ['indicator', { type: 'indicator', path: 'indicators' }],
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
    const baseMockIndicator = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Indicator',
      Description: 'Test Description',
      SequentialId: 1,
      Type: 'kpi',
      Unit: 'percentage',
      TargetValueTxt: '95',
      UpperToleranceNum: 100,
      LowerToleranceNum: 80,
      UpperAppetiteNum: 90,
      LowerAppetiteNum: 70,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      ancestorContributors: [],
      relationFiles: [],
      scheduleAndState: null,
    };

    it('should transform a valid indicator item response', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        Title: '  Test Indicator Item  ',
        Description: '  Detailed indicator description  ',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
        owners: [{ UserId: 'provider|owner1' }, { UserId: 'provider|owner2' }],
        contributors: [{ UserId: 'provider|contributor1' }],
        tags: [
          {
            type: {
              Name: 'kpi',
              Description: 'Key Performance Indicator',
            },
          },
        ],
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        title: 'Test Indicator Item',
        description: 'Detailed indicator description',
        type: 'kpi',
        unit: 'percentage',
        targetValue: '95',
        upperTolerance: 100,
        lowerTolerance: 80,
        upperAppetite: 90,
        lowerAppetite: 70,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'kpi',
            description: 'Key Performance Indicator',
          },
        ],
        schedule: {
          frequency: null,
          manualDueDate: null,
          startDate: null,
          timeToCompleteUnit: null,
          timeToCompleteValue: null,
        },
        scheduleState: {
          dueDate: null,
          latestDate: null,
          overdueDate: null,
        },
        links: {
          ...mockedLinkedItem,
          self: {
            href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000',
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
          owners: [
            {
              id: 'provider|owner1',
              type: 'user',
              href: '/api/v1/users/provider|owner1',
            },
            {
              id: 'provider|owner2',
              type: 'user',
              href: '/api/v1/users/provider|owner2',
            },
          ],
          contributors: [
            {
              id: 'provider|contributor1',
              type: 'user',
              href: '/api/v1/users/provider|contributor1',
            },
          ],
        },
      });
    });

    it('should handle indicator with null Description and default updatedBy to createdBy', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        Description: null,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result.description).toBeNull();
      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle indicator with whitespace-only description string', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        Description: '   ',
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      // Whitespace-only strings are trimmed to empty string, which becomes null
      expect(result.description).toBeNull();
    });

    it('should handle indicator with null Unit and TargetValueTxt', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        Unit: null,
        TargetValueTxt: null,
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result.unit).toBeNull();
      expect(result.targetValue).toBeNull();
    });

    it('should handle indicator with null tolerance values', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        UpperToleranceNum: null,
        LowerToleranceNum: null,
        UpperAppetiteNum: null,
        LowerAppetiteNum: null,
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result.upperTolerance).toBeNull();
      expect(result.lowerTolerance).toBeNull();
      expect(result.upperAppetite).toBeNull();
      expect(result.lowerAppetite).toBeNull();
    });

    it('should filter out tags with null type', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        tags: [
          {
            type: {
              Name: 'valid-tag',
              Description: 'Valid tag description',
            },
          },
          {
            type: null,
          },
          {
            type: {
              Name: 'another-valid-tag',
              Description: 'Another valid tag',
            },
          },
        ],
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result.tags).toHaveLength(2);
      expect(result.tags).toEqual([
        {
          name: 'valid-tag',
          description: 'Valid tag description',
        },
        {
          name: 'another-valid-tag',
          description: 'Another valid tag',
        },
      ]);
    });

    it('should handle indicator with empty tags array', () => {
      const result = transformItem(baseMockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result.tags).toEqual([]);
    });

    it('should handle indicator with null CreatedByUser', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });

    it('should handle indicator with null SequentialId', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        SequentialId: null,
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result.sequentialId).toBeNull();
    });

    it('should handle different indicator types', () => {
      const mockIndicator = {
        ...baseMockIndicator,
        Type: 'metric',
      };

      const result = transformItem(mockIndicator as never, {
        basePath: '/api/v1',
      });

      expect(result.type).toBe('metric');
    });
  });

  describe('transformListQueryResponse', () => {
    const baseMockIndicator = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Indicator 1',
      Description: 'Description 1',
      SequentialId: 1,
      Type: 'kpi',
      Unit: 'percentage',
      TargetValueTxt: '95',
      UpperToleranceNum: 100,
      LowerToleranceNum: 80,
      UpperAppetiteNum: 90,
      LowerAppetiteNum: 70,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      parents: [],
    };

    it('should transform a valid indicator list query response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        indicator: [
          {
            ...baseMockIndicator,
            owners: [{ UserId: 'provider|owner1' }],
            contributors: [{ UserId: 'provider|contributor1' }],
            tags: [
              {
                type: {
                  Name: 'tag1',
                  Description: 'Tag 1 description',
                },
              },
            ],
            parents: [
              {
                parent: {
                  Id: '223e4567-e89b-12d3-a456-426614174000',
                  ObjectType: 'risk',
                },
              },
            ],
          },
        ],
      } as unknown as IndicatorListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.indicator,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: baseMockIndicator.Id,
        sequentialId: 1,
        title: 'Indicator 1',
        description: 'Description 1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user123',
        owners: ['provider|owner1'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'tag1',
            description: 'Tag 1 description',
          },
        ],
        links: {
          ...mockedLinkedItem,
          self: {
            href: '/api/v1/indicators/123e4567-e89b-12d3-a456-426614174000',
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
          owners: [
            {
              id: 'provider|owner1',
              type: 'user',
              href: '/api/v1/users/provider|owner1',
            },
          ],
          contributors: [
            {
              id: 'provider|contributor1',
              type: 'user',
              href: '/api/v1/users/provider|contributor1',
            },
          ],
          parents: [
            {
              id: '223e4567-e89b-12d3-a456-426614174000',
              type: 'risk',
              href: '/api/v1/risks/223e4567-e89b-12d3-a456-426614174000',
            },
          ],
        },
      });
    });

    it('should handle empty indicator list', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        indicator: [],
      } as IndicatorListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.indicator,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(0);
    });

    it('should transform multiple indicators', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        indicator: [
          {
            ...baseMockIndicator,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Indicator 1',
          },
          {
            ...baseMockIndicator,
            Id: '123e4567-e89b-12d3-a456-426614174002',
            Title: 'Indicator 2',
          },
          {
            ...baseMockIndicator,
            Id: '123e4567-e89b-12d3-a456-426614174003',
            Title: 'Indicator 3',
          },
        ],
      } as unknown as IndicatorListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.indicator,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0]?.title).toBe('Indicator 1');
      expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[1]?.title).toBe('Indicator 2');
      expect(result[2]?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(result[2]?.title).toBe('Indicator 3');
    });

    it('should trim whitespace from titles and descriptions', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        indicator: [
          {
            ...baseMockIndicator,
            Title: '  Indicator with spaces  ',
            Description: '  Description with spaces  ',
          },
        ],
      } as unknown as IndicatorListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.indicator,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.title).toBe('Indicator with spaces');
      expect(result[0]?.description).toBe('Description with spaces');
    });

    it('should handle indicators with null ModifiedByUser and ModifiedAtTimestamp', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        indicator: [
          {
            ...baseMockIndicator,
            ModifiedByUser: null,
            ModifiedAtTimestamp: null,
          },
        ],
      } as unknown as IndicatorListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.indicator,
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

    it('should handle indicators with empty parents array', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        indicator: [{ ...baseMockIndicator, parents: [] }],
      } as unknown as IndicatorListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.indicator,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toEqual([]);
    });

    it('should handle indicators with multiple parents', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        indicator: [
          {
            ...baseMockIndicator,
            parents: [
              {
                parent: {
                  Id: '223e4567-e89b-12d3-a456-426614174001',
                  ObjectType: 'risk',
                },
              },
              {
                parent: {
                  Id: '323e4567-e89b-12d3-a456-426614174001',
                  ObjectType: 'control',
                },
              },
            ],
          },
        ],
      } as unknown as IndicatorListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.indicator,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toHaveLength(2);
      expect(result[0]?.links.parents?.[0]).toEqual({
        id: '223e4567-e89b-12d3-a456-426614174001',
        type: 'risk',
        href: '/api/v1/risks/223e4567-e89b-12d3-a456-426614174001',
      });
      expect(result[0]?.links.parents?.[1]).toEqual({
        id: '323e4567-e89b-12d3-a456-426614174001',
        type: 'control',
        href: '/api/v1/controls/323e4567-e89b-12d3-a456-426614174001',
      });
    });

    it('should filter out parents with invalid or missing data', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        indicator: [
          {
            ...baseMockIndicator,
            parents: [
              {
                parent: {
                  Id: '223e4567-e89b-12d3-a456-426614174002',
                  ObjectType: 'risk',
                },
              },
              {
                parent: null,
              },
              {
                parent: {
                  Id: '323e4567-e89b-12d3-a456-426614174002',
                  ObjectType: 'control',
                },
              },
            ],
          },
        ],
      } as unknown as IndicatorListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.indicator,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toHaveLength(2);
      expect(result[0]?.links.parents?.[0]?.id).toBe(
        '223e4567-e89b-12d3-a456-426614174002'
      );
      expect(result[0]?.links.parents?.[1]?.id).toBe(
        '323e4567-e89b-12d3-a456-426614174002'
      );
    });
  });
});
