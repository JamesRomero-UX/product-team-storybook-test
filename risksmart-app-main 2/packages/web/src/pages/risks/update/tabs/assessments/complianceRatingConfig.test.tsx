import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import {
  Assessment_Status_Enum,
  Parent_Type_Enum,
  Risk_Assessment_Result_Control_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render } from '@testing-library/react';
import type { FC } from 'react';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLatestRiskAssessmentResultConfig } from 'src/testing/mock-data/mockedGetLatestRiskAssessmentResultConfig';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import {
  getDisplayOptionsText,
  getHeadersText,
  openPreferencesModals,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';

import { mockedGetRiskScoresByRiskIdResponse } from '../../../../../testing/mock-data/mockedGetRiskScoresByRiskIdResponse';
import type { Providers } from '../../../../../testing/wrapper';
import { getWrapper } from '../../../../../testing/wrapper';
import { useGetCollectionTableProps } from './complianceRatingConfig';
import type { ComplianceRiskAssessmentResultFlatFields } from './types';

describe('compliance assessment rating result config', () => {
  const TestHarness: FC<{
    records: ComplianceRiskAssessmentResultFlatFields[];
  }> = ({ records }) => {
    const tableProps = useGetCollectionTableProps('1', () => ({}), records);

    return <Table {...tableProps} />;
  };
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  const defaultMocks = [
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.RiskUncontrolledSecondLineResult,
      Parent_Type_Enum.RiskControlledSecondLineResult,
    ]),
    mockedGetOrganisationModuleResponse(),
    mockedGetOrganisation(),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedRoleAccessResponse(),
    mockedGetAggregationResponse(),
    mockedGetRiskScoresByRiskIdResponse({ RiskId: '1' }),
    mockedGetLatestRiskAssessmentResultConfig(),
  ];

  describe('useGetCollectionTableProps', () => {
    it('should display 7 columns by default', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              Id: '1',
              ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
              parents: [],
            },
            {
              Id: '1',
              ControlType:
                Risk_Assessment_Result_Control_Type_Enum.Uncontrolled,
              parents: [
                {
                  complianceMonitoringAssessment: {
                    CreatedAtTimestamp: '',
                    CreatedByUser: '',
                    Id: '',
                    ModifiedAtTimestamp: '',
                    ModifiedByUser: '',
                    Summary: '',
                    Title: '',
                    Status: Assessment_Status_Enum.Complete,
                  },
                },
              ],
            },
          ]}
        />,
        {
          wrapper: getWrapper(defaultMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const headers = createWrapper(container).findTable()?.findColumnHeaders();
      expect(headers?.length).toEqual(7);

      const headersText = getHeadersText(container);
      expect(headersText).toEqual([
        'Rating date',
        'Linked monitoring assessment',
        'Result type',
        'Rating',
        'Impact',
        'Likelihood',
        'Monitoring assessment status',
      ]);
    });

    it('should have the option to display 9 fields', async () => {
      const { container } = render(
        <TestHarness
          records={[
            {
              Id: '1',
              ControlType: Risk_Assessment_Result_Control_Type_Enum.Controlled,
              parents: [],
            },
          ]}
        />,
        {
          wrapper: getWrapper(defaultMocks, ...providers),
        }
      );
      await waitForTableHeaders(container);
      const preferences = createWrapper(container)
        .findTable()
        ?.findCollectionPreferences();
      openPreferencesModals(container);

      const options = preferences
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions();
      expect(options?.length).toEqual(9);

      const displayOptionLabels = getDisplayOptionsText(container);
      expect(displayOptionLabels).toEqual([
        'Rating date',
        'Linked monitoring assessment',
        'Result type',
        'Rating',
        'Impact',
        'Likelihood',
        'Monitoring assessment status',
        'Completion date',
        'Next assessment date',
      ]);
    });
  });
});
