import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import {
  Indicator_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  toggleColumnVisibilityFromTable,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';
import type { IndicatorFlatFields } from './types';

describe('indicator config', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const TestHarness: FC<{ records: IndicatorFlatFields[] }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const defaultIndicator: IndicatorFlatFields = {
    createdBy: {
      __typename: 'user',
      FriendlyName: 'RiskManager1',
    },
    modifiedBy: {
      __typename: 'user',
      FriendlyName: 'RiskManager1',
    },
    owners: [
      {
        __typename: 'owner',
        UserId: 'auth0|644151efc3a961d2784456d9',
        user: {
          __typename: 'user',
          FriendlyName: 'RiskManager1',
          Id: 'auth0|644151efc3a961d2784456d9',
        },
      },
    ],
    ownerGroups: [],
    contributors: [],
    contributorGroups: [],
    orderedResults: [],
    parents: [
      {
        __typename: 'indicator_parent',
        control: {
          __typename: 'control',
          Title: 'Control Title A',
        },
        risk: null,
      },
    ],
    tags: [],
    departments: [],
    SequentialId: 1,
    Type: 'number',
    UpperToleranceNum: 10,
    Unit: 'sheep',
    Title: 'Counting Sheep',
    schedule: { Frequency: 'monthly', Id: '' },
    TargetValueTxt: null,
    LowerToleranceNum: 1,
    Id: 'b8694ef8-2f4c-4b41-9c77-60fb44163736',
    Description: 'counting sheep',
    CustomAttributeData: null,
    CreatedAtTimestamp: '2024-08-06T08:11:19.161925+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    ModifiedAtTimestamp: '2024-08-06T08:11:19.161925+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    LowerAppetiteNum: null,
    UpperAppetiteNum: null,
  };

  const testMocks = [
    ...defaultMocks,
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Indicator]),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('indicatorRegister'),
    mockedGetOrganisation(),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 7 columns by default', async () => {
      const { container } = render(<TestHarness records={[]} />, {
        wrapper: getWrapper(testMocks, ...providers),
      });
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()!.findColumnHeaders();
      expect(headers!.length).toEqual(7);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Name',
        'Parent',
        'Frequency',
        'Conformance',
        'Latest result',
        'Latest result date',
        'Conformance Trend',
      ]);
    });

    it('should have the option to display 30 fields', async () => {
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
      expect(options?.length).toEqual(30);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'ID',
        'Name',
        'Parent',
        'Frequency',
        'Conformance',
        'Latest result',
        'Previous result',
        'Latest result date',
        'Next test date',
        'Next test overdue',
        'Test schedule status',
        'Unit',
        'Created on',
        'Updated on',
        'Owners',
        'Contributors',
        'Parent type',
        'Updated by ID',
        'Updated by',
        'Guid',
        'Created by ID',
        'Created by',
        'Lower tolerance',
        'Upper tolerance',
        'Lower appetite',
        'Upper appetite',
        'Expected Text',
        'Tags',
        'Departments',
        'Conformance Trend',
      ]);
    });

    it.each([
      {
        PreviousTargetValueNum: 0,
        CurrentTargetValue: 0,
        Trend: 'Stable',
      },
      {
        PreviousTargetValueNum: -2,
        CurrentTargetValue: 0,
        Trend: 'Improving',
      },
      {
        PreviousTargetValueNum: 0,
        CurrentTargetValue: -2,
        Trend: 'Deteriorating',
      },
    ])(
      'should display a trend of $Trend when $PreviousTargetValueNum and $CurrentTargetValue',
      async ({ PreviousTargetValueNum, CurrentTargetValue, Trend }) => {
        const { container } = render(
          <TestHarness
            records={[
              {
                ...defaultIndicator,
                Type: Indicator_Type_Enum.Number,
                LowerToleranceNum: -1,
                UpperToleranceNum: 1,
                orderedResults: [
                  {
                    TargetValueNum: CurrentTargetValue,
                    ResultDate: '2024-01-02',
                  },
                  {
                    TargetValueNum: PreviousTargetValueNum,
                    ResultDate: '2024-01-02',
                  },
                ],
              },
            ]}
          />,
          {
            wrapper: getWrapper(testMocks, ...providers),
          }
        );
        await waitForTableHeaders(container);

        const trend = getCellText(container, 'Conformance Trend');
        expect(trend).toEqual(Trend);
      }
    );

    it('should display a trend of "Static" when there are less then 2 results', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultIndicator,
              Type: Indicator_Type_Enum.Number,
              LowerToleranceNum: -1,
              UpperToleranceNum: 1,
              orderedResults: [
                {
                  TargetValueNum: 0,
                  ResultDate: '2024-01-02',
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);

      const trend = getCellText(container, 'Conformance Trend');
      expect(trend).toEqual('Static');
    });

    it('should display risk title and type when parent is a risk', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultIndicator,
              parents: [
                {
                  parent: {
                    ObjectType: Parent_Type_Enum.Risk,
                    Id: '234',
                  },
                  risk: {
                    Title: 'Risk 1',
                  },
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);

      toggleColumnVisibilityFromTable(container, 'Parent type');

      const parent = getCellText(container, 'Parent');
      expect(parent).toEqual('Risk 1 (risk)');

      const type = getCellText(container, 'Parent type');
      expect(type).toEqual('risk');
    });

    it('should display control title and type when parent is a control', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultIndicator,
              parents: [
                {
                  parent: {
                    ObjectType: Parent_Type_Enum.Control,
                    Id: '234',
                  },
                  control: {
                    Title: 'Control 1',
                  },
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );

      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, 'Parent type');

      const parent = getCellText(container, 'Parent');
      expect(parent).toEqual('Control 1 (control)');

      const type = getCellText(container, 'Parent type');
      expect(type).toEqual('control');
    });

    it('should display control and risk when has a control and risk parent', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              ...defaultIndicator,
              parents: [
                {
                  parent: {
                    ObjectType: Parent_Type_Enum.Control,
                    Id: '234',
                  },
                  control: {
                    Title: 'Control 1',
                  },
                  risk: {
                    Title: 'Risk 1',
                  },
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(testMocks, ...providers),
        }
      );

      await waitForTableHeaders(container);
      toggleColumnVisibilityFromTable(container, 'Parent type');

      const type = getCellText(container, 'Parent type');
      expect(type).toEqual('control, risk');
    });
  });
});
