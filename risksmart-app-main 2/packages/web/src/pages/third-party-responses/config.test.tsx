import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render } from '@testing-library/react';
import type { FC } from 'react';
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
import type { ThirdPartyResponseFields } from './types';

describe('third party response config', () => {
  const TestHarness: FC<{ records: ThirdPartyResponseFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetUserTablePreferences('thirdPartyResponseRegister'),
  ];

  const providers: Providers[] = [
    'permission',
    'graphql',
    'trpc',
    'router',
    'features',
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display the correct number of columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(5);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Response',
        'Third party',
        'Version',
        'Status',
        'Respondent',
      ]);
    });

    it('should have the option to display 8 fields', async () => {
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
      expect(options?.length).toEqual(8);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Response',
        'Third party',
        'Version',
        'Status',
        'Respondent',
        'Created by ID',
        'Updated by ID',
        'Updated on',
      ]);
    });
  });

  it('should display the "Created by ID" when toggled on in preferences', async () => {
    const { container } = render(
      <TestHarness
        records={[
          {
            Id: '1',
            Status: 'in_progress',
            CreatedByUser: 'user1',
            CreatedAtTimestamp: '2021-01-01T00:00:00Z',
            ModifiedByUser: 'user2',
            ModifiedAtTimestamp: '2021-01-02T00:00:00Z',
            ParentId: '1',
            QuestionnaireTemplateVersionId: '',
            ResponseData: {},
            StartDate: '2021-01-01T00:00:00Z',
            ExpiresAt: '2021-01-01T00:00:00Z',
            thirdParty: {
              Id: '1',
              Title: 'ebay',
              __typename: 'third_party',
            },
            invitees: [],
          },
        ]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitForTableHeaders(container);

    toggleColumnVisibilityFromTable(container, 'Created by ID');

    expect(getCellText(container, 'Created by ID', 1)).toEqual('user1');
  });
});
