import {
  AcceptanceCreatePage,
  AcceptancesPage,
  AcceptanceUpdatePage,
  AccessDeniedPage,
  ActionsPage,
  AppetiteCreatePage,
  AppetitesPage,
  AppetiteUpdatePage,
  AssessmentActivitiesRegisterPage,
  AssessmentCreatePage,
  AssessmentResultsRegisterPage,
  AssessmentsPage,
  AttestationsPage,
  AuthErrorPage,
  CausesPage,
  ComplianceMonitoringAssessmentCreatePage,
  ComplianceMonitoringAssessmentResultsPage,
  ComplianceMonitoringAssessmentsPage,
  ConsequencesPage,
  ControlGroupsPage,
  ControlsPage,
  ControlTestsPage,
  CustomDatasourceDetailsPage,
  CustomDatasourcesPage,
  CustomDatasourceUpdatePage,
  EnterpriseRiskDashboardPage,
  ErrorPage,
  HomePage,
  ImpactPage,
  ImpactRatingsPage,
  ImpactsPage,
  IndicatorsPage,
  InternalAuditCreatePage,
  InternalAuditDashboardPage,
  InternalAuditPage,
  InternalAuditReportCreatePage,
  InternalAuditReportPage,
  InternalAuditReportResultsPage,
  InvitationExpiredPage,
  IssuesPage,
  LoginPage,
  LogoutPage,
  NotFoundPage,
  ObligationChangeDetailPage,
  ObligationChangesPage,
  ObligationCreatePage,
  ObligationDashboardPage,
  ObligationsPage,
  ObligationUpdatePage,
  OpenPublicPolicyFilePage,
  OpenPublicPolicyFileRedirect,
  OrgNotFoundPage,
  PolicyCreatePage,
  PolicyPage,
  ProtectedErrorPage,
  PublicPoliciesPage,
  QuestionnaireTemplateCreatePage,
  QuestionnaireTemplatePage,
  ReportAnIssuePage,
  ReportAnIssueSuccessPage,
  RequestsPage,
  RiskDashboardPage,
  RisksCreatePage,
  RisksPage,
  RisksUpdatePage,
  SlackCallbackPage,
  ThirdPartyCreatePage,
  ThirdPartyInvitePage,
  ThirdPartyPage,
  ThirdPartyResponseDetailsPage,
  ThirdPartyResponsesPage,
  ThirdPartyUpdatePage,
  UpdateAssessmentResultPage,
  UpdateInternalAuditResultPage,
  UpdateMonitoringAssessmentsResultPage,
  UserAttestationsPage,
  UserNotFoundPage,
} from '@pages';
import type { HandleOptions } from '@risksmart-app/components/src/breadcrumbs/types';
import i18n from '@risksmart-app/i18n/src/i18n';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { RouteObject } from 'react-router';
import ModuleGatedRoute from 'src/rbac/ModuleGatedRoute';
import OrgFeatureFlaggedRoute from 'src/rbac/OrgFeatureFlaggedRoute';
import ProtectedRoute from 'src/rbac/ProtectedRoute';
import { ParamId } from 'src/routes/constants';

import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import {
  accessDeniedUrl,
  complianceDashboardUrl,
  customDatasourcesUrl,
  enterpriseRiskDashboardUrl,
  impactRatingsUrl,
  impactsUrl,
  internalAuditDashboardUrl,
  loginUrl,
  logoutUrl,
  policyRegisterUrl,
  publicPoliciesUrl,
  questionnaireTemplateRegisterUrl,
  reportAnIssueUrl,
  riskDashboardUrl,
  settingsUrl,
  slackCallbackUrl,
  thirdPartyRegisterUrl,
} from '@/utils/urls';

import { ProtectedLayout } from '../layouts';
import Providers from '../Providers';
import { actionRoute } from './actionRoutes.config';
import { assessmentsRoute } from './assessmentRoutes.config';
import { automationsRoute } from './automationRoutes.config';
import { complianceMonitoringAssessmentRoute } from './complianceMonitoringAssessmentRoutes.config';
import { controlGroupRoute } from './controlGroupRoutes.config';
import { controlRoute } from './controlRoute.routes.config';
import { documentRoute } from './documentRoutes.config';
import { enterpriseRiskRoute } from './enterpriseRiskRoutes.config';
import { indicatorRoute } from './indicatorRoutes.config';
import { internalAuditReportsRoute } from './internalAuditReportRoutes.config';
import { internalAuditRoute } from './internalAuditRoutes.config';
import { issueRoute } from './issueRoutes.config';
import { questionnaireTemplateRoute } from './questionnaireTemplateRoutes.config';
import { settingsRoute } from './settingRoutes.config';

