import type { Auth0ContextInterface } from '@auth0/auth0-react';
import type { RisksmartUser } from '@risksmart-app/components/src/hooks/useRisksmartUser';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { useGetGuidParam } from '@risksmart-app/components/src/routes/routes.utils';
import {
  Access_Type_Enum,
  Appetite_Type_Enum,
  Contributor_Type_Enum,
  Parent_Type_Enum,
  Risk_Scoring_Model_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedGetActiveAppetitesByParentIdResponse } from 'src/testing/mock-data/mockedGetActiveAppetitesByParentId';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetChangeRequestByParentIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByParentIdSubscription';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse } from 'src/testing/mock-data/mockedGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse';
import { mockedGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse } from 'src/testing/mock-data/mockedGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse';
import { mockedGetLatestRiskAssessmentResultConfig } from 'src/testing/mock-data/mockedGetLatestRiskAssessmentResultConfig';
import { mockedGetLatestRiskScoresByRiskIdResponse } from 'src/testing/mock-data/mockedGetLatestRiskScoresByRiskIdResponse';
import { mockedGetLinkedItemRisksResponse } from 'src/testing/mock-data/mockedGetLinkedItemRisksResponse';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequestsResponse';
import { mockedGetRiskByIdResponse } from 'src/testing/mock-data/mockedGetRiskByRiskIdResponse';
import { mockedGetRisksByTierResponse } from 'src/testing/mock-data/mockedGetRisksByTierResponse';
import { mockedGetRiskScoresByRiskIdResponse } from 'src/testing/mock-data/mockedGetRiskScoresByRiskIdResponse';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedTagsResponse } from 'src/testing/mock-data/mockedTagTypeResponses';
import { mockedUserGroupResponse } from 'src/testing/mock-data/mockedUserGroupResponses';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { stub } from 'src/testing/stub';
import { buildRisk } from 'src/testing/test-data/risk';
import {
  buildControlledInternalAuditRiskAssessmentResultRating,
  buildControlledSecondLineRiskAssessmentResultRating,
  buildRiskAssessmentResultRating,
  buildUncontrolledInternalAuditRiskAssessmentResultRating,
  buildUncontrolledSecondLineRiskAssessmentResultRating,
} from 'src/testing/test-data/riskAssessmentResultRating';
import { buildRiskScores } from 'src/testing/test-data/riskScores';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi, vitest } from 'vitest';

import { useIsModuleEnabled } from '@/hooks/useIsModuleEnabled';

import { mockedGetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryResponse } from '../../../../../testing/mock-data/mockedGetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryResponse';
import { buildActiveAppetite } from '../impacts/activeAppetiteBuilder';
import Tab from './Tab';
vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');

vi.mock('@risksmart-app/components/src/routes/routes.utils');
vitest.mock('@/hooks/useIsModuleEnabled');
const userMock = vi.mocked(useRisksmartUser);
const mockedUseGetGuidParam = vi.mocked(useGetGuidParam);
const useIsModuleEnabledMock = vitest.mocked(useIsModuleEnabled);
const impact1Id = 'impact-1';
const impact2Id = 'impact-2';
const riskId = 'risk-1';

const providers: Providers[] = [
  'graphql',
  'i18n',
  'router',
  'permission',
  'help',
  'trpc',
  'features',
];

