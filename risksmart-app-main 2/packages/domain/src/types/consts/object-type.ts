import { ParentTypes } from './parent-type';

/**
 * Object Types
 *
 * Object types have triggers that maintain entries in the risksmart.node table
 * These are the basis for the Risksmart object hierarchy and relationships
 *
 * These are the core domain objects that:
 * 1. Have an entry in risksmart.node table
 * 2. Have triggers to maintain the node table
 * 3. Are a subset of ParentType, see parent-type.ts for all ParentTypes
 */
export const ObjectTypes = {
  /** Acceptance */
  Acceptance: ParentTypes.Acceptance,
  /** Action */
  Action: ParentTypes.Action,
  /** Action Update */
  ActionUpdate: ParentTypes.ActionUpdate,
  /** Appetite */
  Appetite: ParentTypes.Appetite,
  /** Approval result */
  ApprovalResult: ParentTypes.ApprovalResult,
  /** Assessment */
  Assessment: ParentTypes.Assessment,
  /** Assessment Activity */
  AssessmentActivity: ParentTypes.AssessmentActivity,
  /** Cause */
  Cause: ParentTypes.Cause,
  /** Compliance Monitoring Assessment */
  ComplianceMonitoringAssessment: ParentTypes.ComplianceMonitoringAssessment,
  /** Consequence */
  Consequence: ParentTypes.Consequence,
  /** Control */
  Control: ParentTypes.Control,
  /** Control Group */
  ControlGroup: ParentTypes.ControlGroup,
  /** Conversation */
  Conversation: ParentTypes.Conversation,
  /** Dashboard */
  Dashboard: ParentTypes.Dashboard,
  /** Department Type */
  DepartmentType: ParentTypes.DepartmentType,
  /** Document */
  Document: ParentTypes.Document,
  /** Document Assessment */
  DocumentAssessment: ParentTypes.DocumentAssessment,
  /** Document Assessment Result */
  DocumentAssessmentResult: ParentTypes.DocumentAssessmentResult,
  /** Document version */
  DocumentFile: ParentTypes.DocumentFile,
  /** Enterprise Risk */
  EnterpriseRisk: ParentTypes.EnterpriseRisk,
  /** Entity */
  Entity: ParentTypes.Entity,
  /** Impact */
  Impact: ParentTypes.Impact,
  /** Indicator */
  Indicator: ParentTypes.Indicator,
  /** Indicator Result */
  IndicatorResult: ParentTypes.IndicatorResult,
  /** Internal Audit */
  InternalAuditEntity: ParentTypes.InternalAuditEntity,
  /** Internal Audit Report */
  InternalAuditReport: ParentTypes.InternalAuditReport,
  /** Issue */
  Issue: ParentTypes.Issue,
  /** Issue Assessment */
  IssueAssessment: ParentTypes.IssueAssessment,
  /** Issue Update */
  IssueUpdate: ParentTypes.IssueUpdate,
  /** Obligation */
  Obligation: ParentTypes.Obligation,
  /** Obligation Assessment */
  ObligationAssessment: ParentTypes.ObligationAssessment,
  /** Obligation Assessment Result */
  ObligationAssessmentResult: ParentTypes.ObligationAssessmentResult,
  /** Obligation Impact */
  ObligationImpact: ParentTypes.ObligationImpact,
  /** Questionnaire Template */
  QuestionnaireTemplate: ParentTypes.QuestionnaireTemplate,
  /** Questionnaire Template Version */
  QuestionnaireTemplateVersion: ParentTypes.QuestionnaireTemplateVersion,
  /** Risk */
  Risk: ParentTypes.Risk,
  /** Risk assessment */
  RiskAssessment: ParentTypes.RiskAssessment,
  /** Risk Assessment Result */
  RiskAssessmentResult: ParentTypes.RiskAssessmentResult,
  /** Tag type */
  TagType: ParentTypes.TagType,
  /** Test Result */
  TestResult: ParentTypes.TestResult,
  /** Third Party */
  ThirdParty: ParentTypes.ThirdParty,
  /** Third Party Response */
  ThirdPartyResponse: ParentTypes.ThirdPartyResponse,
} as const;

/**
 * ObjectType - Union type of all object types that exist in risksmart.node table
 */
export type ObjectType = (typeof ObjectTypes)[keyof typeof ObjectTypes];

/**
 * Type guard to check if a ParentType is an ObjectType
 * @param parentType - The parent type to check
 * @returns true if the parent type is an object type (has node_insert_trigger)
 */
export function isObjectType(parentType: string): parentType is ObjectType {
  // Array.includes is typed as (searchElement: T) — TypeScript won't accept a supertype (string) without
  // the assertion. The assertion is safe here because this function's purpose is to perform the runtime check.
  return Object.values(ObjectTypes).includes(parentType as ObjectType);
}
