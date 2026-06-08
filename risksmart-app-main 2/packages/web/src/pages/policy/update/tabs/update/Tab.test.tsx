import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { RisksmartUser } from '@risksmart-app/components/src/hooks/useRisksmartUser';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Access_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetChangeRequestByParentIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByParentIdSubscription';
import { mockedGetDocumentByIdResponse } from 'src/testing/mock-data/mockedGetDocumentByIdResponse';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdResponse } from 'src/testing/mock-data/mockedGetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdResponse';
import { mockedGetLatestDocumentAssessmentResultByDocumentIdResponse } from 'src/testing/mock-data/mockedGetLatestDocumentAssessmentResultByDocumentIdResponse';
import { mockedGetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdResponse } from 'src/testing/mock-data/mockedGetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequestsResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { stub } from 'src/testing/stub';
import {
  buildDocumentAssessmentResultRating,
  buildDocumentInternalAuditResultRating,
  buildDocumentSecondLineResultRating,
} from 'src/testing/test-data/documentAssessmentResultRating';
import { getWrapper } from 'src/testing/wrapper';
import { vi, vitest } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { mockedGetDocumentListResponse } from '../../../../../testing/mock-data/mockedGetDocumentsListResponse';
import { mockedGetDocumentsResponse } from '../../../../../testing/mock-data/mockedGetDocumentsResponse';
import Tab from './Tab';
vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');

vi.mock('@risksmart-app/components/src/routes/routes.utils');
vitest.mock('@/hooks/useIsModuleEnabled');
const userMock = vi.mocked(useRisksmartUser);
const mockedUseGetGuidParam = vi.mocked(useGetGuidParam);
const useIsModuleEnabledMock = vitest.mocked(useIsModuleEnabled);

describe('Policy Details Tab', () => {
  // defaultMocks without mockedRoleAccessResponse for tests that need custom permissions
  const defaultMocksWithoutRoleAccess = [
    mockedGetOrganisation(),
    mockedUsersResponse(),
    mockedUserGroupResponse(),
    mockedGetOrganisationModuleResponse(),
    mockedTagsResponse,
    mockedDepartmentsResponse,
  ];

  const mockedResponses = [
    mockedUserSearchPreferencesResponses(),
    mockedGetDocumentByIdResponse({
      id: 'document-1',
    }),
    mockedGetDocumentListResponse({}),
    mockedGetDocumentListResponse({}),
    mockedGetDocumentsResponse({ where: {}, filesWhere: {} }),
    mockedGetChangeRequestByParentIdSubscription('document-1'),
    mockedGetPendingChangeRequests(
      { ParentId: 'document-1' },
      { change_request: [] }
    ),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Document]),
  ];

  beforeEach(async () => {
    when(mockedUseGetGuidParam)
      .calledWith('documentId')
      .mockReturnValue('document-1');
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
    render(<Tab />, {
      wrapper: getWrapper(
        [
          ...defaultMocks,
          ...mockedResponses,
          mockedGetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdResponse(
            { DocumentId: 'document-1' },
            {
              document_second_line_result: [
                buildDocumentSecondLineResultRating({}),
              ],
            }
          ),
          mockedGetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdResponse(
            {
              DocumentId: 'document-1',
            },
            {
              document_internal_audit_result: [
                buildDocumentInternalAuditResultRating({}),
              ],
            }
          ),
          mockedGetLatestDocumentAssessmentResultByDocumentIdResponse(
            { DocumentId: 'document-1' },
            {
              document_assessment_result: [
                buildDocumentAssessmentResultRating({}),
              ],
            }
          ),
        ],
        'trpc',
        'graphql',
        'i18n',
        'router',
        'permission',
        'help',
        'features'
      ),
    });
    await waitFor(() =>
      expect(screen.queryByText('Policy ratings')).toBeInTheDocument()
    );
    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Internal audit ratings')
    ).not.toBeInTheDocument();
  });
  it('should show document and internal audit but NOT compliance rating tables if not permitted', async () => {
    render(<Tab />, {
      wrapper: getWrapper(
        [
          ...defaultMocksWithoutRoleAccess,
          ...mockedResponses,
          mockedRoleAccessResponse({
            role_access: [
              {
                AccessType: Access_Type_Enum.Read,
                ContributorType: Contributor_Type_Enum.Any,
                ObjectType: Parent_Type_Enum.InternalAuditReport,
              },
            ],
          }),
          mockedGetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdResponse(
            { DocumentId: 'document-1' },
            {
              document_second_line_result: [
                buildDocumentSecondLineResultRating({}),
              ],
            }
          ),
          mockedGetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdResponse(
            {
              DocumentId: 'document-1',
            },
            {
              document_internal_audit_result: [
                buildDocumentInternalAuditResultRating({}),
              ],
            }
          ),
          mockedGetLatestDocumentAssessmentResultByDocumentIdResponse(
            { DocumentId: 'document-1' },
            {
              document_assessment_result: [
                buildDocumentAssessmentResultRating({}),
              ],
            }
          ),
        ],
        'trpc',
        'graphql',
        'i18n',
        'router',
        'permission',
        'help',
        'features'
      ),
    });
    await waitFor(() =>
      expect(screen.queryByText('Policy ratings')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument()
    );

    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).not.toBeInTheDocument();
  });
  it('should show document, internal audit and compliance rating tables if not permitted', async () => {
    render(<Tab />, {
      wrapper: getWrapper(
        [
          ...defaultMocksWithoutRoleAccess,
          ...mockedResponses,
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
          mockedGetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdResponse(
            { DocumentId: 'document-1' },
            {
              document_second_line_result: [
                buildDocumentSecondLineResultRating({}),
              ],
            }
          ),
          mockedGetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdResponse(
            {
              DocumentId: 'document-1',
            },
            {
              document_internal_audit_result: [
                buildDocumentInternalAuditResultRating({}),
              ],
            }
          ),
          mockedGetDocumentListResponse({}),
          mockedGetLatestDocumentAssessmentResultByDocumentIdResponse(
            { DocumentId: 'document-1' },
            {
              document_assessment_result: [
                buildDocumentAssessmentResultRating({}),
              ],
            }
          ),
        ],
        'trpc',
        'graphql',
        'i18n',
        'router',
        'permission',
        'help',
        'features'
      ),
    });
    await waitFor(() =>
      expect(screen.queryByText('Policy ratings')).toBeInTheDocument()
    );

    expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument();

    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).toBeInTheDocument();
  });
});
