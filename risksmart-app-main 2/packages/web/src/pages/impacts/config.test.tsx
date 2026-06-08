import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { Impact } from './types';

describe('impacts config', () => {
  const TestHarness: FC<{ records: Impact[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Impact]),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('impactRegister'),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'trpc',
    'router',
    'features',
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
        'Rationale',
        'Owners',
        'Rated items',
      ]);
    });

    it('should have the option to display 11 fields', async () => {
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
      expect(options?.length).toEqual(11);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Name',
        'Rationale',
        'Owners',
        'Performance Score',
        'Rated items',
        'Created on',
        'Guid',
        'Updated on',
        'Created by ID',
        'Created by',
      ]);
    });
  });

  it('should display the impact name', async () => {
    const { container } = render(
      <TestHarness
        records={[
          {
            Id: '1',
            Name: 'impact - 1',
            CreatedAtTimestamp: '',
            CreatedByUser: '',
            ModifiedAtTimestamp: '',
            ModifiedByUser: '',
            SequentialId: 1,
            owners: [],
            ownerGroups: [],
            ratings: [],
            appetites: [],
            createdByUser: {
              FriendlyName: 'Freddo',
            },
          },
        ]}
      />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitForTableHeaders(container);
    const cell = createWrapper(container).findTable()?.findBodyCell(1, 1);
    expect(cell).toBeDefined();
    expect(cell!.getElement().textContent).toEqual('impact - 1');
  });
});
