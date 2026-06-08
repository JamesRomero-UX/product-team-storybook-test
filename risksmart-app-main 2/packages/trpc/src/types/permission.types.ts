import type { ParentType } from '@risksmart-app/domain/src/types/consts/parent-type';
import { ParentTypes } from '@risksmart-app/domain/src/types/consts/parent-type';

export const NAVIGATION_PARENT_TYPES: Partial<Record<ParentType, ParentType>> =
  {
    [ParentTypes.InternalAuditEntity]: ParentTypes.InternalAuditEntity,
    [ParentTypes.InternalAuditReport]: ParentTypes.InternalAuditReport,
    [ParentTypes.Risk]: ParentTypes.Risk,
    [ParentTypes.Appetite]: ParentTypes.Risk,
    [ParentTypes.Acceptance]: ParentTypes.Risk,
    [ParentTypes.Document]: ParentTypes.Document,
    [ParentTypes.Obligation]: ParentTypes.Obligation,
    [ParentTypes.ComplianceMonitoringAssessment]:
      ParentTypes.ComplianceMonitoringAssessment,
    [ParentTypes.ThirdParty]: ParentTypes.ThirdParty,
    [ParentTypes.Issue]: ParentTypes.Issue,
    [ParentTypes.IssueRiskEvent]: ParentTypes.Issue,
    [ParentTypes.IssueBreachLog]: ParentTypes.Issue,
    [ParentTypes.IssueGdprBreachLog]: ParentTypes.Issue,
    [ParentTypes.IssuePciBreachLog]: ParentTypes.Issue,
    [ParentTypes.IssueSarLog]: ParentTypes.Issue,
    [ParentTypes.IssueConsumerDuty]: ParentTypes.Issue,
    [ParentTypes.IssueCustomerTrust]: ParentTypes.Issue,
    [ParentTypes.Indicator]: ParentTypes.Indicator,
    [ParentTypes.Assessment]: ParentTypes.Assessment,
    [ParentTypes.EnterpriseRisk]: ParentTypes.Risk,
    [ParentTypes.Control]: ParentTypes.Control,
    [ParentTypes.Action]: ParentTypes.Action,
    [ParentTypes.ControlGroup]: ParentTypes.ControlGroup,
    [ParentTypes.AttestationRecord]: ParentTypes.Document,
    [ParentTypes.RiskControlledInternalAuditResult]:
      ParentTypes.InternalAuditEntity,
    [ParentTypes.RiskUncontrolledInternalAuditResult]:
      ParentTypes.InternalAuditEntity,
    [ParentTypes.DocumentInternalAuditResult]: ParentTypes.InternalAuditEntity,
    [ParentTypes.ObligationInternalAuditResult]:
      ParentTypes.InternalAuditEntity,
    [ParentTypes.UncontrolledRiskAssessmentResult]:
      ParentTypes.InternalAuditEntity,
    [ParentTypes.QuestionnaireTemplate]: ParentTypes.ThirdParty,
    [ParentTypes.ThirdPartyResponse]: ParentTypes.ThirdParty,
    [ParentTypes.TestResult]: ParentTypes.Control,
    [ParentTypes.Cause]: ParentTypes.Issue,
    [ParentTypes.Consequence]: ParentTypes.Issue,
    [ParentTypes.AssessmentActivity]: ParentTypes.Assessment,
    [ParentTypes.RiskAssessmentResult]: ParentTypes.Assessment,
    [ParentTypes.DocumentAssessmentResult]: ParentTypes.Assessment,
    [ParentTypes.ObligationAssessmentResult]: ParentTypes.Assessment,
    [ParentTypes.CustomDatasource]: ParentTypes.CustomDatasource,
    [ParentTypes.Impact]: ParentTypes.Impact,
    [ParentTypes.ImpactRating]: ParentTypes.Impact,
    [ParentTypes.ObligationChange]: ParentTypes.ObligationChange,
  };
