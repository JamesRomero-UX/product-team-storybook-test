import {
  transformActionItem,
  transformActionListQueryResponse,
} from './actions/action.transformer';
import { transformClientsListQueryResponse } from './app-clients/app-client.transformer';
import {
  transformItem as transformAssessmentItem,
  transformListQueryResponse as transformAssessmentList,
} from './assessments/assessment.transformer';
import { transformLinkedItemListQueryResponse } from './common/linked-item.transformer';
import {
  transformItem as transformDepartmentGroupItem,
  transformListQueryResponse as transformDepartmentGroupList,
} from './department-groups/department-group.transformer';
import {
  transformItem as transformDepartmentItem,
  transformListQueryResponse as transformDepartmentList,
} from './departments/department.transformer';
import {
  transformItem as transformEnterpriseRiskItem,
  transformListQueryResponse as transformEnterpriseRiskList,
} from './enterprise-risks/enterprise-risk.transformer';
import {
  transformItem as transformImpactItem,
  transformListQueryResponse as transformImpactList,
} from './impacts/impact.transformer';
import {
  transformItem as transformIndicatorItem,
  transformListQueryResponse as transformIndicatorList,
  transformListQueryResponse as transformIndicatorListQueryResponse,
} from './indicators/indicator.transformer';
import {
  transformIndicatorResultItem,
  transformIndicatorResultListQueryResponse as transformIndicatorResultList,
} from './indicators/indicator-result.transformer';
import {
  transformCauseItem,
  transformCauseListQueryResponse as transformCauseList,
} from './issues/cause.transformer';
import {
  transformConsequenceItem,
  transformConsequenceListQueryResponse as transformConsequenceList,
} from './issues/consequence.transformer';
import {
  transformItem as transformIssueItem,
  transformListQueryResponse as transformIssueList,
} from './issues/issue.transform';
import { transformIssueAssessmentItem } from './issues/issue-assessment.transformer';
import {
  transformIssueUpdateItem,
  transformIssueUpdateListQueryResponse as transformIssueUpdateList,
} from './issues/issue-update.transformer';
import {
  transformItem as transformObligationItem,
  transformListQueryResponse as transformObligationList,
} from './obligations/obligation.transformer';
import {
  transformItem as transformPolicyItem,
  transformListQueryResponse as transformPolicyList,
} from './policies/policy.transform';
import {
  transformRiskAcceptanceItem,
  transformRiskAcceptanceList,
} from './risks/acceptance.transformer';
import {
  transformAppetiteByIdResponse as transformAppetiteItem,
  transformAppetiteListQueryResponse as transformAppetiteList,
} from './risks/appetite.transformer';
import {
  transformApprovalItem,
  transformApprovalList,
} from './risks/approval.transformer';
import {
  transformControlItem,
  transformControlListQueryResponse as transformControlList,
} from './risks/control.transformer';
import {
  transformRiskByIdResponse as transformRiskItem,
  transformRiskListQueryResponse as transformRiskList,
} from './risks/risk.transformer';
import {
  transformRatingsItemResponse as transformRiskRatingItem,
  transformRatingsListQueryResponse as transformRiskRatingList,
} from './risks/risk-rating.transformer';
import {
  transformItem as transformTagItem,
  transformListQueryResponse as transformTagList,
} from './tags/tag.transformer';
import {
  transformItem as transformThirdPartyItem,
  transformListQueryResponse as transformThirdPartyList,
} from './third-parties/third-party.transformer';
import {
  transformItem as transformUserGroupItem,
  transformListQueryResponse as transformUserGroupList,
} from './user-groups/user-group.transformer';
import {
  transformItem as transformUserItem,
  transformListQueryResponse as transformUserList,
} from './users/user.transformer';

export * from './types';

// Common transformers
export const commonTransformers = {
  transformLinkedItemList: transformLinkedItemListQueryResponse,
  transformActionList: transformActionListQueryResponse,
};

//App Client transformers
export const appClientTransformers = {
  transformAppClientList: transformClientsListQueryResponse,
};

// Controls transformers
export const controlsTransformers = {
  transformControlList,
  transformControlItem,
  transformLinkedItemList: transformLinkedItemListQueryResponse,
};

