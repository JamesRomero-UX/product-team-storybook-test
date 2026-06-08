import { Approval_Status_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useLabelledFields } from './useLabelledFields';

vi.mock('@/hooks/useChangeRequests', () => ({
  useChangeRequests: () => ({
    isActiveApprover: vi.fn(),
    getCurrentLevel: vi.fn(),
    getMaxLevel: vi.fn(),
    getCurrentApprovers: vi.fn(),
    getNextApprovers: vi.fn(),
  }),
}));
vi.mock('@risksmart-app/components/src/hooks/useRating', () => ({
  useRating: () => ({
    getByValue: (value: unknown) => ({
      label:
        value === Approval_Status_Enum.Approved ? 'Approved' : 'Other Status',
    }),
  }),
}));

describe('useLabelledFields', () => {
  it('issue assessments map correctly', () => {
    const {
      result: { current },
    } = renderHook(() =>
      useLabelledFields({
        change_request: [
          {
            Id: '1',
            SequentialId: 1,
            ChangeRequestStatus: Approval_Status_Enum.Approved,
            ParentId: 'parent-1',
            contributors: [],
            responses: [],
            parent: {
              Id: 'parent-1',
              ObjectType: 'issue_assessment',
              issue_assessment: {
                parent: {
                  Id: 'issue-1',
                  Title: 'Issue 1',
                  SequentialId: 100,
                  owners: [
                    {
                      user: {
                        Id: 'user-1',
                        FriendlyName: 'Jane Smith',
                        Email: 'jane.smith@example.com',
                      },
                    },
                  ],
                },
              },
            },
            currentUserOwnerList: [],
            createdBy: { FriendlyName: 'John Doe' },
            CreatedAtTimestamp: '2021-01-01T00:00:00Z',
            ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
          },
        ],
      })
    );
    expect(current[0]).toEqual(
      expect.objectContaining({
        ChangeRequestStatus: 'approved',
        CreatedAtTimestamp: '2021-01-01T00:00:00Z',
        DateClosed: '2021-01-01T00:00:00Z',
        Id: '1',
        ModifiedAtTimestamp: '2021-01-01T00:00:00Z',
        ParentId: 'parent-1',
        ParentName: 'Issue 1',
        ParentSequentialId: 'I-100',
        ParentType: 'Issue Assessment',
        SequentialId: 1,
        StatusLabelled: 'Approved',
        allApprovers: [],
        allRequesters: [
          {
            id: '',
            label: 'John Doe',
          },
        ],
        approvalConfig: [],
        contributors: [],
        createdBy: {
          FriendlyName: 'John Doe',
        },
        currentApprovers: undefined,
        currentUserOwnerList: [],
        nextApprovers: undefined,
        parentOwners: [
          {
            id: 'user-1',
            label: 'Jane Smith',
          },
        ],
        parent: {
          Id: 'parent-1',
          ObjectType: 'issue_assessment',
          issue_assessment: {
            parent: {
              Id: 'issue-1',
              SequentialId: 100,
              Title: 'Issue 1',
              owners: [
                {
                  user: {
                    Id: 'user-1',
                    FriendlyName: 'Jane Smith',
                    Email: 'jane.smith@example.com',
                  },
                },
              ],
            },
          },
        },
        responses: [],
      })
    );
  });
});
