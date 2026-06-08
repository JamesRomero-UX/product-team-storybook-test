import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
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
import { useGetRegisterTableProps } from './config';
import type { ConsequenceFlatField } from './types';

describe('causes config', () => {
  const TestHarness: FC<{ records: ConsequenceFlatField[] }> = ({
    records,
  }) => {
    const tableProps = useGetRegisterTableProps(records);

    return <Table {...tableProps} />;
  };

  const defaultConsequence: ConsequenceFlatField = {
    CostType: 'hours',
    CostValue: 210,
    Criticality: 3,
    Description: 'Consequence Description 1',
    Id: '6ab8b783-a9e2-44bb-9d50-27595eb031d5',
    ParentIssueId: '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
    ModifiedAtTimestamp: '2024-08-05T06:51:35.503062+00:00',
    CreatedAtTimestamp: '2024-08-05T06:51:35.503062+00:00',
    Title: 'Consequence Title 1',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    Type: null,
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    modifiedByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    issue: {
      SequentialId: 1,
      Type: 'issue',
      CreatedAtTimestamp: '2024-08-05T06:51:35.491522+00:00',
      Title: 'Issue 1',
      owners: [],
      ownerGroups: [],
      contributors: [],
      contributorGroups: [],
      assessment: {
        IssueType: 'material-impact',
        ActualCloseDate: '2023-05-11T22:41:58.03502+00:00',
        Status: 'closed',
        Severity: 5,
        __typename: 'issue_assessment',
        departments: [],
      },
      departments: [
        {
          type: {
            Description: 'An example Dept',
            Name: 'Dept one',
            __typename: 'department_type',
          },
          ParentId: 'a803ea8d-fa58-4757-b6c8-d5e40855251c',
          DepartmentTypeId: 'a2781d16-4827-4d81-a9ba-9402e0c56f71',
          __typename: 'department',
        },
      ],
      tags: [],
      __typename: 'issue',
    },
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.Consequence,
      Parent_Type_Enum.Issue,
      Parent_Type_Enum.IssueAssessment,
    ]),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('consequenceRegister'),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('useGetCollectionTableProps', () => {
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
        'Title (issue)',
        'Cost type',
        'Cost value',
        'Criticality',
      ]);
    });

    it('should have the option to display 26 fields', async () => {
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
      expect(options?.length).toEqual(27);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Title',
        'Type',
        'Title (issue)',
        'Issue Id',
        'Severity (issue assessment)',
        'Status (issue assessment)',
        'Type (issue assessment)',
        'Parent Type',
        'Issue Raised Date',
        'Actual close date (issue assessment)',
        'Owners (issue)',
        'Contributors (issue)',
        'Departments (issue)',
        'Tags (issue)',
        'Cost type',
        'Cost value',
        'Cost (GBP)',
        'Cost (hours)',
        'Cost (number)',
        'Criticality',
        'Description',
        'Created on',
        'Updated on',
        'Updated by ID',
        'Updated by',
        'Created by',
        'Assessment departments (issue assessment)',
      ]);
    });

    it('should support export in correct format', async () => {
      const { result } = renderHook(
        () => useGetRegisterTableProps([{ ...defaultConsequence }]),
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitFor(() => {
        expect(result.current.exportToCsvString).toBeDefined();
      });
      const csv = result.current.exportToCsvString();
      expect(csv).toEqual(
        '"Title","Title (issue)","Cost type","Cost value","Criticality"\r\n' +
          '"Consequence Title 1","Issue 1","Hours","210.00","Moderate"\r\n' +
          '"","","","",""'
      );
    });

    it('should export numerical fields with proper formatting', async () => {
      const consequenceWithNumericalValues: ConsequenceFlatField = {
        ...defaultConsequence,
        CostValue: 1234.56,
        CostType: 'financial',
      };

      const { result } = renderHook(
        () => useGetRegisterTableProps([{ ...consequenceWithNumericalValues }]),
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitFor(() => {
        expect(result.current.exportToCsvString).toBeDefined();
      });
      const csv = result.current.exportToCsvString();
      expect(csv).toContain('1,234.56'); // Check for formatted numbers in CSV
    });
  });
});
