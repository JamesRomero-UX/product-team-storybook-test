import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../../../testing/mock-data';
import type { UserGroupsTableFields } from './config';
import { useGetCollectionTableProps } from './config';

describe('groups config', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const TestHarness: FC<{ records: UserGroupsTableFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const defaultGroup: UserGroupsTableFields = {
    Id: 'b3d6e665-2860-456c-a499-6764230d5bf1',
    Name: 'Approval team',
    Email: null,
    Description: null,
    OwnerContributor: true,
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    CreatedAtTimestamp: '2024-07-10T10:56:12.524916+00:00',
    modifiedByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    ModifiedAtTimestamp: '2024-07-10T10:56:12.524916+00:00',
    users_aggregate: {
      aggregate: {
        count: 1,
        __typename: 'user_group_user_aggregate_fields',
      },
      __typename: 'user_group_user_aggregate',
    },
    approvers_aggregate: {
      aggregate: {
        count: 1,
        __typename: 'approver_aggregate_fields',
      },
    },
  };

  const buildGroup = (overrides: Partial<UserGroupsTableFields> = {}) => ({
    ...defaultGroup,
    ...overrides,
  });

  const testMocks = [
    ...defaultMocks,
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('userGroupRegister'),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 4 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(4);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Name',
        'Description',
        'Email address',
        'Members',
      ]);
    });

    it('should have the option to display 10 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(10);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toEqual([
        'Name',
        'Description',
        'Email address',
        'Members',
        'Owner / Contributor',
        'Created on',
        'Created by',
        'Updated on',
        'Updated by',
        'Guid',
      ]);
    });
  });

  it('should display the "Guid" when toggled on in preferences', async () => {
    const { container } = render(<TestHarness records={[buildGroup()]} />, {
      wrapper: getWrapper(testMocks, ...providers),
    });
    await waitForTableHeaders(container);
    toggleColumnVisibilityFromTable(container, 'Guid');

    expect(getCellText(container, 'Guid', 1)).toEqual(buildGroup().Id);
  });
});
