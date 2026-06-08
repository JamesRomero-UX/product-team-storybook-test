import type {
  AcceptancesService,
  ActionService,
  AggregationService,
  AiFeedbackService,
  AppetiteService,
  ApprovalService,
  AssessmentService,
  AuditService,
  BusinessAreaService,
  CauseService,
  ChangeRequestService,
  ColourPaletteService,
  ConsequenceService,
  ControlService,
  DataExportService,
  DepartmentService,
  EnterpriseRiskService,
  EntityService,
  FormConfigurationService,
  ImpactService,
  IndicatorService,
  IngestionConfigService,
  InternalAuditService,
  IssueAssessmentService,
  IssueService,
  IssueUpdateAuditService,
  IssueUpdateService,
  LinkedItemService,
  MyItemsService,
  ObligationChangeService,
  ObligationImpactService,
  ObligationService,
  OrganisationModuleService,
  PermissionService,
  PolicyService,
  QuestionnaireTemplateService,
  QuestionnaireTemplateVersionService,
  RiskAssessmentResultConfigAuditService,
  RiskAssessmentResultImpactAuditService,
  RiskService,
  SsoConfigurationService,
  TagService,
  TestResultService,
  ThirdPartyContactService,
  ThirdPartyService,
  UserGroupService,
} from '../service.types';
import { AcceptancesServiceImpl } from './acceptance.service';
import { ActionServiceImpl } from './action.service';
import { AggregationServiceImpl } from './aggregation.service';
import { AiFeedbackServiceImpl } from './ai-feedback.service';
import { AppetiteServiceImpl } from './appetite.service';
import { ApprovalServiceImpl } from './approval.service';
import { AssessmentServiceImpl } from './assessment.service';
import { AuditServiceImpl } from './audit.service';
import { BusinessAreaServiceImpl } from './business-area.service';
import { CauseServiceImpl } from './cause.service';
import { ChangeRequestServiceImpl } from './change-request.service';
import { ColourPaletteServiceImpl } from './colour-palette.service';
import { ConsequenceServiceImpl } from './consequence.service';
import { ControlServiceImpl } from './control.service';
import { DataExportServiceImpl } from './data-export.service';
import { DepartmentServiceImpl } from './department.service';
import { EnterpriseRiskServiceImpl } from './enterprise-risk.service';
import { EntityServiceImpl } from './entity.service';
import { FormConfigurationServiceImpl } from './form-configuration.service';
import { ImpactServiceImpl } from './impact.service';
import { IndicatorServiceImpl } from './indicator.service';
import { IngestionConfigServiceImpl } from './ingestion-config.service';
import { InternalAuditServiceImpl } from './internal-audit.service';
import { IssueServiceImpl } from './issue.service';
import { IssueAssessmentServiceImpl } from './issue-assessment.service';
import { IssueUpdateServiceImpl } from './issue-update.service';
import { IssueUpdateAuditServiceImpl } from './issue-update-audit.service';
import { LinkedItemServiceImpl } from './linked-item.service';
import { MyItemsServiceImpl } from './my-items.service';
import { ObligationServiceImpl } from './obligation.service';
import { ObligationChangeServiceImpl } from './obligation-change.service';
import { ObligationImpactServiceImpl } from './obligation-impact.service';
import { OrganisationModuleServiceImpl } from './organisation-module.service';
import { PermissionServiceImpl } from './permission.service';
import { PolicyServiceImpl } from './policy.service';
import { QuestionnaireTemplateServiceImpl } from './questionnaire-template.service';
import { QuestionnaireTemplateVersionServiceImpl } from './questionnaire-template-version.service';
import { RiskServiceImpl } from './risk.service';
import { RiskAssessmentResultServiceImpl } from './risk-assessment-result.service';
import { RiskAssessmentResultConfigAuditServiceImpl } from './risk-assessment-result-config-audit.service';
import { RiskAssessmentResultImpactAuditServiceImpl } from './risk-assessment-result-impact-audit.service';
import { SsoConfigurationServiceImpl } from './sso-configuration.service';
import { TagServiceImpl } from './tag.service';
import { TestResultServiceImpl } from './test-result.service';
import { ThirdPartyServiceImpl } from './third-party.service';
import { ThirdPartyContactServiceImpl } from './third-party-contact.service';
import { UserGroupServiceImpl } from './user-group.service';

