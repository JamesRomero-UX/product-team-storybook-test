import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
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
import type { InternalAuditFields } from './types';

describe('internal audit config', () => {
  const defaultInternalAudit: InternalAuditFields = {
    Description: 'Desc',
    actions: [],
    createdByUser: {},
    internalAuditReports: [],
    issues: [],
    modifiedByUser: {},
    CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    Id: '5735b222-82cc-4548-98ab-12d0d8e9feb3',
    ModifiedAtTimestamp: '2024-02-22T08:46:26.618161+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    SequentialId: 1,
    Title: 'Business integrity check',
    businessArea: {
      Id: 'someId',
      Title: 'Accounting',
      SequentialId: 1,
    },
    owners: [],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    tags: [],
    departments: [],
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'trpc',
    'router',
    'features',
  ];
  const TestHarness: FC<{ records: InternalAuditFields[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.InternalAuditEntity]),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('internalAuditRegister'),
  ];

  describe('useGetCollectionTableProps', () => {
    const id = 'ID';

    it('should display 8 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(8);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Title',
        'Business area',
        'Report status',
        'Audit rating',
        'Open actions',
        'Open issues',
        'Latest report date',
        'Owners',
      ]);
    });

    it('should have the option to display 13 fields', async () => {
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
      expect(options?.length).toEqual(18);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Title',
        'Created on',
        'Updated by ID',
        id,
        'Guid',
        'Business area',
        'Last updated',
        'Created by ID',
        'Created by',
        'Report status',
        'Audit rating',
        'Open actions',
        'Open issues',
        'Latest report date',
        'Owners',
        'Contributors',
        'Tags',
        'Departments',
      ]);
    });

    it('should display friendly sequential id for the ID column', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultInternalAudit }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, id);

      expect(getCellText(container, id, 1)).toEqual('IA-1');
    });

    it('should display correct empty collection text', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      expect(getEmptyCollectionSlotText(container, 0)).toEqual(
        'No Internal Audits'
      );
      expect(getEmptyCollectionSlotText(container, 1)).toEqual(
        'No internal audits to display.'
      );
    });
  });
});
