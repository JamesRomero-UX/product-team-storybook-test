import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import {
  getDisplayOptionsText,
  getEmptyCollectionSlotText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../../../../testing/mock-data';
import { useGetCollectionTableProps } from './RCSAConfig';
import type { AssessmentRCSAActivityFields } from './types';

describe('assessments RCSA activity config', () => {
  const TestHarness: FC<{ records: AssessmentRCSAActivityFields[] }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records);

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
    it('should display 7 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(7);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Risk ID',
        'Linked Risk',
        'Activity title',
        'Status',
        'Type',
        'Completion date',
        'Activity Owner',
      ]);
    });

    it('should have the option to display 16 fields', async () => {
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
      expect(options?.length).toEqual(16);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'GUID',
        'Risk ID',
        'Linked Risk',
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
        'Next test date',
        'Next test overdue',
      ]);
    });
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
