import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useGetCollectionTableProps } from './config';
import type { EntityFields } from './types';

describe('entity config', () => {
  const TestHarness: FC<{ records: EntityFields[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records, vi.fn(), vi.fn());

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
    mockedGetUserTablePreferences('entityRegister'),
    mockedGetOrganisation(),
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
        'Name',
        'Parent entity',
        'Description',
        'Weight',
        'Owners',
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
      expect(options?.length).toEqual(10);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Guid',
        'Name',
        'Parent entity',
        'Description',
        'Weight',
        'Created on',
        'Updated on',
        'Created by ID',
        'Updated by ID',
        'Owners',
      ]);
    });
  });
});
