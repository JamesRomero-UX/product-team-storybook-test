import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
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

import { defaultMocks } from '../../../../../testing/mock-data';
import { useGetCollectionTableProps } from './activtiesConfig';
import type { AssessmentActivityFields } from './types';

describe('assessments activity config', () => {
  const defaultAssessment: AssessmentActivityFields = {
    Title: 'Business integrity check',
    Id: '5735b222-82cc-4548-98ab-12d0d8e9feb3',
    ParentId: '',
    Status: 'complete',
    ActivityType: 'interview',
    CompletionDate: '2023-07-18T14:41:58.03502+00:00',
    AssignedUser: 'auth0|644151efc3a961d2784456d9',
    CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    ModifiedAtTimestamp: '2024-02-22T08:46:26.618161+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    Summary: 'Make sure the business is working with core principles in mind',
    files: [],
    assignedUser: {
      FriendlyName: 'Test User',
    },
    IsRCSA: false,
    ownerGroups: [],
    owners: [],
  };

  const TestHarness: FC<{ records: AssessmentActivityFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps('rating', records);

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
    mockedGetAggregationResponse(),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.AssessmentActivity]),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 5 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(4);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Activity title',
        'Status',
        'Type',
        'Completion date',
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
        'Activity title',
        'Status',
        'Type',
        'Completion date',
        'Activity Owner',
        'Last updated',
        'Created by ID',
        'Created by',
        'Created on',
        'Updated by ID',
        'Updated by',
      ]);
    });
  });

  it('should display activity owner column', async () => {
    const { container } = render(
      <TestHarness records={[{ ...defaultAssessment }]} />,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );
    await waitForTableHeaders(container);
    toggleColumnVisibilityFromTable(container, 'Activity Owner');

    expect(getCellText(container, 'Activity Owner', 1)).toEqual(
      defaultAssessment.assignedUser?.FriendlyName
    );
  });

  it('should display correct empty collection text', async () => {
    const { container } = render(<TestHarness records={[]} />, {
      wrapper: getWrapper(testMocks, ...providers),
    });
    await waitForTableHeaders(container);
    expect(getEmptyCollectionSlotText(container, 0)).toEqual('No Activities');
    expect(getEmptyCollectionSlotText(container, 1)).toEqual(
      'No activities to display.'
    );
  });
});
