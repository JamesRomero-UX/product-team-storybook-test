import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import {
  Acceptance_Status_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getEmptyCollectionSlotText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { AcceptanceFlatFields } from './types';

describe('assessments config', () => {
  const defaultAcceptance: AcceptanceFlatFields = {
    CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    Id: '5735b222-82cc-4548-98ab-12d0d8e9feb3',
    ModifiedAtTimestamp: '2024-02-22T08:46:26.618161+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    SequentialId: 1,
    Title: 'Business integrity check',
    DateAcceptedFrom: '2023-07-15T17:41:58.03502+00:00',
    DateAcceptedTo: '2023-07-15T17:41:58.03502+00:00',
    Details: 'Hello world',
    parents: [],
    files: [],
    changeRequests: [],
    Status: Acceptance_Status_Enum.Open,
  };

  const TestHarness: FC<{ records: AcceptanceFlatFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };
  const mocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.Acceptance,
      Parent_Type_Enum.Risk,
    ]),
    mockedGetUserTablePreferences('acceptanceRegister'),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'trpc',
    'router',
    'features',
  ];

  describe('useGetCollectionTableProps', () => {
    const id = 'ID';
    const guid = 'Guid';

    it('should display 8 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(8);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Acceptance title',
        'Details',
        'Associations',
        'Risk tier (risk)',
        'Owners (risk)',
        'Accepted from',
        'Accepted to',
        'Status',
      ]);
    });

    it('should have the option to display 18 fields', async () => {
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
      expect(options?.length).toEqual(18);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toEqual([
        'Acceptance title',
        'Details',
        'Associations',
        'Risk tier (risk)',
        'Owners (risk)',
        'Contributors (risk)',
        'Accepted from',
        'Accepted to',
        'Status',
        'Guid',
        'ID',
        'Updated on',
        'Updated by ID',
        'Updated by',
        'Requested by',
        'Approved by',
        'Tags (risk)',
        'Departments (risk)',
      ]);
    });

    it('should display the "Guid" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAcceptance }]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);

      toggleColumnVisibilityFromTable(container, guid);

      expect(getCellText(container, guid, 1)).toEqual(defaultAcceptance.Id);
    });

    it('should display the "Id" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAcceptance }]} />,
        {
          wrapper: getWrapper(mocks, ...providers),
        }
      );
      await waitForTableHeaders(container);

      toggleColumnVisibilityFromTable(container, id);

      expect(getCellText(container, id, 1)).toEqual('ACC-1');
    });

    it('should display correct empty collection text', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      expect(getEmptyCollectionSlotText(container, 0)).toEqual(
        'No Acceptances'
      );
      expect(getEmptyCollectionSlotText(container, 1)).toEqual(
        'No acceptances to display.'
      );
    });
  });
});