export function createRiskService(): RiskService {
  return new RiskServiceImpl();
}
export function createEnterpriseRiskService(): EnterpriseRiskService {
  return new EnterpriseRiskServiceImpl();
}
export function createControlService(): ControlService {
  return new ControlServiceImpl();
}
export function createIndicatorService(): IndicatorService {
  return new IndicatorServiceImpl();
}
export function createPolicyService(): PolicyService {
  return new PolicyServiceImpl();
}
export function createIssueService(): IssueService {
  return new IssueServiceImpl();
}
export function createIssueAssessmentService(): IssueAssessmentService {
  return new IssueAssessmentServiceImpl();
}
export function createIssueUpdateService(): IssueUpdateService {
  return new IssueUpdateServiceImpl();
}
export function createIssueUpdateAuditService(): IssueUpdateAuditService {
  return new IssueUpdateAuditServiceImpl();
}
export function createActionService(): ActionService {
  return new ActionServiceImpl();
}
export function createBusinessAreaService(): BusinessAreaService {
  return new BusinessAreaServiceImpl();
}
export function createCauseService(): CauseService {
  return new CauseServiceImpl();
}
export function createChangeRequestService(): ChangeRequestService {
  return new ChangeRequestServiceImpl();
}
export function createConsequenceService(): ConsequenceService {
  return new ConsequenceServiceImpl();
}
export function createThirdPartyService(): ThirdPartyService {
  return new ThirdPartyServiceImpl();
}
export function createObligationService(): ObligationService {
  return new ObligationServiceImpl();
}
export function createObligationChangeService(): ObligationChangeService {
  return new ObligationChangeServiceImpl();
}
export function createObligationImpactService(): ObligationImpactService {
  return new ObligationImpactServiceImpl();
}
export function createOrganisationModuleService(): OrganisationModuleService {
  return new OrganisationModuleServiceImpl();
}
export function createInternalAuditService(): InternalAuditService {
  return new InternalAuditServiceImpl();
}
export function createAssessmentService(): AssessmentService {
  return new AssessmentServiceImpl();
}
export function createTagService(): TagService {
  return new TagServiceImpl();
}
export function createDepartmentService(): DepartmentService {
  return new DepartmentServiceImpl();
}
export function createPermissionService(): PermissionService {
  return new PermissionServiceImpl();
}
export function createDataExportService(): DataExportService {
  return new DataExportServiceImpl();
}
export function createLinkedItemService(): LinkedItemService {
  return new LinkedItemServiceImpl();
}
export function createQuestionnaireTemplateService(): QuestionnaireTemplateService {
  return new QuestionnaireTemplateServiceImpl();
}
export function createQuestionnaireTemplateVersionService(): QuestionnaireTemplateVersionService {
  return new QuestionnaireTemplateVersionServiceImpl();
}
export function createAcceptancesService(): AcceptancesService {
  return new AcceptancesServiceImpl();
}
export function createAuditService(): AuditService {
  return new AuditServiceImpl();
}
export function createColourPaletteService(): ColourPaletteService {
  return new ColourPaletteServiceImpl();
}

export function createTestResultService(): TestResultService {
  return new TestResultServiceImpl();
}

export function createEntityService(): EntityService {
  return new EntityServiceImpl();
}
export function createApprovalService(): ApprovalService {
  return new ApprovalServiceImpl();
}

export function createAggregationService(): AggregationService {
  return new AggregationServiceImpl();
}

export function createImpactService(): ImpactService {
  return new ImpactServiceImpl();
}

export function createIngestionConfigService(): IngestionConfigService {
  return new IngestionConfigServiceImpl();
}

export function createAppetiteService(): AppetiteService {
  return new AppetiteServiceImpl();
}

export function createRiskAssessmentResultService() {
  return new RiskAssessmentResultServiceImpl();
}

export function createRiskAssessmentResultConfigAuditService(): RiskAssessmentResultConfigAuditService {
  return new RiskAssessmentResultConfigAuditServiceImpl();
}

export function createRiskAssessmentResultImpactAuditService(): RiskAssessmentResultImpactAuditService {
  return new RiskAssessmentResultImpactAuditServiceImpl();
}

export function createThirdPartyContactService(): ThirdPartyContactService {
  return new ThirdPartyContactServiceImpl();
}

export function createFormConfigurationService(): FormConfigurationService {
  return new FormConfigurationServiceImpl();
}

export function createAiFeedbackService(): AiFeedbackService {
  return new AiFeedbackServiceImpl();
}

export function createUserGroupService(): UserGroupService {
  return new UserGroupServiceImpl();
}

export function createMyItemsService(): MyItemsService {
  return new MyItemsServiceImpl();
}

export function createSsoConfigurationService(): SsoConfigurationService {
  return new SsoConfigurationServiceImpl();
}
