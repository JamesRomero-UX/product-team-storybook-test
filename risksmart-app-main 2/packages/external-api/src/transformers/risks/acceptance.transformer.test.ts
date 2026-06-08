import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ListAcceptancesResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformRiskAcceptanceItem,
  transformRiskAcceptanceList,
} from './acceptance.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn(),
}));

describe('acceptance.transformer', () => {
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

  describe('transformRiskAcceptanceItem', () => {
    const baseMockAcceptance = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Acceptance',
      Details: 'Test Details',
      SequentialId: 1,
      DateAcceptedFrom: '2023-01-01T00:00:00.000Z',
      DateAcceptedTo: '2023-12-31T23:59:59.000Z',
      Status: 'Active',
      ApprovedByUser: 'provider|approver123',
      ApprovedByUserGroup: null,
      RequestedByUser: 'provider|requester123',
      RequestedByUserGroup: null,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      parents: [],
    };

    describe('happy path', () => {
      it('should transform a valid acceptance item response', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          Title: '  Test Acceptance Item  ',
          Details: '  Detailed acceptance details  ',
          DateAcceptedFrom: '2023-01-01T00:00:00.000Z',
          DateAcceptedTo: '2023-12-31T23:59:59.000Z',
          Status: 'Active',
          ApprovedByUser: 'provider|approver456',
          ApprovedByUserGroup: 'provider|approverGroup1',
          RequestedByUser: 'provider|requester456',
          RequestedByUserGroup: 'provider|requesterGroup1',
          ModifiedByUser: 'provider|user456',
          ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
          parents: [],
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          sequentialId: 1,
          title: 'Test Acceptance Item',
          description: 'Detailed acceptance details',
          dateAcceptedFrom: '2023-01-01T00:00:00.000Z',
          dateAcceptedTo: '2023-12-31T23:59:59.000Z',
          status: 'Active',
          approvedByUser: 'provider|approver456',
          approvedByUserGroup: 'provider|approverGroup1',
          requestedByUser: 'provider|requester456',
          requestedByUserGroup: 'provider|requesterGroup1',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          owners: [],
          contributors: [],
          tags: [],
          links: {
            self: {
              href: '/api/v1/risks/risk-123/acceptances/123e4567-e89b-12d3-a456-426614174000',
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
            owners: [],
            contributors: [],
            parents: [],
            approvedByUser: {
              id: 'provider|approver456',
              type: 'user',
              href: '/api/v1/users/provider|approver456',
            },
            requestedByUser: {
              id: 'provider|requester456',
              type: 'user',
              href: '/api/v1/users/provider|requester456',
            },
          },
        });
      });

      it('should map Title to title field', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          Title: '  Acceptance Title with spaces  ',
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.title).toBe('Acceptance Title with spaces');
      });

      it('should map Details to description field', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          Details: '  Acceptance details with spaces  ',
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.description).toBe('Acceptance details with spaces');
      });

      it('should handle acceptance with null Details and default updatedBy to createdBy', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          Details: null,
          ModifiedAtTimestamp: null,
          ModifiedByUser: null,
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.description).toBeNull();
        expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
        expect(result.updatedBy).toBe('provider|user123');
        expect(result.links.updatedBy).toEqual(result.links.createdBy);
      });

      it('should handle acceptance with whitespace-only Details string', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          Details: '   ',
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.description).toBeNull();
      });

      it('should handle null approvedByUser and requestedByUser', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          ApprovedByUser: null,
          RequestedByUser: null,
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.approvedByUser).toBeNull();
        expect(result.requestedByUser).toBeNull();
        expect(result.links.approvedByUser).toBeNull();
        expect(result.links.requestedByUser).toBeNull();
      });

      it('should handle null user groups', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          ApprovedByUserGroup: null,
          RequestedByUserGroup: null,
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.approvedByUserGroup).toBeNull();
        expect(result.requestedByUserGroup).toBeNull();
      });

      it('should handle acceptance with null CreatedByUser', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          CreatedByUser: null,
          ModifiedByUser: null,
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.createdBy).toBeNull();
        expect(result.updatedBy).toBeNull();
        expect(result.links.createdBy).toBeNull();
        expect(result.links.updatedBy).toBeNull();
      });

      it('should handle acceptance with parents', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
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

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.links.parents).toHaveLength(1);
        expect(result.links.parents[0]).toEqual({
          id: 'provider|parent-1',
          type: 'risk',
          href: '/api/v1/risks/provider|parent-1',
        });
      });

      it('should use correct resource path with linkId', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-456',
        });

        expect(result.links.self.href).toBe(
          '/api/v1/risks/risk-456/acceptances/123e4567-e89b-12d3-a456-426614174000'
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw error when linkId is missing', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
        };

        expect(() =>
          transformRiskAcceptanceItem(mockAcceptance as never, {
            basePath: '/api/v1',
          })
        ).toThrow('Link ID required for acceptance transforms');
      });

      it('should throw error when linkId is undefined', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
        };

        expect(() =>
          transformRiskAcceptanceItem(mockAcceptance as never, {
            basePath: '/api/v1',
            linkId: undefined,
          })
        ).toThrow('Link ID required for acceptance transforms');
      });

      it('should handle parents with null parent', () => {
        const mockAcceptance = {
          ...baseMockAcceptance,
          parents: [
            {
              parent: null,
            },
          ],
        };

        const result = transformRiskAcceptanceItem(mockAcceptance as never, {
          basePath: '/api/v1',
          linkId: 'risk-123',
        });

        expect(result.links.parents).toEqual([]);
      });
    });
  });

  describe('transformRiskAcceptanceList', () => {
    const baseMockAcceptanceListItem = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Acceptance',
      Details: 'Test Details',
      SequentialId: 1,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      parents: [],
    };

    describe('happy path', () => {
      it('should transform a valid acceptance list query response', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [
            {
              ...baseMockAcceptanceListItem,
              Title: '  Test Acceptance  ',
              Details: '  Test Details  ',
              ModifiedByUser: 'provider|user456',
              ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
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
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          sequentialId: 1,
          title: 'Test Acceptance',
          description: 'Test Details',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          owners: [],
          contributors: [],
          tags: [],
          links: {
            self: {
              href: '/api/v1/risks/risk-123/acceptances/123e4567-e89b-12d3-a456-426614174000',
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
            owners: [],
            contributors: [],
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

      it('should handle acceptance with null Details and default updatedBy to createdBy', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [
            {
              ...baseMockAcceptanceListItem,
              Details: null,
              ModifiedAtTimestamp: null,
              ModifiedByUser: null,
            },
          ],
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result[0]?.description).toBeNull();
        expect(result[0]?.updatedAt).toBe('2023-01-01T00:00:00.000Z');
        expect(result[0]?.updatedBy).toBe('provider|user123');
        expect(result[0]?.links.updatedBy).toEqual(result[0]?.links.createdBy);
      });

      it('should handle acceptance with whitespace-only Details string', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [
            {
              ...baseMockAcceptanceListItem,
              Details: '   ',
            },
          ],
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
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

        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [
            {
              ...baseMockAcceptanceListItem,
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
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result[0]?.links.parents).toHaveLength(1);
        expect(result[0]?.links.parents?.[0]).toEqual({
          id: '223e4567-e89b-12d3-a456-426614174001',
          type: 'risk',
          href: '/api/v1/risks/223e4567-e89b-12d3-a456-426614174001',
        });
      });

      it('should handle empty acceptance list', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual([]);
      });

      it('should handle multiple acceptances in the list', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [
            {
              ...baseMockAcceptanceListItem,
              Title: 'Acceptance 1',
              Details: 'Details 1',
            },
            {
              ...baseMockAcceptanceListItem,
              Id: '123e4567-e89b-12d3-a456-426614174001',
              Title: 'Acceptance 2',
              Details: 'Details 2',
              SequentialId: 2,
              CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
              ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
              CreatedByUser: 'provider|user456',
              ModifiedByUser: 'provider|user456',
            },
          ],
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result).toHaveLength(2);
        expect(result[0]?.title).toBe('Acceptance 1');
        expect(result[1]?.title).toBe('Acceptance 2');
      });

      it('should handle acceptances with multiple parents', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [
            {
              ...baseMockAcceptanceListItem,
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
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
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

      it('should handle acceptances with empty parents array', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [baseMockAcceptanceListItem],
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result[0]?.links.parents).toEqual([]);
      });

      it('should use correct resource path with linkId', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [baseMockAcceptanceListItem],
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-789',
          }
        );

        expect(result[0]?.links.self.href).toBe(
          '/api/v1/risks/risk-789/acceptances/123e4567-e89b-12d3-a456-426614174000'
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw error when linkId is missing', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [baseMockAcceptanceListItem],
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        expect(() =>
          transformRiskAcceptanceList(
            {
              data: mockQueryResponse.acceptance,
              metadata: mockMetadata,
            },
            {
              basePath: '/api/v1',
            }
          )
        ).toThrow('Link ID required for acceptance transforms');
      });

      it('should throw error when linkId is undefined', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [baseMockAcceptanceListItem],
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        expect(() =>
          transformRiskAcceptanceList(
            {
              data: mockQueryResponse.acceptance,
              metadata: mockMetadata,
            },
            {
              basePath: '/api/v1',
              linkId: undefined,
            }
          )
        ).toThrow('Link ID required for acceptance transforms');
      });

      it('should handle parents with missing ObjectType', () => {
        const mockQueryResponse: ListAcceptancesResponse = {
          acceptance: [
            {
              ...baseMockAcceptanceListItem,
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
          pageMetadata: mockMetadata,
        } as unknown as ListAcceptancesResponse;

        const result = transformRiskAcceptanceList(
          {
            data: mockQueryResponse.acceptance,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result[0]?.links.parents).toEqual([]);
      });
    });
  });
});
