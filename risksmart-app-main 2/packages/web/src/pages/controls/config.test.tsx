import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { act, render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetControlGroupsResponse } from 'src/testing/mock-data/mockedGetControlGroupsResponse';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import { mockedUpsertUserTablePreferences } from 'src/testing/mock-data/mockedUpsertUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  getRowAsObject,
  getRowCount,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import type { TablePropsWithActions } from '@/utils/table/types';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { ControlFlatFields, ControlTableFields } from './types';

describe('control config', () => {
  const defaultControl: ControlFlatFields = {
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    Description: 'Control Description A',
    Id: 'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
    CreatedAtTimestamp: '2024-07-24T15:11:40.736334+00:00',
    ModifiedAtTimestamp: '2024-07-24T15:11:40.736334+00:00',
    Title: 'Control Title A',
    Type: 'Preventive',
    schedule: {
      Id: 'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
      ManualDueDate: null,
      Frequency: null,
    },
    CustomAttributeData: null,
    SequentialId: 1,

    actions_aggregate: {
      aggregate: {
        count: 0,
        __typename: 'action_parent_aggregate_fields',
      },
      __typename: 'action_parent_aggregate',
    },
    issues_aggregate: {
      aggregate: {
        count: 2,
        __typename: 'issue_parent_aggregate_fields',
      },
      __typename: 'issue_parent_aggregate',
    },
    indicators_aggregate: {
      aggregate: {
        count: 0,
      },
    },
    open_issue_aggregate: {
      aggregate: {
        count: 1,
        __typename: 'issue_parent_aggregate_fields',
      },
      __typename: 'issue_parent_aggregate',
    },

    testResults: [
      {
        OverallEffectiveness: 4,
        DesignEffectiveness: 4,
        PerformanceEffectiveness: 4,
        __typename: 'test_result',
        TestDate: '2023-12-01T11:25:23.852506+00:00',
        Id: '1',
      },
    ],
    owners: [
      {
        UserId: 'auth0|644151efc3a961d2784456d9',
        user: {
          FriendlyName: 'RiskManager1',
          Id: 'auth0|644151efc3a961d2784456d9',
          __typename: 'user',
        },
        __typename: 'owner',
      },
    ],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    parents: [
      {
        parent: {
          Id: 'a1d30192-8100-46b1-a584-6db81b22f935',
          ObjectType: 'risk',
          SequentialId: 3,
          __typename: 'node',
        },
        obligation: null,
        risk: {
          Title: 'Parent risk title',
          __typename: 'risk',
        },
        __typename: 'control_parent',
      },
    ],
    modifiedByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    tags: [],
    departments: [],
  };

  const TestHarness: FC<{
    records: ControlFlatFields[];
    onSet?: (tableProps: TablePropsWithActions<ControlTableFields>) => void;
  }> = ({ records, onSet }) => {
    const tableProps = useGetCollectionTableProps(() => null, records);
    onSet?.(tableProps);

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
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Control]),
    mockedGetAggregationResponse(),
    mockedGetControlGroupsResponse({}),
    mockedGetUserTablePreferences('controlRegister'),
  ];

  describe('useGetCollectionTableProps', () => {
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
        'Type',
        'Associations',
        'Owners',
        'Overall Effectiveness',
        'Open issues',
        'Open actions',
        'Tags',
      ]);
    });

    it('should have the option to display 29 fields', async () => {
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
      expect(options?.length).toEqual(29);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Title',
        'Type',
        'Associations',
        'Owners',
        'Contributors',
        'Design effectiveness',
        'Performance effectiveness',
        'Overall Effectiveness',
        'Overall Effectiveness History',
        'Control test trend',
        'Open issues',
        'Linked indicators',
        'Issues',
        'Open actions',
        'Tags',
        'Departments',
        'Created on',
        'Control description',
        'Guid',
        'Test frequency',
        'Updated on',
        'Created by ID',
        'Created by',
        'Latest rating date',
        'Next test date',
        'Next test overdue',
        'Control groups',
        'Test schedule status',
      ]);
    });

    it.each([
      { column: 'ID', value: 'C-1', shouldToggle: true },
      { column: 'Guid', value: defaultControl.Id, shouldToggle: true },
      {
        column: 'Associations',
        value: 'R-3: Parent risk title (risk)',
        shouldToggle: false,
      },
      {
        column: 'Open issues',
        value: '1',
        shouldToggle: false,
      },
      {
        column: 'Issues',
        value: '2',
        shouldToggle: true,
      },
    ])(
      'should display the $column when toggled on in preferences',
      async ({ column, value, shouldToggle }) => {
        const { container } = render(
          <TestHarness records={[{ ...defaultControl }]} />,
          {
            wrapper: getWrapper(testMocks, ...providers),
          }
        );
        await waitForTableHeaders(container);
        if (shouldToggle) {
          toggleColumnVisibilityFromTable(container, column);
        }

        expect(getCellText(container, column, 1)).toEqual(value);
      }
    );

    it('should render a row', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultControl }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getRowAsObject(container, 1)).toEqual(
        expect.objectContaining({
          Associations: 'R-3: Parent risk title (risk)',
          Guid: 'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
          ID: 'C-1',
          Issues: '2',
          'Open actions': '0',
          'Open issues': '1',
          'Overall Effectiveness': 'Fully effective',
          Owners: 'RiskManager1',
          Title: 'Control Title A',
          Type: 'Preventive',
        })
      );
    });

    it('should render a Unrated for overall effectiveness when there are no test results', async () => {
      const { container } = render(
        <TestHarness records={[{ ...defaultControl, testResults: [] }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Overall Effectiveness', 1)).toEqual(
        'Unrated'
      );
    });

    it('should filter overall effectiveness by Unrated', async () => {
      const propertyFilter: PropertyFilterQuery = {
        tokens: [
          {
            value: 'Unrated',
            propertyKey: 'OverallEffectivenessLabelled',
            operator: '=',
          },
        ],
        operation: 'and',
      };
      let tableProps: TablePropsWithActions<ControlTableFields> | undefined =
        undefined;
      const { container } = render(
        <TestHarness
          records={[{ ...defaultControl, testResults: [] }]}
          onSet={(props) => (tableProps = props)}
        />,
        {
          wrapper: getWrapper(
            [
              ...testMocks,
              mockedUpsertUserTablePreferences({
                TableId: 'controlRegister',
                Preferences: { propertyFilter },
              }),
            ],
            ...providers
          ),
        }
      );
      await waitForTableHeaders(container);
      await act(async () => {
        await tableProps!.actions.setPropertyFiltering(propertyFilter);
      });

      expect(getRowCount(container)).toEqual(1);
    });
    it('should display a "-" if there is no type not set', async () => {
      const controlWithNoType = {
        ...defaultControl,
        Type: null,
      };
      const { container } = render(
        <TestHarness records={[{ ...controlWithNoType, testResults: [] }]} />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      expect(getCellText(container, 'Type', 1)).toEqual('-');
    });
  });
});
