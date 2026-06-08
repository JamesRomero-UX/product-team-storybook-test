import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
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

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { EnterpriseRiskFields } from './types';

describe('enterprise risk config', () => {
  const TestHarness: FC<{ records: EnterpriseRiskFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk]),
    mockedGetUserTablePreferences('enterpriseRiskRegister'),
    mockedGetOrganisation(),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display the correct number of columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(3);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual(['Title', 'Parent risk', 'Risk tier']);
    });

    it('should have the option to display 15 fields', async () => {
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
      expect(options?.length).toEqual(15);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Guid',
        'ID',
        'Title',
        'Parent risk',
        'Risk tier',
        'Risk treatment',
        'Risk description',
        'Inherent rating (mean)',
        'Inherent rating (worst-case)',
        'Residual rating (mean)',
        'Residual rating (worst-case)',
        'Created on',
        'Updated on',
        'Created by ID',
        'Updated by ID',
      ]);
    });
  });
});
