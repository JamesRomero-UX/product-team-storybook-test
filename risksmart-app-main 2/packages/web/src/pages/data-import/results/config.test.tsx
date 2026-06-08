import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { defaultMocks } from 'src/testing/mock-data';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { useGetCollectionTableProps } from './config';
import type { DataImportErrorFields } from './types';

describe('data import config', () => {
  const TestHarness: FC<{ records: DataImportErrorFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const defaultDataImport: DataImportErrorFields = {
    RowNumber: 1,
    ImportObject: 'risk.csv',
    Message: 'Very bad data import',
  };

  const testMocks = [...defaultMocks];

  const providers: Providers[] = ['router', 'graphql', 'trpc', 'features'];

  describe('useGetCollectionTableProps', () => {
    it('should display 3 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(3);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual(['Import object', 'Row number', 'Message']);
    });

    it('should render a row of data', async () => {
      const { container } = render(
        <TestHarness records={[defaultDataImport]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(3);

      expect(getCellText(container, 'Import object', 1)).toEqual('risk.csv');
      expect(getCellText(container, 'Row number', 1)).toEqual('1');
      expect(getCellText(container, 'Message', 1)).toEqual(
        'Very bad data import'
      );
    });

    it('should have the option to display 3 fields', async () => {
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
      expect(options?.length).toEqual(3);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Import object',
        'Row number',
        'Message',
      ]);
    });

    it('should support export in correct format', async () => {
      const { result } = renderHook(
        () => useGetCollectionTableProps([{ ...defaultDataImport }]),
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitFor(() =>
        expect(result.current.exportToCsvString).toBeDefined()
      );
      const csv = result.current.exportToCsvString();
      expect(csv).toEqual(
        '"Import object","Row number","Message"\r\n' +
          '"risk.csv",1,"Very bad data import"'
      );
    });
  });
});
