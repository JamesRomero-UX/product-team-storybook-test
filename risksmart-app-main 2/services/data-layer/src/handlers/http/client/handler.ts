import type { Route } from '@middy/http-router';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createHandler } from '../create-handler';
import {
  createAcceptanceProcessor,
  deleteAcceptancesProcessor,
  updateAcceptanceProcessor,
} from './processors/acceptances';
import { createActionUpdateProcessor } from './processors/action-updates/create';
import { deleteActionUpdatesProcessor } from './processors/action-updates/delete';
import { getActionUpdateByIdProcessor } from './processors/action-updates/get-by-id';
import { getActionUpdatesByParentProcessor } from './processors/action-updates/get-by-parent';
import { createActionProcessor } from './processors/actions/create';
import { getActionByIdProcessor } from './processors/actions/get-by-id';
import { getActionsRegisterProcessor } from './processors/actions/get-register';
import { getAggregationSettingsProcessor } from './processors/aggregation-settings/get';
import { createAppetiteProcessor } from './processors/appetites/create';
import { deleteAppetitesProcessor } from './processors/appetites/delete';
import { updateAppetiteProcessor } from './processors/appetites/update';
import { createAssessmentProcessor } from './processors/assessments/create';
import { deleteAssessmentProcessor } from './processors/assessments/delete';
import { updateAssessmentProcessor } from './processors/assessments/update';
import {
  createCauseProcessor,
  deleteCausesProcessor,
  updateCauseProcessor,
} from './processors/causes';
import {
  createConsequenceProcessor,
  deleteConsequencesProcessor,
  updateConsequenceProcessor,
} from './processors/consequences';
import { createControlGroupProcessor } from './processors/control-groups/create';
import { deleteControlGroupProcessor } from './processors/control-groups/delete';
import { createControlProcessor } from './processors/controls/create';
import { getLatestDocumentAssessmentResultByDocumentProcessor } from './processors/document-assessment-results/get-latest-by-document';
import { getFormConfigurationsProcessor } from './processors/form-configurations';
import {
  createFormFieldProcessor,
  deleteFormFieldProcessor,
  updateFormFieldProcessor,
} from './processors/form-fields';
import { getOldestActiveImpactRatingByRiskProcessor } from './processors/impact-ratings/get-oldest-active-by-risk';
import { createIndicatorResultProcessor } from './processors/indicator-results/create';
import { deleteIndicatorResultsProcessor } from './processors/indicator-results/delete';
import { getLatestIndicatorResultByIndicatorProcessor } from './processors/indicator-results/get-latest-by-indicator';
import { updateIndicatorResultProcessor } from './processors/indicator-results/update';
import { deleteIndicatorsProcessor } from './processors/indicators/delete';
import { updateIndicatorProcessor } from './processors/indicators/update';
import {
  createIssueProcessor,
  deleteIssuesProcessor,
  updateIssueProcessor,
} from './processors/issue';
import { createIssueAssessmentProcessor } from './processors/issue-assessment';
import { createIssueUpdateProcessor } from './processors/issue-updates/create';
import { deleteIssueUpdatesProcessor } from './processors/issue-updates/delete';
import {
  getMyDueActions,
  getMyDueAssessmentActivities,
  getMyDueAssessments,
  getMyDueAttestationRecords,
  getMyDueChangeRequests,
  getMyDueControls,
  getMyDueDocuments,
  getMyDueIndicators,
  getMyDueIssues,
  getMyDueObligations,
  getMyDueRisks,
} from './processors/my-items';
import { getLatestObligationAssessmentResultByObligationProcessor } from './processors/obligation-assessment-results/get-latest-by-obligation';
import { createObligationImpactProcessor } from './processors/obligation-impacts/create';
import { deleteObligationImpactsProcessor } from './processors/obligation-impacts/delete';
import { createObligationProcessor } from './processors/obligations/create';
import { getOrganisationByOrgKeyProcessor } from './processors/organisations/get-by-org-key';
import { createRiskAssessmentResultProcessor } from './processors/risk-assessment-results/create';
import { getLatestRiskAssessmentResultByRiskProcessor } from './processors/risk-assessment-results/get-latest-by-risk';
import { createRiskProcessor } from './processors/risks/create';
import { deleteRiskProcessor } from './processors/risks/delete';
import { updateRiskProcessor } from './processors/risks/update';
import { getScheduleStateByIdProcessor } from './processors/schedule-states/get-by-id';
import { upsertScheduleStateProcessor } from './processors/schedule-states/upsert';
import { getScheduleByIdProcessor } from './processors/schedules/get-by-id';
import { createSsoConfigurationProcessor } from './processors/sso-configurations/create';
import { deleteSsoConfigurationProcessor } from './processors/sso-configurations/delete';
import { getSsoConfigurationsProcessor } from './processors/sso-configurations/get-all';
import { createControlTestResultProcessor } from './processors/test-results/create';
import { deleteTestResultsProcessor } from './processors/test-results/delete';
import { getLatestTestResultByControlProcessor } from './processors/test-results/get-latest-by-control';
import { updateTestResultProcessor } from './processors/test-results/update';
import {
  getUserGroupByIdProcessor,
  getUserGroupsWithApproversProcessor,
  getUsersByGroupIdProcessor,
} from './processors/user-groups';