describe('Risk Details Tab', () => {
  const mockedResponses = [
    mockedGetOrganisation(),
    mockedUserGroupResponse(),
    mockedUsersResponse(),
    mockedUserSearchPreferencesResponses(),
    mockedDepartmentsResponse,
    mockedTagsResponse,
    mockedGetOrganisationModuleResponse(),
    mockedGetAggregationResponse(
      Risk_Scoring_Model_Enum.ControlEffectivenessAverages
    ),
    mockedGetLatestRiskAssessmentResultConfig(),
    mockedGetRisksByTierResponse({ where: { Tier: { _eq: 1 } } }),
    mockedGetChangeRequestByParentIdSubscription(riskId),
    mockedGetPendingChangeRequests(
      { ParentId: riskId },
      { change_request: [] }
    ),
    mockedGetRiskByIdResponse(
      { _eq: riskId },
      {
        risk: [
          buildRisk({
            Id: riskId,
          }),
        ],
      }
    ),
    mockedGetRiskByIdResponse(
      { _eq: riskId },
      {
        risk: [
          buildRisk({
            Id: riskId,
          }),
        ],
      }
    ),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk]),

    mockedGetActiveAppetitesByParentIdResponse(
      { parentId: riskId },
      {
        appetite_parent: [
          buildActiveAppetite({
            AppetiteType: Appetite_Type_Enum.Impact,
            ImpactAppetite: 2,
            impact: { Id: impact1Id, Name: 'test' },
          }),
          buildActiveAppetite({
            AppetiteType: Appetite_Type_Enum.Impact,
            ImpactAppetite: 2,
            impact: { Id: impact2Id, Name: 'test' },
          }),
        ],
      }
    ),
    mockedGetLinkedItemRisksResponse({ Id: riskId }),
  ];

  beforeEach(async () => {
    when(mockedUseGetGuidParam).calledWith('riskId').mockReturnValue(riskId);
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

  it('should show all impact ratings if available', async () => {
    render(<Tab />, {
      wrapper: getWrapper(
        [
          ...mockedResponses,
          mockedGetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryResponse(
            {
              RatedItemId: riskId,
            },
            {
              impact: [
                {
                  __typename: 'impact',
                  Name: 'impact 1 title',
                  Rationale: '',
                  ratings: [
                    {
                      __typename: 'impact_rating',
                      Id: '1',
                      TestDate: '2024-02-23T08:46:26.618161+00:00',
                      Rating: 1,
                      CreatedAtTimestamp: '2023-02-22T08:46:26.618161+00:00',
                      CreatedByUser: '',
                      ModifiedAtTimestamp: '2022-02-22T08:46:26.618161+00:00',
                      ModifiedByUser: '',
                      CompletedBy: '',
                      SequentialId: 1,
                      RatedItemId: riskId,
                      ImpactId: impact1Id,
                      Likelihood: 1,
                      CustomAttributeData: null,
                      completedBy: { __typename: 'user', FriendlyName: '' },
                      createdByUser: { __typename: 'user', FriendlyName: '' },
                    },
                  ],
                },
                {
                  __typename: 'impact',
                  Name: 'impact other title',
                  Rationale: '',
                  ratings: [
                    {
                      __typename: 'impact_rating',
                      Id: '2',
                      TestDate: '2024-04-24T08:46:26.618161+00:00',
                      Rating: 2,
                      CreatedAtTimestamp: '2023-02-22T08:46:26.618161+00:00',
                      CreatedByUser: '',
                      ModifiedAtTimestamp: '2022-02-22T08:46:26.618161+00:00',
                      ModifiedByUser: '',
                      CompletedBy: '',
                      SequentialId: 2,
                      RatedItemId: riskId,
                      ImpactId: impact2Id,
                      Likelihood: 2,
                      CustomAttributeData: null,
                      completedBy: { __typename: 'user', FriendlyName: '' },
                      createdByUser: { __typename: 'user', FriendlyName: '' },
                    },
                  ],
                },
                {
                  __typename: 'impact',
                  Name: 'impact no ratings title',
                  Rationale: '',
                  ratings: [],
                },
              ],
            }
          ),
          mockedRoleAccessResponse({
            role_access: [],
          }),
          mockedGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse(
            { RiskId: riskId },
            {
              controlled: [
                buildControlledSecondLineRiskAssessmentResultRating({}),
              ],
              uncontrolled: [
                buildUncontrolledSecondLineRiskAssessmentResultRating({}),
              ],
            }
          ),
          mockedGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse(
            {
              RiskId: riskId,
            },
            {
              controlled: [
                buildControlledInternalAuditRiskAssessmentResultRating({}),
              ],
              uncontrolled: [
                buildUncontrolledInternalAuditRiskAssessmentResultRating({}),
              ],
            }
          ),
          mockedGetLatestRiskScoresByRiskIdResponse(
            { RiskId: riskId },
            {
              risk_score: [buildRiskScores({})],
            }
          ),
          mockedGetRiskScoresByRiskIdResponse(
            { RiskId: riskId },
            {
              residual: [
                buildRiskAssessmentResultRating({ ControlType: 'Controlled' }),
              ],
              inherent: [
                buildRiskAssessmentResultRating({
                  ControlType: 'Uncontrolled',
                }),
              ],
              risk: [
                {
                  Tier: 1,
                  __typename: 'risk',
                },
              ],
            }
          ),
        ],
        ...providers
      ),
    });

    await waitFor(
      () => expect(screen.queryByText('Likelihood')).toBeInTheDocument(),
      {
        timeout: 10000,
      }
    );
    expect(screen.queryByText('Impacts')).toBeInTheDocument();
    expect(screen.queryByText('impact 1 title')).toBeInTheDocument();
    expect(screen.queryByText('impact other title')).toBeInTheDocument();

    expect(
      screen.queryByText('impact no ratings title')
    ).not.toBeInTheDocument();
  }, 10000);

  it('should show risk but NOT compliance and internal audit rating tables if not permitted', async () => {
    render(<Tab />, {
      wrapper: getWrapper(
        [
          ...mockedResponses,
          mockedGetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryResponse(
            {
              RatedItemId: riskId,
            },
            {
              impact: [],
            }
          ),
          mockedRoleAccessResponse({
            role_access: [],
          }),
          mockedGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse(
            { RiskId: riskId },
            {
              controlled: [
                buildControlledSecondLineRiskAssessmentResultRating({}),
              ],
              uncontrolled: [
                buildUncontrolledSecondLineRiskAssessmentResultRating({}),
              ],
            }
          ),
          mockedGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse(
            {
              RiskId: riskId,
            },
            {
              controlled: [
                buildControlledInternalAuditRiskAssessmentResultRating({}),
              ],
              uncontrolled: [
                buildUncontrolledInternalAuditRiskAssessmentResultRating({}),
              ],
            }
          ),
          mockedGetLatestRiskScoresByRiskIdResponse(
            { RiskId: riskId },
            {
              risk_score: [buildRiskScores({})],
            }
          ),
          mockedGetRiskScoresByRiskIdResponse(
            { RiskId: riskId },
            {
              residual: [
                buildRiskAssessmentResultRating({ ControlType: 'Controlled' }),
              ],
              inherent: [
                buildRiskAssessmentResultRating({
                  ControlType: 'Uncontrolled',
                }),
              ],
              risk: [
                {
                  Tier: 1,
                  __typename: 'risk',
                },
              ],
            }
          ),
        ],
        ...providers
      ),
    });
    await waitFor(
      () => expect(screen.queryByText('Risk ratings')).toBeInTheDocument(),
      { timeout: 10000 }
    );
    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Internal audit ratings')
    ).not.toBeInTheDocument();
  }, 10000);
  it('should show risk and internal audit but NOT compliance rating tables if not permitted', async () => {
    render(<Tab />, {
      wrapper: getWrapper(
        [
          ...mockedResponses,
          mockedGetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryResponse(
            {
              RatedItemId: riskId,
            },
            {
              impact: [],
            }
          ),
          mockedGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse(
            { RiskId: riskId },
            {
              controlled: [
                buildControlledSecondLineRiskAssessmentResultRating({}),
              ],
              uncontrolled: [
                buildUncontrolledSecondLineRiskAssessmentResultRating({}),
              ],
            }
          ),
          mockedGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse(
            {
              RiskId: riskId,
            },
            {
              controlled: [
                buildControlledInternalAuditRiskAssessmentResultRating({}),
              ],
              uncontrolled: [
                buildUncontrolledInternalAuditRiskAssessmentResultRating({}),
              ],
            }
          ),
          mockedGetLatestRiskScoresByRiskIdResponse(
            { RiskId: riskId },
            {
              risk_score: [buildRiskScores({})],
            }
          ),
          mockedGetRiskScoresByRiskIdResponse(
            { RiskId: riskId },
            {
              residual: [
                buildRiskAssessmentResultRating({ ControlType: 'Controlled' }),
              ],
              inherent: [
                buildRiskAssessmentResultRating({
                  ControlType: 'Uncontrolled',
                }),
              ],
              risk: [
                {
                  Tier: 1,
                  __typename: 'risk',
                },
              ],
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
        ...providers
      ),
    });
    await waitFor(
      () => expect(screen.queryByText('Risk ratings')).toBeInTheDocument(),
      { timeout: 10000 }
    );
    await waitFor(() =>
      expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument()
    );

    expect(
      screen.queryByText('Compliance monitoring ratings')
    ).not.toBeInTheDocument();
  }, 10000);
  it('should show risk, internal audit and compliance rating tables if not permitted', async () => {
    render(<Tab />, {
      wrapper: getWrapper(
        [
          ...mockedResponses,
          mockedGetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryResponse(
            {
              RatedItemId: riskId,
            },
            {
              impact: [],
            }
          ),
          mockedGetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse(
            { RiskId: riskId },
            {
              controlled: [
                buildControlledSecondLineRiskAssessmentResultRating({}),
              ],
              uncontrolled: [
                buildUncontrolledSecondLineRiskAssessmentResultRating({}),
              ],
            }
          ),
          mockedGetLatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse(
            {
              RiskId: riskId,
            },
            {
              controlled: [
                buildControlledInternalAuditRiskAssessmentResultRating({}),
              ],
              uncontrolled: [
                buildUncontrolledInternalAuditRiskAssessmentResultRating({}),
              ],
            }
          ),
          mockedGetLatestRiskScoresByRiskIdResponse(
            { RiskId: riskId },
            {
              risk_score: [buildRiskScores({})],
            }
          ),
          mockedGetRiskScoresByRiskIdResponse(
            { RiskId: riskId },
            {
              residual: [
                buildRiskAssessmentResultRating({ ControlType: 'Controlled' }),
              ],
              inherent: [
                buildRiskAssessmentResultRating({
                  ControlType: 'Uncontrolled',
                }),
              ],
              risk: [
                {
                  Tier: 1,
                  __typename: 'risk',
                },
              ],
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
        ...providers
      ),
    });
    await waitFor(
      () => expect(screen.queryByText('Risk ratings')).toBeInTheDocument(),
      { timeout: 10000 }
    );

    await waitFor(() =>
      expect(screen.queryByText('Internal audit ratings')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.queryByText('Compliance monitoring ratings')
      ).toBeInTheDocument()
    );
  }, 10000);
});
