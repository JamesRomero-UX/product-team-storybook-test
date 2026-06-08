import type { AcceptanceListResponseRow } from './acceptance.types';
import type { ActionListResponseRow } from './action.types';
import type { AppetiteListResponseRow } from './appetite.types';
import type { ApprovalListResponseRow } from './approval.types';
import type { AssessmentListResponseRow } from './assessment.types';
import type { RiskAssessmentResultRow } from './assessment-result.types';
import type { CauseListResponseRow } from './cause.types';
import type { ConsequenceListResponseRow } from './consequence.types';
import type { ControlListResponseRow } from './control.types';
import type { DepartmentGroupTypeListResponseRow } from './department-group-type.types';
import type { DepartmentTypeListResponseRow } from './department-type.types';
import type { DocumentListResponseRow } from './document.types';
import type { EnterpriseRiskListResponseRow } from './enterprise-risk.types';
import type { ImpactResponseRow } from './impact.types';
import type { ImpactRatingResponseRow } from './impact-rating.types';
import type { IndicatorListResponseRow } from './indicator.types';
import type { IndicatorResultListResponseRow } from './indicator-result.types';
import type { IssueListResponseRow } from './issue.types';
import type { IssueUpdateListResponseRow } from './issue-update.types';
import type { LinkedItemListResponseRow } from './linked-item.types';
import type { ObligationListResponseRow } from './obligation.types';
import type { RiskListResponseRow } from './risk.types';
import type { TagTypeListResponseRow } from './tag-type.types';
import type { ThirdPartyListResponseRow } from './third-party.types';
import type { UserListResponseRow } from './user.types';
import type { UserGroupListResponseRow } from './user-group.types';

export interface AcceptanceListResponse {
  acceptance: AcceptanceListResponseRow[];
  pageMetadata: PageMeta;
}
export interface RiskAssessmentResultListResponse {
  riskAssessmentResult: RiskAssessmentResultRow[];
  pageMetadata: CompoundPageMeta;
}
export interface ImpactListResponse {
  impact: ImpactResponseRow[];
  pageMetadata: PageMeta;
}

export interface ImpactRatingsListResponse {
  impactRating: ImpactRatingResponseRow[];
  pageMetadata: PageMeta;
}
export interface ActionListResponse {
  action: ActionListResponseRow[];
  pageMetadata: PageMeta;
}

export interface AssessmentListResponse {
  assessment: AssessmentListResponseRow[];
  pageMetadata: PageMeta;
}

export interface ControlListResponse {
  control: ControlListResponseRow[];
  pageMetadata: PageMeta;
}

export interface DocumentListResponse {
  document: DocumentListResponseRow[];
  pageMetadata: PageMeta;
}

export interface IndicatorListResponse {
  indicator: IndicatorListResponseRow[];
  pageMetadata: PageMeta;
}

export interface IndicatorResultListResponse {
  indicatorResult: IndicatorResultListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface AppetiteListResponse {
  appetite: AppetiteListResponseRow[];
  pageMetadata: PageMeta;
}

export interface ApprovalListResponse {
  approval: ApprovalListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface IssueListResponse {
  issue: IssueListResponseRow[];
  pageMetadata: PageMeta;
}

export interface CauseListResponse {
  cause: CauseListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface ConsequenceListResponse {
  consequence: ConsequenceListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface IssueUpdateListResponse {
  update: IssueUpdateListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface LinkedItemListResponse {
  linkedItem: LinkedItemListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface ObligationListResponse {
  obligation: ObligationListResponseRow[];
  pageMetadata: PageMeta;
}

export interface RiskListResponse {
  risk: RiskListResponseRow[];
  pageMetadata: PageMeta;
}

export interface ThirdPartyListResponse {
  thirdParty: ThirdPartyListResponseRow[];
  pageMetadata: PageMeta;
}

export interface UserListResponse {
  user: UserListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface UserGroupListResponse {
  userGroup: UserGroupListResponseRow[];
  pageMetadata: CompoundPageMeta;
}
export interface DepartmentTypeListResponse {
  departmentType: DepartmentTypeListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface DepartmentGroupTypeListResponse {
  departmentGroupType: DepartmentGroupTypeListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface EnterpriseRiskListResponse {
  enterpriseRisk: EnterpriseRiskListResponseRow[];
  pageMetadata: PageMeta;
}

export interface TagTypeListResponse {
  tagType: TagTypeListResponseRow[];
  pageMetadata: CompoundPageMeta;
}

export interface PageMeta {
  nextId: number | string | null;
  prevId: number | string | null;
  hasNext: boolean;
  hasPrev: boolean;
  count: number;
}

export interface CompoundPageMeta {
  nextId: string | null;
  nextDateTime: string | null;
  prevId: string | null;
  prevDateTime: string | null;
  hasNext: boolean;
  hasPrev: boolean;
  count: number;
}
