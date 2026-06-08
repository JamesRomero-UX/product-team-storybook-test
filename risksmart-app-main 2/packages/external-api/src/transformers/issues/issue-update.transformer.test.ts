import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IssueUpdatesListResponse } from '../../clients/client.interface';
import {
  transformIssueUpdateItem,
  transformIssueUpdateListQueryResponse,
} from './issue-update.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
}));

describe('issue-update.transformer', () => {
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

  const baseMockIssueUpdate = {
    Id: '123e4567-e89b-12d3-a456-426614174000',
    Title: 'Test Issue Update',
    Description: 'Test Description',
    CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
    ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
    CreatedByUser: 'provider|user123',
    ModifiedByUser: 'provider|user123',
    ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
  };

  describe('transformIssueUpdateItem', () => {
    it('should transform a valid issue update item response', () => {
      const mockIssueUpdate = {
        ...baseMockIssueUpdate,
        Title: '  Test Issue Update Item  ',
        Description: '  Detailed issue update description  ',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
      };

      const result = transformIssueUpdateItem(mockIssueUpdate as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Issue Update Item',
        description: 'Detailed issue update description',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        links: {
          self: {
            href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001/updates/123e4567-e89b-12d3-a456-426614174000',
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
        transformIssueUpdateItem(baseMockIssueUpdate as never, {
          basePath: '/api/v1',
        })
      ).toThrow('Link ID required for update transforms');
    });

    it('should handle issue update with null Description', () => {
      const mockIssueUpdate = {
        ...baseMockIssueUpdate,
        Description: null,
      };

      const result = transformIssueUpdateItem(mockIssueUpdate as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle issue update with empty Description string', () => {
      const mockIssueUpdate = {
        ...baseMockIssueUpdate,
        Description: '',
      };

      const result = transformIssueUpdateItem(mockIssueUpdate as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle issue update with whitespace-only Description', () => {
      const mockIssueUpdate = {
        ...baseMockIssueUpdate,
        Description: '   ',
      };

      const result = transformIssueUpdateItem(mockIssueUpdate as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle null ModifiedByUser and default to CreatedByUser', () => {
      const mockIssueUpdate = {
        ...baseMockIssueUpdate,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformIssueUpdateItem(mockIssueUpdate as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle null CreatedByUser', () => {
      const mockIssueUpdate = {
        ...baseMockIssueUpdate,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformIssueUpdateItem(mockIssueUpdate as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });
  });

  describe('transformIssueUpdateListQueryResponse', () => {
    it('should transform a valid issue update list query response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        update: [baseMockIssueUpdate],
      } as unknown as IssueUpdatesListResponse;

      const result = transformIssueUpdateListQueryResponse(
        {
          data: mockQueryResponse.update,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: baseMockIssueUpdate.Id,
        title: 'Test Issue Update',
        description: 'Test Description',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user123',
        links: {
          self: {
            href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001/updates/123e4567-e89b-12d3-a456-426614174000',
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
        update: [baseMockIssueUpdate],
      } as unknown as IssueUpdatesListResponse;

      expect(() =>
        transformIssueUpdateListQueryResponse(
          {
            data: mockQueryResponse.update,
            metadata: mockQueryResponse.pageMetadata,
          },
          {
            basePath: '/api/v1',
          }
        )
      ).toThrow('Link ID required for update transforms');
    });

    it('should handle empty issue update list', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        update: [],
      } as unknown as IssueUpdatesListResponse;

      const result = transformIssueUpdateListQueryResponse(
        {
          data: mockQueryResponse.update,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(0);
    });

    it('should transform multiple issue updates', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        update: [
          {
            ...baseMockIssueUpdate,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Update 1',
          },
          {
            ...baseMockIssueUpdate,
            Id: '123e4567-e89b-12d3-a456-426614174002',
            Title: 'Update 2',
          },
          {
            ...baseMockIssueUpdate,
            Id: '123e4567-e89b-12d3-a456-426614174003',
            Title: 'Update 3',
          },
        ],
      } as unknown as IssueUpdatesListResponse;

      const result = transformIssueUpdateListQueryResponse(
        {
          data: mockQueryResponse.update,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0]?.title).toBe('Update 1');
      expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[1]?.title).toBe('Update 2');
      expect(result[2]?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(result[2]?.title).toBe('Update 3');
    });

    it('should trim whitespace from titles and descriptions', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        update: [
          {
            ...baseMockIssueUpdate,
            Title: '  Update with spaces  ',
            Description: '  Description with spaces  ',
          },
        ],
      } as unknown as IssueUpdatesListResponse;

      const result = transformIssueUpdateListQueryResponse(
        {
          data: mockQueryResponse.update,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result[0]?.title).toBe('Update with spaces');
      expect(result[0]?.description).toBe('Description with spaces');
    });

    it('should handle issue updates with null ModifiedByUser and ModifiedAtTimestamp', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        update: [
          {
            ...baseMockIssueUpdate,
            ModifiedByUser: null,
            ModifiedAtTimestamp: null,
          },
        ],
      } as unknown as IssueUpdatesListResponse;

      const result = transformIssueUpdateListQueryResponse(
        {
          data: mockQueryResponse.update,
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
        update: [
          {
            ...baseMockIssueUpdate,
            ParentIssueId: parentIssueId,
          },
        ],
      } as unknown as IssueUpdatesListResponse;

      const result = transformIssueUpdateListQueryResponse(
        {
          data: mockQueryResponse.update,
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
