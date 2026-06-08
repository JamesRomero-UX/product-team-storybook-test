import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { renderHook } from '@testing-library/react';
import type { RecursivePartial } from 'src/testing/stub';
import { buildAuth0User } from 'src/testing/testUser';
import { vi } from 'vitest';

import type { Actions, MyItemsFilter, State } from '../../useDashboardStore';
import { useDashboardStore } from '../../useDashboardStore';
import type { FilterableRibbonData } from './useGetMyItemsFilteringTokens';
import { useGetMyItemsFilteringTokens } from './useGetMyItemsFilteringTokens';

vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
vi.mock('../../useDashboardStore');
const useRisksmartUserMock = vi.mocked(useRisksmartUser);
const useDashboardStoreMock = vi.mocked(useDashboardStore);

type TestData = {
  testDescription: string;
  options: MyItemsFilter;
  data: RecursivePartial<FilterableRibbonData>[];
  expected: unknown[];
};

const defaultOptions: MyItemsFilter = {
  owner: false,
  contributor: false,
  groupOwner: false,
  groupContributor: false,
  inheritedOwner: false,
  inheritedContributor: false,
  inheritedGroupOwner: false,
  inheritedGroupContributor: false,
};

const testData: TestData[] = [
  {
    testDescription: 'empty filters',
    options: { ...defaultOptions },
    data: [],
    expected: [],
  },
  {
    testDescription: 'current user as owner filter',
    options: { ...defaultOptions, owner: true },
    data: [],
    expected: [
      {
        propertyKey: 'allOwners',
        value: 'TestUser',
        operator: '=',
      },
    ],
  },
  {
    testDescription: 'current user as contributor filter',
    options: { ...defaultOptions, contributor: true },
    data: [],
    expected: [
      {
        propertyKey: 'allContributors',
        value: 'TestUser',
        operator: '=',
      },
    ],
  },
  {
    testDescription: 'current user in owner group when present',
    options: { ...defaultOptions, groupOwner: true },
    data: [
      {
        ownerGroups: [
          {
            UserGroupId: 'TestOwnerGroup',
            group: { users: [{ UserId: 'TestUser' }] },
          },
          {
            UserGroupId: 'TestOwnerGroup2',
            group: { users: [{ UserId: 'NotTheTestUser' }] },
          },
        ],
        contributorGroups: [],
      },
    ],
    expected: [
      {
        propertyKey: 'allOwners',
        value: 'TestOwnerGroup',
        operator: '=',
      },
    ],
  },
  {
    testDescription: 'empty filters for owner group when user not present',
    options: { ...defaultOptions, groupOwner: true },
    data: [
      {
        ownerGroups: [
          {
            UserGroupId: 'TestOwnerGroup',
            group: { users: [{ UserId: 'NotTheTestUser' }] },
          },
        ],
        contributorGroups: [],
      },
    ],
    expected: [],
  },
  {
    testDescription: 'current user in contributor group when present',
    options: { ...defaultOptions, groupContributor: true },
    data: [
      {
        contributorGroups: [
          {
            UserGroupId: 'TestContributorGroup',
            group: { users: [{ UserId: 'TestUser' }] },
          },
          {
            UserGroupId: 'TestContributorGroup2',
            group: { users: [{ UserId: 'NotTheTestUser' }] },
          },
        ],
        ownerGroups: [],
      },
    ],
    expected: [
      {
        propertyKey: 'allContributors',
        value: 'TestContributorGroup',
        operator: '=',
      },
    ],
  },
  {
    testDescription:
      'empty filters for contributor group when user not present',
    options: { ...defaultOptions, groupContributor: true },
    data: [
      {
        contributorGroups: [
          {
            UserGroupId: 'TestContributorGroup',
            group: { users: [{ UserId: 'NotTheTestUser' }] },
          },
        ],
        ownerGroups: [],
      },
    ],
    expected: [],
  },
  {
    testDescription: 'partial filtering',
    options: { ...defaultOptions, owner: true, groupContributor: true },
    data: [
      {
        contributorGroups: [
          {
            UserGroupId: 'TestContributorGroup',
            group: { users: [{ UserId: 'TestUser' }] },
          },
        ],
        ownerGroups: [],
      },
    ],
    expected: [
      {
        propertyKey: 'allOwners',
        value: 'TestUser',
        operator: '=',
      },
      {
        propertyKey: 'allContributors',
        value: 'TestContributorGroup',
        operator: '=',
      },
    ],
  },
  {
    testDescription: 'full filtering',
    options: {
      ...defaultOptions,
      owner: true,
      contributor: true,
      groupOwner: true,
      groupContributor: true,
    },
    data: [
      {
        ownerGroups: [
          {
            UserGroupId: 'TestOwnerGroup',
            group: { users: [{ UserId: 'NotTheTestUser' }] },
          },
          {
            UserGroupId: 'TestOwnerGroup2',
            group: { users: [{ UserId: 'TestUser' }] },
          },
        ],
        contributorGroups: [
          {
            UserGroupId: 'TestContributorGroup',
            group: { users: [{ UserId: 'TestUser' }] },
          },
        ],
      },
    ],
    expected: [
      {
        propertyKey: 'allOwners',
        value: 'TestUser',
        operator: '=',
      },
      {
        propertyKey: 'allContributors',
        value: 'TestUser',
        operator: '=',
      },
      {
        propertyKey: 'allOwners',
        value: 'TestOwnerGroup2',
        operator: '=',
      },
      {
        propertyKey: 'allContributors',
        value: 'TestContributorGroup',
        operator: '=',
      },
    ],
  },
];

describe('useGetRibbonFilteringTokens', () => {
  beforeEach(() => {
    useRisksmartUserMock.mockReturnValue(buildAuth0User());
    useDashboardStoreMock.mockClear();
  });

  it.each(testData)(
    'should map $testDescription correctly',
    ({ options, data, expected }) => {
      useDashboardStoreMock.mockReturnValue({
        myItemsFilters: options,
      } as State & Actions);
      const {
        result: { current },
      } = renderHook(() => useGetMyItemsFilteringTokens());
      expect(
        current.getMyItemsFilteringTokens(data as FilterableRibbonData[])
      ).toEqual(expected);
    }
  );
});
