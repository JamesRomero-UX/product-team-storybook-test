import * as Sentry from '@sentry/aws-serverless';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';

import { monoLambdaBackendHandler } from '../../backendActionApiHandler';
import { getLogger } from '../../logger';
import {
  acceptanceDeleteHandler,
  acceptancePostHandler,
  acceptancePutHandler,
  actionDeleteHandler,
  actionPostHandler,
  actionPutHandler,
  appetitesPostHandler,
  approverResponsePutHandler,
  assessmentActivityPostHandler,
  assessmentActivityPutHandler,
  assessmentPostHandler,
  assessmentPutHandler,
  attestationConfigPostHandler,
  attestationCyclePostHandler,
  attestationNotRequiredPostHandler,
  attestationsPostHandler,
  changeRequestOverridePutHandler,
  complianceMonitoringAssessmentPostHandler,
  complianceMonitoringAssessmentPutHandler,
  controlDeleteHandler,
  controlPostHandler,
  controlPutHandler,
  customRolePostHandler,
  customRolePutHandler,
  customRoleUserPutHandler,
  dashboardPostHandler,
  dashboardPutHandler,
  departmentTypeDeleteHandler,
  documentDeleteHandler,
  documentPostHandler,
  documentPutHandler,
  documentVersionPostHandler,
  documentVersionPutHandler,
  enterpriseRiskDeleteHandler,
  enterpriseRiskInstantiateHandler,
  enterpriseRiskLinkHandler,
  enterpriseRiskPostHandler,
  enterpriseRiskPutHandler,
  entityDeleteHandler,
  entityPostHandler,
  entityPutHandler,
  formFieldDeleteHandler,
  formFieldPostHandler,
  formFieldPutHandler,
  impactPostHandler,
  impactPutHandler,
  indicatorPostHandler,
  indicatorPutHandler,
  ingestionConfigDeleteHandler,
  ingestionConfigPostHandler,
  ingestionConfigPutHandler,
  insertControlTestAssessmentResultPostHandler,
  insertControlTestInternalAuditResultPostHandler,
  insertControlTestSecondLineResultPostHandler,
  insertDocumentAssessmentResultPostHandler,
  insertDocumentInternalAuditResultPostHandler,
  insertDocumentSecondLineResultPostHandler,
  insertImpactRatingAssessmentResultPostHandler,
  insertImpactRatingInternalAuditResultPostHandler,
  insertImpactRatingSecondLineResultPostHandler,
  insertObligationAssessmentResultPostHandler,
  insertObligationInternalAuditResultPostHandler,
  insertObligationSecondLineResultPostHandler,
  insertReferenceUserHandler,
  insertRiskAssessmentResultPostHandler,
  insertRiskInternalAuditResultPostHandler,
  insertRiskSecondLineResultPostHandler,
  internalAuditPostHandler,
  internalAuditPutHandler,
  internalAuditReportPostHandler,
  internalAuditReportPutHandler,
  issueAssessmentPostHandler,
  issueAssessmentPutHandler,
  issueDeleteHandler,
  issuePostHandler,
  issuePutHandler,
  linkedItemDeleteHandler,
  linkedItemPostHandler,
  notificationPreferencesGetHandler,
  notificationPreferencesPostHandler,
  obligationChangeAttestationDeleteHandler,
  obligationChangeAttestationPostHandler,
  obligationPostHandler,
  obligationPutHandler,
  questionnaireInvitePostHandler,
  questionnaireTemplatePostHandler,
  questionnaireTemplatePutHandler,
  questionnaireTemplateVersionPutHandler,
  recalculateAllAppetitesPostHandler,
  recalculateAllRiskScoresPostHandler,
  riskAssessmentResultConfigPostHandler,
  riskAssessmentResultConfigPutHandler,
  riskDeleteHandler,
  riskPostHandler,
  riskPutHandler,
  rolesGetHandler,
  scheduleStateRefreshPostHandler,
  scimConfigGetHandler,
  scimDomainsDeleteHandler,
  scimDomainsPostHandler,
  scimTokensDeleteHandler,
  scimTokensPostHandler,
  slackDetailsGetHandler,
  slackDisconnectPostHandler,
  ssoConfigDeleteHandler,
  ssoConfigPostHandler,
  tagTypeDeleteHandler,
  testResultsPutHandler,
  thirdPartyContactPatchHandler,
  thirdPartyContactPostHandler,
  thirdPartyPostHandler,
  thirdPartyPutHandler,
  thirdPartyResponseUpdateStatusPatchHandler,
  updateControlTestInternalAuditResultPostHandler,
  updateControlTestSecondLineResultPostHandler,
  updateRiskAssessmentResultPutHandler,
  userGroupDeleteHandler,
  userPatchHandler,
  wizardDeleteHandler,
  wizardPostHandler,
  wizardPutHandler,
} from '../index';

