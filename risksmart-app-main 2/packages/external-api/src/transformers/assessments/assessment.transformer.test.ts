import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AssessmentListQueryResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformItem,
  transformListQueryResponse,
} from './assessment.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  firstDefined: vi.fn(),
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
  pathResourceReference: vi.fn(),
}));

describe('assessment.transformer', () => {
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
        ['assessment', { type: 'assessment', path: 'assessments' }],
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
    const baseMockAssessment = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Assessment',
      Summary: 'Test Summary',
      SequentialId: 1,
      Status: 'notstarted',
      StartDate: '2023-01-01T00:00:00.000Z',
      TargetCompletionDate: '2023-12-31T00:00:00.000Z',
      ActualCompletionDate: null,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
      ancestorContributors: [],
      completedByUser: null,
    };

    it('should transform a valid assessment item response', () => {
      const mockAssessment = {
        ...baseMockAssessment,
        Title: '  Test Assessment Item  ',
        Summary: '  Detailed assessment summary  ',
        Status: 'inprogress',
        ModifiedByUser: 'provider|user456',
        ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
        ActualCompletionDate: '2023-12-30T00:00:00.000Z',
        owners: [{ UserId: 'provider|owner1' }, { UserId: 'provider|owner2' }],
        contributors: [{ UserId: 'provider|contributor1' }],
        tags: [
          {
            type: {
              Name: 'critical',
              Description: 'Critical assessment',
            },
          },
        ],
      };

      const result = transformItem(mockAssessment as never, {
        basePath: '/api/v1',
      });

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        sequentialId: 1,
        title: 'Test Assessment Item',
        description: 'Detailed assessment summary',
        status: 'inprogress',
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        completionDate: '2023-12-30T00:00:00.000Z',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        createdBy: 'provider|user123',
        updatedBy: 'provider|user456',
        owners: ['provider|owner1', 'provider|owner2'],
        contributors: ['provider|contributor1'],
        tags: [
          {
            name: 'critical',
            description: 'Critical assessment',
          },
        ],
        links: {
          self: {
            href: '/api/v1/assessments/123e4567-e89b-12d3-a456-426614174000',
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

    it('should handle assessment with null Summary and default updatedBy to createdBy', () => {
      const mockAssessment = {
        ...baseMockAssessment,
        Summary: null,
        ModifiedAtTimestamp: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockAssessment as never, {
        basePath: '/api/v1',
      });

      expect(result.description).toBeNull();
      expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result.updatedBy).toBe('provider|user123');
      expect(result.links.updatedBy).toEqual(result.links.createdBy);
    });

    it('should handle assessment with whitespace-only summary string', () => {
      const mockAssessment = {
        ...baseMockAssessment,
        Summary: '   ',
      };

      const result = transformItem(mockAssessment as never, {
        basePath: '/api/v1',
      });

      // Whitespace-only strings are trimmed to empty string, which becomes null
      expect(result.description).toBeNull();
    });

    it('should handle assessment with null date fields', () => {
      const mockAssessment = {
        ...baseMockAssessment,
        StartDate: null,
        TargetCompletionDate: null,
        ActualCompletionDate: null,
      };

      const result = transformItem(mockAssessment as never, {
        basePath: '/api/v1',
      });

      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
      expect(result.completionDate).toBeNull();
    });

    it('should filter out tags with null type', () => {
      const mockAssessment = {
        ...baseMockAssessment,
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

      const result = transformItem(mockAssessment as never, {
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

    it('should handle assessment with empty tags array', () => {
      const result = transformItem(baseMockAssessment as never, {
        basePath: '/api/v1',
      });

      expect(result.tags).toEqual([]);
    });

    it('should handle assessment with null CreatedByUser', () => {
      const mockAssessment = {
        ...baseMockAssessment,
        CreatedByUser: null,
        ModifiedByUser: null,
      };

      const result = transformItem(mockAssessment as never, {
        basePath: '/api/v1',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
      expect(result.links.createdBy).toBeNull();
      expect(result.links.updatedBy).toBeNull();
    });

    it('should handle assessment with null SequentialId', () => {
      const mockAssessment = {
        ...baseMockAssessment,
        SequentialId: null,
      };

      const result = transformItem(mockAssessment as never, {
        basePath: '/api/v1',
      });

      expect(result.sequentialId).toBeNull();
    });
  });

  describe('transformListQueryResponse', () => {
    const baseMockAssessment = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Assessment 1',
      Summary: 'Summary 1',
      SequentialId: 1,
      Status: 'not started',
      StartDate: '2023-01-01T00:00:00.000Z',
      TargetCompletionDate: '2023-12-31T00:00:00.000Z',
      ActualCompletionDate: null,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user123',
      owners: [],
      contributors: [],
      tags: [],
    };

    it('should transform a valid assessment list query response', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        assessment: [
          {
            ...baseMockAssessment,
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
      } as unknown as AssessmentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.assessment,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: baseMockAssessment.Id,
        sequentialId: 1,
        title: 'Assessment 1',
        description: 'Summary 1',
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
          self: {
            href: '/api/v1/assessments/123e4567-e89b-12d3-a456-426614174000',
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

    it('should handle empty assessment list', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        assessment: [],
      } as AssessmentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.assessment,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(0);
    });

    it('should transform multiple assessments', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        assessment: [
          {
            ...baseMockAssessment,
            Id: '123e4567-e89b-12d3-a456-426614174001',
            Title: 'Assessment 1',
          },
          {
            ...baseMockAssessment,
            Id: '123e4567-e89b-12d3-a456-426614174002',
            Title: 'Assessment 2',
          },
          {
            ...baseMockAssessment,
            Id: '123e4567-e89b-12d3-a456-426614174003',
            Title: 'Assessment 3',
          },
        ],
      } as unknown as AssessmentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.assessment,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result[0]?.title).toBe('Assessment 1');
      expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(result[1]?.title).toBe('Assessment 2');
      expect(result[2]?.id).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(result[2]?.title).toBe('Assessment 3');
    });

    it('should trim whitespace from titles and summaries', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        assessment: [
          {
            ...baseMockAssessment,
            Title: '  Assessment with spaces  ',
            Summary: '  Summary with spaces  ',
          },
        ],
      } as unknown as AssessmentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.assessment,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.title).toBe('Assessment with spaces');
      expect(result[0]?.description).toBe('Summary with spaces');
    });

    it('should handle assessments with null ModifiedByUser and ModifiedAtTimestamp', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        assessment: [
          {
            ...baseMockAssessment,
            ModifiedByUser: null,
            ModifiedAtTimestamp: null,
          },
        ],
      } as unknown as AssessmentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.assessment,
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

    it('should always return empty parents array', () => {
      const mockQueryResponse = {
        pageMetadata: mockMetadata,
        assessment: [baseMockAssessment],
      } as unknown as AssessmentListQueryResponse;

      const result = transformListQueryResponse(
        {
          data: mockQueryResponse.assessment,
          metadata: mockQueryResponse.pageMetadata,
        },
        {
          basePath: '/api/v1',
        }
      );

      expect(result[0]?.links.parents).toEqual([]);
    });
  });
});
