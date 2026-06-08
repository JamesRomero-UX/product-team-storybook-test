import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import {
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { defaultMocks } from '../../../../../testing/mock-data';
import { useGetCollectionStatelessTableProps } from './config';
import type { AppetiteFields } from './types';

vi.mock('@/hooks/useIsModuleEnabled');
const useIsModuleEnabledMock = vi.mocked(useIsModuleEnabled);

describe('appetites config', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.clear();
  });

  const TestHarness: FC<{ records: AppetiteFields[] }> = ({ records }) => {
    const tableProps = useGetCollectionStatelessTableProps(records);

    return <Table {...tableProps} />;
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Appetite]),
    mockedGetOrganisation(),
    mockedGetAggregationResponse(),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 6 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findColumnHeaders()
      );
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(6);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'ID',
        'Appetite Type',
        'Effective date',
        'Status',
        'Lower appetite',
        'Upper appetite',
      ]);
    });

    it('should display 7 columns when impacts is enabled', async () => {
      when(useIsModuleEnabledMock)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(true);
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(
          [...testMocks, mockedGetOrganisation()],
          ...providers
        ),
      });
      await waitFor(() => createWrapper(container).findTable());
      await waitFor(() =>
        createWrapper(container).findTable()?.findColumnHeaders()
      );
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(7);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'ID',
        'Appetite Type',
        'Effective date',
        'Status',
        'Impact',
        'Impact appetite',
        'Likelihood appetite',
      ]);
    });

    it('should have the option to display 6 fields', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(
          [...testMocks, mockedGetOrganisation()],
          ...providers
        ),
      });
      await waitFor(() => createWrapper(container).findTable());
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
      expect(options?.length).toEqual(6);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toEqual([
        'ID',
        'Appetite Type',
        'Effective date',
        'Status',
        'Lower appetite',
        'Upper appetite',
      ]);
    });

    it('should have the option to display 7 fields when impacts enabled', async () => {
      when(useIsModuleEnabledMock)
        .calledWith('risk.subModules.impact')
        .mockReturnValue(true);
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitFor(() => createWrapper(container).findTable());
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
      expect(options?.length).toEqual(7);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toEqual([
        'ID',
        'Appetite Type',
        'Effective date',
        'Status',
        'Impact',
        'Impact appetite',
        'Likelihood appetite',
      ]);
    });
  });
});
