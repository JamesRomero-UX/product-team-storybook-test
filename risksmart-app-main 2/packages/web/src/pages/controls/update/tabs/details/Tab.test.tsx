import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { RisksmartUser } from '@risksmart-app/components/src/hooks/useRisksmartUser';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetChangeRequestByParentIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByParentIdSubscription';
import { mockedGetControlsByUserResponse } from 'src/testing/mock-data/mockedGetControlsByUserResponse';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLatestComplianceMonitoringAssessmentTestResultsByControlIdResponse } from 'src/testing/mock-data/mockedGetLatestComplianceMonitoringAssessmentTestResultsByControlIdResponse';
import { mockedGetLatestInternalAuditReportTestResultsByControlIdResponse } from 'src/testing/mock-data/mockedGetLatestInternalAuditReportTestResultsByControlIdResponse';
import { mockedGetLatestTestResultsByControlIdResponse } from 'src/testing/mock-data/mockedGetLatestTestResultsByControlIdResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequestsResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { stub } from 'src/testing/stub';
import { buildControl } from 'src/testing/test-data/control';
import {
  buildInternalAuditTestResultRating,
  buildSecondLineTestResultRating,
  buildTestResultRating,
} from 'src/testing/test-data/testResultRating';
import { getWrapper } from 'src/testing/wrapper';
import { vi, vitest } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import Tab from './Tab';
vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');

vi.mock('@risksmart-app/components/src/routes/routes.utils');
vitest.mock('@/hooks/useIsModuleEnabled');
const userMock = vi.mocked(useRisksmartUser);
const useIsModuleEnabledMock = vitest.mocked(useIsModuleEnabled);

describe('Control Details Tab', () => {
  const mockedResponses = [
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedUserSearchPreferencesResponses(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedGetChangeRequestByParentIdSubscription('control-1'),
    mockedGetPendingChangeRequests(
      { ParentId: 'control-1' },
      { change_request: [] }
    ),

    mockedGetFormCustomisationResponse([Parent_Type_Enum.Control]),

    mockedGetControlsByUserResponse({ _eq: '1' }),
  ];

  beforeEach(async () => {
    when(useIsModuleEnabledMock)
      .calledWith('obligation.subModules.compliance_monitoring_assessment')
      .mockReturnValue(true);
    when(useIsModuleEnabledMock)
      .calledWith('internal_audit_entity')
      .mockReturnValue(true);
    userMock.mockReturnValue(
      stub<Auth0ContextInterface<RisksmartUser>>({
        user: { userId: '1' } as RisksmartUser,
        isLoading: false,
      })
    );
  });

  it('should show document but NOT compliance and internal audit rating tables if not permitted', async () => {
    render(
      <Tab
        control={buildControl({
          Id: 'control-1',
          __typename: 'control',
        })}
      />,
      {
        wrapper: getWrapper(
          [
            ...mockedResponses,
            mockedRoleAccessResponse({
              role_access: [],
            }),
            mockedGetLatestComplianceMonitoringAssessmentTestResultsByControlIdResponse(
              { controlId: 'control-1' },
              {
                control_test_second_line_result: [
                  buildSecondLineTestResultRating({}),
                ],
              }
            ),
            mockedGetLatestInternalAuditReportTestResultsByControlIdResponse(
              {
                controlId: 'control-1',
              },
              {
                control_test_internal_audit_result: [
                  buildInternalAuditTestResultRating({}),
                ],
              }
            ),
            mockedGetLatestTestResultsByControlIdResponse(
              { controlId: 'control-1' },
              {
                test_result: [buildTestResultRating({})],
              }
            ),
          ],
          'graphql',
          'i18n',
          'router',
          'permission',
          'help',
          'trpc',
          'features'
        ),
      }
    );
    await waitFor(() =>
      expect(screen.queryByText('Control test ratings')).toBeInTheDocument()
    );
    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Internal audit ratings')
    ).not.toBeInTheDocument();
  });
  it('should show document and internal audit but NOT compliance rating tables if not permitted', async () => {
    render(
      <Tab
        control={buildControl({
          Id: 'control-1',
          __typename: 'control',
        })}
      />,
      {
        wrapper: getWrapper(
          [
            ...mockedResponses,
            mockedGetLatestComplianceMonitoringAssessmentTestResultsByControlIdResponse(
              { controlId: 'control-1' },
              {
                control_test_second_line_result: [
                  buildSecondLineTestResultRating({}),
                ],
              }
            ),
            mockedGetLatestInternalAuditReportTestResultsByControlIdResponse(
              {
                controlId: 'control-1',
              },
              {
                control_test_internal_audit_result: [
                  buildInternalAuditTestResultRating({}),
                ],
              }
            ),
            mockedGetLatestTestResultsByControlIdResponse(
              { controlId: 'control-1' },
              {
                test_result: [buildTestResultRating({})],
              }
            ),
            mockedRoleAccessResponse({
              role_access: [
                {
                  AccessType: Access_Type_Enum.Read,
                  ContributorType: Contributor_Type_Enum.Any,
                  ObjectType: Parent_Type_Enum.InternalAuditReport,
                },
              ],
            }),
          ],
          'graphql',
          'i18n',
          'router',
          'permission',
          'help',
          'trpc',
          'features'
        ),
      }
    );
    await waitFor(() =>
      expect(screen.queryByText('Control test ratings')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument()
    );

    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).not.toBeInTheDocument();
  });
  it('should show document, internal audit and compliance rating tables if not permitted', async () => {
    render(
      <Tab
        control={buildControl({
          Id: 'control-1',
          __typename: 'control',
        })}
      />,
      {
        wrapper: getWrapper(
          [
            ...mockedResponses,
            mockedGetLatestComplianceMonitoringAssessmentTestResultsByControlIdResponse(
              { controlId: 'control-1' },
              {
                control_test_second_line_result: [
                  buildSecondLineTestResultRating({}),
                ],
              }
            ),
            mockedGetLatestInternalAuditReportTestResultsByControlIdResponse(
              {
                controlId: 'control-1',
              },
              {
                control_test_internal_audit_result: [
                  buildInternalAuditTestResultRating({}),
                ],
              }
            ),
            mockedGetLatestTestResultsByControlIdResponse(
              { controlId: 'control-1' },
              {
                test_result: [buildTestResultRating({})],
              }
            ),
            mockedRoleAccessResponse({
              role_access: [
                {
                  AccessType: Access_Type_Enum.Read,
                  ContributorType: Contributor_Type_Enum.Any,
                  ObjectType: Parent_Type_Enum.InternalAuditReport,
                },
                {
                  AccessType: Access_Type_Enum.Read,
                  ContributorType: Contributor_Type_Enum.Any,
                  ObjectType: Parent_Type_Enum.ComplianceMonitoringAssessment,
                },
              ],
            }),
          ],
          'graphql',
          'i18n',
          'router',
          'permission',
          'help',
          'trpc',
          'features'
        ),
      }
    );
    await waitFor(() =>
      expect(screen.queryByText('Control test ratings')).toBeInTheDocument()
    );

    expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument();

    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).toBeInTheDocument();
  });
});
