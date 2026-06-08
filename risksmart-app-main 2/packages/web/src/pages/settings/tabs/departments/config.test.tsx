import Table from '@risk-smart/themed-cloudscape-components/table';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vitest } from 'vitest';

import { defaultMocks } from '../../../../testing/mock-data';
import type { DepartmentTypeTableFields } from './config';
import { useGetCollectionTableProps } from './config';

describe('department config', () => {
  const TestHarness: FC<{ records: DepartmentTypeTableFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records, vitest.fn());

    return <Table {...tableProps} />;
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const tableMocks = [
    ...defaultMocks,
    mockedGetUserTablePreferences('departmentRegister'),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 3 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(tableMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(3);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual(['Name', 'Description', 'Group']);
    });
  });

  it('should have the option to display 8 fields', async () => {
    const { container } = render(<TestHarness records={[]} />, {
      wrapper: getWrapper(tableMocks, ...providers),
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
      'Name',
      'Description',
      'Created on',
      'Created by',
      'Updated on',
      'Updated by',
      'Group',
      'Guid',
    ]);
  });
});
