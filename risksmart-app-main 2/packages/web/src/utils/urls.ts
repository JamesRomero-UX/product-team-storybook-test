import type {
  TableOptions,
  TypedPropertyFilterQuery,
} from '@risksmart-app/components/src/table/tableUtils';
import { tableOptionsToQueryString } from '@risksmart-app/components/src/table/tableUtils';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ActionTableFields } from 'src/pages/actions/types';
import type { AssessmentRegisterFields } from 'src/pages/assessments/types';
import type { CauseRegisterFields } from 'src/pages/causes/types';
import type { ObligationTableFields } from 'src/pages/compliance/obligations/types';
import type { ConsequenceRegisterFields } from 'src/pages/consequences/types';
import type { ControlTableFields } from 'src/pages/controls/types';
import type { EnterpriseRiskRegisterFields } from 'src/pages/enterprise-risk/types';
import type { IssueRegisterFields } from 'src/pages/issues/types';
import type { DocumentFileTableFields } from 'src/pages/policy/public/types';
import type { AttestationRegisterFields } from 'src/pages/policy/update/tabs/files/update/tabs/attestations/types';
import type { RiskRegisterFields } from 'src/pages/risks/types';
import type { EntityRegisterFields } from 'src/pages/settings/tabs/entities/types';

import type { AcceptanceTableFields } from '../pages/acceptances/types';
import type { ControlTestTableFields } from '../pages/controls/control-tests/types';
import type { IndicatorTableFields } from '../pages/indicators/types';
import type { InternalAuditRegisterFields } from '../pages/internal-audit/types';
import type { PolicyRegisterFields } from '../pages/policy/types';
import type { QuestionnaireTemplateRegisterFields } from '../pages/questionnaire-templates/types';
import type { ChangeRequestRegisterFields } from '../pages/requests/types';
import type { ThirdPartyRegisterFields } from '../pages/third-party/types';

export const slackCallbackUrl = () => '/slack-callback';
export const addRiskUrl = () => '/risks/add';
export const riskDetailsUrl = (riskId: string) => `/risks/${riskId}`;
export const circleInfoSheetsUrl = (infoSheet: string) =>
  `https://community.risksmart.com/c/r-briefs/${infoSheet}`;