type Methods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type Routes =
  | 'acceptance'
  | 'action'
  | 'aggregate/appetite/all'
  | 'aggregate/risk/all'
  | 'appetite'
  | 'approver-response'
  | 'assessment-activity'
  | 'assessment-impact-rating'
  | 'assessment-test-result'
  | 'assessment'
  | 'attest'
  | 'attestation-config'
  | 'attestation-cycle'
  | 'attestation/not-required'
  | 'change-request/override'
  | 'compliance-monitoring-assessment'
  | 'control-test-internal-audit-result'
  | 'control-test-second-line-result'
  | 'control'
  | 'custom-role'
  | 'custom-role-user'
  | 'dashboard'
  | 'data-export/one-off-export'
  | 'data-import/start-import'
  | 'data-import/validate'
  | 'department-type'
  | 'document-assessment-result'
  | 'document-internal-audit-result'
  | 'document-second-line-result'
  | 'document'
  | 'documentVersion'
  | 'enterprise-risk'
  | 'enterprise-risk/instantiate'
  | 'enterprise-risk/link'
  | 'entity'
  | 'form/field'
  | 'impact'
  | 'indicator'
  | 'ingestion-config'
  | 'internal-audit-impact-rating'
  | 'internal-audit-report'
  | 'internal-audit'
  | 'issue-assessment'
  | 'issue'
  | 'linked-item'
  | 'notification-preferences'
  | 'obligation-assessment-result'
  | 'obligation-change-attestation'
  | 'obligation-internal-audit-result'
  | 'obligation-second-line-result'
  | 'obligation'
  | 'questionnaire-template-version/publish'
  | 'questionnaire-template'
  | 'questionnaire/invite'
  | 'questionnaire/recall'
  | 'reference-user'
  | 'risk-assessment-result'
  | 'risk-assessment-result-config'
  | 'risk-internal-audit-result'
  | 'risk-second-line-result'
  | 'risk'
  | 'roles'
  | 'schedule/refresh'
  | 'scim/config'
  | 'scim/domains'
  | 'scim/tokens'
  | 'second-line-impact-rating'
  | 'slack/details'
  | 'slack/disconnect'
  | 'sso-configuration'
  | 'tag-type'
  | 'test-result'
  | 'third-party-response/handle-update-status'
  | 'third-party'
  | 'third-party-contact'
  | 'user-group'
  | 'user'
  | 'wizard';

type RouteFunction = (
  evt: APIGatewayProxyEventV2,
  context: Context
) => Promise<APIGatewayProxyStructuredResultV2>;

const logger = getLogger();

