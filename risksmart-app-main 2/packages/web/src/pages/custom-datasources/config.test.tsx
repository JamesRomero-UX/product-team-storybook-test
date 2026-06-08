import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
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
import type { CustomDatasource } from './types';

describe('report config', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const TestHarness: FC<{ records: CustomDatasource[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('customDatasourceRegister'),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 1 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(1);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual(['Title']);
    });

    it('should have the option to display 6 fields', async () => {
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
      expect(options?.length).toEqual(6);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Title',
        'Created on',
        'Last updated',
        'Updated by ID',
        'Updated by',
        'Id',
      ]);
    });
  });
});
