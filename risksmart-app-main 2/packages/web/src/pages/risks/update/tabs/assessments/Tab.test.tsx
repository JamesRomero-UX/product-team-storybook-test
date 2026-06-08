import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import { when } from 'jest-when';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLatestRiskAssessmentResultConfig } from 'src/testing/mock-data/mockedGetLatestRiskAssessmentResultConfig';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vitest } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { mockedDepartmentsResponse } from '../../../../../testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse } from '../../../../../testing/mock-data/mockedGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse';
import { mockedGetInternalAuditReportRiskAssessmentResultsByRiskIdResponse } from '../../../../../testing/mock-data/mockedGetInternalAuditReportRiskAssessmentResultsByRiskIdResponse';
import { mockedGetRiskAssessmentResultsByRiskIdResponse } from '../../../../../testing/mock-data/mockedGetRiskAssessmentResultsByRiskIdResponse';
import { mockedGetRiskScoresByRiskIdResponse } from '../../../../../testing/mock-data/mockedGetRiskScoresByRiskIdResponse';
import { mockedTagsResponse } from '../../../../../testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from '../../../../../testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from '../../../../../testing/mock-data/mockedUserResponses';
import Tab from './Tab';

vitest.mock('src/routes/useGetDetailParentPath');
vitest.mock('@/hooks/useIsModuleEnabled');

const useGetDetailParentPathMock = vitest.mocked(useGetDetailParentPath);
const useIsModuleEnabledMock = vitest.mocked(useIsModuleEnabled);

describe('Risk Ratings Tab', () => {
  const providers: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'router',
    'i18n',
    'features',
  ];

  const mockedResponses = [
    mockedGetOrganisation(),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedGetAggregationResponse(),
    mockedGetLatestRiskAssessmentResultConfig(),
    mockedGetOrganisationModuleResponse(),
    mockedGetRiskScoresByRiskIdResponse({ RiskId: '1' }),
    mockedGetRiskAssessmentResultsByRiskIdResponse({ RiskId: '1' }),
    mockedGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse(
      { RiskId: '1' }
    ),
    mockedGetInternalAuditReportRiskAssessmentResultsByRiskIdResponse({
      RiskId: '1',
    }),
    // This mock needs to be called 3 times with different configs
    // Calling once with all parentTypes does not work
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.UncontrolledRiskAssessmentResult,
      Parent_Type_Enum.ControlledRiskAssessmentResult,
    ]),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.RiskUncontrolledSecondLineResult,
      Parent_Type_Enum.RiskControlledSecondLineResult,
    ]),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.RiskControlledInternalAuditResult,
      Parent_Type_Enum.RiskUncontrolledInternalAuditResult,
    ]),
  ];

  beforeEach(() => {
    useGetDetailParentPathMock.mockReturnValue('');
    when(useIsModuleEnabledMock)
      .calledWith('obligation.subModules.compliance_monitoring_assessment')
      .mockReturnValue(true);
    when(useIsModuleEnabledMock)
      .calledWith('internal_audit_entity')
      .mockReturnValue(true);
  });

  it('should show risk but NOT compliance and internal audit rating tables if not permitted', async () => {
    render(
      <Tab
        risk={{
          Id: '1',
          ancestorContributors: [],
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mockedResponses,
            mockedRoleAccessResponse({
              role_access: [],
            }),
          ],
          ...providers
        ),
      }
    );
    await waitUntilLoaded();
    expect(screen.queryByText('Risk ratings')).toBeInTheDocument();
    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Internal audit ratings')
    ).not.toBeInTheDocument();
  });

  it('should show risk and compliance but NOT internal audit rating tables if not permitted', async () => {
    render(
      <Tab
        risk={{
          Id: '1',
          ancestorContributors: [],
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mockedResponses,
            mockedRoleAccessResponse({
              role_access: [
                {
                  ObjectType: Parent_Type_Enum.ComplianceMonitoringAssessment,
                  ContributorType: Contributor_Type_Enum.Any,
                  AccessType: Access_Type_Enum.Read,
                },
              ],
            }),
          ],
          ...providers
        ),
      }
    );
    await waitUntilLoaded();
    expect(screen.queryByText('Risk ratings')).toBeInTheDocument();
    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Internal audit ratings')
    ).not.toBeInTheDocument();
  });

  it('should show risk and internal audit but NOT compliance rating tables if not permitted', async () => {
    render(
      <Tab
        risk={{
          Id: '1',
          ancestorContributors: [],
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mockedResponses,
            mockedRoleAccessResponse({
              role_access: [
                {
                  ObjectType: Parent_Type_Enum.InternalAuditReport,
                  ContributorType: Contributor_Type_Enum.Any,
                  AccessType: Access_Type_Enum.Read,
                },
              ],
            }),
          ],
          ...providers
        ),
      }
    );
    await waitUntilLoaded();
    expect(screen.queryByText('Risk ratings')).toBeInTheDocument();
    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument();
  });

  it('should show risk, internal audit andcompliance rating tables if permitted', async () => {
    render(
      <Tab
        risk={{
          Id: '1',
          ancestorContributors: [],
        }}
      />,
      {
        wrapper: getWrapper(
          [
            ...mockedResponses,
            mockedRoleAccessResponse({
              role_access: [
                {
                  ObjectType: Parent_Type_Enum.InternalAuditReport,
                  ContributorType: Contributor_Type_Enum.Any,
                  AccessType: Access_Type_Enum.Read,
                },
                {
                  ObjectType: Parent_Type_Enum.ComplianceMonitoringAssessment,
                  ContributorType: Contributor_Type_Enum.Any,
                  AccessType: Access_Type_Enum.Read,
                },
              ],
            }),
          ],
          ...providers
        ),
      }
    );
    await waitUntilLoaded();
    expect(screen.queryByText('Risk ratings')).toBeInTheDocument();
    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).toBeInTheDocument();
    expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument();
  });
});
