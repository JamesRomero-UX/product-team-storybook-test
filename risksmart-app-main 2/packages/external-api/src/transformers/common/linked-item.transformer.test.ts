import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LinkedItemsListResponse } from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import { transformLinkedItemListQueryResponse } from './linked-item.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
}));

describe('linked-item.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const { idToResourceReference, nodeObjectTypeToResourceType } =
      await import('../../utils/transforms');

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
        ['action', { type: 'action', path: 'actions' }],
        ['control', { type: 'control', path: 'controls' }],
        ['assessment', { type: 'assessment', path: 'assessments' }],
        ['indicator', { type: 'indicator', path: 'indicators' }],
        ['issue', { type: 'issue', path: 'issues' }],
        ['obligation', { type: 'obligation', path: 'obligations' }],
        ['third_party', { type: 'third_party', path: 'third-parties' }],
        ['acceptance', { type: 'acceptance', path: 'acceptances' }],
        ['appetite', { type: 'appetite', path: 'appetites' }],
      ]);

      return resourceTypes.get(type) || undefined;
    });
  });

  const baseMockLinkedItem = {
    Id: '123e4567-e89b-12d3-a456-426614174000',
    Target: '223e4567-e89b-12d3-a456-426614174001',
    RelationshipType: 'relates_to',
    CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
    ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
    CreatedByUser: 'provider|user123',
    ModifiedByUser: 'provider|user456',
    target_node: {
      ObjectType: 'risk',
    },
    target_risk: {
      Title: 'Test Risk',
    },
    target_acceptance: null,
    target_action: null,
    target_assessment: null,
    target_control: null,
    target_indicator: null,
    target_issue: null,
    target_obligation: null,
    target_third_party: null,
    target_appetite: null,
  } as LinkedItemsListResponse['linkedItem'][0];

  const mockMetadata = {
    nextId: null,
    hasNext: false,
    hasPrev: false,
    prevId: null,
    count: 1,
  };

  const mockOptions = {
    basePath: '/api/v1',
    linkId: 'control-123',
    resourceName: 'controls',
  };

  describe('transformLinkedItemListQueryResponse', () => {
    describe('happy path', () => {
      it('should transform a valid linked item with risk target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
        };

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          linkedItemId: '223e4567-e89b-12d3-a456-426614174001',
          linkedItemTitle: 'Test Risk',
          linkedItemType: 'risk',
          relationshipType: 'relates_to',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          links: {
            parents: [],
            linkedItem: {
              id: '223e4567-e89b-12d3-a456-426614174001',
              type: 'risk',
              href: '/api/v1/risks/223e4567-e89b-12d3-a456-426614174001',
            },
            self: null,
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
          },
        });
      });

      it('should transform linked item with action target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'action',
          },
          target_risk: null,
          target_action: {
            Title: 'Test Action',
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('Test Action');
        expect(result[0]?.linkedItemType).toBe('action');
        expect(result[0]?.links.linkedItem).toEqual({
          id: '223e4567-e89b-12d3-a456-426614174001',
          type: 'action',
          href: '/api/v1/actions/223e4567-e89b-12d3-a456-426614174001',
        });
      });

      it('should transform linked item with control target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'control',
          },
          target_risk: null,
          target_control: {
            Title: 'Test Control',
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('Test Control');
        expect(result[0]?.linkedItemType).toBe('control');
      });

      it('should transform linked item with assessment target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'assessment',
          },
          target_risk: null,
          target_assessment: {
            Title: 'Test Assessment',
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('Test Assessment');
        expect(result[0]?.linkedItemType).toBe('assessment');
      });

      it('should transform linked item with indicator target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'indicator',
          },
          target_risk: null,
          target_indicator: {
            Title: 'Test Indicator',
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('Test Indicator');
        expect(result[0]?.linkedItemType).toBe('indicator');
      });

      it('should transform linked item with issue target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'issue',
          },
          target_risk: null,
          target_issue: {
            Title: 'Test Issue',
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('Test Issue');
        expect(result[0]?.linkedItemType).toBe('issue');
      });

      it('should transform linked item with obligation target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'obligation',
          },
          target_risk: null,
          target_obligation: {
            Title: 'Test Obligation',
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('Test Obligation');
        expect(result[0]?.linkedItemType).toBe('obligation');
      });

      it('should transform linked item with third_party target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'third_party',
          },
          target_risk: null,
          target_third_party: {
            Title: 'Test Third Party',
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('Test Third Party');
        expect(result[0]?.linkedItemType).toBe('third_party');
      });

      it('should transform linked item with acceptance target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'acceptance',
          },
          target_risk: null,
          target_acceptance: {
            Title: 'Test Acceptance',
            parents: [
              {
                risk: {
                  Id: 'parent-risk-id',
                },
              },
            ],
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('Test Acceptance');
        expect(result[0]?.linkedItemType).toBe('acceptance');
        expect(result[0]?.links.linkedItem).toEqual({
          id: '223e4567-e89b-12d3-a456-426614174001',
          type: 'acceptance',
          href: '/api/v1/risks/parent-risk-id/acceptances/223e4567-e89b-12d3-a456-426614174001',
        });
      });

      it('should transform linked item with appetite target', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'appetite',
          },
          target_risk: null,
          target_appetite: {
            parents: [
              {
                risk: {
                  Id: 'parent-risk-id',
                },
              },
            ],
          },
        } as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemTitle).toBe('appetite');
        expect(result[0]?.linkedItemType).toBe('appetite');
        expect(result[0]?.links.linkedItem).toEqual({
          id: '223e4567-e89b-12d3-a456-426614174001',
          type: 'appetite',
          href: '/api/v1/risks/parent-risk-id/appetites/223e4567-e89b-12d3-a456-426614174001',
        });
      });

      it('should handle null ModifiedAtTimestamp and default to CreatedAtTimestamp', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          ModifiedAtTimestamp: null,
        } as unknown as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.updatedAt).toBe('2023-01-01T00:00:00.000Z');
      });

      it('should handle null ModifiedByUser and default to CreatedByUser', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          ModifiedByUser: null,
        };

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.updatedBy).toBe('provider|user123');
        expect(result[0]?.links.updatedBy).toEqual(result[0]?.links.createdBy);
      });

      it('should handle null CreatedByUser', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          CreatedByUser: null,
          ModifiedByUser: null,
        };

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.createdBy).toBeNull();
        expect(result[0]?.updatedBy).toBeNull();
        expect(result[0]?.links.createdBy).toBeNull();
        expect(result[0]?.links.updatedBy).toBeNull();
      });

      it('should handle null RelationshipType', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          RelationshipType: null,
        };

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.relationshipType).toBeNull();
      });

      it('should handle multiple linked items', () => {
        const mockLinkedItems = [
          {
            ...baseMockLinkedItem,
            Id: '323e4567-e89b-12d3-a456-426614174001',
            target_risk: { Title: 'Risk 1' },
          },
          {
            ...baseMockLinkedItem,
            Id: '423e4567-e89b-12d3-a456-426614174002',
            target_node: { ObjectType: 'action' },
            target_risk: null,
            target_action: { Title: 'Action 1' },
          },
        ] as LinkedItemsListResponse['linkedItem'];

        const result = transformLinkedItemListQueryResponse(
          {
            data: mockLinkedItems,
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result).toHaveLength(2);
        expect(result[0]?.id).toBe('323e4567-e89b-12d3-a456-426614174001');
        expect(result[0]?.linkedItemTitle).toBe('Risk 1');
        expect(result[1]?.id).toBe('423e4567-e89b-12d3-a456-426614174002');
        expect(result[1]?.linkedItemTitle).toBe('Action 1');
      });

      it('should handle empty linked items list', () => {
        const result = transformLinkedItemListQueryResponse(
          {
            data: [],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result).toEqual([]);
      });

      it('should handle acceptance without parent risk', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'acceptance',
          },
          target_risk: null,
          target_acceptance: {
            Title: 'Test Acceptance',
            parents: [],
          },
        } as unknown as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.links.linkedItem).toBeNull();
      });

      it('should handle appetite without parent risk', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'appetite',
          },
          target_risk: null,
          target_appetite: {
            parents: [],
          },
        } as unknown as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.links.linkedItem).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should handle unknown target type', async () => {
        const { nodeObjectTypeToResourceType } =
          await import('../../utils/transforms');

        vi.mocked(nodeObjectTypeToResourceType).mockReturnValue(undefined);

        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: 'unknown_type',
          },
        } as unknown as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemType).toBe('unknown_type');
        expect(result[0]?.linkedItemTitle).toBeNull();
        expect(result[0]?.links.linkedItem).toBeNull();
      });

      it('should handle null target_node', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: null,
        } as unknown as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemType).toBeNull();
        expect(result[0]?.linkedItemTitle).toBeNull();
        expect(result[0]?.links.linkedItem).toBeNull();
      });

      it('should handle null target_node.ObjectType', () => {
        const mockLinkedItem = {
          ...baseMockLinkedItem,
          target_node: {
            ObjectType: null,
          },
        } as unknown as LinkedItemsListResponse['linkedItem'][0];

        const result = transformLinkedItemListQueryResponse(
          {
            data: [mockLinkedItem],
            metadata: mockMetadata,
          },
          mockOptions
        );

        expect(result[0]?.linkedItemType).toBeNull();
        expect(result[0]?.linkedItemTitle).toBeNull();
        expect(result[0]?.links.linkedItem).toBeNull();
      });
    });

    describe('error handling', () => {
      it('should throw error when linkId is missing', () => {
        expect(() =>
          transformLinkedItemListQueryResponse(
            {
              data: [baseMockLinkedItem],
              metadata: mockMetadata,
            },
            {
              basePath: '/api/v1',
              linkId: undefined,
            } as never
          )
        ).toThrow(
          'Link ID and resource name required for linked item transforms'
        );
      });

      it('should throw error when linkId is null', () => {
        expect(() =>
          transformLinkedItemListQueryResponse(
            {
              data: [baseMockLinkedItem],
              metadata: mockMetadata,
            },
            {
              basePath: '/api/v1',
              linkId: null,
            } as never
          )
        ).toThrow(
          'Link ID and resource name required for linked item transforms'
        );
      });

      it('should throw error when linkId is empty string', () => {
        expect(() =>
          transformLinkedItemListQueryResponse(
            {
              data: [baseMockLinkedItem],
              metadata: mockMetadata,
            },
            {
              basePath: '/api/v1',
              linkId: '',
            }
          )
        ).toThrow(
          'Link ID and resource name required for linked item transforms'
        );
      });
    });
  });
});
