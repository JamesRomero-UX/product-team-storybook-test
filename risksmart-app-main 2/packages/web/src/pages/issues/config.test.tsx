import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, renderHook } from '@testing-library/react';
import { when } from 'jest-when';
import type { FC } from 'react';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import { stub } from 'src/testing/stub';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import { vi } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { defaultMocks } from '../../testing/mock-data';
import { buildIssueFlatField } from '../../testing/test-data/issueFlatField';
import type { Providers } from '../../testing/wrapper';
import { getWrapper } from '../../testing/wrapper';
import { useGetRegisterTableProps } from './config';
import type { IssueFlatField } from './types';
import { useLabelledFields } from './useLabelledFields';

vi.mock('@/hooks/useIsModuleEnabled');
const useIsModuleEnabledMock = vi.mocked(useIsModuleEnabled);

const providers: Providers[] = [
  'permission',
  'graphql',
  'trpc',
  'router',
  'features',
];

describe('Issues config', () => {
  const mockDate = new Date(Date.UTC(2021, 0, 3, 0, 0, 0));

  beforeEach(() => {
    window.localStorage.clear();
    // mock time date.
    vi.setSystemTime(mockDate);
  });

  const defaultIssue = buildIssueFlatField();

  const mocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.Issue,
      Parent_Type_Enum.IssueAssessment,
    ]),
    mockedGetUserTablePreferences('issueRegister'),
  ];

  describe('useFlattenData', () => {
    const buildIssue = (overrides: Partial<IssueFlatField>) =>
      stub<IssueFlatField>({
        actions_aggregate: {},
        parents: [],
        owners: [],
        contributors: [],
        ownerGroups: [],
        contributorGroups: [],
        consequences: [],
        issueUpdateSummary: {},
        ...overrides,
      });

    beforeEach(() => {
      when(useIsModuleEnabledMock).calledWith('document').mockReturnValue(true);
    });

    it('should return an empty array if passed no records', async () => {
      const records: IssueFlatField[] = [];
      const { result } = renderHook(
        () => useLabelledFields(Parent_Type_Enum.Issue, records),
        {
          wrapper: getWrapper(mocks),
        }
      );

      expect(result.current).toEqual([]);
    });

    it('should return CreatedAtTimestamp from the issue', () => {
      const CreatedAtTimestamp = '2022-12-28T09:08:52.68+00:00';
      const AssessmentCreatedAtTimestamp = '2023-12-28T01:08:52.68+00:00';
      const issue = buildIssue({
        CreatedAtTimestamp: CreatedAtTimestamp,
        assessment: {
          CreatedAtTimestamp: AssessmentCreatedAtTimestamp,
        } as IssueFlatField['assessment'],
      });
      const records: IssueFlatField[] = [issue];
      const { result } = renderHook(
        () => useLabelledFields(Parent_Type_Enum.Issue, records),
        {
          wrapper: getWrapper(mocks),
        }
      );
      expect(result.current?.[0].CreatedAtTimestamp).toEqual(
        CreatedAtTimestamp
      );
    });

    it('should map null severity to Unrated', () => {
      const issue = buildIssue({
        assessment: {
          Severity: null,
        } as IssueFlatField['assessment'],
      });
      const records: IssueFlatField[] = [issue];
      const { result } = renderHook(
        () => useLabelledFields(Parent_Type_Enum.Issue, records),
        {
          wrapper: getWrapper(mocks),
        }
      );
      expect(result.current?.[0].SeverityLabelled).toEqual('Unrated');
    });
  });

  describe('useGetRegisterTableProps', () => {
    const TestHarness: FC<{ records: IssueFlatField[] }> = ({ records }) => {
      const tableProps = useGetRegisterTableProps(
        Parent_Type_Enum.Issue,
        records
      );

      return <Table {...tableProps} />;
    };

    beforeEach(() => {
      when(useIsModuleEnabledMock).calledWith('document').mockReturnValue(true);
    });

    it('should display 10 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(mocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();

      expect(headers?.length).toEqual(10);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Title',
        'Owners',
        'Type (issue assessment)',
        'Associations',
        'Severity (issue assessment)',
        'Open actions',
        'Status (issue assessment)',
        'Raised',
        'Target close date (issue assessment)',
        'Tags',
      ]);
    });

    it('should have the option to display 53 fields', async () => {
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
      expect(options?.length).toEqual(54);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toEqual([
        'ID',
        'Title',
        'Owners',
        'Contributors',
        'Type (issue assessment)',
        'Associations',
        'Severity (issue assessment)',
        'Open actions',
        'Status (issue assessment)',
        'Raised',
        'Created on',
        'Date identified',
        'Target close date (issue assessment)',
        'Tags',
        'Departments',
        'Actual close date (issue assessment)',
        'Assessment departments (issue assessment)',
        'Certified individual (issue assessment)',
        'Date occurred',
        'Details',
        'Impacts customer',
        'Is external issue',
        'Internal or external issue',
        'Issue caused by system issue (issue assessment)',
        'System responsible (issue assessment)',
        'Issue caused by third party (issue assessment)',
        'Third party responsible (issue assessment)',
        'Policy breach (issue assessment)',
        'Policies breached (issue assessment)',
        'Policy owner (issue assessment)',
        'Policy owner commentary (issue assessment)',
        'Rationale (issue assessment)',
        'Reportable (issue assessment)',
        'Regulatory breach (issue assessment)',
        'Regulations breached (issue assessment)',
        'Updated on',
        'Updated by ID',
        'Modified by',
        'Raised by',
        'Assessed by',
        'Assessment modified by',
        'Parent ID',
        'Hours',
        'Cost',
        'Customers impacted',
        'Time to Resolve (days)',
        'Time to Report (days)',
        'Time to Identify (days)',
        'Time since raised (days)',
        'Guid',
        'Update count',
        'Latest update created on',
        'Latest update description',
        'Latest update title',
      ]);
    });

    it.each([
      {
        CreatedAtTimestamp: '2021-01-03T00:00:00Z',
        DateIdentified: '2021-01-01T00:00:00Z',
        expectedValue: '2 days',
      },
      {
        CreatedAtTimestamp: '2021-01-02T00:00:00Z',
        DateIdentified: '2021-01-01T00:00:00Z',
        expectedValue: '1 day',
      },
      {
        CreatedAtTimestamp: '2021-01-01T00:00:00Z',
        DateIdentified: '2021-01-01T00:00:00Z',
        expectedValue: '0 days',
      },
    ])(
      'should display "Time to Report (days)" column (CreatedAtTimestamp=$CreatedAtTimestamp, DateIdentified=$DateIdentified) = $expectedValue',
      async ({ CreatedAtTimestamp, DateIdentified, expectedValue }) => {
        const timeToReportColumn = 'Time to Report (days)';
        const { container } = render(
          <TestHarness
            records={[
              {
                ...defaultIssue,
                CreatedAtTimestamp,
                DateIdentified,
              },
            ]}
          />,
          {
            wrapper: getWrapper(mocks, ...providers),
          }
        );
        await waitForTableHeaders(container);
        toggleColumnVisibilityFromTable(container, timeToReportColumn);

        expect(getCellText(container, timeToReportColumn, 1)).toEqual(
          expectedValue
        );
      }
    );

    it.each([
      {
        CreatedAtTimestamp: '2021-01-01T00:00:00Z',
        ActualCloseDate: '2021-01-03T00:00:00Z',
        expectedValue: '2 days',
      },
      {
        CreatedAtTimestamp: '2021-01-01T00:00:00Z',
        ActualCloseDate: '2021-01-02T00:00:00Z',
        expectedValue: '1 day',
      },
      {
        CreatedAtTimestamp: '2021-01-01T00:00:00Z',
        ActualCloseDate: '2021-01-01T00:00:00Z',
        expectedValue: '0 days',
      },
    ])(
      'should display "Time to Resolve (days)" column (CreatedAtTimestamp=$CreatedAtTimestamp, ActualCloseDate=$ActualCloseDate) = $expectedValue',
      async ({ CreatedAtTimestamp, ActualCloseDate, expectedValue }) => {
        const timeToResolveColumn = 'Time to Resolve (days)';
        const { container } = render(
          <TestHarness
            records={[
              {
                ...defaultIssue,
                CreatedAtTimestamp,
                assessment: {
                  ...defaultIssue.assessment!,
                  ActualCloseDate,
                },
              },
            ]}
          />,
          {
            wrapper: getWrapper(mocks, ...providers),
          }
        );
        await waitForTableHeaders(container);
        toggleColumnVisibilityFromTable(container, timeToResolveColumn);

        expect(getCellText(container, timeToResolveColumn, 1)).toEqual(
          expectedValue
        );
      }
    );

    it.each([
      {
        DateIdentified: '2021-01-03T00:00:00Z',
        DateOccurred: '2021-01-01T00:00:00Z',
        expectedValue: '2 days',
      },
      {
        DateIdentified: '2021-01-02T00:00:00Z',
        DateOccurred: '2021-01-01T00:00:00Z',
        expectedValue: '1 day',
      },
      {
        DateIdentified: '2021-01-01T00:00:00Z',
        DateOccurred: '2021-01-01T00:00:00Z',
        expectedValue: '0 days',
      },
    ])(
      'should display "Time to Identify (days)" column (DateIdentified=$DateIdentified, DateOccurred=$DateOccurred) = $expectedValue',
      async ({ DateIdentified, DateOccurred, expectedValue }) => {
        const timeToIdentifyColumn = 'Time to Identify (days)';
        const { container } = render(
          <TestHarness
            records={[
              {
                ...defaultIssue,
                DateIdentified,
                DateOccurred,
              },
            ]}
          />,
          {
            wrapper: getWrapper(mocks, ...providers),
          }
        );
        await waitForTableHeaders(container);
        toggleColumnVisibilityFromTable(container, timeToIdentifyColumn);

        expect(getCellText(container, timeToIdentifyColumn, 1)).toEqual(
          expectedValue
        );
      }
    );

    it.each([
      {
        CreatedAtTimestamp: '2021-01-01T00:00:00Z',
        expectedValue: '2 days',
      },
      {
        CreatedAtTimestamp: '2021-01-02T00:00:00Z',
        expectedValue: '1 day',
      },
      {
        CreatedAtTimestamp: '2021-01-03T00:00:00Z',
        expectedValue: '0 days',
      },
    ])(
      'should display "Time since raised (days)" column (CreatedAtTimestamp=$CreatedAtTimestamp) = $expectedValue',
      async ({ CreatedAtTimestamp, expectedValue }) => {
        const timeToIdentifyColumn = 'Time since raised (days)';
        const { container } = render(
          <TestHarness
            records={[
              {
                ...defaultIssue,
                CreatedAtTimestamp,
              },
            ]}
          />,
          {
            wrapper: getWrapper(mocks, ...providers),
          }
        );
        await waitForTableHeaders(container);
        toggleColumnVisibilityFromTable(container, timeToIdentifyColumn);

        expect(getCellText(container, timeToIdentifyColumn, 1)).toEqual(
          expectedValue
        );
      }
    );

    it.each([
      { column: 'ID', value: 'I-1', shouldToggle: true },
      { column: 'Guid', value: defaultIssue.Id, shouldToggle: true },

      {
        column: 'Associations',
        value: 'Parent control title (control)',
        shouldToggle: false,
      },
    ])(
      'should display the $column when toggled on in preferences',
      async ({ column, value, shouldToggle }) => {
        const { container } = render(
          <TestHarness records={[{ ...defaultIssue }]} />,
          {
            wrapper: getWrapper(mocks, ...providers),
          }
        );
        await waitForTableHeaders(container);
        if (shouldToggle) {
          toggleColumnVisibilityFromTable(container, column);
        }

        expect(getCellText(container, column, 1)).toEqual(value);
      }
    );
  });
});
