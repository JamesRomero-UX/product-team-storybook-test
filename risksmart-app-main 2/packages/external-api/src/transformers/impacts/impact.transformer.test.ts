import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ImpactListQueryResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformItem,
  transformListQueryResponse,
} from './impact.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn(),
}));

describe('impact.transformer', () => {
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

  describe('transformItem', () => {
    const baseMockImpact = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Test Impact',
      Rationale: 'Test Rationale',
      SequentialId: 1,
      LikelihoodAppetite: 3,
      ImpactAppetite: 4,
      RatingGuidance: 'Test guidance',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      ancestorContributors: [],
      appetites: [],
      parents: [],
    };

    describe('happy path', () => {
      it('should transform a valid impact item response', () => {
        const mockImpact = {
          ...baseMockImpact,
          Name: '  Test Impact Item  ',
          Rationale: '  Detailed impact rationale  ',
          LikelihoodAppetite: 2,
          ImpactAppetite: 5,
          RatingGuidance: 'Detailed rating guidance',
          ModifiedByUser: 'provider|user456',
          ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
          owners: [
            { UserId: 'provider|owner1' },
            { UserId: 'provider|owner2' },
          ],
          contributors: [{ UserId: 'provider|contributor1' }],
          ancestorContributors: [
            {
              Id: '323e4567-e89b-12d3-a456-426614174001',
              ObjectType: 'risk',
              ContributorType: 'owner',
              AncestorId: '423e4567-e89b-12d3-a456-426614174001',
              UserGroupId: null,
              UserId: 'provider|ancestor-user-1',
            },
          ],
          appetites: [
            {
              Id: 'provider|appetite-1',
              SequentialId: 1,
              parents: [
                {
                  risk: {
                    Id: 'provider|risk-1',
                  },
                },
              ],
            },
            {
              Id: 'provider|appetite-2',
              SequentialId: 2,
              parents: [
                {
                  risk: {
                    Id: 'provider|risk-1',
                  },
                },
              ],
            },
          ],
          parents: [],
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          sequentialId: 1,
          title: 'Test Impact Item',
          description: 'Detailed impact rationale',
          likelihoodAppetite: 2,
          impactAppetite: 5,
          ratingGuidance: 'Detailed rating guidance',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          owners: ['provider|owner1', 'provider|owner2'],
          contributors: ['provider|contributor1'],
          tags: [],
          ancestorContributors: [
            {
              id: '323e4567-e89b-12d3-a456-426614174001',
              objectType: 'risk',
              contributorType: 'owner',
              ancestorId: '423e4567-e89b-12d3-a456-426614174001',
              userGroupId: null,
              user: {
                id: 'provider|ancestor-user-1',
                type: 'user',
                href: '/api/v1/users/provider|ancestor-user-1',
              },
            },
          ],
          links: {
            self: {
              href: '/api/v1/impacts/123e4567-e89b-12d3-a456-426614174000',
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
            appetites: [
              {
                id: 'provider|appetite-1',
                type: 'appetite',
                href: '/api/v1/risks/provider|risk-1/appetites/provider|appetite-1',
              },
              {
                id: 'provider|appetite-2',
                type: 'appetite',
                href: '/api/v1/risks/provider|risk-1/appetites/provider|appetite-2',
              },
            ],
            parents: [],
          },
        });
      });

      it('should map Name to title field', () => {
        const mockImpact = {
          ...baseMockImpact,
          Name: '  Impact Name with spaces  ',
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.title).toBe('Impact Name with spaces');
      });

      it('should map Rationale to description field', () => {
        const mockImpact = {
          ...baseMockImpact,
          Rationale: '  Impact rationale with spaces  ',
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.description).toBe('Impact rationale with spaces');
      });

      it('should handle impact with null Rationale and default updatedBy to createdBy', () => {
        const mockImpact = {
          ...baseMockImpact,
          Rationale: null,
          ModifiedAtTimestamp: null,
          ModifiedByUser: null,
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.description).toBeNull();
        expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
        expect(result.updatedBy).toBe('provider|user123');
        expect(result.links.updatedBy).toEqual(result.links.createdBy);
      });

      it('should handle impact with whitespace-only Rationale string', () => {
        const mockImpact = {
          ...baseMockImpact,
          Rationale: '   ',
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.description).toBeNull();
      });

      it('should handle null appetite values', () => {
        const mockImpact = {
          ...baseMockImpact,
          LikelihoodAppetite: null,
          ImpactAppetite: null,
          RatingGuidance: null,
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.likelihoodAppetite).toBeNull();
        expect(result.impactAppetite).toBeNull();
        expect(result.ratingGuidance).toBeNull();
      });

      it('should handle ancestor contributors with null UserId', () => {
        const mockImpact = {
          ...baseMockImpact,
          ancestorContributors: [
            {
              Id: '323e4567-e89b-12d3-a456-426614174001',
              ObjectType: 'risk',
              ContributorType: 'owner',
              AncestorId: '423e4567-e89b-12d3-a456-426614174001',
              UserGroupId: 'group-1',
              UserId: null,
            },
          ],
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.ancestorContributors).toHaveLength(1);
        expect(result.ancestorContributors[0]?.user).toBeNull();
        expect(result.ancestorContributors[0]?.userGroupId).toBe('group-1');
      });

      it('should handle empty appetites array', () => {
        const mockImpact = {
          ...baseMockImpact,
          appetites: [],
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.links.appetites).toEqual([]);
      });

      it('should handle impact with null CreatedByUser', () => {
        const mockImpact = {
          ...baseMockImpact,
          CreatedByUser: null,
          ModifiedByUser: null,
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.createdBy).toBeNull();
        expect(result.updatedBy).toBeNull();
        expect(result.links.createdBy).toBeNull();
        expect(result.links.updatedBy).toBeNull();
      });

      it('should handle empty owners and contributors arrays', () => {
        const result = transformItem(baseMockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.owners).toEqual([]);
        expect(result.contributors).toEqual([]);
        expect(result.links.owners).toEqual([]);
        expect(result.links.contributors).toEqual([]);
      });

      it('should handle empty ancestorContributors array', () => {
        const result = transformItem(baseMockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.ancestorContributors).toEqual([]);
      });

      it('should handle impact with parents', () => {
        const mockImpact = {
          ...baseMockImpact,
          parents: [
            {
              parent: {
                Id: 'provider|parent-1',
                ObjectType: 'risk',
                SequentialId: 1,
              },
            },
          ],
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.links.parents).toHaveLength(1);
        expect(result.links.parents[0]).toEqual({
          id: 'provider|parent-1',
          type: 'risk',
          href: '/api/v1/risks/provider|parent-1',
        });
      });

      it('should filter out appetites without risk parent', () => {
        const mockImpact = {
          ...baseMockImpact,
          appetites: [
            {
              Id: 'provider|appetite-1',
              SequentialId: 1,
              parents: [
                {
                  risk: {
                    Id: 'provider|risk-1',
                  },
                },
              ],
            },
            {
              Id: 'provider|appetite-2',
              SequentialId: 2,
              parents: [],
            },
            {
              Id: 'provider|appetite-3',
              SequentialId: 3,
              parents: [
                {
                  risk: null,
                },
              ],
            },
          ],
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.links.appetites).toHaveLength(1);
        expect(result.links.appetites[0]).toEqual({
          id: 'provider|appetite-1',
          type: 'appetite',
          href: '/api/v1/risks/provider|risk-1/appetites/provider|appetite-1',
        });
      });

      it('should filter out appetites with risk parent but no risk Id', () => {
        const mockImpact = {
          ...baseMockImpact,
          appetites: [
            {
              Id: 'provider|appetite-1',
              SequentialId: 1,
              parents: [
                {
                  risk: {
                    Id: 'provider|risk-1',
                  },
                },
              ],
            },
            {
              Id: 'provider|appetite-2',
              SequentialId: 2,
              parents: [
                {
                  risk: {
                    Id: null,
                  },
                },
              ],
            },
          ],
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.links.appetites).toHaveLength(1);
        expect(result.links.appetites[0]?.id).toBe('provider|appetite-1');
      });
    });

    describe('unhappy path', () => {
      it('should handle ancestor contributors with all null values', () => {
        const mockImpact = {
          ...baseMockImpact,
          ancestorContributors: [
            {
              Id: null,
              ObjectType: null,
              ContributorType: null,
              AncestorId: null,
              UserGroupId: null,
              UserId: null,
            },
          ],
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.ancestorContributors).toHaveLength(1);
        expect(result.ancestorContributors[0]).toEqual({
          id: null,
          objectType: null,
          contributorType: null,
          ancestorId: null,
          userGroupId: null,
          user: null,
        });
      });

      it('should handle parents with null parent', () => {
        const mockImpact = {
          ...baseMockImpact,
          parents: [
            {
              parent: null,
            },
          ],
        };

        const result = transformItem(mockImpact as never, {
          basePath: '/api/v1',
        });

        expect(result.links.parents).toEqual([]);
      });
    });
  });

  describe('transformListQueryResponse', () => {
    const baseMockImpactListItem = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Test Impact',
      Rationale: 'Test Rationale',
      SequentialId: 1,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      parents: [],
    };

    describe('happy path', () => {
      it('should transform a valid impact list query response', () => {
        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [
            {
              ...baseMockImpactListItem,
              Name: '  Test Impact  ',
              Rationale: '  Test Rationale  ',
              ModifiedByUser: 'provider|user456',
              ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
              owners: [
                { UserId: 'provider|owner1' },
                { UserId: 'provider|owner2' },
              ],
              contributors: [{ UserId: 'provider|contributor1' }],
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
        } as unknown as ImpactListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.impact,
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
          title: 'Test Impact',
          description: 'Test Rationale',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          owners: ['provider|owner1', 'provider|owner2'],
          contributors: ['provider|contributor1'],
          tags: [],
          links: {
            self: {
              href: '/api/v1/impacts/123e4567-e89b-12d3-a456-426614174000',
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

      it('should handle impact with null Rationale and default updatedBy to createdBy', () => {
        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [
            {
              ...baseMockImpactListItem,
              Rationale: null,
              ModifiedAtTimestamp: null,
              ModifiedByUser: null,
            },
          ],
        } as unknown as ImpactListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.impact,
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

      it('should handle impact with whitespace-only Rationale string', () => {
        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [
            {
              ...baseMockImpactListItem,
              Rationale: '   ',
            },
          ],
        } as unknown as ImpactListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.impact,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
          }
        );

        expect(result[0]?.description).toBeNull();
      });

      it('should filter out parents with invalid or missing data', async () => {
        const { nodeObjectTypeToResourceType } =
          await import('../../utils/transforms');

        vi.mocked(nodeObjectTypeToResourceType).mockImplementation((type) => {
          if (type === 'risk') {
            return { type: 'risk', path: 'risks' };
          }

          return undefined;
        });

        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [
            {
              ...baseMockImpactListItem,
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
        } as unknown as ImpactListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.impact,
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

      it('should handle empty impact list', () => {
        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [],
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
            data: mockQueryResponse.impact,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
          }
        );

        expect(result).toEqual([]);
      });

      it('should handle multiple impacts in the list', () => {
        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [
            {
              ...baseMockImpactListItem,
              Name: 'Impact 1',
              Rationale: 'Rationale 1',
            },
            {
              ...baseMockImpactListItem,
              Id: '123e4567-e89b-12d3-a456-426614174001',
              Name: 'Impact 2',
              Rationale: 'Rationale 2',
              SequentialId: 2,
              CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
              ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
              CreatedByUser: 'provider|user456',
              ModifiedByUser: 'provider|user456',
            },
          ],
        } as unknown as ImpactListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.impact,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
          }
        );

        expect(result).toHaveLength(2);
        expect(result[0]?.title).toBe('Impact 1');
        expect(result[1]?.title).toBe('Impact 2');
      });

      it('should handle impacts with multiple parents', () => {
        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [
            {
              ...baseMockImpactListItem,
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
        } as unknown as ImpactListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.impact,
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

      it('should handle impacts with empty parents array', () => {
        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [baseMockImpactListItem],
        } as unknown as ImpactListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.impact,
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
        const mockQueryResponse: ImpactListQueryResponse = {
          impact: [
            {
              ...baseMockImpactListItem,
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
        } as unknown as ImpactListQueryResponse;

        const result = transformListQueryResponse(
          {
            data: mockQueryResponse.impact,
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
