import type { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import type { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import type { AppetiteType } from '@risksmart-app/domain/src/types/consts/appetite-type';
import type { AssessmentStatus } from '@risksmart-app/domain/src/types/consts/assessment-status';
import type { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import type { ControlType } from '@risksmart-app/domain/src/types/consts/control-type';
import type { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import type { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import type { IssueAssessmentStatus } from '@risksmart-app/domain/src/types/consts/issue-assessment-status';
import type { ObligationType } from '@risksmart-app/domain/src/types/consts/obligation-type';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts/parent-issue-type';
import type { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/risk-assessment-result-control-type';
import type { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import type { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import type { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import type { TestType } from '@risksmart-app/domain/src/types/consts/test-type';
import type { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';

// ---------------------------------------------------------------------------
// Shared field types
// ---------------------------------------------------------------------------

export interface ScheduleFields {
  Frequency?: TestFrequency | null;
  ManualDueDate?: string | null;
  StartDate?: string | null;
  TimeToCompleteUnit?: UnitOfTime | null;
  TimeToCompleteValue?: number | null;
}

export interface ScheduleStateFields {
  DueDate?: string | null;
  OverdueDate?: string | null;
  LatestDate?: string | null;
}

export interface RelationshipFields {
  OwnerUserIds?: string[] | null;
  OwnerGroupIds?: string[] | null;
  ContributorUserIds?: string[] | null;
  ContributorGroupIds?: string[] | null;
  TagTypeIds?: string[] | null;
  DepartmentTypeIds?: string[] | null;
}

// ---------------------------------------------------------------------------
// Acceptance
// ---------------------------------------------------------------------------

interface AcceptanceFields {
  DateAcceptedFrom: string;
  DateAcceptedTo: string;
  Title: string;
  Details: string;
  Status: AcceptanceStatus;
  ApprovedByUser?: string | null;
  ApprovedByUserGroup?: string | null;
  RequestedByUser?: string | null;
  RequestedByUserGroup?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface CreateAcceptanceRequest extends AcceptanceFields {
  ParentId: string;
}

export interface UpdateAcceptanceRequest extends AcceptanceFields {
  Id: string;
}

export interface DeleteAcceptancesRequest {
  Ids: string[];
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

interface ActionFields extends RelationshipFields {
  Title: string;
  DateDue: string;
  DateRaised: string;
  Status: ActionStatus;
  Priority?: number | null;
  Description?: string | null;
  ClosedDate?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface CreateActionRequest extends ActionFields {
  ParentId?: string | null;
}

export interface CreateActionUpdateRequest {
  Description: string;
  ParentActionId: string;
  Title: string;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface DeleteActionUpdatesRequest {
  Ids: string[];
}

// ---------------------------------------------------------------------------
// Appetite
// ---------------------------------------------------------------------------

interface AppetiteFields {
  AppetiteType: AppetiteType;
  Statement?: string | null;
  EffectiveDate?: string | null;
  LowerAppetite?: number | null;
  UpperAppetite?: number | null;
  ImpactAppetite?: number | null;
  LikelihoodAppetite?: number | null;
  ImpactId?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface CreateAppetiteRequest extends AppetiteFields {
  ParentIds: string[];
}

export interface UpdateAppetiteRequest extends AppetiteFields {
  Id: string;
}

export interface DeleteAppetitesRequest {
  Ids: string[];
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

interface AssessmentFields extends RelationshipFields {
  Title: string;
  Summary?: string | null;
  ActualCompletionDate?: string | null;
  NextTestDate?: string | null;
  StartDate?: string | null;
  TargetCompletionDate?: string | null;
  CompletedByUser?: string | null;
  Status: AssessmentStatus;
  Outcome?: number | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface CreateAssessmentRequest extends AssessmentFields {
  OriginatingItemId?: string | null;
}

export interface UpdateAssessmentRequest extends AssessmentFields {
  Id: string;
}

export interface DeleteAssessmentRequest {
  Id: string;
}

// ---------------------------------------------------------------------------
// Control
// ---------------------------------------------------------------------------

interface ControlFields extends RelationshipFields {
  Title: string;
  Description?: string | null;
  Type?: ControlType | null;
  CustomAttributeData?: Record<string, unknown> | null;
  Schedule?: ScheduleFields | null;
}

export interface CreateControlRequest extends ControlFields {
  ParentId?: string | null;
  ScheduleState?: ScheduleStateFields | null;
}

export interface CreateControlGroupRequest {
  Title: string;
  Description: string;
  Owner: string;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface DeleteControlGroupRequest {
  OriginalTimestamp: string;
}

export interface CreateControlTestResultRequest {
  ControlIds: string[];
  AssessmentId?: string | null;
  Description?: string | null;
  DesignEffectiveness?: number | null;
  OverallEffectiveness?: number | null;
  PerformanceEffectiveness?: number | null;
  Submitter?: string | null;
  TestDate?: string | null;
  TestType?: TestType | null;
  Title?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Issue
// ---------------------------------------------------------------------------

interface IssueFields extends RelationshipFields {
  Title: string;
  Details?: string | null;
  ImpactsCustomer?: boolean | null;
  IsExternalIssue?: boolean | null;
  DateOccurred: string;
  DateIdentified: string;
  Type: ParentIssueType;
  CustomAttributeData?: Record<string, unknown> | null;
  Meta?: Record<string, unknown> | null;
}

export interface CreateIssueRequest extends IssueFields {
  ParentId?: string | null;
}

export interface UpdateIssueRequest extends IssueFields {
  Id: string;
  OriginalTimestamp: string;
}

interface IssueAssessmentFields {
  Severity?: number | null;
  Status?: IssueAssessmentStatus | null;
  CertifiedIndividual?: string | null;
  IssueType?: string | null;
  ActualCloseDate?: string | null;
  TargetCloseDate?: string | null;
  PolicyOwnerCommentary?: string | null;
  PolicyOwner?: string | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  PolicyBreach?: boolean | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Reportable?: boolean | null;
  PoliciesBreached?: string | null;
  Rationale?: string | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IssueCausedByThirdParty?: boolean | null;
  SystemResponsible?: string | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  RegulatoryBreach?: boolean | null;
  RegulationsBreached?: string | null;
  ThirdPartyResponsible?: string | null;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IssueCausedBySystemIssue?: boolean | null;
  CustomAttributeData?: Record<string, unknown> | null;
  TagTypeIds?: string[] | null;
  DepartmentTypeIds?: string[] | null;
  RegulationsBreachedIds?: string[] | null;
  AssociatedControlIds?: string[] | null;
  PoliciesBreachedIds?: string[] | null;
}

export interface CreateIssueAssessmentRequest extends IssueAssessmentFields {
  ParentIssueId: string;
}

export interface CreateIssueUpdateRequest {
  Description: string;
  ParentIssueId: string;
  Title: string;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface DeleteIssuesRequest {
  Ids: string[];
}

export interface DeleteIssueUpdatesRequest {
  Ids: string[];
}

// ---------------------------------------------------------------------------
// Cause
// ---------------------------------------------------------------------------

interface CauseFields {
  Title: string;
  Description: string;
  Significance?: number | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface CreateCauseRequest extends CauseFields {
  ParentIssueId: string;
}

export interface UpdateCauseRequest extends CauseFields {
  Id: string;
  ParentIssueId: string;
  OriginalTimestamp: string;
}

export interface DeleteCausesRequest {
  Ids: string[];
}

// ---------------------------------------------------------------------------
// Consequence
// ---------------------------------------------------------------------------

interface ConsequenceFields {
  Title: string;
  Description: string;
  Criticality?: number | null;
  CostType: CostType;
  CostValue: number;
  Type?: ConsequenceType | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface CreateConsequenceRequest extends ConsequenceFields {
  ParentIssueId: string;
}

export interface UpdateConsequenceRequest extends ConsequenceFields {
  Id: string;
  ParentIssueId: string;
  OriginalTimestamp: string;
}

export interface DeleteConsequencesRequest {
  Ids: string[];
}

// ---------------------------------------------------------------------------
// Indicator
// ---------------------------------------------------------------------------

interface IndicatorFields extends RelationshipFields {
  Title: string;
  Type: IndicatorType;
  Description?: string | null;
  Unit?: string | null;
  UpperToleranceNum?: number | null;
  LowerToleranceNum?: number | null;
  TargetValueTxt?: string | null;
  UpperAppetiteNum?: number | null;
  LowerAppetiteNum?: number | null;
  CustomAttributeData?: Record<string, unknown> | null;
  Schedule?: ScheduleFields | null;
}

export interface UpdateIndicatorRequest extends IndicatorFields {
  Id: string;
}

export interface CreateIndicatorResultRequest {
  Description?: string | null;
  IndicatorId: string;
  ResultDate: string;
  TargetValueNum?: number | null;
  TargetValueTxt?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export interface UpdateIndicatorResultRequest {
  Id: string;
  Description?: string | null;
  ResultDate: string;
  TargetValueNum?: number | null;
  TargetValueTxt?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Obligation
// ---------------------------------------------------------------------------

interface ObligationFields extends RelationshipFields {
  Title: string;
  Adherence: string;
  Type: ObligationType;
  Description?: string | null;
  Interpretation?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
  Schedule?: ScheduleFields | null;
}

export interface CreateObligationRequest extends ObligationFields {
  ParentId?: string | null;
  ScheduleState?: ScheduleStateFields | null;
}

export interface CreateObligationImpactRequest {
  Description: string;
  ImpactRating: number;
  ParentObligationId: string;
  CustomAttributeData?: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Risk
// ---------------------------------------------------------------------------

interface RiskFields extends RelationshipFields {
  ParentRiskId?: string | null;
  Title: string;
  Tier: number;
  Description?: string | null;
  Treatment?: RiskTreatmentType | null;
  Status?: RiskStatusType | null;
  CustomAttributeData?: Record<string, unknown> | null;
  Schedule?: ScheduleFields | null;
}

export interface CreateRiskRequest extends RiskFields {
  ScheduleState?: ScheduleStateFields | null;
}

export interface UpdateRiskRequest extends RiskFields {
  Id: string;
}

export interface DeleteRiskRequest {
  Id: string;
}

// ---------------------------------------------------------------------------
// Risk Assessment Result
// ---------------------------------------------------------------------------

export interface CreateRiskAssessmentResultRequest {
  RiskIds: string[];
  ControlType: RiskAssessmentResultControlType;
  Rating?: number | null;
  Likelihood?: number | null;
  Impact?: number | null;
  AssessmentId?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
  TestDate?: string | null;
  Rationale?: string | null;
}

// ---------------------------------------------------------------------------
// Form Field
// ---------------------------------------------------------------------------

export type Option =
  | { _tag: 'StringOption'; Value: string }
  | { _tag: 'AltValueOption'; AltValue: string; Value: string };

interface FormFieldFields {
  ParentType: string;
  AltLabel?: string;
  Description?: string | null;
  Options: Option[];
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: boolean;
  DefaultValue?: string | null;
  Conditions?: unknown;
}

export interface CreateFormFieldRequest extends FormFieldFields {
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsCustomField: true;
  Label: string;
  Type: string;
}

export interface UpdateFormFieldRequest extends FormFieldFields {
  FieldId: string;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  IsCustomField: boolean;
  Label?: string | null;
}

export interface DeleteFormFieldRequest {
  ParentType: string;
  FieldId: string;
}
// ---------------------------------------------------------------------------
// SSO request types
// ---------------------------------------------------------------------------

export interface CreateSsoConfigurationRequest {
  Name: string;
  Strategy: string;
  ClientId: string;
  ConnectionId: string;
  Domain: string;
  DomainAliases: string[];
  IsActive: boolean;
  IsRestApiEnabled: boolean;
  IsOrganizationConnected: boolean;
}

export interface DeleteSsoConfgurationRequest {
  ConnectionId: string;
}
// ---------------------------------------------------------------------------
// Union of all request types
// ---------------------------------------------------------------------------
export interface CreateObligationRequest {
  ParentId?: string | null;
  Title: string;
  Adherence: string;
  Type: ObligationType;
  Description?: string | null;
  Interpretation?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
  OwnerUserIds?: string[] | null;
  OwnerGroupIds?: string[] | null;
  ContributorUserIds?: string[] | null;
  ContributorGroupIds?: string[] | null;
  TagTypeIds?: string[] | null;
  DepartmentTypeIds?: string[] | null;
  Schedule?: {
    Frequency?: TestFrequency | null;
    ManualDueDate?: string | null;
    StartDate?: string | null;
    TimeToCompleteUnit?: UnitOfTime | null;
    TimeToCompleteValue?: number | null;
  } | null;
  ScheduleState?: {
    DueDate?: string | null;
    OverdueDate?: string | null;
    LatestDate?: string | null;
  } | null;
}

export interface CreateRiskAssessmentResultRequest {
  RiskIds: string[];
  ControlType: RiskAssessmentResultControlType;
  Rating?: number | null;
  Likelihood?: number | null;
  Impact?: number | null;
  AssessmentId?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
  TestDate?: string | null;
  Rationale?: string | null;
}

export interface CreateRiskRequest {
  ParentRiskId?: string | null;
  Title: string;
  Tier: number;
  Description?: string | null;
  Treatment?: RiskTreatmentType | null;
  Status?: RiskStatusType | null;
  CustomAttributeData?: Record<string, unknown> | null;
  OwnerUserIds?: string[] | null;
  OwnerGroupIds?: string[] | null;
  ContributorUserIds?: string[] | null;
  ContributorGroupIds?: string[] | null;
  TagTypeIds?: string[] | null;
  DepartmentTypeIds?: string[] | null;
  Schedule?: {
    Frequency?: TestFrequency | null;
    ManualDueDate?: string | null;
    StartDate?: string | null;
    TimeToCompleteUnit?: UnitOfTime | null;
    TimeToCompleteValue?: number | null;
  } | null;
  ScheduleState?: {
    DueDate?: string | null;
    OverdueDate?: string | null;
    LatestDate?: string | null;
  } | null;
}

export interface UpdateRiskRequest {
  Id: string;
  ParentRiskId?: string | null;
  Title: string;
  Tier: number;
  Description?: string | null;
  Treatment?: RiskTreatmentType | null;
  Status?: RiskStatusType | null;
  CustomAttributeData?: Record<string, unknown> | null;
  OwnerUserIds?: string[] | null;
  OwnerGroupIds?: string[] | null;
  ContributorUserIds?: string[] | null;
  ContributorGroupIds?: string[] | null;
  TagTypeIds?: string[] | null;
  DepartmentTypeIds?: string[] | null;
  Schedule?: {
    Frequency?: TestFrequency | null;
    ManualDueDate?: string | null;
    StartDate?: string | null;
    TimeToCompleteUnit?: UnitOfTime | null;
    TimeToCompleteValue?: number | null;
  } | null;
}

export interface UpdateTestResultRequest {
  Id: string;
  ParentControlId: string;
  Description?: string | null;
  DesignEffectiveness?: number | null;
  OverallEffectiveness?: number | null;
  PerformanceEffectiveness?: number | null;
  Submitter?: string | null;
  TestDate?: string | null;
  TestType?: TestType | null;
  Title?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
  OriginalTimestamp: string;
}

export interface DeleteIndicatorResultsRequest {
  Ids: string[];
}

export interface DeleteIndicatorsRequest {
  Ids: string[];
}

export interface DeleteTestResultsRequest {
  Ids: string[];
}

export interface CreateControlTestResultRequest {
  ControlIds: string[];
  AssessmentId?: string | null;
  Description?: string | null;
  DesignEffectiveness?: number | null;
  OverallEffectiveness?: number | null;
  PerformanceEffectiveness?: number | null;
  Submitter?: string | null;
  TestDate?: string | null;
  TestType?: TestType | null;
  Title?: string | null;
  CustomAttributeData?: Record<string, unknown> | null;
}

export type RequestTypes =
  | CreateAcceptanceRequest
  | CreateActionRequest
  | CreateActionUpdateRequest
  | CreateAppetiteRequest
  | CreateAssessmentRequest
  | CreateCauseRequest
  | CreateConsequenceRequest
  | CreateControlGroupRequest
  | CreateControlRequest
  | CreateControlTestResultRequest
  | CreateFormFieldRequest
  | CreateIndicatorResultRequest
  | CreateIssueAssessmentRequest
  | CreateIssueRequest
  | CreateIssueUpdateRequest
  | CreateObligationImpactRequest
  | CreateObligationRequest
  | CreateRiskAssessmentResultRequest
  | CreateRiskRequest
  | CreateSsoConfigurationRequest
  | DeleteAcceptancesRequest
  | DeleteActionUpdatesRequest
  | DeleteAppetitesRequest
  | DeleteAssessmentRequest
  | DeleteCausesRequest
  | DeleteConsequencesRequest
  | DeleteControlGroupRequest
  | DeleteFormFieldRequest
  | DeleteIndicatorResultsRequest
  | DeleteIndicatorsRequest
  | DeleteIssuesRequest
  | DeleteIssueUpdatesRequest
  | DeleteRiskRequest
  | DeleteSsoConfgurationRequest
  | DeleteTestResultsRequest
  | UpdateAcceptanceRequest
  | UpdateAppetiteRequest
  | UpdateAssessmentRequest
  | UpdateCauseRequest
  | UpdateConsequenceRequest
  | UpdateFormFieldRequest
  | UpdateIssueRequest
  | UpdateIndicatorRequest
  | UpdateIndicatorResultRequest
  | UpdateRiskRequest
  | UpdateTestResultRequest;
