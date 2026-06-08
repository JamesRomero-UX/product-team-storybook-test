import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ObligationListQueryResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformItem,
  transformListQueryResponse,
} from './obligation.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    firstDefined: vi.fn(),
    idToResourceReference: vi.fn(),
    nodeObjectTypeToResourceType: vi.fn(),
  };
});

describe('obligation.transformer', () => {
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
        ['obligation', { type: 'obligation', path: 'compliance/obligations' }],
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
    const baseMockObligation = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Obligation',
      Description: 'Test Description',
      SequentialId: 1,
      Type: 'regulatory',
      Interpretation: 'Financial Conduct Authority interpretation',
      Adherence: 'GDPR compliance requirements',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      ancestorContributors: [],
    };

    it('should transform a valid obligation item response', () => {
      const mockObligation = {
        ...baseMockObligation,
        Title: '  Test Obligation Item  ',
        Description: '  Detailed obligation description  ',
        Type: 'contractual',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
        owners: [{ UserId: 'provider|owner1' }, { UserId: 'provider|owner2' }],
        contributors: [{ UserId: 'provider|contributor1' }],
        tags: [
          {
            type: {
              Name: 'compliance',
              Description: 'Compliance obligation',
            },
          },
        ],
      };

      const result = transformItem(mockObligation as never, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        title: 'Test Obligation Item',
        description: 'Detailed obligation description',
        type: 'contractual',
        interpretation: 'Financial Conduct Authority interpretation',
        adherence: 'GDPR compliance requirements',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'compliance',
            description: 'Compliance obligation',
          },
        ],
        links: {
          linkedItems: {
            href: '/api/v1/compliance/obligations/123e4567-e89b-12d3-a456-426614174000/linked-items',
          },
          self: {
            href: '/api/v1/compliance/obligations/123e4567-e89b-12d3-a456-426614174000',
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

    it('should handle obligation with null Description and default updatedBy to createdBy', () => {
      const mockObligation = {
        ...baseMockObligation,
        Description: null,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockObligation as never, {
        basePath: '/api/v1',
      });

      expect(result.description).toBeNull();
      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle obligation with whitespace-only description string', () => {
      const mockObligation = {
        ...baseMockObligation,
        Description: '   ',
      };

      const result = transformItem(mockObligation as never, {
        basePath: '/api/v1',
      });

      // Whitespace-only strings are trimmed to empty string, which becomes null
      expect(result.description).toBeNull();
    });

    it('should handle obligation with null Interpretation', () => {
      const mockObligation = {
        ...baseMockObligation,
        Interpretation: null,
      };

      const result = transformItem(mockObligation as never, {
        basePath: '/api/v1',
      });

      expect(result.interpretation).toBeNull();
    });

    it('should filter out tags with null type', () => {
      const mockObligation = {
        ...baseMockObligation,
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

      const result = transformItem(mockObligation as never, {
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

    it('should handle obligation with empty tags array', () => {
      const result = transformItem(baseMockObligation as never, {
        basePath: '/api/v1',
      });

      expect(result.tags).toEqual([]);
    });

    it('should handle obligation with null CreatedByUser', () => {
      const mockObligation = {
        ...baseMockObligation,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockObligation as never, {
        basePath: '/api/v1',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });

    it('should handle obligation with null SequentialId', () => {
      const mockObligation = {
        ...baseMockObligation,
        SequentialId: null,
      };

      const result = transformItem(mockObligation as never, {
        basePath: '/api/v1',
      });

      expect(result.sequentialId).toBeNull();
    });
  });

  describe('transformListQueryResponse', () => {
    const baseMockObligation = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Obligation 1',
      Description: 'Description 1',
      SequentialId: 1,
      Type: 'regulatory',
      Interpretation: 'Interpretation text',
      Adherence: 'Adherence requirements',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      parent: null,
    };

    it('should transform a valid obligation list query response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        obligation: [
          {
            ...baseMockObligation,
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
          },
        ],
      } as unknown as ObligationListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.obligation,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: baseMockObligation.Id,
        sequentialId: 1,
        title: 'Obligation 1',
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
          linkedItems: {
            href: '/api/v1/compliance/obligations/123e4567-e89b-12d3-a456-426614174000/linked-items',
          },
          self: {
            href: '/api/v1/compliance/obligations/123e4567-e89b-12d3-a456-426614174000',
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
          parents: [],
        },
      });
    });

    it('should handle empty obligation list', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        obligation: [],
      } as ObligationListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.obligation,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(0);
    });

    it('should transform multiple obligations', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        obligation: [
          {
            ...baseMockObligation,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Obligation 1',
          },
          {
            ...baseMockObligation,
            Id: '123e4567-e89b-12d3-a456-426614174002',
            Title: 'Obligation 2',
          },
          {
            ...baseMockObligation,
            Id: '123e4567-e89b-12d3-a456-426614174003',
            Title: 'Obligation 3',
          },
        ],
      } as unknown as ObligationListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.obligation,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0]?.title).toBe('Obligation 1');
      expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[1]?.title).toBe('Obligation 2');
      expect(result[2]?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(result[2]?.title).toBe('Obligation 3');
    });

    it('should trim whitespace from titles and descriptions', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        obligation: [
          {
            ...baseMockObligation,
            Title: '  Obligation with spaces  ',
            Description: '  Description with spaces  ',
          },
        ],
      } as unknown as ObligationListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.obligation,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.title).toBe('Obligation with spaces');
      expect(result[0]?.description).toBe('Description with spaces');
    });

    it('should handle obligations with null ModifiedByUser and ModifiedAtTimestamp', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        obligation: [
          {
            ...baseMockObligation,
            ModifiedByUser: null,
            ModifiedAtTimestamp: null,
          },
        ],
      } as unknown as ObligationListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.obligation,
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
        obligation: [{ ...baseMockObligation, parent: null }],
      } as unknown as ObligationListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.obligation,
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
        obligation: [
          {
            ...baseMockObligation,
            parent: {
              Id: '223e4567-e89b-12d3-a456-426614174000',
              Title: 'Parent Obligation',
            },
          },
        ],
      } as unknown as ObligationListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.obligation,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toHaveLength(1);
      expect(result[0]?.links.parents[0]).toEqual({
        id: '223e4567-e89b-12d3-a456-426614174000',
        type: 'obligation',
        href: '/api/v1/compliance/obligations/223e4567-e89b-12d3-a456-426614174000',
      });
    });
  });
});