const routeHandlerMap: {
  [key in Methods]: { [key in Routes]?: RouteFunction };
} = {
  GET: {
    ['roles']: rolesGetHandler,
    ['notification-preferences']: notificationPreferencesGetHandler,
    ['slack/details']: slackDetailsGetHandler,
    ['scim/config']: scimConfigGetHandler,
  },
  POST: {
    ['form/field']: formFieldPostHandler,
    ['questionnaire-template']: questionnaireTemplatePostHandler,
    ['internal-audit-report']: internalAuditReportPostHandler,
    ['compliance-monitoring-assessment']:
      complianceMonitoringAssessmentPostHandler,
    ['assessment']: assessmentPostHandler,
    ['action']: actionPostHandler,
    ['acceptance']: acceptancePostHandler,
    ['aggregate/appetite/all']: recalculateAllAppetitesPostHandler,
    ['aggregate/risk/all']: recalculateAllRiskScoresPostHandler,
    ['appetite']: appetitesPostHandler,
    ['assessment-activity']: assessmentActivityPostHandler,
    ['assessment-impact-rating']: insertImpactRatingAssessmentResultPostHandler,
    ['attestation-config']: attestationConfigPostHandler,
    ['attestation-cycle']: attestationCyclePostHandler,
    ['attestation/not-required']: attestationNotRequiredPostHandler,
    ['internal-audit-impact-rating']:
      insertImpactRatingInternalAuditResultPostHandler,
    ['second-line-impact-rating']:
      insertImpactRatingSecondLineResultPostHandler,
    ['assessment-test-result']: insertControlTestAssessmentResultPostHandler,
    ['control-test-internal-audit-result']:
      insertControlTestInternalAuditResultPostHandler,
    ['control-test-second-line-result']:
      insertControlTestSecondLineResultPostHandler,
    ['custom-role']: customRolePostHandler,
    ['attest']: attestationsPostHandler,
    ['control']: controlPostHandler,
    ['dashboard']: dashboardPostHandler,
    ['documentVersion']: documentVersionPostHandler,
    ['document']: documentPostHandler,
    ['document-assessment-result']: insertDocumentAssessmentResultPostHandler,
    ['document-internal-audit-result']:
      insertDocumentInternalAuditResultPostHandler,
    ['document-second-line-result']: insertDocumentSecondLineResultPostHandler,
    ['enterprise-risk']: enterpriseRiskPostHandler,
    ['enterprise-risk/instantiate']: enterpriseRiskInstantiateHandler,
    ['enterprise-risk/link']: enterpriseRiskLinkHandler,
    ['entity']: entityPostHandler,
    ['indicator']: indicatorPostHandler,
    ['ingestion-config']: ingestionConfigPostHandler,
    ['internal-audit']: internalAuditPostHandler,
    ['impact']: impactPostHandler,
    ['issue']: issuePostHandler,
    ['issue-assessment']: issueAssessmentPostHandler,
    ['linked-item']: linkedItemPostHandler,
    ['notification-preferences']: notificationPreferencesPostHandler,
    ['reference-user']: insertReferenceUserHandler,
    ['risk']: riskPostHandler,
    ['third-party']: thirdPartyPostHandler,
    ['third-party-contact']: thirdPartyContactPostHandler,
    ['risk-assessment-result']: insertRiskAssessmentResultPostHandler,
    ['risk-assessment-result-config']: riskAssessmentResultConfigPostHandler,
    ['risk-internal-audit-result']: insertRiskInternalAuditResultPostHandler,
    ['risk-second-line-result']: insertRiskSecondLineResultPostHandler,
    ['slack/disconnect']: slackDisconnectPostHandler,
    ['scim/domains']: scimDomainsPostHandler,
    ['scim/tokens']: scimTokensPostHandler,
    ['obligation']: obligationPostHandler,
    ['obligation-assessment-result']:
      insertObligationAssessmentResultPostHandler,
    ['obligation-change-attestation']: obligationChangeAttestationPostHandler,
    ['obligation-internal-audit-result']:
      insertObligationInternalAuditResultPostHandler,
    ['obligation-second-line-result']:
      insertObligationSecondLineResultPostHandler,
    ['questionnaire/invite']: questionnaireInvitePostHandler,
    ['wizard']: wizardPostHandler,
    ['schedule/refresh']: scheduleStateRefreshPostHandler,
    ['sso-configuration']: ssoConfigPostHandler,
  },
  PUT: {
    ['form/field']: formFieldPutHandler,
    ['impact']: impactPutHandler,
    ['questionnaire-template']: questionnaireTemplatePutHandler,
    ['issue']: issuePutHandler,
    ['assessment']: assessmentPutHandler,
    ['internal-audit-report']: internalAuditReportPutHandler,
    ['compliance-monitoring-assessment']:
      complianceMonitoringAssessmentPutHandler,
    ['third-party']: thirdPartyPutHandler,
    ['action']: actionPutHandler,
    ['acceptance']: acceptancePutHandler,
    ['custom-role']: customRolePutHandler,
    ['custom-role-user']: customRoleUserPutHandler,
    ['approver-response']: approverResponsePutHandler,
    ['assessment-activity']: assessmentActivityPutHandler,
    ['control']: controlPutHandler,
    ['change-request/override']: changeRequestOverridePutHandler,
    ['dashboard']: dashboardPutHandler,
    ['document']: documentPutHandler,
    ['documentVersion']: documentVersionPutHandler,
    ['enterprise-risk']: enterpriseRiskPutHandler,
    ['entity']: entityPutHandler,
    ['indicator']: indicatorPutHandler,
    ['ingestion-config']: ingestionConfigPutHandler,
    ['issue-assessment']: issueAssessmentPutHandler,
    ['internal-audit']: internalAuditPutHandler,
    ['questionnaire-template-version/publish']:
      questionnaireTemplateVersionPutHandler,
    ['risk']: riskPutHandler,
    ['risk-assessment-result']: updateRiskAssessmentResultPutHandler,
    ['risk-assessment-result-config']: riskAssessmentResultConfigPutHandler,
    ['test-result']: testResultsPutHandler,
    ['control-test-internal-audit-result']:
      updateControlTestInternalAuditResultPostHandler,
    ['control-test-second-line-result']:
      updateControlTestSecondLineResultPostHandler,
    ['obligation']: obligationPutHandler,
    ['wizard']: wizardPutHandler,
  },
  PATCH: {
    ['third-party-contact']: thirdPartyContactPatchHandler,
    ['third-party-response/handle-update-status']:
      thirdPartyResponseUpdateStatusPatchHandler,
    ['user']: userPatchHandler,
  },
  DELETE: {
    ['tag-type']: tagTypeDeleteHandler,
    ['department-type']: departmentTypeDeleteHandler,
    ['action']: actionDeleteHandler,
    ['acceptance']: acceptanceDeleteHandler,
    ['control']: controlDeleteHandler,
    ['document']: documentDeleteHandler,
    ['enterprise-risk']: enterpriseRiskDeleteHandler,
    ['entity']: entityDeleteHandler,
    ['ingestion-config']: ingestionConfigDeleteHandler,
    ['issue']: issueDeleteHandler,
    ['linked-item']: linkedItemDeleteHandler,
    ['obligation-change-attestation']: obligationChangeAttestationDeleteHandler,
    ['risk']: riskDeleteHandler,
    ['scim/domains']: scimDomainsDeleteHandler,
    ['scim/tokens']: scimTokensDeleteHandler,
    ['user-group']: userGroupDeleteHandler,
    ['wizard']: wizardDeleteHandler,
    ['form/field']: formFieldDeleteHandler,
    ['sso-configuration']: ssoConfigDeleteHandler,
  },
};

