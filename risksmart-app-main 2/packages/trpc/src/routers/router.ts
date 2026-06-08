import { router } from '../init';
import { acceptanceRouter as backendAcceptanceRouter } from './backend/acceptance.router';
import { actionRouter as backendActionRouter } from './backend/action.router';
import { appetiteRouter as backendAppetiteRouter } from './backend/appetites.router';
import { approvalRouter as backendApprovalRouter } from './backend/approval.router';
import { assessmentRouter as backendAssessmentRouter } from './backend/assessment.router';
import { controlRouter as backendControlRouter } from './backend/control.router';
import { departmentGroupTypeRouter as backendDepartmentGroupTypeRouter } from './backend/department-group-type.router';
import { departmentTypeRouter as backendDepartmentTypeRouter } from './backend/department-type.router';
import { documentRouter as backendDocumentRouter } from './backend/document.router';
import { enterpriseRiskRouter as backendEnterpriseRiskRouter } from './backend/enterprise-risk.router';
import { formConfigurationRouter as backendFormConfigurationRouter } from './backend/form-configuration.router';
import { impactRouter as backendImpactRouter } from './backend/impact.router';
import { impactRatingRouter as backendImpactRatingRouter } from './backend/impact-rating.router';
import { indicatorRouter as backendIndicatorRouter } from './backend/indicator.router';
import { issueRouter as backendIssueRouter } from './backend/issue.router';
import { linkedItemRouter as backendLinkedItemRouter } from './backend/linked-item.router';
import { obligationRouter as backendObligationRouter } from './backend/obligation.router';
import { riskRouter as backendRiskRouter } from './backend/risk.router';
import { tagTypeRouter as backendTagTypeRouter } from './backend/tag-type.router';
import { thirdPartyRouter as backendThirdPartyRouter } from './backend/third-party.router';
import { userRouter as backendUserRouter } from './backend/user.router';
import { userGroupRouter as backendUserGroupRouter } from './backend/user-group.router';
import { acceptanceRouter } from './frontend/acceptance.router';
import { actionRouter } from './frontend/action.router';
import { aggregationRouter } from './frontend/aggregation.router';
import { aiFeedbackRouter } from './frontend/ai-feedback.router';
import { appetiteRouter } from './frontend/appetite.router';
import { approvalRouter } from './frontend/approval.router';
import { assessmentRouter } from './frontend/assessment.router';
import { attestationRouter } from './frontend/attestation.router';
import { attestationCycleRouter } from './frontend/attestation-cycle.router';
import { auditRouter } from './frontend/audit.router';
import { businessAreaRouter } from './frontend/business-area.router';
import { causeRouter } from './frontend/cause.router';
import { changeRequestRouter } from './frontend/change-request.router';
import { colourPaletteRouter } from './frontend/colour-palette.router';
import { consequenceRouter } from './frontend/consequence.router';
import { controlRouter } from './frontend/control.router';
import { controlGroupRouter } from './frontend/control-group.router';
import { dataExportRouter } from './frontend/data-export.router';
import { departmentRouter } from './frontend/department.router';
import { documentRouter } from './frontend/document.router';
import { documentFileRouter } from './frontend/document-file.router';
import { enterpriseRiskRouter } from './frontend/enterprise-risk.router';
import { entityRouter } from './frontend/entity.router';
import { formConfigurationRouter } from './frontend/form-configuration.router';
import { impactRouter } from './frontend/impact.router';
import { indicatorRouter } from './frontend/indicator.router';
import { ingestionConfigRouter } from './frontend/ingestion-config.router';
import { internalAuditEntityRouter } from './frontend/internal-audit-entity.router';
import { internalAuditReportRouter } from './frontend/internal-audit-report.router';
import { internalAuditResultRouter } from './frontend/internal-audit-result.router';
import { internalAuditTestResultRouter } from './frontend/internal-audit-test-result.router';
import { issueRouter } from './frontend/issue.router';
import { issueAssessmentRouter } from './frontend/issue-assessment.router';
import { issueUpdateRouter } from './frontend/issue-update.router';
import { issueUpdateAuditRouter } from './frontend/issue-update-audit.router';
import { linkedItemRouter } from './frontend/linked-item.router';
import { myItemsRouter } from './frontend/my-items.router';
import { notificationsRouter } from './frontend/notifications/router';
import { obligationRouter } from './frontend/obligation.router';
import { obligationChangeRouter } from './frontend/obligation-change.router';
import { obligationImpactRouter } from './frontend/obligation-impact.router';
import { organisationModuleRouter } from './frontend/organisation-module.router';
import { permissionRouter } from './frontend/permission.router';
import { questionnaireTemplateRouter } from './frontend/questionnaire-template.router';
import { questionnaireTemplateVersionRouter } from './frontend/questionnaire-template-version.router';
import { riskRouter } from './frontend/risk.router';
import { riskAssessmentResultRouter } from './frontend/risk-assessment-result.router';
import { riskAssessmentResultConfigAuditRouter } from './frontend/risk-assessment-result-config-audit.router';
import { riskAssessmentResultImpactAuditRouter } from './frontend/risk-assessment-result-impact-audit.router';
import { ssoConfigurationRouter } from './frontend/sso-configuration.router';
import { tagRouter } from './frontend/tag.router';
import { testResultRouter } from './frontend/test-result.router';
import { thirdPartyRouter } from './frontend/third-party.router';
import { thirdPartyContactRouter } from './frontend/third-party-contact.router';
import { userGroupRouter } from './frontend/user-group.router';

