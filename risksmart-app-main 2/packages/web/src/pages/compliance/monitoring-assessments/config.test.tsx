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

import { defaultMocks } from '../../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { ComplianceMonitoringAssessmentFields } from './types';

describe('compliance monitoring assessment config', () => {
  const defaultAssessment: ComplianceMonitoringAssessmentFields = {
    ActualCompletionDate: '2023-07-15T16:41:58.03502+00:00',
    CompletedByUser: 'auth0|644151efc3a961d2784456d9',
    CreatedAtTimestamp: '2023-07-15T17:41:58.03502+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    Id: '5735b222-82cc-4548-98ab-12d0d8e9feb3',
    ModifiedAtTimestamp: '2024-02-22T08:46:26.618161+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    NextTestDate: '2023-08-14T08:41:58.03502+00:00',
    OriginatingItemId: null,
    SequentialId: 1,
    StartDate: '2023-07-14T08:41:58.03502+00:00',
    Summary: 'Make sure the business is working with core principles in mind',
    TargetCompletionDate: '2023-07-18T14:41:58.03502+00:00',
    Title: 'Business integrity check',
    Status: 'notstarted',
    Outcome: 1,
    owners: [],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    tags: [],
    departments: [],
    completedByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    assessedItems: [
      {
        obligationAssessmentResult: {
          Id: 'oar-1',
          parents: [{ obligation: { Id: 'o-1', Title: 'Obligation 1' } }],
        },
      },
      {
        documentAssessmentResult: {
          Id: 'dar-1',
          parents: [{ document: { Id: 'd-1', Title: 'Document 1' } }],
        },
      },
      {
        riskAssessmentResult: {
          Id: 'rar-1',
          parents: [{ risk: { Id: 'r-1', Title: 'Risk 1' } }],
        },
      },
    ],
  };

  const TestHarness: FC<{
    records: ComplianceMonitoringAssessmentFields[];
  }> = ({ records }) => {
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
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.ComplianceMonitoringAssessment,
    ]),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('complianceMonitoringAssessmentRegister'),
  ];

  describe('useGetCollectionTableProps', () => {
    const nextAssessmentDate = 'Next assessment date';
    const assessedItems = 'Assessed items';
    const id = 'ID';

    it('should display 5 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(5);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Title',
        'Start date',
        'Completion date',
        'Status',
        'Owners',
      ]);
    });

    it('should have the option to display 17 fields', async () => {
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
      expect(options?.length).toEqual(19);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Title',
        'Start date',
        'Completion date',
        'Status',
        'Compliance outcome',
        'Assessed items',
        'Target completion date',
        'Completed by',
        'Created on',
        'Updated by ID',
        id,
        'Guid',
        nextAssessmentDate,
        'Last updated',
        'Created by ID',
        'Owners',
        'Contributors',
        'Tags',
        'Departments',
      ]);
    });

    it('should display friendly sequential id for the ID column', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAssessment }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, id);

      expect(getCellText(container, id, 1)).toEqual('CMA-1');
    });

    it('should display the "Next monitoring assessment date" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAssessment }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, nextAssessmentDate);

      const headersText = getHeadersText(container);
      expect(headersText).toContain(nextAssessmentDate);

      expect(getCellText(container, nextAssessmentDate, 1)).toEqual(
        '14 Aug 2023'
      );
    });

    it('should display the "Assessed items" when toggled on in preferences', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultAssessment }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, assessedItems);

      expect(getCellText(container, assessedItems, 1)).toEqual(
        'Document 1, Risk 1, Obligation 1'
      );
    });

    it('should display correct empty collection text', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      expect(getEmptyCollectionSlotText(container, 0)).toEqual(
        'No Monitoring Assessments'
      );
      expect(getEmptyCollectionSlotText(container, 1)).toEqual(
        'No monitoring assessments to display.'
      );
    });
  });
});
