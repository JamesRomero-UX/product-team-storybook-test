import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IssueCausesListResponse } from '../../clients/client.interface';
import {
  transformCauseItem,
  transformCauseListQueryResponse,
} from './cause.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
}));

describe('cause.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const { firstDefined, idToResourceReference } =
      await import('../../utils/transforms');

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
  });

  const mockMetadata = {
    nextId: null,
    nextDateTime: null,
    hasNext: false,
    hasPrev: false,
    prevId: null,
    prevDateTime: null,
    count: 1,
  };

  const baseMockCause = {
    Id: '123e4567-e89b-12d3-a456-426614174000',
    Title: 'Test Cause',
    Description: 'Test Description',
    Significance: 5,
    CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
    ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
    CreatedByUser: 'provider|user123',
    ModifiedByUser: 'provider|user123',
    ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
  };

  describe('transformCauseItem', () => {
    it('should transform a valid cause item response', () => {
      const mockCause = {
        ...baseMockCause,
        Title: '  Test Cause Item  ',
        Description: '  Detailed cause description  ',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
        Significance: 8,
      };

      const result = transformCauseItem(mockCause as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Cause Item',
        description: 'Detailed cause description',
        significance: 8,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        links: {
          self: {
            href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001/causes/123e4567-e89b-12d3-a456-426614174000',
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
        },
      });
    });

    it('should throw error when linkId is missing', () => {
      expect(() =>
        transformCauseItem(baseMockCause as never, {
          basePath: '/api/v1',
        })
      ).toThrow('Link ID required for cause transforms');
    });

    it('should handle cause with null Description', () => {
      const mockCause = {
        ...baseMockCause,
        Description: null,
      };

      const result = transformCauseItem(mockCause as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle cause with empty Description string', () => {
      const mockCause = {
        ...baseMockCause,
        Description: '',
      };

      const result = transformCauseItem(mockCause as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle cause with whitespace-only Description', () => {
      const mockCause = {
        ...baseMockCause,
        Description: '   ',
      };

      const result = transformCauseItem(mockCause as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle null ModifiedByUser and default to CreatedByUser', () => {
      const mockCause = {
        ...baseMockCause,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformCauseItem(mockCause as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle null CreatedByUser', () => {
      const mockCause = {
        ...baseMockCause,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformCauseItem(mockCause as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });

    it('should handle cause with null Significance', () => {
      const mockCause = {
        ...baseMockCause,
        Significance: null,
      };

      const result = transformCauseItem(mockCause as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.significance).toBeNull();
    });
  });

  describe('transformCauseListQueryResponse', () => {
    it('should transform a valid cause list query response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        cause: [
          {
            ...baseMockCause,
            Significance: 7,
          },
        ],
      } as unknown as IssueCausesListResponse;

      const result = transformCauseListQueryResponse(
        {
          data: mockQueryResponse.cause,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: baseMockCause.Id,
        title: 'Test Cause',
        description: 'Test Description',
        significance: 7,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user123',
        links: {
          self: {
            href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001/causes/123e4567-e89b-12d3-a456-426614174000',
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
          parents: [
            {
              id: '456e4567-e89b-12d3-a456-426614174001',
              type: 'issue',
              href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001',
            },
          ],
        },
      });
    });

    it('should throw error when linkId is missing', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        cause: [baseMockCause],
      } as unknown as IssueCausesListResponse;

      expect(() =>
        transformCauseListQueryResponse(
          {
            data: mockQueryResponse.cause,
            metadata: mockQueryResponse.pageMetadata,
          },
          {
            basePath: '/api/v1',
          }
        )
      ).toThrow('Link ID required for cause transforms');
    });

    it('should handle empty cause list', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        cause: [],
      } as unknown as IssueCausesListResponse;

      const result = transformCauseListQueryResponse(
        {
          data: mockQueryResponse.cause,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(0);
    });

    it('should transform multiple causes', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        cause: [
          {
            ...baseMockCause,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Cause 1',
          },
          {
            ...baseMockCause,
            Id: '123e4567-e89b-12d3-a456-426614174002',
            Title: 'Cause 2',
          },
          {
            ...baseMockCause,
            Id: '123e4567-e89b-12d3-a456-426614174003',
            Title: 'Cause 3',
          },
        ],
      } as unknown as IssueCausesListResponse;

      const result = transformCauseListQueryResponse(
        {
          data: mockQueryResponse.cause,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0]?.title).toBe('Cause 1');
      expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[1]?.title).toBe('Cause 2');
      expect(result[2]?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(result[2]?.title).toBe('Cause 3');
    });

    it('should trim whitespace from titles and descriptions', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        cause: [
          {
            ...baseMockCause,
            Title: '  Cause with spaces  ',
            Description: '  Description with spaces  ',
          },
        ],
      } as unknown as IssueCausesListResponse;

      const result = transformCauseListQueryResponse(
        {
          data: mockQueryResponse.cause,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result[0]?.title).toBe('Cause with spaces');
      expect(result[0]?.description).toBe('Description with spaces');
    });

    it('should handle causes with null ModifiedByUser and ModifiedAtTimestamp', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        cause: [
          {
            ...baseMockCause,
            ModifiedByUser: null,
            ModifiedAtTimestamp: null,
          },
        ],
      } as unknown as IssueCausesListResponse;

      const result = transformCauseListQueryResponse(
        {
          data: mockQueryResponse.cause,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result[0]?.updatedBy).toBe('provider|user123');
      expect(result[0]?.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result[0]?.links.updatedBy).toEqual(result[0]?.links.createdBy);
    });

    it('should include parent issue reference in links', () => {
      const parentIssueId = '789e4567-e89b-12d3-a456-426614174999';
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        cause: [
          {
            ...baseMockCause,
            ParentIssueId: parentIssueId,
          },
        ],
      } as unknown as IssueCausesListResponse;

      const result = transformCauseListQueryResponse(
        {
          data: mockQueryResponse.cause,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: parentIssueId,
        }
      );

      expect(result[0]?.links.parents).toEqual([
        {
          id: parentIssueId,
          type: 'issue',
          href: `/api/v1/issues/${parentIssueId}`,
        },
      ]);
    });
  });
});