/**
 * Route definitions for client API (frontend/user-initiated requests).
 *
 * These routes are consumed by the tRPC service and web application for CRUD operations.
 * Includes GET, POST, and DELETE endpoints for various entity types.
 *
 * API Gateway uses a greedy {proxy+} route which forwards all paths to this Lambda,
 * and the http-router handles path matching internally.
 */
const routes: Route<APIGatewayProxyEvent, APIGatewayProxyResult>[] = [
  // Acceptances endpoints
  {
    method: 'POST',
    path: '/acceptances',
    handler: createAcceptanceProcessor,
  },
  {
    method: 'PUT',
    path: '/acceptances/{id}',
    handler: updateAcceptanceProcessor,
  },
  {
    method: 'DELETE',
    path: '/acceptances',
    handler: deleteAcceptancesProcessor,
  },
  // Aggregation settings endpoints
  {
    method: 'GET',
    path: '/aggregation-settings',
    handler: getAggregationSettingsProcessor,
  },

  // Assessments endpoints
  {
    method: 'POST',
    path: '/assessments',
    handler: createAssessmentProcessor,
  },
  {
    method: 'PUT',
    path: '/assessments/{id}',
    handler: updateAssessmentProcessor,
  },
  {
    method: 'DELETE',
    path: '/assessments/{id}',
    handler: deleteAssessmentProcessor,
  },

  // Actions endpoints
  {
    method: 'GET',
    path: '/actions/register',
    handler: getActionsRegisterProcessor,
  },
  {
    method: 'GET',
    path: '/actions/{id}',
    handler: getActionByIdProcessor,
  },
  {
    method: 'POST',
    path: '/actions',
    handler: createActionProcessor,
  },

  // Action updates endpoints
  {
    method: 'GET',
    path: '/action-updates/by-parent/{parentActionId}',
    handler: getActionUpdatesByParentProcessor,
  },
  {
    method: 'GET',
    path: '/action-updates/{id}',
    handler: getActionUpdateByIdProcessor,
  },
  {
    method: 'POST',
    path: '/action-updates',
    handler: createActionUpdateProcessor,
  },
  {
    method: 'DELETE',
    path: '/action-updates',
    handler: deleteActionUpdatesProcessor,
  },

  // Appetites endpoints
  {
    method: 'POST',
    path: '/appetites',
    handler: createAppetiteProcessor,
  },
  {
    method: 'PUT',
    path: '/appetites/{id}',
    handler: updateAppetiteProcessor,
  },
  {
    method: 'DELETE',
    path: '/appetites',
    handler: deleteAppetitesProcessor,
  },

  // Control groups endpoints
  {
    method: 'POST',
    path: '/control-groups',
    handler: createControlGroupProcessor,
  },
  {
    method: 'DELETE',
    path: '/control-groups/{id}',
    handler: deleteControlGroupProcessor,
  },

  // Causes endpoints
  {
    method: 'POST',
    path: '/causes',
    handler: createCauseProcessor,
  },
  {
    method: 'PUT',
    path: '/causes/{id}',
    handler: updateCauseProcessor,
  },
  {
    method: 'DELETE',
    path: '/causes',
    handler: deleteCausesProcessor,
  },

  // Consequences endpoints
  {
    method: 'POST',
    path: '/consequences',
    handler: createConsequenceProcessor,
  },
  {
    method: 'PUT',
    path: '/consequences/{id}',
    handler: updateConsequenceProcessor,
  },
  {
    method: 'DELETE',
    path: '/consequences',
    handler: deleteConsequencesProcessor,
  },

  // Controls endpoints
  {
    method: 'POST',
    path: '/controls',
    handler: createControlProcessor,
  },

  // Document assessment results endpoints
  {
    method: 'GET',
    path: '/document-assessment-results/latest-by-document/{documentId}',
    handler: getLatestDocumentAssessmentResultByDocumentProcessor,
  },

  // Form configurations endpoint
  {
    method: 'GET',
    path: '/form-configurations',
    handler: getFormConfigurationsProcessor,
  },

  // Impact ratings endpoints
  {
    method: 'GET',
    path: '/impact-ratings/oldest-active-by-risk/{riskId}',
    handler: getOldestActiveImpactRatingByRiskProcessor,
  },

  // Indicators endpoints
  {
    method: 'PUT',
    path: '/indicators/{id}',
    handler: updateIndicatorProcessor,
  },
  {
    method: 'DELETE',
    path: '/indicators',
    handler: deleteIndicatorsProcessor,
  },

  // Indicator results endpoints
  {
    method: 'GET',
    path: '/indicator-results/latest-by-indicator/{indicatorId}',
    handler: getLatestIndicatorResultByIndicatorProcessor,
  },
  {
    method: 'POST',
    path: '/indicator-results',
    handler: createIndicatorResultProcessor,
  },
  {
    method: 'PUT',
    path: '/indicator-results/{id}',
    handler: updateIndicatorResultProcessor,
  },
  {
    method: 'DELETE',
    path: '/indicator-results',
    handler: deleteIndicatorResultsProcessor,
  },

  // Issues endpoints
  {
    method: 'POST',
    path: '/issues',
    handler: createIssueProcessor,
  },
  {
    method: 'PUT',
    path: '/issues/{id}',
    handler: updateIssueProcessor,
  },
  {
    method: 'DELETE',
    path: '/issues',
    handler: deleteIssuesProcessor,
  },

  // Issue assessments endpoints
  {
    method: 'POST',
    path: '/issue-assessments',
    handler: createIssueAssessmentProcessor,
  },

  // Issue updates endpoints
  {
    method: 'POST',
    path: '/issue-updates',
    handler: createIssueUpdateProcessor,
  },
  {
    method: 'DELETE',
    path: '/issue-updates',
    handler: deleteIssueUpdatesProcessor,
  },

  // Obligations endpoints
  {
    method: 'POST',
    path: '/obligations',
    handler: createObligationProcessor,
  },

  // Obligation assessment results endpoints
  {
    method: 'GET',
    path: '/obligation-assessment-results/latest-by-obligation/{obligationId}',
    handler: getLatestObligationAssessmentResultByObligationProcessor,
  },

  // Obligation impacts endpoints
  {
    method: 'POST',
    path: '/obligation-impacts',
    handler: createObligationImpactProcessor,
  },
  {
    method: 'DELETE',
    path: '/obligation-impacts',
    handler: deleteObligationImpactsProcessor,
  },

  // Risk assessment results endpoints
  {
    method: 'GET',
    path: '/risk-assessment-results/latest-by-risk/{riskId}',
    handler: getLatestRiskAssessmentResultByRiskProcessor,
  },
  {
    method: 'POST',
    path: '/risk-assessment-results',
    handler: createRiskAssessmentResultProcessor,
  },

  // Risks endpoints
  {
    method: 'POST',
    path: '/risks',
    handler: createRiskProcessor,
  },
  {
    method: 'PUT',
    path: '/risks/{id}',
    handler: updateRiskProcessor,
  },
  {
    method: 'DELETE',
    path: '/risks/{id}',
    handler: deleteRiskProcessor,
  },

  // Test results endpoints
  {
    method: 'POST',
    path: '/test-results',
    handler: createControlTestResultProcessor,
  },
  {
    method: 'PUT',
    path: '/test-results/{id}',
    handler: updateTestResultProcessor,
  },
  {
    method: 'DELETE',
    path: '/test-results',
    handler: deleteTestResultsProcessor,
  },
  {
    method: 'GET',
    path: '/test-results/latest-by-control/{controlId}',
    handler: getLatestTestResultByControlProcessor,
  },

  // Schedule endpoints
  {
    method: 'GET',
    path: '/schedules/{id}',
    handler: getScheduleByIdProcessor,
  },

  // Schedule state endpoints
  {
    method: 'GET',
    path: '/schedule-states/{id}',
    handler: getScheduleStateByIdProcessor,
  },
  {
    method: 'PUT',
    path: '/schedule-states/{id}',
    handler: upsertScheduleStateProcessor,
  },

  // My items endpoints
  {
    method: 'GET',
    path: '/my-items/due-actions',
    handler: getMyDueActions,
  },
  {
    method: 'GET',
    path: '/my-items/due-assessments',
    handler: getMyDueAssessments,
  },
  {
    method: 'GET',
    path: '/my-items/due-assessment-activities',
    handler: getMyDueAssessmentActivities,
  },
  {
    method: 'GET',
    path: '/my-items/due-attestation-records',
    handler: getMyDueAttestationRecords,
  },
  {
    method: 'GET',
    path: '/my-items/due-change-requests',
    handler: getMyDueChangeRequests,
  },
  {
    method: 'GET',
    path: '/my-items/due-controls',
    handler: getMyDueControls,
  },
  {
    method: 'GET',
    path: '/my-items/due-documents',
    handler: getMyDueDocuments,
  },
  {
    method: 'GET',
    path: '/my-items/due-indicators',
    handler: getMyDueIndicators,
  },
  {
    method: 'GET',
    path: '/my-items/due-issues',
    handler: getMyDueIssues,
  },
  {
    method: 'GET',
    path: '/my-items/due-obligations',
    handler: getMyDueObligations,
  },
  {
    method: 'GET',
    path: '/my-items/due-risks',
    handler: getMyDueRisks,
  },

  // Form fields endpoints
  {
    method: 'POST',
    path: '/form-fields',
    handler: createFormFieldProcessor,
  },
  {
    method: 'PUT',
    path: '/form-fields',
    handler: updateFormFieldProcessor,
  },
  {
    method: 'DELETE',
    path: '/form-fields',
    handler: deleteFormFieldProcessor,
  },

  // Organisations endpoints
  {
    method: 'GET',
    path: '/organisations/{orgKey}',
    handler: getOrganisationByOrgKeyProcessor,
  },

  // SSO configurations endpoints
  {
    method: 'GET',
    path: '/sso-configurations',
    handler: getSsoConfigurationsProcessor,
  },
  {
    method: 'POST',
    path: '/sso-configurations',
    handler: createSsoConfigurationProcessor,
  },
  {
    method: 'DELETE',
    path: '/sso-configurations/{connectionId}',
    handler: deleteSsoConfigurationProcessor,
  },

  // User groups endpoints
  {
    method: 'GET',
    path: '/user-groups',
    handler: getUserGroupsWithApproversProcessor,
  },
  {
    method: 'GET',
    path: '/user-groups/{groupId}/users',
    handler: getUsersByGroupIdProcessor,
  },
  {
    method: 'GET',
    path: '/user-groups/{id}',
    handler: getUserGroupByIdProcessor,
  },
];

/**
 * Client API Lambda handler - entry point
 *
 * Serves frontend/user-initiated requests via tRPC and web application.
 * Uses middy http-router for request routing with standard middleware stack.
 */
export const handler = createHandler(routes);

// Export routes for testing
export { routes };