const routes: RouteObject[] = [
  {
    element: <Providers />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: loginUrl(),
        element: <LoginPage />,
        handle: {
          // TODO: translation
          title: 'Login',
        },
      },
      {
        children: [
          {
            path: '/error',
            element: <ErrorPage />,
            handle: {
              // TODO: translation
              title: 'Error',
            },
          },
          {
            path: '/auth-error',
            element: <AuthErrorPage />,
          },
          {
            path: '/noorg',
            element: <OrgNotFoundPage />,
            handle: {
              // TODO: translation
              title: 'No organisation found',
            },
          },
          {
            path: '/user-not-found',
            element: <UserNotFoundPage />,
            handle: {
              // TODO: translation
              title: 'User not found',
            },
          },
          {
            path: '/invitation-expired',
            element: <InvitationExpiredPage />,
            handle: {
              // TODO: translation
              title: 'Invitation expired',
            },
          },
          {
            path: accessDeniedUrl(),
            element: <AccessDeniedPage />,
            handle: {
              // TODO: translation
              title: 'Access denied',
            },
          },
        ],
      },

      {
        path: logoutUrl(),
        element: <LogoutPage loginUrl={loginUrl} />,
        handle: {
          // TODO: translation
          title: 'Logout',
        },
      },
      {
        path: '/',
        element: <ProtectedLayout />,
        errorElement: <ErrorPage />,
        children: [
          {
            errorElement: <ProtectedErrorPage />,
            children: [
              {
                path: slackCallbackUrl(),
                element: <SlackCallbackPage />,
              },
              {
                handle: {
                  title: () => i18n.t('dashboard.entity_name'),
                },
                path: '/',
                element: <HomePage />,
              },
              {
                handle: {
                  title: () => i18n.t('customDatasources.register_title'),
                },
                path: customDatasourcesUrl(),
                children: [
                  {
                    path: '',
                    element: (
                      <ModuleGatedRoute moduleKey={'custom_datasource'}>
                        <ProtectedRoute permission={'read:custom_datasource'}>
                          <CustomDatasourcesPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    handle: {
                      title: () => i18n.t('customDatasources.create_title'),
                    },
                    path: 'add',
                    element: (
                      <ModuleGatedRoute moduleKey={'custom_datasource'}>
                        <ProtectedRoute permission={'insert:custom_datasource'}>
                          <CustomDatasourceUpdatePage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.CustomDatasource}/edit`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.CustomDatasource,
                        paramName: ParamId.CustomDatasource,
                      },
                    },
                    element: (
                      <ModuleGatedRoute moduleKey={'custom_datasource'}>
                        <ProtectedRoute permission={'read:custom_datasource'}>
                          <CustomDatasourceUpdatePage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.CustomDatasource}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.CustomDatasource,
                        paramName: ParamId.CustomDatasource,
                      },
                    },
                    element: (
                      <ModuleGatedRoute moduleKey={'custom_datasource'}>
                        <ProtectedRoute permission={'read:custom_datasource'}>
                          <CustomDatasourceDetailsPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                ],
              },
              {
                path: riskDashboardUrl(),
                handle: {
                  title: () => i18n.format(i18n.t('risk_other'), 'capitalize'),
                },
                element: (
                  <ProtectedRoute
                    permission={'read:risk'}
                    canHaveAccessAsContributor={true}
                  >
                    <RiskDashboardPage />
                  </ProtectedRoute>
                ),
              },
              {
                handle: {
                  title: () => i18n.t('issues.report_issue_title'),
                },
                path: reportAnIssueUrl(),
                element: (
                  <ProtectedRoute permission={'read:public_issue_form'}>
                    <ReportAnIssuePage />
                  </ProtectedRoute>
                ),
              },
              {
                handle: {
                  title: () => i18n.t('publicPolicies.register_title'),
                },
                path: publicPoliciesUrl(),
                element: (
                  <ProtectedRoute permission={'read:public_policies'}>
                    <PublicPoliciesPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: 'policy/:documentId/files/:fileId',
                element: <OpenPublicPolicyFileRedirect />,
              },
              {
                path: `${publicPoliciesUrl()}/:documentId/files/:fileId`,
                element: (
                  <ProtectedRoute
                    permission={['read:public_policies', 'read:document']}
                  >
                    <OpenPublicPolicyFilePage />
                  </ProtectedRoute>
                ),
              },
              {
                path: '/automations',
                handle: {
                  title: () => i18n.t('automations.page_title'),
                },
                children: [automationsRoute],
              },
              {
                path: settingsUrl(),
                handle: {
                  title: 'Settings',
                },
                children: [settingsRoute],
              },
              ...Object.entries(IssueTypeMapping).map(([_, itm]) => ({
                path: itm.reportedSuccessfullyUrl(':sequentialId'),
                element: (
                  <ProtectedRoute permission={'read:public_issue_form'}>
                    <ReportAnIssueSuccessPage issueType={itm.type} />
                  </ProtectedRoute>
                ),
              })),
              {
                path: policyRegisterUrl(),
                handle: {
                  title: () => i18n.t('policy.policy'),
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ModuleGatedRoute moduleKey={'document'}>
                        <ProtectedRoute
                          permission={'read:document'}
                          canHaveAccessAsContributor={true}
                        >
                          <PolicyPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: 'add',
                    element: (
                      <ModuleGatedRoute moduleKey={'document'}>
                        <ProtectedRoute permission={'insert:document'}>
                          <PolicyCreatePage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                    handle: {
                      title: () => i18n.t('policy.create_title'),
                    },
                  },
                  documentRoute,
                ],
              },
              {
                path: `${policyRegisterUrl()}/attestations`,
                handle: {
                  title: () =>
                    i18n.format(i18n.t('attestation_other'), 'capitalize'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ModuleGatedRoute
                        moduleKey={'document.subModules.attestation'}
                      >
                        <ProtectedRoute permission={'read:attestation_record'}>
                          <AttestationsPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: `user/:${ParamId.User}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: 'user',
                        paramName: ParamId.User,
                      },
                    },
                    element: (
                      <ModuleGatedRoute
                        moduleKey={'document.subModules.attestation'}
                      >
                        <ProtectedRoute permission={'read:attestation_record'}>
                          <UserAttestationsPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                ],
              },
              {
                path: '/controls',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('control_other'), 'capitalize'),
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ProtectedRoute
                        permission={'read:control'}
                        canHaveAccessAsContributor={true}
                      >
                        <ControlsPage />
                      </ProtectedRoute>
                    ),
                  },
                  controlRoute,
                ],
              },
              {
                handle: {
                  title: () =>
                    i18n.format(i18n.t('control_test_other'), 'capitalize'),
                },
                path: '/controls/tests',
                element: (
                  <ProtectedRoute
                    permission={'read:control'}
                    canHaveAccessAsContributor={true}
                  >
                    <ControlTestsPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: '/control-groups',
                handle: {
                  // TODO: translation
                  title: 'Control Groups',
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ProtectedRoute
                        permission={'read:control_group'}
                        canHaveAccessAsContributor={true}
                      >
                        <ControlGroupsPage />
                      </ProtectedRoute>
                    ),
                  },
                  controlGroupRoute,
                ],
              },
              {
                path: '/indicator',
                handle: {
                  title: () =>
                    // TODO: translation
                    'Indicators',
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ProtectedRoute
                        permission={'read:indicator'}
                        canHaveAccessAsContributor={true}
                      >
                        <IndicatorsPage />
                      </ProtectedRoute>
                    ),
                  },
                  indicatorRoute,
                ],
              },
              {
                path: '/assessments/findings',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('finding_other'), 'capitalizeAll'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute
                        permission={'read:assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <AssessmentResultsRegisterPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.Finding}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.AssessmentResult,
                        paramName: ParamId.Finding,
                      },
                    },
                    element: (
                      <ProtectedRoute
                        permission={'read:assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <UpdateAssessmentResultPage />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
              {
                path: '/assessments/activities',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('activity_other'), 'capitalize'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute
                        permission={'read:assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <AssessmentActivitiesRegisterPage />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
              {
                path: '/assessments',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('assessment_other'), 'capitalize'),
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ProtectedRoute
                        permission={'read:assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <AssessmentsPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: 'add',
                    element: (
                      <ProtectedRoute permission={'insert:assessment'}>
                        <AssessmentCreatePage />
                      </ProtectedRoute>
                    ),
                    handle: {
                      // TODO: translation
                      title: 'Add assessment',
                    },
                  },
                  assessmentsRoute,
                ],
              },
              {
                path: internalAuditDashboardUrl(),
                handle: {
                  title: () =>
                    i18n.format(i18n.t('internal_audit'), 'capitalize'),
                },
                element: (
                  <ModuleGatedRoute moduleKey={'internal_audit_entity'}>
                    <ProtectedRoute
                      permission={'read:internal_audit_entity'}
                      canHaveAccessAsContributor={true}
                    >
                      <InternalAuditDashboardPage />
                    </ProtectedRoute>
                  </ModuleGatedRoute>
                ),
              },
              {
                path: '/internal-audits',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('internal_audit_other'), 'capitalize'),
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ProtectedRoute
                        permission={'read:internal_audit_entity'}
                        canHaveAccessAsContributor={true}
                      >
                        <InternalAuditPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: 'add',
                    element: (
                      <ProtectedRoute
                        permission={'insert:internal_audit_entity'}
                        canHaveAccessAsContributor={true}
                      >
                        <InternalAuditCreatePage />
                      </ProtectedRoute>
                    ),
                    handle: {
                      title: () => i18n.t('internalAudits.add_button'),
                    },
                  },
                  internalAuditRoute,
                ],
              },
              {
                path: '/internal-audits/reports',
                handle: {
                  title: () =>
                    i18n.format(
                      i18n.t('internal_audit_report_other'),
                      'capitalize'
                    ),
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ProtectedRoute
                        permission={'read:internal_audit_report'}
                        canHaveAccessAsContributor={true}
                      >
                        <InternalAuditReportPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: 'add',
                    element: (
                      <ProtectedRoute
                        permission={'insert:internal_audit_report'}
                        canHaveAccessAsContributor={true}
                      >
                        <InternalAuditReportCreatePage />
                      </ProtectedRoute>
                    ),
                    handle: {
                      title: () => i18n.t('internalAuditReports.add_button'),
                    },
                  },
                  internalAuditReportsRoute,
                ],
              },

              {
                path: '/internal-audits/reports/findings',
                handle: {
                  title: () =>
                    i18n.t('internalAuditAssessmentResults.register_title'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute
                        permission={'read:internal_audit_report'}
                        canHaveAccessAsContributor={true}
                      >
                        <InternalAuditReportResultsPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.Finding}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.InternalAuditReportResult,
                        paramName: ParamId.Finding,
                      },
                    },
                    element: (
                      <ProtectedRoute
                        permission={'read:assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <UpdateInternalAuditResultPage />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
              {
                path: '/compliance/monitoring-assessments',
                handle: {
                  title: () =>
                    i18n.format(
                      i18n.t('compliance_monitoring_assessment_other'),
                      'capitalize'
                    ),
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ProtectedRoute
                        permission={'read:compliance_monitoring_assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <ComplianceMonitoringAssessmentsPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: 'add',
                    element: (
                      <ProtectedRoute
                        permission={'insert:compliance_monitoring_assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <ComplianceMonitoringAssessmentCreatePage />
                      </ProtectedRoute>
                    ),
                    handle: {
                      title: () =>
                        i18n.t('complianceMonitoringAssessment.add_button'),
                    },
                  },
                  complianceMonitoringAssessmentRoute,
                ],
              },
              {
                path: '/compliance/obligation-changes',
                handle: {
                  title: () =>
                    i18n.format(
                      i18n.t('obligationChanges.register_title'),
                      'capitalize'
                    ),
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ModuleGatedRoute
                        moduleKey={'obligation.subModules.reg_feed'}
                      >
                        <ProtectedRoute
                          permission={'read:obligation_change'}
                          canHaveAccessAsContributor={true}
                        >
                          <ObligationChangesPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: ':obligationChangeId',
                    element: (
                      <ModuleGatedRoute
                        moduleKey={'obligation.subModules.reg_feed'}
                      >
                        <ProtectedRoute
                          permission={'read:obligation_change'}
                          canHaveAccessAsContributor={true}
                        >
                          <ObligationChangeDetailPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                    handle: {
                      title: () => i18n.t('obligationChanges.detail_title'),
                    },
                  },
                ],
              },
              {
                path: '/compliance/monitoring-assessments/findings',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('finding_other'), 'capitalizeAll'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute
                        permission={'read:compliance_monitoring_assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <ComplianceMonitoringAssessmentResultsPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.Finding}`,
                    handle: {
                      title: () =>
                        i18n.format(i18n.t('finding_one'), 'capitalizeAll'),
                    },
                    element: (
                      <ProtectedRoute
                        permission={'read:assessment'}
                        canHaveAccessAsContributor={true}
                      >
                        <UpdateMonitoringAssessmentsResultPage />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
              {
                path: '/third-party',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('third_party_other'), 'capitalizeAll'),
                  breadcrumbUrl: () => thirdPartyRegisterUrl(),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ModuleGatedRoute moduleKey={'third_party'}>
                        <ProtectedRoute
                          permission={'read:third_party'}
                          canHaveAccessAsContributor={true}
                        >
                          <ThirdPartyPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: 'add',
                    handle: {
                      title: () => i18n.t('common:third_party.create_title'),
                    },
                    element: (
                      <ModuleGatedRoute moduleKey={'third_party'}>
                        <ProtectedRoute permission={'insert:third_party'}>
                          <ThirdPartyCreatePage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.ThirdParty}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.ThirdParty,
                        paramName: ParamId.ThirdParty,
                      },
                    },
                    children: [
                      {
                        path: '',
                        element: (
                          <ModuleGatedRoute moduleKey={'third_party'}>
                            <ProtectedRoute
                              permission={'read:third_party'}
                              canHaveAccessAsContributor={true}
                            >
                              <ThirdPartyUpdatePage
                                activeTabId={'details'}
                                showDeleteButton={true}
                              />
                            </ProtectedRoute>
                          </ModuleGatedRoute>
                        ),
                      },
                      {
                        path: 'questionnaire-responses',
                        children: [
                          {
                            index: true,
                            element: (
                              <ModuleGatedRoute moduleKey={'third_party'}>
                                <ProtectedRoute
                                  permission={'update:third_party'}
                                  canHaveAccessAsContributor={true}
                                >
                                  <ThirdPartyUpdatePage
                                    activeTabId={'questionnaires'}
                                  />
                                </ProtectedRoute>
                              </ModuleGatedRoute>
                            ),
                          },
                          {
                            path: `:${ParamId.ThirdPartyResponse}`,
                            handle: {
                              breadcrumbNode: {
                                nodeType: Parent_Type_Enum.ThirdPartyResponse,
                                paramName: ParamId.ThirdPartyResponse,
                              },
                            },
                            element: (
                              <ModuleGatedRoute moduleKey={'third_party'}>
                                <ProtectedRoute
                                  permission={'read:third_party_response'}
                                  canHaveAccessAsContributor={true}
                                >
                                  <ThirdPartyResponseDetailsPage />
                                </ProtectedRoute>
                              </ModuleGatedRoute>
                            ),
                          },
                        ],
                      },
                      {
                        path: 'questionnaire-responses/invite',
                        element: (
                          <ModuleGatedRoute moduleKey={'third_party'}>
                            <ProtectedRoute
                              permission={'update:third_party'}
                              canHaveAccessAsContributor={true}
                            >
                              <ThirdPartyInvitePage />
                            </ProtectedRoute>
                          </ModuleGatedRoute>
                        ),
                      },
                      {
                        path: 'contacts',
                        element: (
                          <ModuleGatedRoute moduleKey={'third_party'}>
                            <ProtectedRoute
                              permission={'update:third_party'}
                              canHaveAccessAsContributor={true}
                            >
                              <ThirdPartyUpdatePage activeTabId={'contacts'} />
                            </ProtectedRoute>
                          </ModuleGatedRoute>
                        ),
                      },
                      {
                        path: 'controls',
                        children: [
                          {
                            path: '',
                            element: (
                              <ModuleGatedRoute moduleKey={'third_party'}>
                                <ProtectedRoute
                                  permission={'read:control'}
                                  canHaveAccessAsContributor={true}
                                >
                                  <ThirdPartyUpdatePage
                                    activeTabId={'controls'}
                                  />
                                </ProtectedRoute>
                              </ModuleGatedRoute>
                            ),
                          },
                          controlRoute,
                        ],
                      },
                      ...Object.entries(IssueTypeMapping).map(([_, itm]) => ({
                        path: itm.uriPath,
                        children: [
                          {
                            path: '',
                            element: (
                              <ModuleGatedRoute moduleKey={'third_party'}>
                                <ProtectedRoute
                                  permission={'read:issue'}
                                  canHaveAccessAsContributor={true}
                                >
                                  <ThirdPartyUpdatePage
                                    activeTabId={itm.taxonomy}
                                  />
                                </ProtectedRoute>
                              </ModuleGatedRoute>
                            ),
                          },
                          issueRoute(itm.type),
                        ],
                      })),
                      {
                        path: 'actions',
                        children: [
                          {
                            path: '',
                            element: (
                              <ModuleGatedRoute moduleKey={'third_party'}>
                                <ProtectedRoute
                                  permission={'read:action'}
                                  canHaveAccessAsContributor
                                >
                                  <ThirdPartyUpdatePage
                                    activeTabId={'actions'}
                                  />
                                </ProtectedRoute>
                              </ModuleGatedRoute>
                            ),
                          },
                          actionRoute,
                        ],
                      },
                      {
                        path: 'linked-items',
                        element: (
                          <ModuleGatedRoute moduleKey={'third_party'}>
                            <ProtectedRoute
                              permission={'read:linked_item'}
                              canHaveAccessAsContributor={true}
                            >
                              <ThirdPartyUpdatePage
                                activeTabId={'linkedItems'}
                              />
                            </ProtectedRoute>
                          </ModuleGatedRoute>
                        ),
                      },
                      {
                        path: 'notification-history',
                        handle: {
                          title: () => i18n.t('notificationHistory.tab_title'),
                        },
                        element: (
                          <ModuleGatedRoute moduleKey={'third_party'}>
                            <ProtectedRoute
                              permission={'read:third_party'}
                              canHaveAccessAsContributor={true}
                            >
                              <ThirdPartyUpdatePage
                                activeTabId={'notificationHistory'}
                              />
                            </ProtectedRoute>
                          </ModuleGatedRoute>
                        ),
                      },
                    ],
                  },
                ],
              },
              {
                path: 'third-party/questionnaire',
                handle: {
                  title: () =>
                    `${i18n.format(i18n.t('questionnaire_one'), 'capitalizeAll')} `,
                  breadcrumbUrl: () => questionnaireTemplateRegisterUrl(),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ModuleGatedRoute moduleKey={'third_party'}>
                        <ProtectedRoute
                          permission={'read:questionnaire_template'}
                          canHaveAccessAsContributor={true}
                        >
                          <QuestionnaireTemplatePage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: 'add',
                    handle: {
                      title: () =>
                        i18n.t('common:questionnaire_templates.create_title'),
                    },
                    element: (
                      <ModuleGatedRoute moduleKey={'third_party'}>
                        <ProtectedRoute
                          permission={'insert:questionnaire_template'}
                        >
                          <QuestionnaireTemplateCreatePage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  questionnaireTemplateRoute,
                ],
              },
              {
                handle: {
                  title: () =>
                    i18n.format(i18n.t('response_other'), 'capitalize'),
                },
                path: 'third-party/questionnaire-responses',
                element: (
                  <ModuleGatedRoute moduleKey={'third_party'}>
                    <ProtectedRoute permission={'read:third_party_response'}>
                      <ThirdPartyResponsesPage />
                    </ProtectedRoute>
                  </ModuleGatedRoute>
                ),
              },
              {
                path: '/actions',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('action_other'), 'capitalize'),
                },
                children: [
                  {
                    path: '',
                    element: (
                      <ProtectedRoute
                        permission={'read:action'}
                        canHaveAccessAsContributor={true}
                      >
                        <ActionsPage />
                      </ProtectedRoute>
                    ),
                  },
                  actionRoute,
                ],
              },
              {
                handle: {
                  title: () => i18n.t('causes.tab_title'),
                },
                path: '/causes',
                element: (
                  <ProtectedRoute
                    permission={'read:cause'}
                    canHaveAccessAsContributor={true}
                  >
                    <CausesPage />
                  </ProtectedRoute>
                ),
              },
              {
                handle: {
                  title: () => i18n.t('consequences.tab_title'),
                },
                path: '/consequences',
                element: (
                  <ProtectedRoute
                    permission={'read:consequence'}
                    canHaveAccessAsContributor={true}
                  >
                    <ConsequencesPage />
                  </ProtectedRoute>
                ),
              },
              ...Object.entries(IssueTypeMapping).map(([_, itm]) => ({
                path: itm.uriPath,
                handle: {
                  title: () => i18n.t(`${itm.taxonomy}.tab_title`),
                },
                children: [
                  {
                    index: true,
                    element: itm.featureFlag ? (
                      <OrgFeatureFlaggedRoute featureFlag={itm.featureFlag}>
                        <ProtectedRoute
                          permission={'read:issue'}
                          canHaveAccessAsContributor={true}
                        >
                          <IssuesPage issueType={itm.type} />
                        </ProtectedRoute>
                      </OrgFeatureFlaggedRoute>
                    ) : (
                      <ProtectedRoute
                        permission={'read:issue'}
                        canHaveAccessAsContributor={true}
                      >
                        <IssuesPage issueType={itm.type} />
                      </ProtectedRoute>
                    ),
                  },
                  issueRoute(itm.type),
                ],
              })),
              {
                path: '/acceptances',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('acceptance_other'), 'capitalize'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute
                        permission={'read:acceptance'}
                        canHaveAccessAsContributor={true}
                      >
                        <AcceptancesPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.Acceptance}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.Acceptance,
                        paramName: ParamId.Acceptance,
                      },
                    },
                    element: <AcceptanceUpdatePage />,
                  },
                ],
              },
              {
                path: '/appetites',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('appetite_other'), 'capitalize'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute
                        permission={'read:appetite'}
                        canHaveAccessAsContributor={true}
                      >
                        <AppetitesPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.Appetite}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.Appetite,
                        paramName: ParamId.Appetite,
                      },
                    },
                    element: (
                      <ProtectedRoute
                        permission={'update:appetite'}
                        canHaveAccessAsContributor={true}
                      >
                        <AppetiteUpdatePage />
                      </ProtectedRoute>
                    ),
                  },
                ],
              },
              {
                path: impactRatingsUrl(),
                children: [
                  {
                    index: true,
                    handle: {
                      title: () =>
                        i18n.format(
                          i18n.t('impact_rating_other'),
                          'capitalize'
                        ),
                    },
                    element: (
                      <ModuleGatedRoute moduleKey={'risk.subModules.impact'}>
                        <ProtectedRoute
                          permission={'read:impact_rating'}
                          canHaveAccessAsContributor={true}
                        >
                          <ImpactRatingsPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                ],
              },
              {
                path: impactsUrl(),
                handle: {
                  title: () =>
                    i18n.format(i18n.t('impact_other'), 'capitalize'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ModuleGatedRoute moduleKey={'risk.subModules.impact'}>
                        <ProtectedRoute permission={'update:impact'}>
                          <ImpactsPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: `:${ParamId.Impact}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.Impact,
                        paramName: ParamId.Impact,
                      },
                    },
                    children: [
                      {
                        index: true,
                        element: (
                          <ModuleGatedRoute
                            moduleKey={'risk.subModules.impact'}
                          >
                            <ProtectedRoute permission={'update:impact'}>
                              <ImpactPage activeTabId={'details'} />
                            </ProtectedRoute>
                          </ModuleGatedRoute>
                        ),
                      },
                      {
                        path: 'rating',
                        handle: {
                          title: () =>
                            i18n.format(i18n.t('rating_other'), 'capitalize'),
                        },
                        element: (
                          <ModuleGatedRoute
                            moduleKey={'risk.subModules.impact'}
                          >
                            <ProtectedRoute permission={'read:impact'}>
                              <ImpactPage activeTabId={'ratings'} />
                            </ProtectedRoute>
                          </ModuleGatedRoute>
                        ),
                      },
                    ],
                  },
                ],
              },
              {
                path: complianceDashboardUrl(),
                handle: {
                  title: () => i18n.format(i18n.t('compliance'), 'capitalize'),
                },
                element: (
                  <ModuleGatedRoute moduleKey={'obligation'}>
                    <ProtectedRoute
                      permission={'read:obligation'}
                      canHaveAccessAsContributor={true}
                    >
                      <ObligationDashboardPage />
                    </ProtectedRoute>
                  </ModuleGatedRoute>
                ),
              },
              {
                path: '/compliance',
                handle: {
                  breadcrumbUrl: (options: HandleOptions) => {
                    if (
                      options.location.state?.from === 'compliance-dashboard'
                    ) {
                      return complianceDashboardUrl();
                    }

                    return '/compliance';
                  },
                  title: () => i18n.format(i18n.t('compliance'), 'capitalize'),
                },
                children: [
                  {
                    index: true,
                    element: (
                      <ModuleGatedRoute moduleKey={'obligation'}>
                        <ProtectedRoute
                          permission={'read:obligation'}
                          canHaveAccessAsContributor={true}
                        >
                          <ObligationsPage />
                        </ProtectedRoute>
                      </ModuleGatedRoute>
                    ),
                  },
                  {
                    path: 'obligation',
                    handle: { isNotParent: true },
                    children: [
                      {
                        index: true,
                        handle: {
                          // TODO: translation
                          title: 'Add Obligation',
                          isNotParent: true,
                        },
                        element: (
                          <ModuleGatedRoute moduleKey={'obligation'}>
                            <ProtectedRoute
                              permission={'insert:obligation'}
                              canHaveAccessAsContributor={true}
                            >
                              <ObligationCreatePage />
                            </ProtectedRoute>
                          </ModuleGatedRoute>
                        ),
                      },
                      {
                        path: `:${ParamId.Obligation}`,
                        handle: {
                          breadcrumbNode: {
                            nodeType: Parent_Type_Enum.Obligation,
                            paramName: ParamId.Obligation,
                          },
                        },
                        children: [
                          {
                            path: '',
                            element: (
                              <ModuleGatedRoute moduleKey={'obligation'}>
                                <ObligationUpdatePage
                                  selectedTabId={'details'}
                                />
                              </ModuleGatedRoute>
                            ),
                          },
                          {
                            path: 'impacts',
                            handle: {
                              // TODO: translation
                              title: 'Impact',
                            },
                            element: (
                              <ModuleGatedRoute moduleKey={'obligation'}>
                                <ObligationUpdatePage
                                  selectedTabId={'impacts'}
                                />
                              </ModuleGatedRoute>
                            ),
                          },
                          {
                            path: 'ratings',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('assessment_other'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                index: true,
                                element: (
                                  <ModuleGatedRoute moduleKey={'obligation'}>
                                    <ObligationUpdatePage
                                      selectedTabId={'ratings'}
                                    />
                                  </ModuleGatedRoute>
                                ),
                              },
                              assessmentsRoute,
                            ],
                          },
                          {
                            path: 'actions',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('action_other'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                path: '',
                                element: (
                                  <ModuleGatedRoute moduleKey={'obligation'}>
                                    <ObligationUpdatePage
                                      selectedTabId={'actions'}
                                    />
                                  </ModuleGatedRoute>
                                ),
                              },
                              actionRoute,
                            ],
                          },
                          ...Object.entries(IssueTypeMapping).map(
                            ([_, itm]) => ({
                              path: itm.uriPath,
                              handle: {
                                title: () =>
                                  i18n.format(
                                    i18n.t(itm.entityLabelOther),
                                    'capitalize'
                                  ),
                              },
                              children: [
                                {
                                  path: '',
                                  element: (
                                    <ModuleGatedRoute moduleKey={'obligation'}>
                                      <ObligationUpdatePage
                                        selectedTabId={itm.taxonomy}
                                      />
                                    </ModuleGatedRoute>
                                  ),
                                },
                                issueRoute(itm.type),
                              ],
                            })
                          ),
                          {
                            path: 'controls',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('control_other'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                path: '',
                                element: (
                                  <ModuleGatedRoute moduleKey={'obligation'}>
                                    <ObligationUpdatePage
                                      selectedTabId={'controls'}
                                    />
                                  </ModuleGatedRoute>
                                ),
                              },
                              controlRoute,
                            ],
                          },
                          {
                            path: 'linked-items',
                            handle: {
                              title: 'Linked items',
                            },
                            children: [
                              {
                                path: '',
                                element: (
                                  <ObligationUpdatePage
                                    selectedTabId={'linkedItems'}
                                  />
                                ),
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                path: '/requests',
                handle: {
                  title: () =>
                    i18n.format(i18n.t('request_other'), 'capitalize'),
                },
                element: (
                  <ModuleGatedRoute moduleKey={'approval'}>
                    <ProtectedRoute
                      permission={'read:change_request'}
                      canHaveAccessAsContributor={true}
                    >
                      <RequestsPage />
                    </ProtectedRoute>
                  </ModuleGatedRoute>
                ),
              },
              {
                path: '/risks',
                handle: {
                  breadcrumbUrl: (options: HandleOptions) => {
                    if (options.location.state?.from === 'risk-dashboard') {
                      return riskDashboardUrl();
                    }

                    return '/risks';
                  },
                  title: () => i18n.format(i18n.t('risk_other'), 'capitalize'),
                },

                children: [
                  {
                    index: true,
                    element: (
                      <ProtectedRoute
                        permission={'read:risk'}
                        canHaveAccessAsContributor={true}
                      >
                        <RisksPage />
                      </ProtectedRoute>
                    ),
                  },
                  {
                    path: 'add',
                    element: (
                      <ProtectedRoute
                        permission={'insert:risk'}
                        canHaveAccessAsContributor={true}
                      >
                        <RisksCreatePage />
                      </ProtectedRoute>
                    ),
                    handle: {
                      // TODO: translation
                      title: 'Add Risk',
                    },
                  },
                  {
                    path: `:${ParamId.Risk}`,
                    handle: {
                      breadcrumbNode: {
                        nodeType: Parent_Type_Enum.Risk,
                        paramName: ParamId.Risk,
                      },
                    },
                    children: [
                      {
                        path: '',
                        children: [
                          {
                            path: '',
                            element: (
                              <ProtectedRoute
                                permission={'read:risk'}
                                canHaveAccessAsContributor={true}
                              >
                                <RisksUpdatePage
                                  selectedTabId={'details'}
                                  showDeleteButton={true}
                                />
                              </ProtectedRoute>
                            ),
                          },
                          {
                            path: 'ratings',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('rating_other'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                path: '',
                                element: (
                                  <RisksUpdatePage selectedTabId={'ratings'} />
                                ),
                              },
                              assessmentsRoute,
                            ],
                          },
                          {
                            path: 'impacts',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('impact_other'),
                                  'capitalize'
                                ),
                            },
                            element: (
                              <RisksUpdatePage selectedTabId={'impacts'} />
                            ),
                          },
                          {
                            path: 'actions',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('action_other'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                path: '',
                                element: (
                                  <RisksUpdatePage selectedTabId={'actions'} />
                                ),
                              },
                              actionRoute,
                            ],
                          },
                          {
                            path: 'controls',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('control_other'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                path: '',
                                element: (
                                  <RisksUpdatePage selectedTabId={'controls'} />
                                ),
                              },
                              controlRoute,
                            ],
                          },
                          {
                            path: 'appetite',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('appetite_one'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                index: true,
                                element: (
                                  <RisksUpdatePage
                                    selectedTabId={'appetites'}
                                  />
                                ),
                              },
                              {
                                path: 'add',
                                handle: {
                                  title: () =>
                                    i18n.format(
                                      i18n.t('appetites.create_modal_title'),
                                      'capitalize'
                                    ),
                                },
                                element: <AppetiteCreatePage />,
                              },
                              {
                                path: `:${ParamId.Appetite}`,
                                handle: {
                                  breadcrumbNode: {
                                    nodeType: Parent_Type_Enum.Appetite,
                                    paramName: ParamId.Appetite,
                                  },
                                },
                                element: <AppetiteUpdatePage />,
                              },
                            ],
                          },
                          {
                            path: 'acceptances',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('acceptance_other'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                index: true,
                                element: (
                                  <RisksUpdatePage
                                    selectedTabId={'acceptances'}
                                  />
                                ),
                              },
                              {
                                path: 'add',
                                handle: {
                                  title: () =>
                                    i18n.format(
                                      i18n.t('acceptances.create_modal_title'),
                                      'capitalize'
                                    ),
                                },
                                element: <AcceptanceCreatePage />,
                              },
                              {
                                path: `:${ParamId.Acceptance}`,
                                handle: {
                                  breadcrumbNode: {
                                    nodeType: Parent_Type_Enum.Acceptance,
                                    paramName: ParamId.Acceptance,
                                  },
                                },
                                element: <AcceptanceUpdatePage />,
                              },
                            ],
                          },
                          {
                            path: 'indicators',
                            handle: {
                              title: () =>
                                i18n.format(
                                  i18n.t('indicator_other'),
                                  'capitalize'
                                ),
                            },
                            children: [
                              {
                                path: '',
                                element: (
                                  <RisksUpdatePage
                                    selectedTabId={'indicators'}
                                  />
                                ),
                              },
                              indicatorRoute,
                            ],
                          },
                          {
                            path: 'approvals',
                            handle: {
                              title: () => i18n.t('approvals.tab_title'),
                            },
                            element: (
                              <RisksUpdatePage selectedTabId={'approvals'} />
                            ),
                          },
                          {
                            path: 'linked-items',
                            handle: {
                              title: 'Linked items',
                            },
                            children: [
                              {
                                path: '',
                                element: (
                                  <RisksUpdatePage
                                    selectedTabId={'linkedItems'}
                                  />
                                ),
                              },
                            ],
                          },
                          {
                            path: 'notification-history',
                            handle: {
                              title: () =>
                                i18n.t('notificationHistory.tab_title'),
                            },
                            element: (
                              <RisksUpdatePage
                                selectedTabId={'notificationHistory'}
                              />
                            ),
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                path: enterpriseRiskDashboardUrl(),
                handle: {
                  title: () =>
                    i18n.format(i18n.t('enterprise_risk'), 'capitalize'),
                },
                element: (
                  <ModuleGatedRoute moduleKey={'enterprise_risk'}>
                    <ProtectedRoute permission={'read:enterprise_risk'}>
                      <EnterpriseRiskDashboardPage />
                    </ProtectedRoute>
                  </ModuleGatedRoute>
                ),
              },
              {
                ...enterpriseRiskRoute,
              },
              {
                path: '*',
                element: <NotFoundPage />,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default routes;
