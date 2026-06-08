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
import type { CauseRegisterFields } from './types';

describe('causes config', () => {
  const TestHarness: FC<{ records: CauseRegisterFields[] }> = ({ records }) => {
    const tableProps = useGetRegisterTableProps(records);

    return <Table {...tableProps} />;
  };

  const defaultCause: CauseRegisterFields = {
    IssueTypeLabelled: 'Test',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    Title: 'Cause Title 1',
    ModifiedAtTimestamp: '2024-08-05T06:51:35.501152+00:00',
    CreatedAtTimestamp: '2024-08-05T06:51:35.501152+00:00',
    Significance: 3,
    ParentIssueId: '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
    Id: '83343ea9-354a-4a9b-8b8c-6485199bd915',
    Description: 'Cause Description 1',
    CustomAttributeData: null,
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
      CreatedAtTimestamp: '2024-08-05T06:51:35.491522+00:00',
      Title: 'Issue 1',
      owners: [],
      ownerGroups: [],
      contributors: [],
      contributorGroups: [],
      Type: 'issue',
      assessment: {
        IssueType: 'test',

        ActualCloseDate: '2023-05-11T22:41:58.03502+00:00',
        Status: 'closed',
        Severity: 5,
        __typename: 'issue_assessment',
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
      },
      __typename: 'issue',
    },
    CreatedByUserName: 'user1',
    IssueTitle: 'Issue 1',
    IssueSequentialId: 1,
    ModifiedByUserName: 'User1',
    IssueStatus: 'IssueStatus',
    IssueStatusLabelled: 'Test',
    IssueRaisedDate: '',
    IssueClosedDate: '',
    IssueSeverity: 1,
    IssueSeverityLabelled: '',
    allOwners: [],
    allContributors: [],
    SignificanceLabelled: '',
    ParentTypeLabelled: '',
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.Cause,
      Parent_Type_Enum.Issue,
      Parent_Type_Enum.IssueAssessment,
    ]),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('causeRegister'),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 4 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(4);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Title',
        'Title (issue)',
        'Status (issue assessment)',
        'Description',
      ]);
    });

    it('should have the option to display 18 fields', async () => {
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
        'Issue Id',
        'Title (issue)',
        'Severity (issue assessment)',
        'Status (issue assessment)',
        'Type (issue assessment)',
        'Parent Type',
        'Issue Raised Date',
        'Actual close date (issue assessment)',
        'Owners (issue)',
        'Contributors (issue)',
        'Significance',
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
        () => useGetRegisterTableProps([{ ...defaultCause }]),
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitFor(() =>
        expect(result.current.exportToCsvString).toBeDefined()
      );
      const csv = result.current.exportToCsvString();
      expect(csv).toEqual(
        '"Title","Title (issue)","Status (issue assessment)","Description"\r\n' +
          '"Cause Title 1","Issue 1","Closed","Cause Description 1"'
      );
    });
  });
});
