import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IssueConsequencesListResponse } from '../../clients/client.interface';
import {
  transformConsequenceItem,
  transformConsequenceListQueryResponse,
} from './consequence.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
}));

describe('consequence.transformer', () => {
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

  const baseMockConsequence = {
    Id: '123e4567-e89b-12d3-a456-426614174000',
    Title: 'Test Consequence',
    Description: 'Test Description',
    CostType: 'financial',
    CostValue: 10000,
    Criticality: 7,
    Type: 'operational',
    CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
    ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
    CreatedByUser: 'provider|user123',
    ModifiedByUser: 'provider|user123',
    ParentIssueId: '456e4567-e89b-12d3-a456-426614174001',
  };

  describe('transformConsequenceItem', () => {
    it('should transform a valid consequence item response', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        Title: '  Test Consequence Item  ',
        Description: '  Detailed consequence description  ',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
        CostType: 'reputational',
        CostValue: 50000,
        Criticality: 9,
        Type: 'strategic',
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Consequence Item',
        description: 'Detailed consequence description',
        costType: 'reputational',
        costValue: 50000,
        criticality: 9,
        type: 'strategic',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        links: {
          self: {
            href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001/consequences/123e4567-e89b-12d3-a456-426614174000',
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
        transformConsequenceItem(baseMockConsequence as never, {
          basePath: '/api/v1',
        })
      ).toThrow('Link ID required for consequence transforms');
    });

    it('should handle consequence with null Description', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        Description: null,
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle consequence with empty Description string', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        Description: '',
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle consequence with whitespace-only Description', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        Description: '   ',
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
    });

    it('should handle null ModifiedByUser and default to CreatedByUser', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle null CreatedByUser', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });

    it('should handle consequence with null CostType', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        CostType: null,
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.costType).toBeNull();
    });

    it('should handle consequence with null CostValue', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        CostValue: null,
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.costValue).toBeNull();
    });

    it('should handle consequence with null Criticality', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        Criticality: null,
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.criticality).toBeNull();
    });

    it('should handle consequence with null Type', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        Type: null,
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.type).toBeNull();
    });

    it('should handle consequence with all nullable fields as null', () => {
      const mockConsequence = {
        ...baseMockConsequence,
        Description: null,
        CostType: null,
        CostValue: null,
        Criticality: null,
        Type: null,
      };

      const result = transformConsequenceItem(mockConsequence as never, {
        basePath: '/api/v1',
        linkId: '456e4567-e89b-12d3-a456-426614174001',
      });

      expect(result.description).toBeNull();
      expect(result.costType).toBeNull();
      expect(result.costValue).toBeNull();
      expect(result.criticality).toBeNull();
      expect(result.type).toBeNull();
    });
  });

  describe('transformConsequenceListQueryResponse', () => {
    it('should transform a valid consequence list query response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        consequence: [baseMockConsequence],
      } as unknown as IssueConsequencesListResponse;

      const result = transformConsequenceListQueryResponse(
        {
          data: mockQueryResponse.consequence,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: baseMockConsequence.Id,
        title: 'Test Consequence',
        description: 'Test Description',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user123',
        links: {
          self: {
            href: '/api/v1/issues/456e4567-e89b-12d3-a456-426614174001/consequences/123e4567-e89b-12d3-a456-426614174000',
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
        consequence: [baseMockConsequence],
      } as unknown as IssueConsequencesListResponse;

      expect(() =>
        transformConsequenceListQueryResponse(
          {
            data: mockQueryResponse.consequence,
            metadata: mockQueryResponse.pageMetadata,
          },
          {
            basePath: '/api/v1',
          }
        )
      ).toThrow('Link ID required for consequence transforms');
    });

    it('should handle empty consequence list', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        consequence: [],
      } as unknown as IssueConsequencesListResponse;

      const result = transformConsequenceListQueryResponse(
        {
          data: mockQueryResponse.consequence,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(0);
    });

    it('should transform multiple consequences', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        consequence: [
          {
            ...baseMockConsequence,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Consequence 1',
          },
          {
            ...baseMockConsequence,
            Id: '123e4567-e89b-12d3-a456-426614174002',
            Title: 'Consequence 2',
          },
          {
            ...baseMockConsequence,
            Id: '123e4567-e89b-12d3-a456-426614174003',
            Title: 'Consequence 3',
          },
        ],
      } as unknown as IssueConsequencesListResponse;

      const result = transformConsequenceListQueryResponse(
        {
          data: mockQueryResponse.consequence,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0]?.title).toBe('Consequence 1');
      expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[1]?.title).toBe('Consequence 2');
      expect(result[2]?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(result[2]?.title).toBe('Consequence 3');
    });

    it('should trim whitespace from titles and descriptions', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        consequence: [
          {
            ...baseMockConsequence,
            Title: '  Consequence with spaces  ',
            Description: '  Description with spaces  ',
          },
        ],
      } as unknown as IssueConsequencesListResponse;

      const result = transformConsequenceListQueryResponse(
        {
          data: mockQueryResponse.consequence,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
          linkId: '456e4567-e89b-12d3-a456-426614174001',
        }
      );

      expect(result[0]?.title).toBe('Consequence with spaces');
      expect(result[0]?.description).toBe('Description with spaces');
    });

    it('should handle consequences with null ModifiedByUser and ModifiedAtTimestamp', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        consequence: [
          {
            ...baseMockConsequence,
            ModifiedByUser: null,
            ModifiedAtTimestamp: null,
          },
        ],
      } as unknown as IssueConsequencesListResponse;

      const result = transformConsequenceListQueryResponse(
        {
          data: mockQueryResponse.consequence,
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
        consequence: [
          {
            ...baseMockConsequence,
            ParentIssueId: parentIssueId,
          },
        ],
      } as unknown as IssueConsequencesListResponse;

      const result = transformConsequenceListQueryResponse(
        {
          data: mockQueryResponse.consequence,
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
