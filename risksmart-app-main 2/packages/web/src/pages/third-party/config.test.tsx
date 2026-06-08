import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
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

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { ThirdPartyFields } from './types';

describe('third party config', () => {
  const TestHarness: FC<{ records: ThirdPartyFields[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.ThirdParty]),
    mockedGetOrganisation(),
    mockedGetUserTablePreferences('thirdPartyRegister'),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display the correct number of columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(9);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Title',
        'Owners',
        'Description',
        'Company Name',
        'Type',
        'Status',
        'Criticality',
        'Tags',
        'Departments',
      ]);
    });

    it('should have the option to display 8 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      await waitFor(() =>
        createWrapper(container).findTable()?.findCollectionPreferences()
      );
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(22);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Title',
        'Owners',
        'Contributors',
        'Description',
        'Company Name',
        'Companies House Number',
        'Address',
        'City/Town',
        'Postcode',
        'Country',
        'Primary Contact Name',
        'Contact Name',
        'Contact Email',
        'Company Domain',
        'Type',
        'Status',
        'Criticality',
        'Tags',
        'Departments',
        'Created by ID',
        'Updated by ID',
      ]);
    });
  });

  it('should display the "ID" when toggled on in preferences', async () => {
    const { container } = render(
      <TestHarness
        records={[
          {
            SequentialId: 52,
            Id: 'abcdefg',
            Title: 'ok',
            CompanyName: 'risksmart',
            CompanyDomain: 'risksmart.com',
            CompaniesHouseNumber: '123',
            Status: 'active',
            Type: 'managed_service',
            Criticality: 1,
            CreatedByUser: 'user1',
            CreatedAtTimestamp: '2021-01-01T00:00:00Z',
            ModifiedByUser: 'user2',
            ModifiedAtTimestamp: '2021-01-02T00:00:00Z',
            owners: [],
            contributors: [],
            ownerGroups: [],
            contributorGroups: [],
            tags: [],
            departments: [],
          },
        ]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitForTableHeaders(container);
    await waitFor(() =>
      createWrapper(container).findTable()?.findCollectionPreferences()
    );
    toggleColumnVisibilityFromTable(container, 'ID');

    expect(getCellText(container, 'ID', 1)).toEqual('TP-52');
  });
});