const handleRequest = async (
  method: Methods,
  evt: APIGatewayProxyEventV2,
  context: Context
) => {
  const path = evt.pathParameters?.proxy;
  logger.info('Handling path', {
    path: path,
  });
  if (!path) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Not Found',
      }),
    };
  }

  const route = path as Routes;
  const func = routeHandlerMap[method][route];
  if (!func) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Not Found',
      }),
    };
  }

  const transactionName = `${method}-${route}`;
  logger.appendKeys({
    transactionName,
  });

  return await Sentry.withScope(async function (scope) {
    scope.setTransactionName(transactionName);
    scope.setTag('method', method);
    scope.setTag('path', route);
    try {
      return await func(evt, context);
    } catch (error) {
      // This only occurs if the error is entirely unhandled by the error handling middleware.
      logger.error('Error processing handler', error as Error);
      scope.captureException(error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unhandled error',
        }),
      };
    } finally {
      logger.resetKeys();
    }
  });
};

export const requestRouter = async (
  evt: APIGatewayProxyEventV2,
  context: Context
) => {
  logger.info('Handling method', {
    method: evt.requestContext.http.method,
  });
  switch (evt.requestContext.http.method) {
    case 'GET':
      return await handleRequest('GET', evt, context);
    case 'POST':
      return await handleRequest('POST', evt, context);
    case 'PUT':
      return await handleRequest('PUT', evt, context);
    case 'PATCH':
      return await handleRequest('PATCH', evt, context);
    case 'DELETE':
      return await handleRequest('DELETE', evt, context);
  }

  return {
    statusCode: 204,
  };
};

export const handler = monoLambdaBackendHandler(requestRouter);
