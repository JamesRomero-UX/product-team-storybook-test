import type { ParentType } from './parent-type';
import { ParentTypes } from './parent-type';

export const ParentIssueTypes = {
  Issue: ParentTypes.Issue,
  IssueBreachLog: ParentTypes.IssueBreachLog,
  IssueConsumerDuty: ParentTypes.IssueConsumerDuty,
  IssueCustomerTrust: ParentTypes.IssueCustomerTrust,
  IssueGdprBreachLog: ParentTypes.IssueGdprBreachLog,
  IssuePciBreachLog: ParentTypes.IssuePciBreachLog,
  IssueRiskEvent: ParentTypes.IssueRiskEvent,
  IssueSarLog: ParentTypes.IssueSarLog,
} as const;

export type ParentIssueType =
  (typeof ParentIssueTypes)[keyof typeof ParentIssueTypes];

export const issueAssessmentTypeMapping = {
  [ParentTypes.Issue]: ParentTypes.IssueAssessment,
  [ParentTypes.IssueBreachLog]: ParentTypes.IssueAssessmentBreachLog,
  [ParentTypes.IssueConsumerDuty]: ParentTypes.IssueAssessmentConsumerDuty,
  [ParentTypes.IssueCustomerTrust]: ParentTypes.IssueAssessmentCustomerTrust,
  [ParentTypes.IssueGdprBreachLog]: ParentTypes.IssueAssessmentGdprBreachLog,
  [ParentTypes.IssuePciBreachLog]: ParentTypes.IssueAssessmentPciBreachLog,
  [ParentTypes.IssueRiskEvent]: ParentTypes.IssueAssessmentRiskEvent,
  [ParentTypes.IssueSarLog]: ParentTypes.IssueAssessmentSarLog,
};

export function isParentIssueType(type: ParentType): type is ParentIssueType {
  return type != null && type in issueAssessmentTypeMapping;
}
