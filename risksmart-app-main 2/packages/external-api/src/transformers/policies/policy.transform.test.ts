import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DocumentListQueryResponse } from '../../clients/client.interface';
import { transformItem, transformListQueryResponse } from './policy.transform';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    firstDefined: vi.fn(),
    idToResourceReference: vi.fn(),
    nodeObjectTypeToResourceType: vi.fn(),
  };
});

describe('policy.transform', () => {
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

    vi.mocked(nodeObjectTypeToResourceType).mockImplementation(() => {
      return undefined;
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
    const baseMockDocument = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Policy',
      Purpose: 'Test Purpose',
      SequentialId: 1,
      DocumentType: 'governance',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    it('should transform a valid policy item response', () => {
      const mockDocument = {
        ...baseMockDocument,
        Title: '  Test Policy Item  ',
        Purpose: '  Detailed policy purpose  ',
        DocumentType: 'governance',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
        owners: [{ UserId: 'provider|owner1' }, { UserId: 'provider|owner2' }],
        contributors: [{ UserId: 'provider|contributor1' }],
        tags: [
          {
            type: {
              Name: 'compliance',
              Description: 'Compliance policy',
            },
          },
        ],
      };

      const result = transformItem(mockDocument as never, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        title: 'Test Policy Item',
        description: 'Detailed policy purpose',
        type: 'governance',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'compliance',
            description: 'Compliance policy',
          },
        ],
        links: {
          linkedItems: {
            href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174000/linked-items',
          },
          self: {
            href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174000',
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

    it('should handle policy with null description and default updatedBy to createdBy', () => {
      const mockDocument = {
        ...baseMockDocument,
        Purpose: null,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockDocument as never, {
        basePath: '/api/v1',
      });

      expect(result.description).toBeNull();
      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle policy with whitespace-only purpose string', () => {
      const mockDocument = {
        ...baseMockDocument,
        Purpose: '   ',
      };

      const result = transformItem(mockDocument as never, {
        basePath: '/api/v1',
      });

      // Whitespace-only strings are trimmed to empty string, which becomes null
      expect(result.description).toBeNull();
    });

    it('should handle policy with null type', () => {
      const mockDocument = {
        ...baseMockDocument,
        DocumentType: null,
      };

      const result = transformItem(mockDocument as never, {
        basePath: '/api/v1',
      });

      expect(result.type).toBeNull();
    });

    it('should filter out tags with null type', () => {
      const mockDocument = {
        ...baseMockDocument,
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

      const result = transformItem(mockDocument as never, {
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

    it('should handle policy with empty tags array', () => {
      const result = transformItem(baseMockDocument as never, {
        basePath: '/api/v1',
      });

      expect(result.tags).toEqual([]);
    });

    it('should handle policy with null CreatedByUser', () => {
      const mockDocument = {
        ...baseMockDocument,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockDocument as never, {
        basePath: '/api/v1',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });

    it('should handle empty owners and contributors arrays', () => {
      const result = transformItem(baseMockDocument as never, {
        basePath: '/api/v1',
      });

      expect(result.owners).toEqual([]);
      expect(result.contributors).toEqual([]);
      expect(result.links.owners).toEqual([]);
      expect(result.links.contributors).toEqual([]);
    });
  });

  describe('transformListQueryResponse', () => {
    const baseMockDocumentListItem = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Policy',
      Purpose: 'Test Purpose',
      SequentialId: 1,
      DocumentType: 'governance',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      parent: null,
    };

    it('should transform a valid policy list query response', () => {
      const mockQueryResponse: DocumentListQueryResponse = {
        document: [
          {
            ...baseMockDocumentListItem,
            Title: '  Test Policy  ',
            Purpose: '  Test Purpose  ',
            DocumentType: 'governance',
            ModifiedByUser: 'provider|user456',
            ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
            owners: [
              { UserId: 'provider|owner1' },
              { UserId: 'provider|owner2' },
            ],
            contributors: [{ UserId: 'provider|contributor1' }],
            tags: [
              {
                type: {
                  Name: 'compliance',
                  Description: 'Compliance policy',
                },
              },
              {
                type: {
                  Name: 'security',
                  Description: 'Security policy',
                },
              },
            ],
            parent: {
              Id: '223e4567-e89b-12d3-a456-426614174001',
            },
          },
        ],
      } as unknown as DocumentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.document,
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
        title: 'Test Policy',
        description: 'Test Purpose',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'compliance',
            description: 'Compliance policy',
          },
          {
            name: 'security',
            description: 'Security policy',
          },
        ],
        links: {
          linkedItems: {
            href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174000/linked-items',
          },
          self: {
            href: '/api/v1/policies/123e4567-e89b-12d3-a456-426614174000',
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
          parents: [
            {
              id: '223e4567-e89b-12d3-a456-426614174001',
              type: 'policy',
              href: '/api/v1/policies/223e4567-e89b-12d3-a456-426614174001',
            },
          ],
        },
      });
    });

    it('should handle policy with null description and default updatedBy to createdBy', () => {
      const mockQueryResponse: DocumentListQueryResponse = {
        document: [
          {
            ...baseMockDocumentListItem,
            Purpose: null,
            ModifiedAtTimestamp: null,
            ModifiedByUser: null,
          },
        ],
      } as unknown as DocumentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.document,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.description).toBeNull();
      expect(result[0]?.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result[0]?.updatedBy).toBe('provider|user123');
      expect(result[0]?.links.updatedBy).toEqual(result[0]?.links.createdBy);
    });

    it('should handle policy with whitespace-only purpose string', () => {
      const mockQueryResponse: DocumentListQueryResponse = {
        document: [
          {
            ...baseMockDocumentListItem,
            Purpose: '   ',
          },
        ],
      } as unknown as DocumentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.document,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      // Whitespace-only strings are trimmed to empty string, which becomes null
      expect(result[0]?.description).toBeNull();
    });

    it('should filter out tags with null type', () => {
      const mockQueryResponse: DocumentListQueryResponse = {
        document: [
          {
            ...baseMockDocumentListItem,
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
          },
        ],
      } as unknown as DocumentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.document,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.tags).toHaveLength(2);
      expect(result[0]?.tags).toEqual([
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

    it('should handle parent with null value', () => {
      const mockQueryResponse: DocumentListQueryResponse = {
        document: [
          {
            ...baseMockDocumentListItem,
            parent: null,
          },
        ],
      } as unknown as DocumentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.document,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toEqual([]);
    });

    it('should handle empty document list', () => {
      const mockQueryResponse: DocumentListQueryResponse = {
        document: [],
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      };

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.document,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toEqual([]);
    });

    it('should handle multiple policies in the list', () => {
      const mockQueryResponse: DocumentListQueryResponse = {
        document: [
          {
            ...baseMockDocumentListItem,
            Title: 'Policy 1',
            Purpose: 'Purpose 1',
          },
          {
            ...baseMockDocumentListItem,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Policy 2',
            Purpose: 'Purpose 2',
            SequentialId: 2,
            DocumentType: 'compliance',
            CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
            CreatedByUser: 'provider|user456',
            ModifiedByUser: 'provider|user456',
          },
        ],
      } as unknown as DocumentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.document,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(2);
      expect(result[0]?.title).toBe('Policy 1');
      expect(result[1]?.title).toBe('Policy 2');
    });

    it('should handle policies with parent', () => {
      const mockQueryResponse: DocumentListQueryResponse = {
        document: [
          {
            ...baseMockDocumentListItem,
            parent: {
              Id: '223e4567-e89b-12d3-a456-426614174001',
            },
          },
        ],
      } as unknown as DocumentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.document,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toHaveLength(1);
      expect(result[0]?.links.parents?.[0]).toEqual({
        id: '223e4567-e89b-12d3-a456-426614174001',
        type: 'policy',
        href: '/api/v1/policies/223e4567-e89b-12d3-a456-426614174001',
      });
    });
  });
});