// Actions transformers
export const actionsTransformers = {
  transformActionItem,
  transformActionList: transformActionListQueryResponse,
  transformLinkedItemList: transformLinkedItemListQueryResponse,
};

// Assessments transformers
export const assessmentsTransformers = {
  transformAssessmentItem,
  transformAssessmentList,
};

// Enterprise Risks transformers
export const enterpriseRisksTransformers = {
  transformEnterpriseRiskItem,
  transformEnterpriseRiskList,
  transformRiskList: transformRiskList,
};

// Impacts transformers
export const impactsTransformers = {
  transformImpactItem,
  transformImpactList,
};

// Indicators transformers
export const indicatorsTransformers = {
  transformIndicatorItem,
  transformIndicatorList,
  transformLinkedItemList: transformLinkedItemListQueryResponse,
  transformIndicatorResultItem,
  transformIndicatorResultList,
};

// Issues transformers
export const issuesTransformers = {
  transformIssueItem,
  transformIssueList,
  transformLinkedItemList: transformLinkedItemListQueryResponse,
  transformCauseItem,
  transformCauseList,
  transformConsequenceItem,
  transformConsequenceList,
  transformIssueUpdateItem,
  transformIssueUpdateList,
  transformActionList: transformActionListQueryResponse,
  transformIssueAssessmentItem,
};

// Obligations transformers
export const obligationsTransformers = {
  transformObligationItem,
  transformObligationList,
  transformLinkedItemList: transformLinkedItemListQueryResponse,
};

// Policies transformers
export const policiesTransformers = {
  transformPolicyItem,
  transformPolicyList,
  transformLinkedItemList: transformLinkedItemListQueryResponse,
};

// Third Parties transformers
export const thirdPartiesTransformers = {
  transformThirdPartyItem,
  transformThirdPartyList,
  transformLinkedItemList: transformLinkedItemListQueryResponse,
};

// Risks transformers
export const risksTransformers = {
  transformRiskItem,
  transformRiskList,
  transformRiskRatingItem,
  transformRiskRatingList,
  transformLinkedItemList: transformLinkedItemListQueryResponse,
  transformControlList,
  transformActionList: transformActionListQueryResponse,
  transformIndicatorList: transformIndicatorListQueryResponse,
  transformAppetiteItem,
  transformAppetiteList,
  transformImpactList,
  transformRiskAcceptanceItem,
  transformRiskAcceptanceList,
  transformApprovalItem,
  transformApprovalList,
};

// Users transformers
export const usersTransformers = {
  transformUserItem,
  transformUserList,
};

// User Groups transformers
export const userGroupsTransformers = {
  transformUserGroupItem,
  transformUserGroupList,
};

// Departments transformers
export const departmentsTransformers = {
  transformDepartmentItem,
  transformDepartmentList,
};

// Department Groups transformers
export const departmentGroupsTransformers = {
  transformDepartmentGroupItem,
  transformDepartmentGroupList,
};

// Tags transformers
export const tagsTransformers = {
  transformTagItem,
  transformTagList,
};

export type CommonTransformers = typeof commonTransformers;
export type ControlsTransformers = typeof controlsTransformers;
export type ActionsTransformers = typeof actionsTransformers;
export type AssessmentsTransformers = typeof assessmentsTransformers;
export type EnterpriseRisksTransformers = typeof enterpriseRisksTransformers;
export type ImpactsTransformers = typeof impactsTransformers;
export type IndicatorsTransformers = typeof indicatorsTransformers;
export type IssuesTransformers = typeof issuesTransformers;
export type ObligationsTransformers = typeof obligationsTransformers;
export type PoliciesTransformers = typeof policiesTransformers;
export type ThirdPartiesTransformers = typeof thirdPartiesTransformers;
export type RisksTransformers = typeof risksTransformers;
export type UsersTransformers = typeof usersTransformers;
export type UserGroupsTransformers = typeof userGroupsTransformers;
export type DepartmentsTransformers = typeof departmentsTransformers;
export type DepartmentGroupsTransformers = typeof departmentGroupsTransformers;
export type TagsTransformers = typeof tagsTransformers;
