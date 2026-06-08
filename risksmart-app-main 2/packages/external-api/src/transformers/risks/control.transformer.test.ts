import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ControlListQueryResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformControlItem,
  transformControlListQueryResponse,
} from './control.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn().mockReturnValue({ href: 'href/path' }),
}));

describe('control.transformer', () => {
  // Mock UUID constants for test data
  const MOCK_ANCESTOR_ID_1 = '11111111-1111-1111-1111-111111111111';
  const MOCK_ANCESTOR_ID_2 = '22222222-2222-2222-2222-222222222222';
  const MOCK_ANCESTOR_PARENT_ID_1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const MOCK_ANCESTOR_PARENT_ID_2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

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

  describe('transformControlListQueryResponse', () => {
    it('should transform a valid control list query response', () => {
      const mockQueryResponse: ControlListQueryResponse = {
        control: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            Title: '  Test Control  ',
            Description: '  Test Description  ',
            SequentialId: 1,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
            CreatedByUser: 'provider|user123',
            ModifiedByUser: 'provider|user456',
            owners: [
              { UserId: 'provider|owner1' },
              { UserId: 'provider|owner2' },
            ],
            contributors: [{ UserId: 'provider|contributor1' }],
            tags: [
              {
                type: {
                  Name: 'security',
                  Description: 'Security control',
                },
              },
              {
                type: {
                  Name: 'compliance',
                  Description: 'Compliance control',
                },
              },
            ],
            parents: [
              {
                parent: {
                  Id: 'parent-risk-1',
                  ObjectType: 'risk',
                  SequentialId: 1,
                },
              },
            ],
            departments: [],
          },
        ],
      } as unknown as ControlListQueryResponse;

      const result = transformControlListQueryResponse(
        {
          data: mockQueryResponse.control,
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
        title: 'Test Control',
        description: 'Test Description',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'security',
            description: 'Security control',
          },
          {
            name: 'compliance',
            description: 'Compliance control',
          },
        ],
        links: {
          ...mockedLinkedItem,
          self: {
            href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000',
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
              id: 'parent-risk-1',
              type: 'risk',
              href: '/api/v1/risks/parent-risk-1',
            },
          ],
        },
      });
    });

    it('should handle control with null description', () => {
      const mockQueryResponse: ControlListQueryResponse = {
        control: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            Title: 'Test Control',
            Description: null,
            SequentialId: 1,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: null,
            CreatedByUser: 'provider|user123',
            ModifiedByUser: null,
            owners: [],
            contributors: [],
            tags: [],
            parents: [],
            departments: [],
          },
        ],
      } as unknown as ControlListQueryResponse;

      const result = transformControlListQueryResponse(
        {
          data: mockQueryResponse.control,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.description).toBeNull();
      expect(result[0]?.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result[0]?.updatedBy).toBe('provider|user123');
    });

    it('should handle control with empty description string', () => {
      const mockQueryResponse: ControlListQueryResponse = {
        control: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            Title: 'Test Control',
            Description: '   ',
            SequentialId: 1,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
            CreatedByUser: 'provider|user123',
            ModifiedByUser: 'provider|user123',
            owners: [],
            contributors: [],
            tags: [],
            parents: [],
            departments: [],
          },
        ],
      } as unknown as ControlListQueryResponse;

      const result = transformControlListQueryResponse(
        {
          data: mockQueryResponse.control,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.description).toBeNull();
    });

    it('should filter out tags with null type', () => {
      const mockQueryResponse: ControlListQueryResponse = {
        control: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            Title: 'Test Control',
            Description: 'Test Description',
            SequentialId: 1,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
            CreatedByUser: 'provider|user123',
            ModifiedByUser: 'provider|user123',
            owners: [],
            contributors: [],
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
            parents: [],
            departments: [],
          },
        ],
      } as unknown as ControlListQueryResponse;

      const result = transformControlListQueryResponse(
        {
          data: mockQueryResponse.control,
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

      const mockQueryResponse: ControlListQueryResponse = {
        control: [
          {
            Id: '123e4567-e89b-12d3-a456-426614174000',
            Title: 'Test Control',
            Description: 'Test Description',
            SequentialId: 1,
            CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
            ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
            CreatedByUser: 'provider|user123',
            ModifiedByUser: 'provider|user123',
            owners: [],
            contributors: [],
            tags: [],
            parents: [
              {
                parent: {
                  Id: 'valid-parent',
                  ObjectType: 'risk',
                  SequentialId: 1,
                },
              },
              {
                parent: null,
              },
              {
                parent: {
                  Id: 'invalid-parent',
                  ObjectType: 'invalid-type',
                  SequentialId: 2,
                },
              },
            ],
            departments: [],
          },
        ],
      } as unknown as ControlListQueryResponse;

      const result = transformControlListQueryResponse(
        {
          data: mockQueryResponse.control,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toHaveLength(1);
      expect(result[0]?.links.parents?.[0]).toEqual({
        id: 'valid-parent',
        type: 'risk',
        href: '/api/v1/risks/valid-parent',
      });
    });

    it('should handle empty control list', () => {
      const mockQueryResponse: ControlListQueryResponse = {
        control: [],
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      };

      const result = transformControlListQueryResponse(
        {
          data: mockQueryResponse.control,
          metadata: mockMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toEqual([]);
    });
  });

  describe('transformControlItem', () => {
    it('should transform a valid control item response', () => {
      const mockControl = {
        control: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: '  Test Control Item  ',
          Description: '  Detailed control description  ',
          Type: 'manual',
          SequentialId: 1,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user456',
          owners: [
            { UserId: 'provider|owner1' },
            { UserId: 'provider|owner2' },
          ],
          contributors: [{ UserId: 'provider|contributor1' }],
          tags: [
            {
              type: {
                Name: 'security',
                Description: 'Security control',
              },
            },
          ],
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
          departments: [],
        },
      };

      const result = transformControlItem(mockControl.control as never, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        title: 'Test Control Item',
        description: 'Detailed control description',
        type: 'manual',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'security',
            description: 'Security control',
          },
        ],
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
          ...mockedLinkedItem,
          self: {
            href: '/api/v1/controls/123e4567-e89b-12d3-a456-426614174000',
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

    it('should handle control with null type', () => {
      const mockControl = {
        control: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Control',
          Description: 'Test Description',
          Type: null,
          SequentialId: 1,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          owners: [],
          contributors: [],
          tags: [],
          ancestorContributors: [],
          departments: [],
        },
      };

      const result = transformControlItem(mockControl.control as never, {
        basePath: '/api/v1',
      });

      expect(result?.type).toBeNull();
    });

    it('should handle control with empty ancestorContributors', () => {
      const mockControl = {
        control: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Control',
          Description: 'Test Description',
          Type: 'automated',
          SequentialId: 1,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          owners: [],
          contributors: [],
          tags: [],
          ancestorContributors: [],
          departments: [],
        },
      };

      const result = transformControlItem(mockControl.control as never, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors).toEqual([]);
    });

    it('should handle control with null ancestorContributors', () => {
      const mockControl = {
        control: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Control',
          Description: 'Test Description',
          Type: 'automated',
          SequentialId: 1,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          owners: [],
          contributors: [],
          tags: [],
          ancestorContributors: null,
          departments: [],
        },
      };

      const result = transformControlItem(mockControl.control as never, {
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

      const mockControl = {
        control: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Control',
          Description: 'Test Description',
          Type: 'manual',
          SequentialId: 1,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          owners: [],
          contributors: [],
          tags: [],
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
          departments: [],
        },
      };

      const result = transformControlItem(mockControl.control as never, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors?.[0]?.objectType).toBeNull();
    });

    it('should handle ancestorContributor with null ObjectType', () => {
      const mockControl = {
        control: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Control',
          Description: 'Test Description',
          Type: 'manual',
          SequentialId: 1,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          owners: [],
          contributors: [],
          tags: [],
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
          departments: [],
        },
      };

      const result = transformControlItem(mockControl.control as never, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors?.[0]?.objectType).toBeNull();
    });

    it('should handle ancestorContributor with null UserId', () => {
      const mockControl = {
        control: {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Control',
          Description: 'Test Description',
          Type: 'manual',
          SequentialId: 1,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user123',
          owners: [],
          contributors: [],
          tags: [],
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
          departments: [],
        },
      };

      const result = transformControlItem(mockControl.control as never, {
        basePath: '/api/v1',
      });

      expect(result?.ancestorContributors?.[0]?.user).toBeNull();
    });
  });
});
