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

import { defaultMocks } from '../../../../testing/mock-data';
import type { ScimDomainFields, ScimTokenFields } from './config';
import {
  useGetScimDomainTableProps,
  useGetScimTokenTableProps,
} from './config';

describe('scim config', () => {
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('domain config', () => {
    const TestHarness: FC<{ records: ScimDomainFields[] }> = ({ records }) => {
      const tableProps = useGetScimDomainTableProps(records);

      return <Table {...tableProps} />;
    };

    describe('useGetScimDomainTableProps', () => {
      const mocks = [
        ...defaultMocks,
        mockedGetUserTablePreferences('scimDomains'),
      ];

      it('should display 2 columns by default', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(mocks, ...providers),
        });
        await waitForTableHeaders(container);
        const headers = createWrapper(container)
          .findTable()
          ?.findColumnHeaders();
        expect(headers?.length).toEqual(2);

        const headersText = getHeadersText(container);
        expect(headersText).toEqual(['Domain', 'Added on']);
      });

      it('should have the option to display 2 fields', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(mocks, ...providers),
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
        expect(options?.length).toEqual(2);
        const displayOptionLabels = getDisplayOptionsText(container);

        expect(displayOptionLabels).toEqual(['Domain', 'Added on']);
      });
    });
  });
  describe('token config', () => {
    const TestHarness: FC<{ records: ScimTokenFields[] }> = ({ records }) => {
      const tableProps = useGetScimTokenTableProps(records);

      return <Table {...tableProps} />;
    };

    describe('useGetScimTokenTableProps', () => {
      const mocks = [
        ...defaultMocks,
        mockedGetUserTablePreferences('scimTokens'),
      ];

      it('should display 4 columns by default', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(mocks, ...providers),
        });
        await waitForTableHeaders(container);
        const headers = createWrapper(container)
          .findTable()
          ?.findColumnHeaders();
        expect(headers?.length).toEqual(4);

        const headersText = getHeadersText(container);
        expect(headersText).toEqual([
          'Key ID',
          'Added on',
          'Expires on',
          'Status',
        ]);
      });

      it('should have the option to display 4 fields', async () => {
        const { container } = render(<TestHarness records={[]} />, {
          wrapper: getWrapper(mocks, ...providers),
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
        expect(options?.length).toEqual(4);
        const displayOptionLabels = getDisplayOptionsText(container);

        expect(displayOptionLabels).toEqual([
          'Key ID',
          'Added on',
          'Expires on',
          'Status',
        ]);
      });
    });
  });
});
