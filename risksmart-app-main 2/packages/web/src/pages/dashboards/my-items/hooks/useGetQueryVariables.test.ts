import { useEntityFilter } from '@risksmart-app/components/src/contexts/entityFilterContext';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import { useDashboardStore } from '../../useDashboardStore';
import { useGetQueryVariables } from './useGetQueryVariables';

vi.mock('../../useDashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser', () => ({
  default: vi.fn(),
}));

vi.mock('@risksmart-app/components/src/contexts/entityFilterContext', () => ({
  useEntityFilter: vi.fn(),
}));

describe('useGetQueryVariables', () => {
  const mockUser = { userId: 'test-user-id' };

  beforeEach(() => {
    vi.clearAllMocks();

    (useRisksmartUser as Mock).mockReturnValue({ user: mockUser });
    (useEntityFilter as unknown as Mock).mockReturnValue({
      entityIds: [],
    });
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        owner: false,
        contributor: false,
        groupOwner: false,
        groupContributor: false,
        inheritedOwner: false,
        inheritedContributor: false,
        inheritedGroupOwner: false,
        inheritedGroupContributor: false,
      },
    });
  });

  it('should return default query variables when no filters are active', () => {
    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current).toEqual({
      userId: mockUser.userId,
      riskFilterConditions: { _or: [] },
      actionFilterConditions: { _or: [] },
      indicatorFilterConditions: { _or: [] },
      documentFilterConditions: { _or: [] },
      assessmentFilterConditions: { _or: [] },
      issueFilterConditions: { _or: [] },
      internalAuditFilterConditions: { _or: [] },
      obligationFilterConditions: { _or: [] },
      thirdPartyFilterConditions: { _or: [] },
      assessmentActivityFilterConditions: { _or: [] },
      controlFilterConditions: { _or: [] },
    });
  });

  it('should add owner filter condition when owner is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: { owner: true },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toContainEqual({
      owners: { UserId: { _eq: mockUser.userId } },
    });
  });

  it('should add contributor filter condition when contributor is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: { contributor: true },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toContainEqual({
      contributors: { UserId: { _eq: mockUser.userId } },
    });
  });

  it('should add groupOwner filter condition when groupOwner is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: { groupOwner: true },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toContainEqual({
      ownerGroups: { group: { users: { UserId: { _eq: mockUser.userId } } } },
    });
  });

  it('should add groupContributor filter condition when groupContributor is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: { groupContributor: true },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toContainEqual({
      contributorGroups: {
        group: { users: { UserId: { _eq: mockUser.userId } } },
      },
    });
  });

  it('should add inheritedOwner filter condition when inheritedOwner is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: { inheritedOwner: true },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toContainEqual({
      _and: [
        { _not: { owners: { UserId: { _eq: mockUser.userId } } } },
        {
          ancestorContributors: {
            _and: [
              { UserId: { _eq: mockUser.userId } },
              { ContributorType: { _eq: 'owner' } },
              { UserGroupId: { _is_null: true } },
            ],
          },
        },
      ],
    });
  });

  it('should add inheritedGroupOwner filter condition when inheritedGroupOwner is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: { inheritedGroupOwner: true },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toContainEqual({
      _and: [
        {
          _not: {
            ownerGroups: {
              group: { users: { UserId: { _eq: mockUser.userId } } },
            },
          },
        },
        {
          ancestorContributors: {
            _and: [
              { UserId: { _eq: mockUser.userId } },
              { ContributorType: { _eq: 'owner' } },
              { UserGroupId: { _is_null: false } },
            ],
          },
        },
      ],
    });
  });

  it('should add inheritedContributor filter condition when inheritedContributor is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: { inheritedContributor: true },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toContainEqual({
      _and: [
        { _not: { contributors: { UserId: { _eq: mockUser.userId } } } },
        {
          ancestorContributors: {
            _and: [
              { UserId: { _eq: mockUser.userId } },
              { ContributorType: { _eq: 'contributor' } },
              { UserGroupId: { _is_null: true } },
            ],
          },
        },
      ],
    });
  });

  it('should add inheritedGroupContributor filter condition when inheritedGroupContributor is true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: { inheritedGroupContributor: true },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toContainEqual({
      _and: [
        {
          _not: {
            contributorGroups: {
              group: { users: { UserId: { _eq: mockUser.userId } } },
            },
          },
        },
        {
          ancestorContributors: {
            _and: [
              { UserId: { _eq: mockUser.userId } },
              { ContributorType: { _eq: 'contributor' } },
              { UserGroupId: { _is_null: false } },
            ],
          },
        },
      ],
    });
  });

  it('should apply additional entity filter when set', () => {
    (useEntityFilter as unknown as Mock).mockReturnValue({
      entityIds: ['entity1', 'entity2'],
    });
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        owner: true,
      },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions).toEqual({
      enterpriseRiskInstance: { EntityId: { _in: ['entity1', 'entity2'] } },
      _or: [{ owners: { UserId: { _eq: mockUser.userId } } }],
    });
  });

  it('should add all query conditions when all filters are true', () => {
    (useDashboardStore as Mock).mockReturnValue({
      myItemsFilters: {
        owner: true,
        contributor: true,
        groupOwner: true,
        groupContributor: true,
        inheritedOwner: true,
        inheritedContributor: true,
        inheritedGroupOwner: true,
        inheritedGroupContributor: true,
      },
    });

    const { result } = renderHook(() => useGetQueryVariables());

    expect(result.current.riskFilterConditions._or).toEqual(
      expect.arrayContaining([
        { owners: { UserId: { _eq: mockUser.userId } } },
        { contributors: { UserId: { _eq: mockUser.userId } } },
        {
          ownerGroups: {
            group: { users: { UserId: { _eq: mockUser.userId } } },
          },
        },
        {
          contributorGroups: {
            group: { users: { UserId: { _eq: mockUser.userId } } },
          },
        },
        {
          _and: [
            { _not: { owners: { UserId: { _eq: mockUser.userId } } } },
            {
              ancestorContributors: {
                _and: [
                  { UserId: { _eq: mockUser.userId } },
                  { ContributorType: { _eq: 'owner' } },
                  { UserGroupId: { _is_null: true } },
                ],
              },
            },
          ],
        },
        {
          _and: [
            {
              _not: {
                ownerGroups: {
                  group: { users: { UserId: { _eq: mockUser.userId } } },
                },
              },
            },
            {
              ancestorContributors: {
                _and: [
                  { UserId: { _eq: mockUser.userId } },
                  { ContributorType: { _eq: 'owner' } },
                  { UserGroupId: { _is_null: false } },
                ],
              },
            },
          ],
        },
        {
          _and: [
            { _not: { contributors: { UserId: { _eq: mockUser.userId } } } },
            {
              ancestorContributors: {
                _and: [
                  { UserId: { _eq: mockUser.userId } },
                  { ContributorType: { _eq: 'contributor' } },
                  { UserGroupId: { _is_null: true } },
                ],
              },
            },
          ],
        },
        {
          _and: [
            {
              _not: {
                contributorGroups: {
                  group: { users: { UserId: { _eq: mockUser.userId } } },
                },
              },
            },
            {
              ancestorContributors: {
                _and: [
                  { UserId: { _eq: mockUser.userId } },
                  { ContributorType: { _eq: 'contributor' } },
                  { UserGroupId: { _is_null: false } },
                ],
              },
            },
          ],
        },
      ])
    );
  });
});