export const riskRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<RiskRegisterFields>
    | undefined = undefined
) =>
  `/risks${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const thirdPartyRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<ThirdPartyRegisterFields>
    | undefined = undefined
) =>
  `/third-party${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const addThirdPartyUrl = () => '/third-party/add';

export const thirdPartyDetailsUrl = (id: string) => `/third-party/${id}`;
export const thirdPartyQuestionnairesUrl = (id: string) =>
  `/third-party/${id}/questionnaire-responses`;

const questionnaireTemplates = 'third-party/questionnaire';
export const questionnaireTemplateRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<QuestionnaireTemplateRegisterFields>
    | undefined = undefined
) =>
  `/${questionnaireTemplates}${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const addQuestionnaireTemplateUrl = () =>
  `${questionnaireTemplateRegisterUrl()}/add`;

export const createQuestionnaireInviteUrl = (thirdPartyId: string) => {
  return thirdPartyDetailsUrl(thirdPartyId) + '/questionnaire-responses/invite';
};
export const questionnaireTemplateDetailsUrl = (id: string) =>
  `${questionnaireTemplateRegisterUrl()}/${id}`;
export const questionnaireTemplateVersionsUrl = (id: string) =>
  `${questionnaireTemplateRegisterUrl()}/${id}/versions`;
export const questionnaireTemplateVersionCreateUrl = (id: string) =>
  `${questionnaireTemplateRegisterUrl()}/${id}/versions/create`;
export const questionnaireResponseDetailsUrl = (
  id: string,
  thirdPartyId?: string
) =>
  thirdPartyId
    ? thirdPartyDetailsUrl(thirdPartyId) + '/questionnaire-responses/' + id
    : `/third-party/questionnaire-responses/${id}`;

export const issueRegisterUrl = (
  options: TableOptions<IssueRegisterFields> | undefined = undefined
) => `/issues${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const issueRiskEventRegisterUrl = (
  options: TableOptions<IssueRegisterFields> | undefined = undefined
) => `/risk-events${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const issueBreachLogRegisterUrl = (
  options: TableOptions<IssueRegisterFields> | undefined = undefined
) => `/breach-log${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const issueConsumerDutyRegisterUrl = (
  options: TableOptions<IssueRegisterFields> | undefined = undefined
) => `/consumer-duty${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const issueCustomerTrustRegisterUrl = (
  options: TableOptions<IssueRegisterFields> | undefined = undefined
) =>
  `/customer-trust${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const issueGDPRBreachLogRegisterUrl = (
  options: TableOptions<IssueRegisterFields> | undefined = undefined
) =>
  `/gdpr-breach-log${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const issuePCIBreachLogRegisterUrl = (
  options: TableOptions<IssueRegisterFields> | undefined = undefined
) =>
  `/pci-breach-log${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const issueSARLogRegisterUrl = (
  options: TableOptions<IssueRegisterFields> | undefined = undefined
) => `/sar-log${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const consequencesRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<ConsequenceRegisterFields>
    | undefined = undefined
) =>
  `/consequences${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const causesRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<CauseRegisterFields>
    | undefined = undefined
) =>
  `/causes${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const requestsRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<ChangeRequestRegisterFields>
    | undefined = undefined
) =>
  `/requests${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const acceptanceRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<AcceptanceTableFields>
    | undefined = undefined
) =>
  `/acceptances${filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''}`;

export const acceptanceDetailUrl = (acceptanceId: string) =>
  `/acceptances/${acceptanceId}`;

export const issueDetailsUrl = (issueId: string) => `/issues/${issueId}`;
export const issueAssessmentDetailsUrl = (issueId: string) =>
  `/issues/${issueId}/assessment`;

export const issueRiskEventDetailsUrl = (issueId: string) =>
  `/risk-events/${issueId}`;
export const issueRiskEventAssessmentDetailsUrl = (issueId: string) =>
  `/risk-events/${issueId}/assessment`;

export const issueConsumerDutyDetailsUrl = (issueId: string) =>
  `/consumer-duty/${issueId}`;
export const issueConsumerDutyAssessmentDetailsUrl = (issueId: string) =>
  `/consumer-duty/${issueId}/assessment`;

export const issueCustomerTrustDetailsUrl = (issueId: string) =>
  `/customer-trust/${issueId}`;
export const issueCustomerTrustAssessmentDetailsUrl = (issueId: string) =>
  `/customer-trust/${issueId}/assessment`;

export const issueGDPRBreachLogDetailsUrl = (issueId: string) =>
  `/gdpr-breach-log/${issueId}`;
export const issueGDPRBreachLogAssessmentDetailsUrl = (issueId: string) =>
  `/gdpr-breach-log/${issueId}/assessment`;

export const issuePCIBreachLogDetailsUrl = (issueId: string) =>
  `/pci-breach-log/${issueId}`;
export const issuePCIBreachLogAssessmentDetailsUrl = (issueId: string) =>
  `/pci-breach-log/${issueId}/assessment`;

export const issueSARLogDetailsUrl = (issueId: string) => `/sar-log/${issueId}`;
export const issueSARLogAssessmentDetailsUrl = (issueId: string) =>
  `/sar-log/${issueId}/assessment`;

export const issueBreachLogDetailsUrl = (issueId: string) =>
  `/breach-log/${issueId}`;
export const issueBreachLogAssessmentDetailsUrl = (issueId: string) =>
  `/breach-log/${issueId}/assessment`;

export const controlRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<ControlTableFields>
    | undefined = undefined
) =>
  `/controls${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const controlTestsRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<ControlTestTableFields>
    | undefined = undefined
) =>
  `/controls/tests${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const actionRegisterUrl = (
  filtering: TypedPropertyFilterQuery<ActionTableFields> | undefined = undefined
) =>
  `/actions${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

const assessments = 'assessments';
export const assessmentRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<AssessmentRegisterFields>
    | undefined = undefined
) =>
  `/${assessments}${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const assessmentResultsRegisterUrl = () => `/${assessments}/findings`;
export const assessmentActivitiesRegisterPageUrl = () =>
  `/${assessments}/activities`;
export const assessmentAddUrl = () => `/${assessments}/add`;
export const assessmentDetailsUrl = (assessmentId: string) =>
  `${assessmentRegisterUrl()}/${assessmentId}`;
export const assessmentResultsUrl = (assessmentId?: string) =>
  `${assessmentRegisterUrl()}/${assessmentId}/findings`;
export const assessmentResultsAddUrl = (assessmentId?: string) =>
  `${assessmentRegisterUrl()}/${assessmentId}/findings/add`;
export const assessmentResultsEditUrl = (
  assessmentId?: string,
  assessmentResultId?: string
) =>
  `${assessmentRegisterUrl()}/${assessmentId}/findings/${assessmentResultId}`;

export const assessmentLinkedItemsUrl = (assessmentId: string) =>
  `${assessmentRegisterUrl()}/${assessmentId}/linked-items`;
export const assessmentActivitiesRegisterUrl = (assessmentId: string) =>
  `${assessmentRegisterUrl()}/${assessmentId}/activities`;
export const addAssessmentActivityUrl = (assessmentId: string) =>
  `${assessmentRegisterUrl()}/${assessmentId}/activities/add-activity`;
export const addAssessmentRCSAActivityUrl = (assessmentId: string) =>
  `${assessmentRegisterUrl()}/${assessmentId}/activities/add-rcsa`;
export const assessmentActivitiesDetailsUrl = (
  assessmentId: string,
  activityId: string
) =>
  `${assessmentRegisterUrl()}/${assessmentId}/activities/${activityId}/activity`;
export const assessmentRCSADetailsUrl = (
  assessmentId: string,
  activityId: string
) => `${assessmentRegisterUrl()}/${assessmentId}/activities/${activityId}/rcsa`;

const internalAudit = 'internal-audits';
export const internalAuditRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<InternalAuditRegisterFields>
    | undefined = undefined
) =>
  `/${internalAudit}${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;
export const internalAuditDashboardUrl = () => `/${internalAudit}/universe`;

export const internalAuditAddUrl = () => `/${internalAudit}/add`;
export const internalAuditDetailsUrl = (internalAuditId: string) =>
  `${internalAuditRegisterUrl()}/${internalAuditId}`;

const internalAuditReport = `${internalAudit}/reports`;
export const internalAuditReportRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<AssessmentRegisterFields>
    | undefined = undefined
) =>
  `/${internalAuditReport}${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const internalAuditReportResultsRegisterUrl = () =>
  `/${internalAuditReport}/findings`;
export const internalAuditReportAddUrl = () => `/${internalAuditReport}/add`;
export const internalAuditReportDetailsUrl = (internalAuditReportId: string) =>
  `${internalAuditReportRegisterUrl()}/${internalAuditReportId}`;
export const internalAuditReportResultsUrl = (internalAuditReportId?: string) =>
  `${internalAuditReportRegisterUrl()}/${internalAuditReportId}/findings`;
export const internalAuditReportResultsAddUrl = (
  internalAuditReportId?: string
) =>
  `${internalAuditReportRegisterUrl()}/${internalAuditReportId}/findings/add`;
export const internalAuditReportResultsEditUrl = (
  internalAuditReportId?: string,
  internalAuditReportResultId?: string
) =>
  `${internalAuditReportRegisterUrl()}/${internalAuditReportId}/findings/${internalAuditReportResultId}`;

export const internalAuditReportLinkedItemsUrl = (
  internalAuditReportId: string
) =>
  `${internalAuditReportRegisterUrl()}/${internalAuditReportId}/linked-items`;
export const internalAuditReportActivitiesRegisterUrl = (
  internalAuditReportId: string
) => `${internalAuditReportRegisterUrl()}/${internalAuditReportId}/activities`;
export const addInternalAuditActivityUrl = (internalAuditReportId: string) =>
  `${internalAuditReportRegisterUrl()}/${internalAuditReportId}/activities/add`;
export const internalAuditReportActivitiesDetailsUrl = (
  internalAuditReportId: string,
  activityId: string
) =>
  `${internalAuditReportRegisterUrl()}/${internalAuditReportId}/activities/${activityId}`;

const complianceMonitoringAssessment = 'compliance/monitoring-assessments';
export const complianceMonitoringAssessmentRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<AssessmentRegisterFields>
    | undefined = undefined
) =>
  `/${complianceMonitoringAssessment}${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const complianceMonitoringAssessmentResultsRegisterUrl = () =>
  `/${complianceMonitoringAssessment}/findings`;
export const complianceMonitoringAssessmentAddUrl = () =>
  `/${complianceMonitoringAssessment}/add`;
export const complianceMonitoringAssessmentDetailsUrl = (
  complianceMonitoringAssessmentId: string
) =>
  `${complianceMonitoringAssessmentRegisterUrl()}/${complianceMonitoringAssessmentId}`;
export const complianceMonitoringAssessmentResultsUrl = (
  complianceMonitoringAssessmentId?: string
) =>
  `${complianceMonitoringAssessmentRegisterUrl()}/${complianceMonitoringAssessmentId}/findings`;
export const complianceMonitoringAssessmentResultsAddUrl = (
  complianceMonitoringAssessmentId?: string
) =>
  `${complianceMonitoringAssessmentRegisterUrl()}/${complianceMonitoringAssessmentId}/findings/add`;
export const complianceMonitoringAssessmentResultsEditUrl = (
  complianceMonitoringAssessmentId?: string,
  complianceMonitoringAssessmentResultId?: string
) =>
  `${complianceMonitoringAssessmentRegisterUrl()}/${complianceMonitoringAssessmentId}/findings/${complianceMonitoringAssessmentResultId}`;

export const complianceMonitoringAssessmentLinkedItemsUrl = (
  complianceMonitoringAssessmentId: string
) =>
  `${complianceMonitoringAssessmentRegisterUrl()}/${complianceMonitoringAssessmentId}/linked-items`;
export const complianceMonitoringAssessmentActivitiesRegisterUrl = (
  complianceMonitoringAssessmentId: string
) =>
  `${complianceMonitoringAssessmentRegisterUrl()}/${complianceMonitoringAssessmentId}/activities`;
export const addComplianceMonitoringAssessmentActivityUrl = (
  complianceMonitoringAssessmentId: string
) =>
  `${complianceMonitoringAssessmentRegisterUrl()}/${complianceMonitoringAssessmentId}/activities/add`;
export const complianceMonitoringAssessmentActivitiesDetailsUrl = (
  complianceMonitoringAssessmentId: string,
  activityId: string
) =>
  `${complianceMonitoringAssessmentRegisterUrl()}/${complianceMonitoringAssessmentId}/activities/${activityId}`;

export const controlDetailsUrl = (
  controlId: string,
  parentId?: string,
  parentType?: null | Parent_Type_Enum
) => {
  switch (parentType) {
    case Parent_Type_Enum.Risk:
      return `${riskDetailsUrl(parentId!)}/controls/${controlId}`;
    case Parent_Type_Enum.Obligation:
      return `${obligationDetailsUrl(parentId!)}/controls/${controlId}`;
    default:
      return `/controls/${controlId}`;
  }
};
export const controlGroupDetailsUrl = (controlGroupId: string) =>
  `/control-groups/${controlGroupId}`;
export const obligationRegister = (
  filtering:
    | TypedPropertyFilterQuery<ObligationTableFields>
    | undefined = undefined
) =>
  `/compliance${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const addObligationUrl = (type?: string) =>
  `/compliance/obligation${type ? `?type=${type}` : ''}`;
export const obligationDetailsUrl = (obligationId: string) =>
  `/compliance/obligation/${obligationId}`;

export const obligationChangesRegisterUrl = () =>
  '/compliance/obligation-changes';

export const obligationChangeDetailsUrl = (obligationChangeId: string) =>
  `/compliance/obligation-changes/${obligationChangeId}`;

export const reportAnIssueUrl = () => '/report-an-issue';
export const reportAnIssueSuccessUrl = (sequentialId: string) =>
  `/issue-reported/${sequentialId}`;
export const reportAnIssueRiskEventSuccessUrl = (sequentialId: string) =>
  `/risk-event-reported/${sequentialId}`;
export const reportAnIssueBreachSuccessUrl = (sequentialId: string) =>
  `/breach-reported/${sequentialId}`;
export const reportAnIssueConsumerDutySuccessUrl = (sequentialId: string) =>
  `/consumer-duty-reported/${sequentialId}`;
export const reportAnIssueCustomerTrustSuccessUrl = (sequentialId: string) =>
  `/customer-trust-reported/${sequentialId}`;
export const reportAnIssueGDPRBreachSuccessUrl = (sequentialId: string) =>
  `/gdpr-breach-reported/${sequentialId}`;
export const reportAnIssuePCIBreachSuccessUrl = (sequentialId: string) =>
  `/pci-breach-reported/${sequentialId}`;
export const reportAnIssueSARSuccessUrl = (sequentialId: string) =>
  `/sar-reported/${sequentialId}`;
export const logoutUrl = () => '/logout';
export const loginUrl = () => '/login';
export const actionDetailsUrl = (actionId: string) => `/actions/${actionId}`;
export const accessDeniedUrl = () => '/access-denied';

export const riskDashboardUrl = () => '/risks/dashboard';
export const dashboardUrl = () => '/';

export const policyRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<PolicyRegisterFields>
    | undefined = undefined
) =>
  `/policy${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const attestationRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<AttestationRegisterFields>
    | undefined = undefined
) =>
  `/policy/attestations${
    filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''
  }`;

export const attestationCardsUrl = (userId: string) =>
  `/policy/attestations/user/${userId}`;

export const addPolicyUrl = () => '/policy/add';
export const policyDetailsUrl = (documentId: string) => `/policy/${documentId}`;
export const policyFilesUrl = (documentId: string) =>
  `/policy/${documentId}/files`;
export const policyFileUrl = (documentId: string, fileId?: string) =>
  `/policy/${documentId}/files/${fileId ?? 'latest'}`;

export const publicPolicyFileUrl = (documentId: string, fileId?: string) =>
  `/public-policies/${documentId}/files/${fileId ?? 'latest'}`;
export const policyFileDetailsUrl = (documentId: string, fileId: string) =>
  `/policy/${documentId}/files/update/${fileId}`;

export const policyFileDetailsAttestationsUrl = (
  documentId: string,
  fileId: string
) => `/policy/${documentId}/files/update/${fileId}/attestations`;

export const policyFileAttestationDetailsUrl = (
  documentId: string,
  fileId: string
) => `${policyFileDetailsUrl(documentId, fileId)}`;

export const publicPoliciesUrl = (
  options: TableOptions<DocumentFileTableFields> | undefined = undefined
) =>
  `/public-policies${options ? '#' + tableOptionsToQueryString(options) : ''}`;
export const indicatorDetailsUrl = (indicatorId: string) =>
  `/indicator/${indicatorId}`;
export const indicatorRegisterUrl = (
  options: TableOptions<IndicatorTableFields> | undefined = undefined
) => `/indicator${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const complianceDashboardUrl = () => '/compliance/dashboard';
export const settingsUrl = () => '/settings';
export const settingsGroupsUrl = () => '/settings/groups';

export const settingsEditUserGroupsUrl = (groupId: string) =>
  `/settings/groups/${groupId}/details`;

export const settingsCustomRolesUrl = () => '/settings/custom-roles';
export const settingsEditCustomRoleUrl = (roleId: string) =>
  `/settings/custom-roles/${roleId}/details`;

export const customDatasourcesUrl = () => '/custom-datasources';

export const addCustomDatasourceUrl = () => `${customDatasourcesUrl()}/add`;
export const customDatasourceUrl = (
  customDatasourceId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: TableOptions<any> | undefined = undefined
) =>
  `${customDatasourcesUrl()}/${customDatasourceId}${options ? '#' + tableOptionsToQueryString(options) : ''}`;

export const editCustomDatasourceUrl = (customDatasourceId: string) =>
  `${customDatasourceUrl(customDatasourceId)}/edit`;
export const homeUrl = () => {
  return '/';
};

export const auditItemSearch = (objectId: string) =>
  `/settings/audit#fo=and&k0=Id&o0=%3D&v0=${objectId}`;
export const impactsUrl = () => '/impacts';
export const impactRatingsUrl = () => `${impactsUrl()}/ratings`;

export const impactDetailsUrl = (impactId: string) => `/impacts/${impactId}`;
export const impactDetailRatingUrl = (impactId: string) =>
  `${impactDetailsUrl(impactId)}/rating`;

export const appetiteDetailsUrl = (appetiteId: string) =>
  `/appetites/${appetiteId}`;

export const consequenceDetailsUrl = (
  issueId: string,
  _consequenceId: string
) => `${issueDetailsUrl(issueId)}/consequences`;

export const causeDetailsUrl = (issueId: string, _causeId: string) =>
  `${issueDetailsUrl(issueId)}/causes`;

export const dataImportUrl = () => `/settings/data-import`;

export const dataImportResultsUrl = (dataImportId: string) =>
  `${dataImportUrl()}/${dataImportId}/results`;

export const enterpriseRiskUrl = '/enterprise-risks';

export const enterpriseRiskRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<EnterpriseRiskRegisterFields>
    | undefined = undefined
) => `${enterpriseRiskUrl}#${tableOptionsToQueryString({ filtering })}`;

export const enterpriseRiskDashboardUrl = () =>
  `${enterpriseRiskUrl}/dashboard`;

export const enterpriseRiskDetailsUrl = (riskId: string) =>
  `${enterpriseRiskUrl}/${riskId}`;

export const enterpriseRiskRiskRegisterUrl = (riskId: string) =>
  `${enterpriseRiskDetailsUrl(riskId)}/risks`;

export const addEnterpriseRiskUrl = () => `${enterpriseRiskUrl}/add`;

export const entityUrl = `${settingsUrl()}/entities`;

export const entityRegisterUrl = (
  filtering:
    | TypedPropertyFilterQuery<EntityRegisterFields>
    | undefined = undefined
) =>
  `${entityUrl}${filtering ? '#' + tableOptionsToQueryString({ filtering: filtering }) : ''}`;

export const addEntityUrl = () => `${entityUrl}/add`;

export const entityDetailsUrl = (entityId: string) =>
  `${entityUrl}/${entityId}`;

export const notificationHistoryUrl = () => '/settings/notifications';

export const automationsUrl = () => '/automations';
