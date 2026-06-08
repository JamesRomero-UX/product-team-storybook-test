import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ApprovalByIdResponse,
  RiskListApprovalResponse,
} from '../../clients/client.interface';
import type { KnownType } from '../../utils/transforms';
import {
  transformApprovalItem,
  transformApprovalList,
} from './approval.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/transforms', () => ({
  idToResourceReference: vi.fn(),
  nodeObjectTypeToResourceType: vi.fn(),
}));

describe('approval.transformer', () => {
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
    nextDateTime: null,
    prevDateTime: null,
  };

  describe('transformApprovalItem', () => {
    const baseMockApproval = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      ParentId: '223e4567-e89b-12d3-a456-426614174001',
      Workflow: 'standard-approval',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      createdBy: {
        Id: 'provider|user123',
      },
      ModifiedByUser: 'provider|user123',
      levels: [
        {
          Id: '323e4567-e89b-12d3-a456-426614174002',
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
          SequenceOrder: 1,
          ApprovalRuleType: 'any',
          approvers: [
            {
              Id: '423e4567-e89b-12d3-a456-426614174003',
              CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
              ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
              UserId: 'provider|user456',
              UserGroupId: null,
              responses: [
                {
                  Id: '523e4567-e89b-12d3-a456-426614174004',
                  CreatedAtTimestamp: '2023-01-03T00:00:00.000Z',
                  ModifiedAtTimestamp: '2023-01-03T00:00:00.000Z',
                  ApproverId: '423e4567-e89b-12d3-a456-426614174003',
                  Approved: true,
                  Comment: 'Looks good',
                },
              ],
            },
          ],
        },
      ],
      parent: {
        Id: '223e4567-e89b-12d3-a456-426614174001',
        ObjectType: 'risk',
        SequentialId: 1,
      },
    };

    describe('happy path', () => {
      it('should transform a valid approval item response', () => {
        const mockApproval = {
          ...baseMockApproval,
          Workflow: 'standard-approval',
          ModifiedByUser: 'provider|user456',
          ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000',
          workflow: 'standard-approval',
          parentId: '223e4567-e89b-12d3-a456-426614174001',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          owners: [],
          contributors: [],
          tags: [],
          levels: [
            {
              id: '323e4567-e89b-12d3-a456-426614174002',
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-02T00:00:00.000Z',
              sequenceOrder: 1,
              approvalRuleType: 'any',
              approvers: [
                {
                  id: '423e4567-e89b-12d3-a456-426614174003',
                  createdAt: '2023-01-01T00:00:00.000Z',
                  updatedAt: '2023-01-02T00:00:00.000Z',
                  userId: 'provider|user456',
                  userGroupId: null,
                  responses: [
                    {
                      id: '523e4567-e89b-12d3-a456-426614174004',
                      createdAt: '2023-01-03T00:00:00.000Z',
                      updatedAt: '2023-01-03T00:00:00.000Z',
                      approverId: '423e4567-e89b-12d3-a456-426614174003',
                      approved: true,
                      comment: 'Looks good',
                    },
                  ],
                },
              ],
            },
          ],
          links: {
            self: {
              href: '/api/v1/risks/risk-123/approvals/123e4567-e89b-12d3-a456-426614174000',
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

      it('should handle approval with null workflow', () => {
        const mockApproval = {
          ...baseMockApproval,
          Workflow: null,
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.workflow).toBeNull();
      });

      it('should handle approval with null ModifiedAtTimestamp', () => {
        const mockApproval = {
          ...baseMockApproval,
          ModifiedAtTimestamp: null,
          ModifiedByUser: null,
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
        expect(result.updatedBy).toBe('provider|user123');
        expect(result.links.updatedBy).toEqual(result.links.createdBy);
      });

      it('should handle approval with null createdBy', () => {
        const mockApproval = {
          ...baseMockApproval,
          createdBy: null,
          ModifiedByUser: null,
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.createdBy).toBeNull();
        expect(result.updatedBy).toBeNull();
        expect(result.links.createdBy).toBeNull();
        expect(result.links.updatedBy).toBeNull();
      });

      it('should handle approval with multiple levels', () => {
        const mockApproval = {
          ...baseMockApproval,
          levels: [
            {
              Id: '323e4567-e89b-12d3-a456-426614174002',
              CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
              ModifiedAtTimestamp: null,
              SequenceOrder: 1,
              ApprovalRuleType: 'any',
              approvers: [
                {
                  Id: '423e4567-e89b-12d3-a456-426614174003',
                  CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
                  ModifiedAtTimestamp: null,
                  UserId: 'provider|user456',
                  UserGroupId: null,
                  responses: [],
                },
              ],
            },
            {
              Id: '623e4567-e89b-12d3-a456-426614174005',
              CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
              ModifiedAtTimestamp: '2023-01-03T00:00:00.000Z',
              SequenceOrder: 2,
              ApprovalRuleType: 'all',
              approvers: [
                {
                  Id: '723e4567-e89b-12d3-a456-426614174006',
                  CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
                  ModifiedAtTimestamp: null,
                  UserId: null,
                  UserGroupId: '823e4567-e89b-12d3-a456-426614174007',
                  responses: [],
                },
              ],
            },
          ],
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.levels).toHaveLength(2);
        expect(result.levels[0]?.sequenceOrder).toBe(1);
        expect(result.levels[1]?.sequenceOrder).toBe(2);
        expect(result.levels[0]?.approvalRuleType).toBe('any');
        expect(result.levels[1]?.approvalRuleType).toBe('all');
      });

      it('should handle approver with null userId and non-null userGroupId', () => {
        const mockApproval = {
          ...baseMockApproval,
          levels: [
            {
              Id: '323e4567-e89b-12d3-a456-426614174002',
              CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
              ModifiedAtTimestamp: null,
              SequenceOrder: 1,
              ApprovalRuleType: 'any',
              approvers: [
                {
                  Id: '423e4567-e89b-12d3-a456-426614174003',
                  CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
                  ModifiedAtTimestamp: null,
                  UserId: null,
                  UserGroupId: '923e4567-e89b-12d3-a456-426614174008',
                  responses: [],
                },
              ],
            },
          ],
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.levels[0]?.approvers[0]?.userId).toBeNull();
        expect(result.levels[0]?.approvers[0]?.userGroupId).toBe(
          '923e4567-e89b-12d3-a456-426614174008'
        );
      });

      it('should handle response with null comment', () => {
        const mockApproval = {
          ...baseMockApproval,
          levels: [
            {
              Id: '323e4567-e89b-12d3-a456-426614174002',
              CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
              ModifiedAtTimestamp: null,
              SequenceOrder: 1,
              ApprovalRuleType: 'any',
              approvers: [
                {
                  Id: '423e4567-e89b-12d3-a456-426614174003',
                  CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
                  ModifiedAtTimestamp: null,
                  UserId: 'provider|user456',
                  UserGroupId: null,
                  responses: [
                    {
                      Id: '523e4567-e89b-12d3-a456-426614174004',
                      CreatedAtTimestamp: '2023-01-03T00:00:00.000Z',
                      ModifiedAtTimestamp: '2023-01-03T00:00:00.000Z',
                      ApproverId: '423e4567-e89b-12d3-a456-426614174003',
                      Approved: false,
                      Comment: null,
                    },
                  ],
                },
              ],
            },
          ],
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(
          result.levels[0]?.approvers[0]?.responses[0]?.comment
        ).toBeNull();
        expect(result.levels[0]?.approvers[0]?.responses[0]?.approved).toBe(
          false
        );
      });

      it('should handle approval with empty levels array', () => {
        const mockApproval = {
          ...baseMockApproval,
          levels: [],
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.levels).toEqual([]);
      });

      it('should handle level with null ApprovalRuleType', () => {
        const mockApproval = {
          ...baseMockApproval,
          levels: [
            {
              Id: '323e4567-e89b-12d3-a456-426614174002',
              CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
              ModifiedAtTimestamp: null,
              SequenceOrder: 1,
              ApprovalRuleType: null,
              approvers: [],
            },
          ],
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.levels[0]?.approvalRuleType).toBe('');
      });

      it('should use correct resource path with linkId', () => {
        const mockApproval = {
          ...baseMockApproval,
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-456',
          }
        );

        expect(result.links.self.href).toBe(
          '/api/v1/risks/risk-456/approvals/123e4567-e89b-12d3-a456-426614174000'
        );
      });

      it('should handle approval with parent that has null ObjectType', () => {
        const mockApproval = {
          ...baseMockApproval,
          parent: {
            Id: '223e4567-e89b-12d3-a456-426614174001',
            ObjectType: '',
            SequentialId: 1,
          },
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.links.parents).toEqual([]);
      });
    });

    describe('unhappy path', () => {
      it('should throw error when linkId is missing', () => {
        const mockApproval = {
          ...baseMockApproval,
        };

        expect(() =>
          transformApprovalItem(
            mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
            {
              basePath: '/api/v1',
            }
          )
        ).toThrow('Link ID required for approval transforms');
      });

      it('should throw error when linkId is undefined', () => {
        const mockApproval = {
          ...baseMockApproval,
        };

        expect(() =>
          transformApprovalItem(
            mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
            {
              basePath: '/api/v1',
              linkId: undefined,
            }
          )
        ).toThrow('Link ID required for approval transforms');
      });
    });

    describe('edge cases', () => {
      it('should handle approval without levels property', () => {
        const mockApproval = {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          ParentId: '223e4567-e89b-12d3-a456-426614174001',
          Workflow: 'standard-approval',
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
          createdBy: {
            Id: 'provider|user123',
          },
          ModifiedByUser: 'provider|user123',
          parent: {
            Id: '223e4567-e89b-12d3-a456-426614174001',
            ObjectType: 'risk',
            SequentialId: 1,
          },
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.levels).toEqual([]);
      });

      it('should handle response with falsy Approved value', () => {
        const mockApproval = {
          ...baseMockApproval,
          levels: [
            {
              Id: '323e4567-e89b-12d3-a456-426614174002',
              CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
              ModifiedAtTimestamp: null,
              SequenceOrder: 1,
              ApprovalRuleType: 'any',
              approvers: [
                {
                  Id: '423e4567-e89b-12d3-a456-426614174003',
                  CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
                  ModifiedAtTimestamp: null,
                  UserId: 'provider|user456',
                  UserGroupId: null,
                  responses: [
                    {
                      Id: '523e4567-e89b-12d3-a456-426614174004',
                      CreatedAtTimestamp: '2023-01-03T00:00:00.000Z',
                      ModifiedAtTimestamp: '2023-01-03T00:00:00.000Z',
                      ApproverId: '423e4567-e89b-12d3-a456-426614174003',
                      Approved: null,
                      Comment: null,
                    },
                  ],
                },
              ],
            },
          ],
        };

        const result = transformApprovalItem(
          mockApproval as unknown as NonNullable<ApprovalByIdResponse>['approval'],
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result.levels[0]?.approvers[0]?.responses[0]?.approved).toBe(
          false
        );
      });
    });
  });

  describe('transformApprovalList', () => {
    const baseMockApprovalListItem = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      ParentId: '223e4567-e89b-12d3-a456-426614174001',
      Workflow: 'standard-approval',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-01T00:00:00.000Z',
      createdBy: {
        Id: 'provider|user123',
      },
      ModifiedByUser: 'provider|user123',
      parent: {
        Id: '223e4567-e89b-12d3-a456-426614174001',
        ObjectType: 'risk',
        SequentialId: 1,
      },
    };

    describe('happy path', () => {
      it('should transform a valid approval list query response', () => {
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [
            {
              ...baseMockApprovalListItem,
              Workflow: 'standard-approval',
              ModifiedByUser: 'provider|user456',
              ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
            },
          ],
          pageMetadata: mockMetadata,
        } as unknown as RiskListApprovalResponse;

        const result = transformApprovalList(
          {
            data: mockQueryResponse.approval,
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
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z',
          createdBy: 'provider|user123',
          updatedBy: 'provider|user456',
          owners: [],
          contributors: [],
          tags: [],
          links: {
            self: {
              href: '/api/v1/risks/risk-123/approvals/123e4567-e89b-12d3-a456-426614174000',
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

      it('should handle approval with null ModifiedAtTimestamp', () => {
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [
            {
              ...baseMockApprovalListItem,
              ModifiedAtTimestamp: null,
              ModifiedByUser: null,
            },
          ],
          pageMetadata: mockMetadata,
        } as unknown as RiskListApprovalResponse;

        const result = transformApprovalList(
          {
            data: mockQueryResponse.approval,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result[0]?.updatedAt).toBe('2023-01-01T00:00:00.000Z');
        expect(result[0]?.updatedBy).toBe('provider|user123');
        expect(result[0]?.links.updatedBy).toEqual(result[0]?.links.createdBy);
      });

      it('should handle empty approval list', () => {
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
            nextDateTime: null,
            prevDateTime: null,
          },
        } as unknown as RiskListApprovalResponse;

        const result = transformApprovalList(
          {
            data: mockQueryResponse.approval,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual([]);
      });

      it('should handle multiple approvals in the list', () => {
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [
            {
              ...baseMockApprovalListItem,
              Workflow: 'Workflow 1',
            },
            {
              ...baseMockApprovalListItem,
              Id: '123e4567-e89b-12d3-a456-426614174001',
              Workflow: 'Workflow 2',
              CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
              ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
              createdBy: {
                Id: 'provider|user456',
              },
              ModifiedByUser: 'provider|user456',
            },
          ],
          pageMetadata: mockMetadata,
        } as unknown as RiskListApprovalResponse;

        const result = transformApprovalList(
          {
            data: mockQueryResponse.approval,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result).toHaveLength(2);
        expect(result[0]?.id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(result[1]?.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      });

      it('should handle approvals with null parent', () => {
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [
            {
              ...baseMockApprovalListItem,
              parent: null,
            },
          ],
          pageMetadata: mockMetadata,
        } as unknown as RiskListApprovalResponse;

        const result = transformApprovalList(
          {
            data: mockQueryResponse.approval,
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
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [baseMockApprovalListItem],
          pageMetadata: mockMetadata,
        } as unknown as RiskListApprovalResponse;

        const result = transformApprovalList(
          {
            data: mockQueryResponse.approval,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-789',
          }
        );

        expect(result[0]?.links.self.href).toBe(
          '/api/v1/risks/risk-789/approvals/123e4567-e89b-12d3-a456-426614174000'
        );
      });

      it('should handle approval with null createdBy', () => {
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [
            {
              ...baseMockApprovalListItem,
              createdBy: null,
              ModifiedByUser: null,
            },
          ],
          pageMetadata: mockMetadata,
        } as unknown as RiskListApprovalResponse;

        const result = transformApprovalList(
          {
            data: mockQueryResponse.approval,
            metadata: mockMetadata,
          },
          {
            basePath: '/api/v1',
            linkId: 'risk-123',
          }
        );

        expect(result[0]?.createdBy).toBeNull();
        expect(result[0]?.updatedBy).toBeNull();
        expect(result[0]?.links.createdBy).toBeNull();
        expect(result[0]?.links.updatedBy).toBeNull();
      });
    });

    describe('unhappy path', () => {
      it('should throw error when linkId is missing', () => {
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [baseMockApprovalListItem],
          pageMetadata: mockMetadata,
        } as unknown as RiskListApprovalResponse;

        expect(() =>
          transformApprovalList(
            {
              data: mockQueryResponse.approval,
              metadata: mockMetadata,
            },
            {
              basePath: '/api/v1',
            }
          )
        ).toThrow('Link ID required for approval transforms');
      });

      it('should throw error when linkId is undefined', () => {
        const mockQueryResponse: RiskListApprovalResponse = {
          approval: [baseMockApprovalListItem],
          pageMetadata: mockMetadata,
        } as unknown as RiskListApprovalResponse;

        expect(() =>
          transformApprovalList(
            {
              data: mockQueryResponse.approval,
              metadata: mockMetadata,
            },
            {
              basePath: '/api/v1',
              linkId: undefined,
            }
          )
        ).toThrow('Link ID required for approval transforms');
      });
    });
  });
});