const backendV1Router = router({
  appetite: backendAppetiteRouter,
  risk: backendRiskRouter,
  control: backendControlRouter,
  action: backendActionRouter,
  issue: backendIssueRouter,
  document: backendDocumentRouter,
  obligation: backendObligationRouter,
  thirdParty: backendThirdPartyRouter,
  user: backendUserRouter,
  departmentType: backendDepartmentTypeRouter,
  departmentGroupType: backendDepartmentGroupTypeRouter,
  tagType: backendTagTypeRouter,
  indicator: backendIndicatorRouter,
  assessment: backendAssessmentRouter,
  enterpriseRisk: backendEnterpriseRiskRouter,
  formConfiguration: backendFormConfigurationRouter,
  impactRating: backendImpactRatingRouter,
  impact: backendImpactRouter,
  acceptance: backendAcceptanceRouter,
  approval: backendApprovalRouter,
  linkedItem: backendLinkedItemRouter,
  userGroup: backendUserGroupRouter,
});

const backendRouter = router({
  v1: backendV1Router,
});

export const appRouter = router({
  backend: backendRouter,
  frontend: {
    acceptance: acceptanceRouter,
    action: actionRouter,
    aggregation: aggregationRouter,
    aiFeedback: aiFeedbackRouter,
    appetite: appetiteRouter,
    approval: approvalRouter,
    assessment: assessmentRouter,
    attestation: attestationRouter,
    attestationCycle: attestationCycleRouter,
    audit: auditRouter,
    businessArea: businessAreaRouter,
    cause: causeRouter,
    changeRequest: changeRequestRouter,
    colourPalette: colourPaletteRouter,
    consequence: consequenceRouter,
    control: controlRouter,
    controlGroup: controlGroupRouter,
    dataExport: dataExportRouter,
    department: departmentRouter,
    document: documentRouter,
    documentFile: documentFileRouter,
    enterpriseRisk: enterpriseRiskRouter,
    entity: entityRouter,
    formConfiguration: formConfigurationRouter,
    impact: impactRouter,
    indicator: indicatorRouter,
    ingestionConfig: ingestionConfigRouter,
    internalAuditEntity: internalAuditEntityRouter,
    internalAuditReport: internalAuditReportRouter,
    internalAuditResult: internalAuditResultRouter,
    internalAuditTestResult: internalAuditTestResultRouter,
    issue: issueRouter,
    issueAssessment: issueAssessmentRouter,
    issueUpdate: issueUpdateRouter,
    issueUpdateAudit: issueUpdateAuditRouter,
    linkedItem: linkedItemRouter,
    myItems: myItemsRouter,
    notifications: notificationsRouter,
    obligation: obligationRouter,
    obligationChange: obligationChangeRouter,
    obligationImpact: obligationImpactRouter,
    organisationModule: organisationModuleRouter,
    permission: permissionRouter,
    questionnaireTemplate: questionnaireTemplateRouter,
    questionnaireTemplateVersion: questionnaireTemplateVersionRouter,
    risk: riskRouter,
    ssoConfiguration: ssoConfigurationRouter,
    riskAssessmentResult: riskAssessmentResultRouter,
    tag: tagRouter,
    testResult: testResultRouter,
    thirdParty: thirdPartyRouter,
    thirdPartyContact: thirdPartyContactRouter,
    riskAssessmentResultConfigAudit: riskAssessmentResultConfigAuditRouter,
    riskAssessmentResultImpactAudit: riskAssessmentResultImpactAuditRouter,
    userGroup: userGroupRouter,
  },
});

export type AppRouter = typeof appRouter;
