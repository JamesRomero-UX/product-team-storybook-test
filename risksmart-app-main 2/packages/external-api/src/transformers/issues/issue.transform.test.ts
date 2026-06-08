import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IssueListQueryResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import { transformItem, transformListQueryResponse } from './issue.transform';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn().mockReturnValue({ href: 'href/path' }),
}));

describe('issue.transform', () => {
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
  const mockNestedLinks = {
    actions: { href: `href/path` },
    assessment: { href: `href/path` },
    causes: { href: `href/path` },
    consequences: { href: `href/path` },
    updates: { href: `href/path` },
  };

  describe('transformItem', () => {
    const baseMockIssue = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Issue',
      Details: 'Test Details',
      SequentialId: 1,
      DateOccurred: '2023-01-01T00:00:00.000Z',
      DateIdentified: '2023-01-01T00:00:00.000Z',
      RaisedAtTimestamp: '2023-01-01T00:00:00.000Z',
      Type: 'incident',
      IsExternalIssue: false,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      ImpactsCustomer: false,
      owners: [],
      contributors: [],
      tags: [],
    };

    describe('happy path', () => {
      it('should transform a valid issue item response', () => {
        const mockIssue = {
          ...baseMockIssue,
          Title: '  Test Issue Item  ',
          Details: '  Detailed issue description  ',
          Type: 'security',
          IsExternalIssue: true,
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
                Description: 'Urgent issue',
              },
            },
          ],
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          sequentialId: 1,
          title: 'Test Issue Item',
          description: 'Detailed issue description',
          dateOccurred: '2023-01-01T00:00:00.000Z',
          dateIdentified: '2023-01-01T00:00:00.000Z',
          dateRaised: '2023-01-01T00:00:00.000Z',
          type: 'security',
          isExternalIssue: true,
          impactsCustomer: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          owners: ['provider|owner1', 'provider|owner2'],
          contributors: ['provider|contributor1'],
          tags: [
            {
              name: 'urgent',
              description: 'Urgent issue',
            },
          ],
          links: {
            ...mockedLinkedItem,
            ...mockNestedLinks,
            self: {
              href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000',
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

      it('should handle issue with null details and default updatedBy to createdBy', () => {
        const mockIssue = {
          ...baseMockIssue,
          Details: null,
          ModifiedAtTimestamp: null,
          ModifiedByUser: null,
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.description).toBeNull();
        expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
        expect(result.updatedBy).toBe('provider|user123');
        expect(result.links.updatedBy).toEqual(result.links.createdBy);
      });

      it('should handle issue with whitespace-only details string', () => {
        const mockIssue = {
          ...baseMockIssue,
          Details: '   ',
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        // Whitespace-only strings are trimmed to empty string, which becomes null
        expect(result.description).toBeNull();
      });

      it('should handle issue with null type', () => {
        const mockIssue = {
          ...baseMockIssue,
          Type: null,
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.type).toBeNull();
      });

      it('should handle issue with null RaisedAtTimestamp', () => {
        const mockIssue = {
          ...baseMockIssue,
          RaisedAtTimestamp: null,
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.dateRaised).toBeNull();
      });

      it('should handle issue with IsExternalIssue true', () => {
        const mockIssue = {
          ...baseMockIssue,
          IsExternalIssue: true,
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.isExternalIssue).toBe(true);
      });

      it('should handle issue with IsExternalIssue false', () => {
        const mockIssue = {
          ...baseMockIssue,
          IsExternalIssue: false,
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.isExternalIssue).toBe(false);
      });

      it('should filter out tags with null type', () => {
        const mockIssue = {
          ...baseMockIssue,
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

        const result = transformItem(mockIssue as never, {
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

      it('should handle issue with empty tags array', () => {
        const result = transformItem(baseMockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.tags).toEqual([]);
      });

      it('should handle issue with null CreatedByUser', () => {
        const mockIssue = {
          ...baseMockIssue,
          CreatedByUser: null,
          ModifiedByUser: null,
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.createdBy).toBeNull();
        expect(result.updatedBy).toBeNull();
        expect(result.links.createdBy).toBeNull();
        expect(result.links.updatedBy).toBeNull();
      });

      it('should handle empty owners and contributors arrays', () => {
        const result = transformItem(baseMockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.owners).toEqual([]);
        expect(result.contributors).toEqual([]);
        expect(result.links.owners).toEqual([]);
        expect(result.links.contributors).toEqual([]);
      });
    });

    describe('unhappy path', () => {
      it('should handle null impactsCustomer value flag', () => {
        const mockIssue = {
          ...baseMockIssue,
          ImpactsCustomer: null,
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.impactsCustomer).toEqual(null);
      });
      it('should handle null externalIssue flag', () => {
        const mockIssue = {
          ...baseMockIssue,
          IsExternalIssue: null,
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.isExternalIssue).toEqual(null);
      });
      it('should handle tags with empty name or description gracefully', () => {
        const mockIssue = {
          ...baseMockIssue,
          tags: [
            {
              type: {
                Name: '',
                Description: '',
              },
            },
          ],
        };

        const result = transformItem(mockIssue as never, {
          basePath: '/api/v1',
        });

        expect(result.tags).toEqual([
          {
            name: '',
            description: '',
          },
        ]);
      });
    });
  });

  describe('transformListQueryResponse', () => {
    const baseMockIssueListItem = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Issue',
      Details: 'Test Details',
      SequentialId: 1,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      parents: [],
    };

    describe('happy path', () => {
      it('should transform a valid issue list query response', () => {
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [
            {
              ...baseMockIssueListItem,
              Title: '  Test Issue  ',
              Details: '  Test Details  ',
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
                    Description: 'Urgent issue',
                  },
                },
                {
                  type: {
                    Name: 'security',
                    Description: 'Security issue',
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
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
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
          title: 'Test Issue',
          description: 'Test Details',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          owners: ['provider|owner1', 'provider|owner2'],
          contributors: ['provider|contributor1'],
          tags: [
            {
              name: 'urgent',
              description: 'Urgent issue',
            },
            {
              name: 'security',
              description: 'Security issue',
            },
          ],
          links: {
            ...mockedLinkedItem,
            ...mockNestedLinks,
            self: {
              href: '/api/v1/issues/123e4567-e89b-12d3-a456-426614174000',
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

      it('should handle issue with null details and default updatedBy to createdBy', () => {
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [
            {
              ...baseMockIssueListItem,
              Details: null,
              ModifiedAtTimestamp: null,
              ModifiedByUser: null,
            },
          ],
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
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

      it('should handle issue with whitespace-only details string', () => {
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [
            {
              ...baseMockIssueListItem,
              Details: '   ',
            },
          ],
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
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
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [
            {
              ...baseMockIssueListItem,
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
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
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

        const mockQueryResponse: IssueListQueryResponse = {
          issue: [
            {
              ...baseMockIssueListItem,
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
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
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

      it('should handle empty issue list', () => {
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [],
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
            data: mockQueryResponse.issue,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
          }
        );

        expect(result).toEqual([]);
      });

      it('should handle multiple issues in the list', () => {
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [
            {
              ...baseMockIssueListItem,
              Title: 'Issue 1',
              Details: 'Details 1',
            },
            {
              ...baseMockIssueListItem,
              Id: '123e4567-e89b-12d3-a456-426614174001',
              Title: 'Issue 2',
              Details: 'Details 2',
              SequentialId: 2,
              CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
              ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
              CreatedByUser: 'provider|user456',
              ModifiedByUser: 'provider|user456',
            },
          ],
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
          }
        );

        expect(result).toHaveLength(2);
        expect(result[0]?.title).toBe('Issue 1');
        expect(result[1]?.title).toBe('Issue 2');
      });

      it('should handle issues with multiple parents', () => {
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [
            {
              ...baseMockIssueListItem,
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
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
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

      it('should handle issues with empty parents array', () => {
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [baseMockIssueListItem],
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
          }
        );

        expect(result[0]?.links.parents).toEqual([]);
      });
    });

    describe('unhappy path', () => {
      it('should handle parents with missing ObjectType', () => {
        const mockQueryResponse: IssueListQueryResponse = {
          issue: [
            {
              ...baseMockIssueListItem,
              parents: [
                {
                  parent: {
                    Id: '223e4567-e89b-12d3-a456-426614174001',
                    ObjectType: '',
                    SequentialId: 1,
                  },
                },
              ],
            },
          ],
        } as unknown as IssueListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.issue,
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
});
