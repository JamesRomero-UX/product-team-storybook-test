import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { useGetDetailParentPath } from 'src/routes/useGetDetailParentPath';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vitest } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { mockedDepartmentsResponse } from '../../../../../testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdResponse } from '../../../../../testing/mock-data/mockedGetComplianceMonitoringDocumentAssessmentResultsByDocumentIdResponse';
import { mockedGetDocumentAssessmentResultsByParentIdResponse } from '../../../../../testing/mock-data/mockedGetDocumentAssessmentResultsByParentIdResponse';
import { mockedGetInternalAuditReportDocumentAssessmentResultsByDocumentIdResponse } from '../../../../../testing/mock-data/mockedGetInternalAuditDocumentAssessmentResultsByDocumentIdResponse';
import { mockedTagsResponse } from '../../../../../testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from '../../../../../testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from '../../../../../testing/mock-data/mockedUserResponses';
import Tab from './Tab';

vitest.mock('src/routes/useGetDetailParentPath');
vitest.mock('@/hooks/useIsModuleEnabled');

const useGetDetailParentPathMock = vitest.mocked(useGetDetailParentPath);
const useIsModuleEnabledMock = vitest.mocked(useIsModuleEnabled);

describe('Policy Ratings Tab', () => {
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
    mockedGetOrganisationModuleResponse(),
    mockedGetDocumentAssessmentResultsByParentIdResponse({ ParentId: '1' }),
    mockedGetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdResponse(
      { ParentId: '1' }
    ),
    mockedGetInternalAuditReportDocumentAssessmentResultsByDocumentIdResponse({
      ParentId: '1',
    }),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.DocumentInternalAuditResult,
      Parent_Type_Enum.InternalAuditReport,
    ]),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.DocumentSecondLineResult,
      Parent_Type_Enum.ComplianceMonitoringAssessment,
    ]),
    mockedGetFormCustomisationResponse([
      Parent_Type_Enum.DocumentAssessmentResult,
      Parent_Type_Enum.Assessment,
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

  it('should show policy but NOT compliance and internal audit rating tables if not permitted', async () => {
    render(
      <Tab
        parent={{
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
    await waitFor(() => {
      expect(screen.queryByText('Policy ratings')).toBeInTheDocument();
      expect(
        screen.queryByText('Compliance monitoring ratings')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Internal audit ratings')
      ).not.toBeInTheDocument();
    });
  });

  it('should show policy and compliance but NOT internal audit rating tables if not permitted', async () => {
    render(
      <Tab
        parent={{
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
    await waitFor(() => {
      expect(screen.queryByText('Policy ratings')).toBeInTheDocument();
      expect(
        screen.queryByText('Compliance monitoring ratings')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Internal audit ratings')
      ).not.toBeInTheDocument();
    });
  });
  it('should show policy and internal audit but NOT compliance rating tables if not permitted', async () => {
    render(
      <Tab
        parent={{
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
    await waitFor(() => {
      expect(screen.queryByText('Policy ratings')).toBeInTheDocument();
      expect(
        screen.queryByText('Compliance monitoring ratings')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument();
    });
  });
  it('should show policy, internal audit and compliance rating tables if permitted', async () => {
    render(
      <Tab
        parent={{
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
    await waitFor(() => {
      expect(screen.queryByText('Policy ratings')).toBeInTheDocument();
      expect(
        screen.queryByText('Compliance monitoring ratings')
      ).toBeInTheDocument();
      expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument();
    });
  });
});
