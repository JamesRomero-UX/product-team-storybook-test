// Consolidated resource schemas export
// All schemas are organized by domain and exported as a single object
import {
  ActionItemResponseSchema,
  ActionListResponseSchema,
} from './actions/action.schema';
import {
  AssessmentItemResponseSchema,
  AssessmentListResponseSchema,
} from './assessments/assessment.schema';
import {
  customAttributeDataSchema,
  CustomAttributesResponseCompactSchema,
  CustomAttributesResponseExpandedSchema,
  PropertiesSchema,
  ResourceSchemaResponseSchema,
} from './common/custom-fields.schema';
import {
  ErrorResponseSchema,
  ForbiddenResponseSchema,
  InternalServerErrorResponseSchema,
  NotFoundResponseSchema,
  ValidationErrorResponseSchema,
} from './common/error-response.schema';
import { LinkedItemListSchema } from './common/linked-item.schema';
import {
  DepartmentGroupItemResponseSchema,
  DepartmentGroupListResponseSchema,
} from './department-groups/department-group.schema';
import {
  DepartmentItemResponseSchema,
  DepartmentListResponseSchema,
} from './departments/department.schema';
import {
  EnterpriseRiskItemResponseSchema,
  EnterpriseRiskListResponseSchema,
} from './enterprise-risks/enterprise-risk.schema';
import {
  ImpactItemResponseSchema,
  ImpactListResponseSchema,
} from './impacts/impact.schema';
import {
  IndicatorItemResponseSchema,
  IndicatorListResponseSchema,
} from './indicators/indicator.schema';
import {
  IndicatorResultItemResponseSchema,
  IndicatorResultListResponseSchema,
} from './indicators/indicator-result.schema';
import {
  CauseItemResponseSchema,
  CauseListResponseSchema,
} from './issues/cause.schema';
import {
  ConsequenceItemResponseSchema,
  ConsequenceListResponseSchema,
} from './issues/consequence.schema';
import {
  IssueItemResponseSchema,
  IssueListResponseSchema,
} from './issues/issue.schema';
import { IssueAssessmentResponseSchema } from './issues/issue-assessment.schema';
import {
  IssueUpdateItemResponseSchema,
  IssueUpdateListResponseSchema,
} from './issues/issue-update.schema';
import {
  ObligationItemResponseSchema,
  ObligationListResponseSchema,
} from './obligations/obligation.schema';
import {
  PolicyItemResponseSchema,
  PolicyListResponseSchema,
} from './policies/policy.schema';
import {
  AcceptanceItemResponseSchema,
  AcceptanceListResponseSchema,
} from './risks/acceptance.schema';
import {
  AppetiteItemResponseSchema,
  AppetiteListResponseSchema,
} from './risks/appetite.schema';
import {
  ApprovalItemSchema,
  ApprovalListSchema,
} from './risks/approval.schema';
import {
  ControlItemResponseSchema,
  ControlListResponseSchema,
} from './risks/control.schema';
import {
  RiskListItemSchema,
  RiskListSchema,
  RiskRatingItemSchema,
  RiskRatingListSchema,
  RiskSchema,
} from './risks/risk.schema';
import { createBaseListResponse } from './route-query.schema';
import {
  TagItemResponseSchema,
  TagListResponseSchema,
} from './tags/tag.schema';
import {
  ThirdPartyItemResponseSchema,
  ThirdPartyListResponseSchema,
} from './third-parties/third-party.schema';
import {
  UserGroupItemResponseSchema,
  UserGroupListResponseSchema,
} from './user-groups/user-group.schema';
import {
  UserItemResponseSchema,
  UserListResponseSchema,
} from './users/user.schema';

export const resourceSchemas = {
  AcceptanceItemResponseSchema,
  AcceptanceListResponseSchema,
  ActionItemResponseSchema,
  ActionListResponseSchema,
  AppetiteItemResponseSchema,
  AppetiteListResponseSchema,
  ApprovalItemSchema,
  ApprovalListSchema,
  AssessmentItemResponseSchema,
  AssessmentListResponseSchema,
  CauseItemResponseSchema,
  CauseListResponseSchema,
  ConsequenceItemResponseSchema,
  ConsequenceListResponseSchema,
  ControlItemResponseSchema,
  ControlListResponseSchema,
  customAttributeDataSchema,
  CustomAttributesResponseCompactSchema,
  CustomAttributesResponseExpandedSchema,
  EnterpriseRiskItemResponseSchema,
  EnterpriseRiskListResponseSchema,
  ErrorResponseSchema,
  ForbiddenResponseSchema,
  InternalServerErrorResponseSchema,
  NotFoundResponseSchema,
  ValidationErrorResponseSchema,
  ImpactItemResponseSchema,
  ImpactListResponseSchema,
  IndicatorItemResponseSchema,
  IndicatorListResponseSchema,
  IndicatorResultItemResponseSchema,
  IndicatorResultListResponseSchema,
  IssueItemResponseSchema,
  IssueListResponseSchema,
  IssueAssessmentResponseSchema,
  IssueUpdateItemResponseSchema,
  IssueUpdateListResponseSchema,
  LinkedItemListSchema,
  ObligationItemResponseSchema,
  ObligationListResponseSchema,
  PolicyItemResponseSchema,
  PolicyListResponseSchema,
  PropertiesSchema,
  ResourceSchemaResponseSchema,
  RiskListItemSchema,
  RiskListSchema,
  RiskRatingItemSchema,
  RiskRatingListSchema,
  RiskSchema,
  createBaseListResponse,
  ThirdPartyItemResponseSchema,
  ThirdPartyListResponseSchema,
  UserItemResponseSchema,
  UserListResponseSchema,
  UserGroupItemResponseSchema,
  UserGroupListResponseSchema,
  DepartmentItemResponseSchema,
  DepartmentListResponseSchema,
  DepartmentGroupItemResponseSchema,
  DepartmentGroupListResponseSchema,
  TagItemResponseSchema,
  TagListResponseSchema,
};
