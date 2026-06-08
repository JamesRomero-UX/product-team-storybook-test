import Table from '@risk-smart/themed-cloudscape-components/table';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import type {
  GetActiveAppetitesByParentIdQuery,
  GetImpactRatingsByRatedItemIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import {
  getCellText,
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { buildActiveAppetite } from './activeAppetiteBuilder';
import { useGetCollectionTableProps } from './config';

describe('impacts config', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetAllMocks();
  });
  const providers: Providers[] = [
    'graphql',
    'router',
    'permission',
    'features',
    'trpc',
    'notification',
  ];

  type ImpactRating =
    GetImpactRatingsByRatedItemIdQuery['impact_rating'][number];

  const impactId = 'b8c75086-2fb2-47f1-9194-6ceacf99b224';
  const defaultImpactRating: ImpactRating = {
    CreatedAtTimestamp: '2024-10-07T13:22:23.597449+00:00',
    CreatedByUser: 'auth0|644151efc3a961d2784456d9',
    Id: 'a8c75086-2fb2-47f1-9194-6ceacf99b224',
    ModifiedAtTimestamp: '2024-10-07T13:22:23.597449+00:00',
    ModifiedByUser: 'auth0|644151efc3a961d2784456d9',
    CustomAttributeData: null,
    SequentialId: 2,
    Rating: 3,
    RatedItemId: 'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
    ImpactId: impactId,
    TestDate: '2024-10-07T00:00:00+00:00',
    CompletedBy: 'auth0|644151efc3a961d2784456d9',
    Likelihood: 3,
    __typename: 'impact_rating',
    createdByUser: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    completedBy: {
      FriendlyName: 'RiskManager1',
      __typename: 'user',
    },
    impact: {
      Name: 'Financial',
      Rationale: 'Financial rationale',
      __typename: 'impact',
    },
    ratedItem: {
      risk: {
        Title: 'Project Delays',
        __typename: 'risk',
      },
      ObjectType: 'risk',
      __typename: 'node',
    },
  };

  const TestHarness: FC<{
    records: GetImpactRatingsByRatedItemIdQuery;
    appetiteData: GetActiveAppetitesByParentIdQuery | undefined;
  }> = ({ records, appetiteData }) => {
    const tableProps = useGetCollectionTableProps(
      {
        ancestorContributors: [],
        Id: '',
      },
      records,
      appetiteData?.appetite_parent.map((ap) => ap.appetite),
      vi.fn(),
      vi.fn()
    );

    return <Table {...tableProps} />;
  };

  const defaultMocks = [
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedRoleAccessResponse(),
    mockedGetAggregationResponse(),
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.ImpactRating]),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 9 columns by default', async () => {
      const { container } = render(
        <TestHarness
          appetiteData={undefined}
          records={{ impact_rating: [] }}
        />,
        {
          wrapper: getWrapper(defaultMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(10);

      const headersText = getHeadersText(container);

      expect(headersText).toEqual([
        'Name',
        'Rationale',
        'Rating date',
        'Likelihood',
        'Status',
        'Rating score',
        'Performance score',
        'Performance rating',
        'Likelihood performance',
        'Completed by',
      ]);
    });

    it('should have the option to display 10 fields', async () => {
      const { container } = render(
        <TestHarness
          appetiteData={undefined}
          records={{ impact_rating: [] }}
        />,
        {
          wrapper: getWrapper(defaultMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      await waitFor(() =>
        createWrapper(container).findTable()?.findCollectionPreferences()
      );
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(10);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toEqual([
        'Name',
        'Rationale',
        'Rating date',
        'Likelihood',
        'Status',
        'Rating score',
        'Performance score',
        'Performance rating',
        'Likelihood performance',
        'Completed by',
      ]);
    });

    it('should display custom attribute columns from impact_rating form configuration', async () => {
      const mocksWithCustomAttribute = [
        mockedUserGroupResponse(),
        mockedUsersResponse(),
        mockedDepartmentsResponse,
        mockedTagsResponse,
        mockedRoleAccessResponse(),
        mockedGetAggregationResponse(),
        mockedGetOrganisation(),
        mockedGetOrganisationModuleResponse(),
        mockedGetFormCustomisationResponse([Parent_Type_Enum.ImpactRating], {
          form_configuration: [
            {
              ParentType: Parent_Type_Enum.ImpactRating,
              customAttributeSchema: {
                Schema: {
                  properties: {
                    '1704213361924_select': {
                      type: 'string',
                      oneOf: [
                        { const: 'high', title: 'High' },
                        { const: 'medium', title: 'Medium' },
                        { const: 'low', title: 'Low' },
                      ],
                    },
                  },
                },
                UiSchema: {
                  type: 'VerticalLayout',
                  elements: [
                    {
                      type: 'Control',
                      label: 'Driving Impact Band',
                      scope: '#/properties/1704213361924_select',
                    },
                  ],
                },
                Id: 'test-schema-id',
              },
              fields_config: [],
            },
          ],
          form_field_configuration: [],
          form_field_ordering: [],
        }),
      ];

      const { container } = render(
        <TestHarness
          appetiteData={undefined}
          records={{ impact_rating: [] }}
        />,
        {
          wrapper: getWrapper(mocksWithCustomAttribute, ...providers),
        }
      );
      await waitForTableHeaders(container);
      await waitFor(() =>
        createWrapper(container).findTable()?.findCollectionPreferences()
      );
      openPreferencesModals(container);

      const displayOptionLabels = getDisplayOptionsText(container);

      expect(displayOptionLabels).toContain('Driving Impact Band');
    });

    it.each([
      {
        ImpactAppetite: 1,
        Rating: 3,
        expectedPerformanceScore: -2,
        expectedPerformanceRating: 'Below',
      },
      {
        ImpactAppetite: 1,
        Rating: 1,
        expectedPerformanceScore: 0,
        expectedPerformanceRating: 'Aligned',
      },
      {
        ImpactAppetite: 3,
        Rating: 1,
        expectedPerformanceScore: 2,
        expectedPerformanceRating: 'Above',
      },
    ])(
      'renders appetite $ImpactAppetite and rating $Rating with performance score of $expectedPerformanceScore and performance rating of $expectedPerformanceRating',
      async ({
        ImpactAppetite,
        Rating,
        expectedPerformanceRating,
        expectedPerformanceScore,
      }) => {
        const { container } = render(
          <TestHarness
            appetiteData={{
              appetite_parent: [
                buildActiveAppetite({
                  ImpactAppetite,
                  impact: { Id: impactId, Name: '' },
                }),
              ],
            }}
            records={{
              impact_rating: [
                {
                  ...defaultImpactRating,
                  Rating,
                },
              ],
            }}
          />,
          {
            wrapper: getWrapper(defaultMocks, ...providers),
          }
        );
        await waitForTableHeaders(container);

        expect(getCellText(container, 'Rating score', 1)).toEqual(
          String(Rating)
        );
        expect(getCellText(container, 'Performance score', 1)).toEqual(
          String(expectedPerformanceScore)
        );
        expect(getCellText(container, 'Performance rating', 1)).toEqual(
          String(expectedPerformanceRating)
        );
      }
    );
  });
});
