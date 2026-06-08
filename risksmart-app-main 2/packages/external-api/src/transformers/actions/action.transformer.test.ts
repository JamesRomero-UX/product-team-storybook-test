import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActionListQueryResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformActionItem,
  transformActionListQueryResponse,
} from './action.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn().mockReturnValue({ href: 'href/path' }),
}));

describe('action.transformer', () => {
  const mockedLinkedItem = { linkedItems: { href: 'href/path' } };
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
        ['action', { type: 'action', path: 'actions' }],
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

  describe('transformActionItem', () => {
    const baseMockAction = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Action',
      Description: 'Test Description',
      SequentialId: 1,
      Status: 'open',
      Priority: 1,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    it('should transform a valid action item response', () => {
      const mockAction = {
        ...baseMockAction,
        Title: '  Test Action Item  ',
        Description: '  Detailed action description  ',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
        owners: [{ UserId: 'provider|owner1' }, { UserId: 'provider|owner2' }],
        contributors: [{ UserId: 'provider|contributor1' }],
        tags: [
          {
            type: {
              Name: 'urgent',
              Description: 'Urgent action',
            },
          },
        ],
      };

      const result = transformActionItem(mockAction as never, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        title: 'Test Action Item',
        description: 'Detailed action description',
        status: 'open',
        priority: 1,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'urgent',
            description: 'Urgent action',
          },
        ],
        links: {
          ...mockedLinkedItem,
          self: {
            href: '/api/v1/actions/123e4567-e89b-12d3-a456-426614174000',
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

    it('should handle action with null description and default updatedBy to createdBy', () => {
      const mockAction = {
        ...baseMockAction,
        Description: null,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformActionItem(mockAction as never, {
        basePath: '/api/v1',
      });

      expect(result.description).toBeNull();
      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle action with whitespace-only description string', () => {
      const mockAction = {
        ...baseMockAction,
        Description: '   ',
      };

      const result = transformActionItem(mockAction as never, {
        basePath: '/api/v1',
      });

      // Whitespace-only strings are trimmed to empty string, which becomes null
      expect(result.description).toBeNull();
    });

    it('should handle action with null priority', () => {
      const mockAction = {
        ...baseMockAction,
        Priority: null,
      };

      const result = transformActionItem(mockAction as never, {
        basePath: '/api/v1',
      });

      expect(result.priority).toBeNull();
    });

    it('should filter out tags with null type', () => {
      const mockAction = {
        ...baseMockAction,
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

      const result = transformActionItem(mockAction as never, {
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

    it('should handle action with empty tags array', () => {
      const result = transformActionItem(baseMockAction as never, {
        basePath: '/api/v1',
      });

      expect(result.tags).toEqual([]);
    });

    it('should handle action with null CreatedByUser', () => {
      const mockAction = {
        ...baseMockAction,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformActionItem(mockAction as never, {
        basePath: '/api/v1',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });

    it('should handle empty owners and contributors arrays', () => {
      const result = transformActionItem(baseMockAction as never, {
        basePath: '/api/v1',
      });

      expect(result.owners).toEqual([]);
      expect(result.contributors).toEqual([]);
      expect(result.links.owners).toEqual([]);
      expect(result.links.contributors).toEqual([]);
    });
  });

  describe('transformActionListQueryResponse', () => {
    const baseMockActionListItem = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Action',
      Description: 'Test Description',
      SequentialId: 1,
      Status: 'open',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      parents: [],
    };

    it('should transform a valid action list query response', () => {
      const mockQueryResponse: ActionListQueryResponse = {
        action: [
          {
            ...baseMockActionListItem,
            Title: '  Test Action  ',
            Description: '  Test Description  ',
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
                  Name: 'urgent',
                  Description: 'Urgent action',
                },
              },
              {
                type: {
                  Name: 'security',
                  Description: 'Security action',
                },
              },
            ],
            parents: [
              {
                parent: {
                  Id: '223e4567-e89b-12d3-a456-426614174001',
                  ObjectType: 'risk',
                  SequentialId: 1,
                },
              },
            ],
          },
        ],
      } as unknown as ActionListQueryResponse;

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
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
        title: 'Test Action',
        description: 'Test Description',
        status: 'open',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'urgent',
            description: 'Urgent action',
          },
          {
            name: 'security',
            description: 'Security action',
          },
        ],
        links: {
          ...mockedLinkedItem,
          self: {
            href: '/api/v1/actions/123e4567-e89b-12d3-a456-426614174000',
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
              type: 'risk',
              href: '/api/v1/risks/223e4567-e89b-12d3-a456-426614174001',
            },
          ],
        },
      });
    });

    it('should handle action with null description and default updatedBy to createdBy', () => {
      const mockQueryResponse: ActionListQueryResponse = {
        action: [
          {
            ...baseMockActionListItem,
            Description: null,
            ModifiedAtTimestamp: null,
            ModifiedByUser: null,
          },
        ],
      } as unknown as ActionListQueryResponse;

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
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

    it('should handle action with whitespace-only description string', () => {
      const mockQueryResponse: ActionListQueryResponse = {
        action: [
          {
            ...baseMockActionListItem,
            Description: '   ',
          },
        ],
      } as unknown as ActionListQueryResponse;

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
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
      const mockQueryResponse: ActionListQueryResponse = {
        action: [
          {
            ...baseMockActionListItem,
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
      } as unknown as ActionListQueryResponse;

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
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

    it('should filter out parents with invalid or missing data', async () => {
      const { nodeObjectTypeToResourceType } =
        await import('../../utils/transforms');

      // Mock to return undefined for invalid types
      vi.mocked(nodeObjectTypeToResourceType).mockImplementation((type) => {
        if (type === 'risk') {
          return { type: 'risk', path: 'risks' };
        }

        return undefined;
      });

      const mockQueryResponse: ActionListQueryResponse = {
        action: [
          {
            ...baseMockActionListItem,
            parents: [
              {
                parent: {
                  Id: '223e4567-e89b-12d3-a456-426614174001',
                  ObjectType: 'risk',
                  SequentialId: 1,
                },
              },
              {
                parent: null,
              },
              {
                parent: {
                  Id: '223e4567-e89b-12d3-a456-426614174002',
                  ObjectType: 'invalid-type',
                  SequentialId: 2,
                },
              },
            ],
          },
        ],
      } as unknown as ActionListQueryResponse;

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toHaveLength(1);
      expect(result[0]?.links.parents?.[0]).toEqual({
        id: '223e4567-e89b-12d3-a456-426614174001',
        type: 'risk',
        href: '/api/v1/risks/223e4567-e89b-12d3-a456-426614174001',
      });
    });

    it('should handle empty action list', () => {
      const mockQueryResponse: ActionListQueryResponse = {
        action: [],
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      };

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toEqual([]);
    });

    it('should handle multiple actions in the list', () => {
      const mockQueryResponse: ActionListQueryResponse = {
        action: [
          {
            ...baseMockActionListItem,
            Title: 'Action 1',
            Description: 'Description 1',
          },
          {
            ...baseMockActionListItem,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Action 2',
            Description: 'Description 2',
            SequentialId: 2,
            Status: 'closed',
            CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
            CreatedByUser: 'provider|user456',
            ModifiedByUser: 'provider|user456',
          },
        ],
      } as unknown as ActionListQueryResponse;

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(2);
      expect(result[0]?.title).toBe('Action 1');
      expect(result[1]?.title).toBe('Action 2');
    });

    it('should handle actions with multiple parents', () => {
      const mockQueryResponse: ActionListQueryResponse = {
        action: [
          {
            ...baseMockActionListItem,
            parents: [
              {
                parent: {
                  Id: '223e4567-e89b-12d3-a456-426614174001',
                  ObjectType: 'risk',
                  SequentialId: 1,
                },
              },
              {
                parent: {
                  Id: '223e4567-e89b-12d3-a456-426614174002',
                  ObjectType: 'control',
                  SequentialId: 2,
                },
              },
            ],
          },
        ],
      } as unknown as ActionListQueryResponse;

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
          metadata: mockMetadata,
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
        id: '223e4567-e89b-12d3-a456-426614174002',
        type: 'control',
        href: '/api/v1/controls/223e4567-e89b-12d3-a456-426614174002',
      });
    });

    it('should handle actions with empty parents array', () => {
      const mockQueryResponse: ActionListQueryResponse = {
        action: [baseMockActionListItem],
      } as unknown as ActionListQueryResponse;

      const result = transformActionListQueryResponse(
        {
          data: mockQueryResponse.action,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toEqual([]);
    });
  });
});
