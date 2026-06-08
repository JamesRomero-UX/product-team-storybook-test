import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import type { VersionStatus } from '@risksmart-app/domain/src/types/consts/version-status';
import type {
  CreateAcceptanceRequest,
  CreateActionRequest,
  CreateActionUpdateRequest,
  CreateAppetiteRequest,
  CreateAssessmentRequest,
  CreateCauseRequest,
  CreateConsequenceRequest,
  CreateControlGroupRequest,
  CreateControlRequest,
  CreateControlTestResultRequest,
  CreateFormFieldRequest,
  CreateIndicatorResultRequest,
  CreateIssueAssessmentRequest,
  CreateIssueRequest,
  CreateIssueUpdateRequest,
  CreateObligationImpactRequest,
  CreateObligationRequest,
  CreateRiskRequest,
  DeleteControlGroupRequest,
  DeleteFormFieldRequest,
  DeleteIssueUpdatesRequest,
  UpdateAcceptanceRequest,
  UpdateAppetiteRequest,
  UpdateAssessmentRequest,
  UpdateCauseRequest,
  UpdateConsequenceRequest,
  UpdateFormFieldRequest,
  UpdateIndicatorRequest,
  UpdateIndicatorResultRequest,
  UpdateIssueRequest,
  UpdateRiskRequest,
  UpdateTestResultRequest,
} from '@risksmart-app/events/src/types/request-types';

import type {
  LinkedListQueryBySeqId,
  LinkedListQueryByUuidTs,
  ListQueryBySeqId,
  ListQueryByUuidTs,
} from '../routers/backend/query.schema';
import type {
  AiAssistantFeedbackRequest,
  WorkflowFeedbackRequest,
} from '../types/ai-feedback.types';
import type { AcceptanceByIdResponse } from '../types/backend/v1/acceptance.types';
import type { ActionByIdResponse } from '../types/backend/v1/action.types';
import type { ApprovalByIdResponse } from '../types/backend/v1/approval.types';
import type { AssessmentByIdResponse } from '../types/backend/v1/assessment.types';
import type { RiskAssessmentResultByIdResponse } from '../types/backend/v1/assessment-result.types';
import type { CauseByIdResponse } from '../types/backend/v1/cause.types';
import type { ConsequenceByIdResponse } from '../types/backend/v1/consequence.types';
import type { ControlByIdResponse } from '../types/backend/v1/control.types';
import type { DepartmentGroupTypeByIdResponse } from '../types/backend/v1/department-group-type.types';
import type { DepartmentTypeByIdResponse } from '../types/backend/v1/department-type.types';
import type { DocumentByIdResponse } from '../types/backend/v1/document.types';
import type { BackendEnterpriseRiskByIdResponse } from '../types/backend/v1/enterprise-risk.types';
import type { ImpactByIdResponse } from '../types/backend/v1/impact.types';
import type { ImpactRatingByIdResponse } from '../types/backend/v1/impact-rating.types';
import type { AppetiteByIdResponse } from '../types/backend/v1/index';
import type { IndicatorByIdResponse } from '../types/backend/v1/indicator.types';
import type { IndicatorResultByIdResponse } from '../types/backend/v1/indicator-result.types';
import type { IssueByIdResponse } from '../types/backend/v1/issue.types';
import type { IssueAssessmentResponse } from '../types/backend/v1/issue-assessment.types';
import type { IssueUpdateByIdResponse } from '../types/backend/v1/issue-update.types';
import type {
  AcceptanceListResponse,
  ActionListResponse,
  AppetiteListResponse,
  ApprovalListResponse,
  AssessmentListResponse,
  CauseListResponse,
  ConsequenceListResponse,
  ControlListResponse,
  DepartmentGroupTypeListResponse,
  DepartmentTypeListResponse,
  DocumentListResponse,
  EnterpriseRiskListResponse,
  ImpactListResponse,
  ImpactRatingsListResponse,
  IndicatorListResponse,
  IndicatorResultListResponse,
  IssueListResponse,
  IssueUpdateListResponse,
  LinkedItemListResponse,
  ObligationListResponse,
  RiskAssessmentResultListResponse,
  RiskListResponse,
  TagTypeListResponse,
  ThirdPartyListResponse,
  UserGroupListResponse,
  UserListResponse,
} from '../types/backend/v1/list.types';
import type { ObligationByIdResponse } from '../types/backend/v1/obligation.types';
import type { OrganisationModuleByOrgIdResponse } from '../types/backend/v1/organisation-module.types';
import type { RiskByIdResponse } from '../types/backend/v1/risk.types';
import type { TagTypeByIdResponse } from '../types/backend/v1/tag-type.types';
import type { ThirdPartyByIdResponse } from '../types/backend/v1/third-party.types';
import type { UserByIdResponse } from '../types/backend/v1/user.types';
import type { UserGroupByIdResponse } from '../types/backend/v1/user-group.types';
import type {
  AcceptanceAuditByIdResponseRow,
  AcceptanceRegisterResponse,
  AcceptancesByParentRiskIdResponse,
  ActionAuditByIdResponseRow,
  ActionRegisterResponse,
  AggregationSettingsForOrgResponseRow,
  AppetiteByIdResponseRow,
  AppetiteParentRegisterResponseRow,
  AppetiteRegisterResponse,
  ApprovalResponseRow,
  AssessmentActivitiesByParentIdResponseRow,
  AssessmentActivityRegisterResponse,
  AssessmentRCSAActivityByAssessmentIdResponseRow,
  AssessmentRegisterResponse,
  AssessmentResultParentByIdResponseRow,
  AssessmentResultsRegisterResponse,
  AttestationCycleRecordResponseRow,
  AttestationCycleRegisterResponse,
  AttestationRegisterResponse,
  AttestationStatusResponseRow,
  BusinessAreasResponseRow,
  CauseByIdResponseRow,
  CauseRegisterResponse,
  CausesByParentIssueIdResponseRow,
  ChangeRequestRegisterResponse,
  ColourPaletteResponseRow,
  ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse,
  ComplianceMonitoringAssessmentTestResultsByControlIdResponse,
  ConsequenceAuditByIdResponseRow,
  ConsequenceByIdResponseRow,
  ConsequenceRegisterResponse,
  ControlByIdResponseRow,
  ControlGroupRegisterResponse,
  ControlGroupResponseRow,
  ControlGroupsByTitleResponseRow,
  ControlGroupsResponseRow,
  ControlRegisterResponse,
  ControlsBasicResponse,
  ControlsByUserIdResponseRow,
  CreateAcceptanceResponse,
  CreateActionResponse,
  CreateActionUpdateResponse,
  CreateAppetiteResponse,
  CreateAssessmentResponse,
  CreateControlGroupResponse,
  CreateControlResponse,
  CreateControlTestResultResponse,
  CreateFormFieldResponse,
  CreateIndicatorResultResponse,
  CreateIssueResponse,
  CreateIssueUpdateResponse,
  CreateObligationImpactResponse,
  CreateObligationResponse,
  CreateRiskResponse,
  DataExportScheduleExecutionResponseRow,
  DataExportScheduleResponseRow,
  DepartmentTypeResponseRow,
  DocumentAssessmentResultsByParentIdResponseRow,
  DocumentByIdResponseRow,
  DocumentFileByIdResponseRow,
  DocumentFileEntityRow,
  DocumentFilesByDocumentIdResponseRow,
  DocumentListSimpleResponseRow,
  DocumentRegisterResponse,
  EnterpriseRiskByIdResponseRow,
  EnterpriseRiskByTierResponseRow,
  EnterpriseRiskRegisterResponse,
  EntityByIdResponse,
  EntityRegisterResponse,
  GetAcceptanceByIdResponseRow,
  GetActionByIdResponseRow,
  GetActionUpdateByIdResponseRow,
  GetActionUpdatesByParentActionIdResponseRow,
  GetActiveAppetitesByParentIdResponseRow,
  GetAppetitesGroupedByImpactResponseRow,
  GetAssessmentByIdResponseRow,
  GetFormConfigurationResponseRow,
  GetIndicatorByIdResponseRow,
  GetIndicatorResultsByIndicatorIdResponseRow,
  GetIndicatorsByParentIdResponse,
  GetIssueAssessmentByParentIdResponse,
  GetIssueByIdResponseRow,
  GetIssuesByParentIdResponseRow,
  GetIssueUpdateAuditByIdResponseRow,
  GetIssueUpdateByIdResponseRow,
  GetIssueUpdatesByParentIssueIdResponseRow,
  GetLatestDocumentInternalAuditResultByDocumentIdResponseRow,
  GetLatestImpactRatingsForRatedImpactsByRatedItemIdResponseRow,
  GetLinkedItemRisksResponseRow,
  GetLinkedItemsResponseRow,
  GetLinkedRisksByInternalAuditIdResponse,
  GetObligationByIdResponseRow,
  GetObligationImpactsByParentIdResponseRow,
  GetRiskAssessmentResultConfigAuditByIdResponseRow,
  GetRiskAssessmentResultImpactAuditByIdResponseRow,
  GetUserGroupByIdResponseRow,
  GetUserGroupsWithApproversResponseRow,
  GetUsersByGroupIdResponseRow,
  IndicatorRegisterResponse,
  IngestionConfigResponseRow,
  InternalAuditByIdResponse,
  InternalAuditEntityRegisterResponse,
  InternalAuditReportByIdResponseRow,
  InternalAuditReportRegisterResponse,
  InternalAuditReportRiskAssessmentResultsByRiskIdResponse,
  InternalAuditReportsByOriginatingItemIdResponse,
  InternalAuditReportTestResultsByControlIdResponse,
  InternalAuditResultByIdResponseRow,
  InternalAuditResultsByParentIdResponse,
  InternalAuditTestResultByIdResponse,
  IssueRegisterResponse,
  LatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse,
  LatestDocumentAssessmentResultByDocumentIdResponseRow,
  LatestDocumentFileResponseRow,
  LatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse,
  MyDueItemsResponse,
  ObligationChangeRegisterResponseRow,
  ObligationRegisterResponse,
  PendingChangeRequestResponseRow,
  PublicDocumentFilesResponseRow,
  QuestionnaireTemplateRegisterResponse,
  QuestionnaireTemplateResponse,
  QuestionnaireTemplateVersionByIdResponse,
  QuestionnaireTemplateVersionByParentIdResponse,
  RiskAssessmentResultsByRiskIdResponseRow,
  RiskByIdResponseRow,
  RiskListOnlyOptimizedResponseRow,
  RiskListOnlyWithEntitiesOptimizedResponseRow,
  RiskRegisterResponse,
  RiskScoreResponse,
  RiskScoresByRiskIdResponse,
  SsoConfigurationRow,
  TagTypeResponseRow,
  TestResultByIdResponseRow,
  TestResultsByControlIdResponse,
  TestResultsResponse,
  ThirdPartyContactByIdRow,
  ThirdPartyContactRow,
  ThirdPartyRegisterResponse,
  ThirdPartyWithFilesResponseRow,
  UpdateAcceptanceResponse,
  UpdateAppetiteResponse,
  UpdateAssessmentResponse,
  UpdateFormFieldResponse,
  UpdateIndicatorResultResponse,
  UpdateIssueResponse,
  UpdateRiskResponse,
  UpdateTestResultResponse,
} from '../types/index';

export interface ServiceContext {
  orgId: string;
  tenant: string;
  userId: string;
}

export interface BackendServiceContext {
  orgId: string;
  tenant: string;
}

export interface AuditService {
  getAcceptanceAuditById(
    ctx: ServiceContext,
    id: string
  ): Promise<AcceptanceAuditByIdResponseRow[]>;
  getActionAuditById(
    ctx: ServiceContext,
    id: string
  ): Promise<ActionAuditByIdResponseRow[]>;
}

export interface RiskService {
  getRisksRegister(ctx: ServiceContext): Promise<RiskRegisterResponse>;
  getRiskById(
    ctx: ServiceContext,
    riskId: string
  ): Promise<RiskByIdResponseRow[]>;
  getRiskScores(ctx: ServiceContext): Promise<RiskScoreResponse>;
  getRiskListOnlyOptimized(
    ctx: ServiceContext
  ): Promise<RiskListOnlyOptimizedResponseRow[]>;
  getRiskListOnlyWithEntitiesOptimized(
    ctx: ServiceContext
  ): Promise<RiskListOnlyWithEntitiesOptimizedResponseRow[]>;
  getRiskScoresByRiskId(
    ctx: ServiceContext,
    riskId: string
  ): Promise<RiskScoresByRiskIdResponse>;
  insertRisk(
    ctx: ServiceContext,
    input: CreateRiskRequest
  ): Promise<CreateRiskResponse>;
  updateRisk(
    ctx: ServiceContext,
    input: UpdateRiskRequest,
    options: { useImpacts: boolean }
  ): Promise<UpdateRiskResponse>;
  deleteRisk(ctx: ServiceContext, id: string): Promise<void>;
}

export interface RiskBackendService {
  getRiskAssessmentResults(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ): Promise<RiskAssessmentResultListResponse>;
  getRiskImpactRatings(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<ImpactRatingsListResponse>;
  getRiskControls(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<ControlListResponse>;
  getRiskIndicators(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<IndicatorListResponse>;
  getRiskList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<RiskListResponse>;
  getRiskById(
    ctx: BackendServiceContext,
    riskId: string
  ): Promise<RiskByIdResponse | null>;
  getRiskAppetites(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<AppetiteListResponse>;
  getRiskAcceptances(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<AcceptanceListResponse>;
  getRiskApprovals(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ): Promise<ApprovalListResponse>;
}

export interface AcceptanceBackendService {
  getAcceptanceById(
    ctx: BackendServiceContext,
    acceptanceId: string
  ): Promise<AcceptanceByIdResponse | null>;
}

export interface ApprovalBackendService {
  getApprovalById(
    ctx: BackendServiceContext,
    approvalId: string
  ): Promise<ApprovalByIdResponse | null>;
}

export interface AppetiteBackendService {
  getAppetiteById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<AppetiteByIdResponse | null>;
}

export interface EnterpriseRiskService {
  getEnterpriseRisksRegister(
    ctx: ServiceContext
  ): Promise<EnterpriseRiskRegisterResponse>;
  getEnterpriseRiskById(
    ctx: ServiceContext,
    enterpriseRiskId: string
  ): Promise<EnterpriseRiskByIdResponseRow[]>;
  getEnterpriseRiskByTier(
    ctx: ServiceContext,
    tier: number
  ): Promise<EnterpriseRiskByTierResponseRow[]>;
}

export interface EnterpriseRiskBackendService {
  getEnterpriseRiskChildRisks(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<RiskListResponse>;
  getEnterpriseRiskList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<EnterpriseRiskListResponse>;
  getEnterpriseRiskById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<BackendEnterpriseRiskByIdResponse | null>;
}

export interface BusinessAreaService {
  getBusinessAreas(ctx: ServiceContext): Promise<BusinessAreasResponseRow[]>;
}

export interface ControlService {
  getControlsRegister(
    ctx: ServiceContext,
    parentId?: string
  ): Promise<ControlRegisterResponse>;
  getControlGroupsRegister(
    ctx: ServiceContext
  ): Promise<ControlGroupRegisterResponse>;
  getControlById(
    ctx: ServiceContext,
    controlId: string
  ): Promise<ControlByIdResponseRow[]>;
  getControlsByUserId(
    ctx: ServiceContext,
    userId: string
  ): Promise<ControlsByUserIdResponseRow[]>;
  getControlGroupsByTitle(
    ctx: ServiceContext,
    title: string
  ): Promise<ControlGroupsByTitleResponseRow[]>;
  getControlGroupById(
    ctx: ServiceContext,
    controlGroupId: string
  ): Promise<ControlGroupResponseRow[]>;
  getControlsBasic(ctx: ServiceContext): Promise<ControlsBasicResponse>;
  getControlGroups(ctx: ServiceContext): Promise<ControlGroupsResponseRow[]>;
  insertControl(
    ctx: ServiceContext,
    input: CreateControlRequest
  ): Promise<CreateControlResponse>;
  insertControlGroup(
    ctx: ServiceContext,
    input: CreateControlGroupRequest
  ): Promise<CreateControlGroupResponse>;
  deleteControlGroup(
    ctx: ServiceContext,
    controlGroupId: string,
    body: DeleteControlGroupRequest
  ): Promise<void>;
}

export interface ControlBackendService {
  getControlList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<ControlListResponse>;
  getControlById(
    ctx: BackendServiceContext,
    controlId: string
  ): Promise<ControlByIdResponse | null>;
}

export interface PolicyService {
  getDocumentsRegister(ctx: ServiceContext): Promise<DocumentRegisterResponse>;
  getDocumentById(
    ctx: ServiceContext,
    documentId: string
  ): Promise<DocumentByIdResponseRow[]>;
  getLatestPublicDocumentFileByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ): Promise<DocumentFileEntityRow | undefined>;
  getDocumentFileById(
    ctx: ServiceContext,
    documentFileId: string
  ): Promise<DocumentFileByIdResponseRow[]>;
  getDocumentFilesByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ): Promise<DocumentFilesByDocumentIdResponseRow[]>;
  getLatestDocumentFile(
    ctx: ServiceContext,
    parentDocumentId: string,
    fileId?: string,
    status?: VersionStatus
  ): Promise<LatestDocumentFileResponseRow[]>;
  getPublicDocumentFiles(
    ctx: ServiceContext,
    currentUserId: string
  ): Promise<PublicDocumentFilesResponseRow[]>;
  getAttestationsRegister(
    ctx: ServiceContext,
    userId?: string
  ): Promise<AttestationRegisterResponse>;
  getAttestationCyclesRegister(
    ctx: ServiceContext
  ): Promise<AttestationCycleRegisterResponse>;
  getAttestationCyclesByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ): Promise<AttestationCycleRecordResponseRow[]>;
  getAttestationStatus(
    ctx: ServiceContext,
    parentId: string,
    userId: string
  ): Promise<AttestationStatusResponseRow[]>;
  getDocumentListSimple(
    ctx: ServiceContext
  ): Promise<DocumentListSimpleResponseRow[]>;
}

export interface DocumentBackendService {
  getDocumentList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<DocumentListResponse>;
  getDocumentById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<DocumentByIdResponse | null>;
}

export const IssueTypeArray = [
  'issue_breach_log',
  'issue_consumer_duty',
  'issue_customer_trust',
  'issue_gdpr_breach_log',
  'issue_pci_breach_log',
  'issue_risk_event',
  'issue_sar_log',
  'issue',
] as const;

export type IssueTypes = (typeof IssueTypeArray)[number];

export interface IssueService {
  getIssuesRegister(
    ctx: ServiceContext,
    issueType: ParentType,
    departmentTypeIds?: string[],
    tagTypeIds?: string[]
  ): Promise<IssueRegisterResponse>;
  getById(ctx: ServiceContext, id: string): Promise<GetIssueByIdResponseRow[]>;
  getIssuesByParentId(
    ctx: ServiceContext,
    parentId: string,
    type: ParentType
  ): Promise<GetIssuesByParentIdResponseRow[]>;
  getIssueAssessmentByParentId(
    ctx: ServiceContext,
    parentIssueId: string
  ): Promise<GetIssueAssessmentByParentIdResponse>;
  insertIssue(
    ctx: ServiceContext,
    input: CreateIssueRequest
  ): Promise<CreateIssueResponse>;
  updateIssue(
    ctx: ServiceContext,
    input: UpdateIssueRequest
  ): Promise<UpdateIssueResponse>;
  deleteIssues(ctx: ServiceContext, ids: string[]): Promise<void>;
}

export interface IssueAssessmentService {
  insertIssueAssessment(
    ctx: ServiceContext,
    input: CreateIssueAssessmentRequest
  ): Promise<{ Id: string }>;
}

export interface ActionService {
  getActionsRegister(
    ctx: ServiceContext,
    parentId?: string,
    departmentTypeIds?: string[],
    tagTypeIds?: string[]
  ): Promise<ActionRegisterResponse>;
  getById(ctx: ServiceContext, id: string): Promise<GetActionByIdResponseRow[]>;
  getActionUpdatesByParentActionId(
    ctx: ServiceContext,
    parentActionId: string
  ): Promise<GetActionUpdatesByParentActionIdResponseRow[]>;
  getActionUpdateById(
    ctx: ServiceContext,
    id: string
  ): Promise<GetActionUpdateByIdResponseRow[]>;
  insertActionUpdate(
    ctx: ServiceContext,
    input: CreateActionUpdateRequest
  ): Promise<CreateActionUpdateResponse>;
  deleteActionUpdates(ctx: ServiceContext, ids: string[]): Promise<void>;
  insertAction(
    ctx: ServiceContext,
    input: CreateActionRequest
  ): Promise<CreateActionResponse>;
}

export interface ActionBackendService {
  getActionList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<ActionListResponse>;
  getActionById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<ActionByIdResponse | null>;
  getActionsByParent(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<ActionListResponse>;
}

export interface IssueBackendService {
  getIssueList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<IssueListResponse>;
  getIssueById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<IssueByIdResponse | null>;
  getIssueConsequenceById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<ConsequenceByIdResponse | null>;
  getIssueCauseById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<CauseByIdResponse | null>;
  getIssueUpdateById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<IssueUpdateByIdResponse | null>;
  getIssueConsequences(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ): Promise<ConsequenceListResponse>;
  getIssueCauses(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ): Promise<CauseListResponse>;
  getIssueUpdates(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ): Promise<IssueUpdateListResponse>;
  getIssueAssessment(
    ctx: BackendServiceContext,
    issueId: string
  ): Promise<IssueAssessmentResponse | null>;
}

export interface CauseService {
  getCausesRegister(ctx: ServiceContext): Promise<CauseRegisterResponse>;
  getCausesByParentIssueId(
    ctx: ServiceContext,
    parentIssueId: string
  ): Promise<CausesByParentIssueIdResponseRow[]>;
  getCauseById(
    ctx: ServiceContext,
    id: string
  ): Promise<CauseByIdResponseRow[]>;
  insertCause(
    ctx: ServiceContext,
    input: CreateCauseRequest
  ): Promise<{ Id: string }>;
  updateCause(
    ctx: ServiceContext,
    id: string,
    input: UpdateCauseRequest
  ): Promise<void>;
  deleteCauses(
    ctx: ServiceContext,
    ids: string[]
  ): Promise<{ deletedCount: number }>;
}
export interface ChangeRequestService {
  getPendingChangeRequests(
    ctx: ServiceContext,
    parentId: string
  ): Promise<PendingChangeRequestResponseRow[]>;
  getChangeRequestsRegister(
    ctx: ServiceContext
  ): Promise<ChangeRequestRegisterResponse>;
}

export interface ConsequenceService {
  getConsequenceById(
    ctx: ServiceContext,
    id: string
  ): Promise<ConsequenceByIdResponseRow[]>;
  getConsequenceAuditById(
    ctx: ServiceContext,
    id: string
  ): Promise<ConsequenceAuditByIdResponseRow[]>;
  getConsequencesRegister(
    ctx: ServiceContext
  ): Promise<ConsequenceRegisterResponse>;
  getConsequencesByParentIssueId(
    ctx: ServiceContext,
    parentIssueId: string
  ): Promise<ConsequenceByIdResponseRow[]>;
  insertConsequence(
    ctx: ServiceContext,
    input: CreateConsequenceRequest
  ): Promise<{ Id: string }>;
  updateConsequence(
    ctx: ServiceContext,
    id: string,
    input: UpdateConsequenceRequest
  ): Promise<void>;
  deleteConsequences(
    ctx: ServiceContext,
    ids: string[]
  ): Promise<{ deletedCount: number }>;
}

export interface DataExportService {
  getActiveSchedule(
    ctx: ServiceContext
  ): Promise<DataExportScheduleResponseRow[]>;
  getScheduleExecutions(
    ctx: ServiceContext
  ): Promise<DataExportScheduleExecutionResponseRow[]>;
}

export interface TagService {
  getTags(ctx: ServiceContext): Promise<TagTypeResponseRow[]>;
}

export interface DepartmentService {
  getDepartments(ctx: ServiceContext): Promise<DepartmentTypeResponseRow[]>;
}

export interface ThirdPartyService {
  getThirdPartiesRegister(
    ctx: ServiceContext
  ): Promise<ThirdPartyRegisterResponse>;
  getThirdPartyById(
    ctx: ServiceContext,
    thirdPartyId: string
  ): Promise<ThirdPartyWithFilesResponseRow>;
}

export interface ThirdPartyContactService {
  getContactsByThirdParty(
    ctx: ServiceContext,
    thirdPartyId: string,
    isIncludingRevoked?: boolean
  ): Promise<{ contacts: ThirdPartyContactRow[] }>;

  getContactById(
    ctx: ServiceContext,
    contactId: string
  ): Promise<ThirdPartyContactByIdRow>;

  getActiveContacts(
    ctx: ServiceContext,
    thirdPartyId: string
  ): Promise<{ contacts: ThirdPartyContactRow[] }>;
}

export interface QuestionnaireTemplateService {
  getQuestionnaireTemplatesRegister(
    ctx: ServiceContext
  ): Promise<QuestionnaireTemplateRegisterResponse>;
  getQuestionnaireTemplateById(
    ctx: ServiceContext,
    id: string
  ): Promise<QuestionnaireTemplateResponse>;
}

export interface QuestionnaireTemplateVersionService {
  getQuestionnaireTemplateVersionById(
    ctx: ServiceContext,
    id: string
  ): Promise<QuestionnaireTemplateVersionByIdResponse>;
  getLatestQuestionnaireTemplateVersionByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<QuestionnaireTemplateVersionByIdResponse>;
  getQuestionnaireTemplateVersionsByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<QuestionnaireTemplateVersionByParentIdResponse>;
}

export interface ObligationService {
  getObligationsRegister(
    ctx: ServiceContext
  ): Promise<ObligationRegisterResponse>;
  getObligationById(
    ctx: ServiceContext,
    obligationId: string
  ): Promise<GetObligationByIdResponseRow[]>;
  insertObligation(
    ctx: ServiceContext,
    input: CreateObligationRequest
  ): Promise<CreateObligationResponse>;
}

export interface ObligationChangeService {
  getObligationChangesRegister(
    ctx: ServiceContext
  ): Promise<ObligationChangeRegisterResponseRow[]>;
  getObligationChangeById(
    ctx: ServiceContext,
    id: string
  ): Promise<ObligationChangeRegisterResponseRow[]>;
}

export interface ObligationBackendService {
  getObligationList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<ObligationListResponse>;
  getObligationById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<ObligationByIdResponse | null>;
}

export interface ThirdPartyBackendService {
  getThirdPartyList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<ThirdPartyListResponse>;
  getThirdPartyById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<ThirdPartyByIdResponse | null>;
}

export interface ImpactRatingBackendService {
  getImpactRatingById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<ImpactRatingByIdResponse | null>;
}
export interface UserListFilter {
  Id?: string[];
}

export interface UserBackendService {
  getUserById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<UserByIdResponse | null>;
  getUserList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: UserListFilter
  ): Promise<UserListResponse>;
}

export interface UserGroupListFilter {
  Id?: string[];
}

export interface UserGroupBackendService {
  getUserGroupById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<UserGroupByIdResponse | null>;
  getUserGroupList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: UserGroupListFilter
  ): Promise<UserGroupListResponse>;
}
export interface DepartmentGroupTypeListFilter {
  Id?: string[];
}

export interface DepartmentGroupTypeBackendService {
  getDepartmentGroupTypeById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<DepartmentGroupTypeByIdResponse | null>;
  getDepartmentGroupTypeList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: DepartmentGroupTypeListFilter
  ): Promise<DepartmentGroupTypeListResponse>;
}

export interface DepartmentTypeListFilter {
  Id?: string[];
}

export interface DepartmentTypeBackendService {
  getDepartmentTypeById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<DepartmentTypeByIdResponse | null>;
  getDepartmentTypeList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: DepartmentTypeListFilter
  ): Promise<DepartmentTypeListResponse>;
}

export interface TagTypeListFilter {
  Id?: string[];
}

export interface TagTypeBackendService {
  getTagTypeById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<TagTypeByIdResponse | null>;
  getTagTypeList(
    ctx: BackendServiceContext,
    opts: ListQueryByUuidTs,
    filter?: TagTypeListFilter
  ): Promise<TagTypeListResponse>;
}

export interface ObligationImpactService {
  getObligationImpactsByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<GetObligationImpactsByParentIdResponseRow[]>;

  insertObligationImpact(
    ctx: ServiceContext,
    input: CreateObligationImpactRequest
  ): Promise<CreateObligationImpactResponse>;

  deleteObligationImpacts(ctx: ServiceContext, ids: string[]): Promise<void>;
}

export interface AssessmentService {
  getAssessmentsRegister(
    ctx: ServiceContext
  ): Promise<AssessmentRegisterResponse>;
  getAssessmentActivitiesRegister(
    ctx: ServiceContext
  ): Promise<AssessmentActivityRegisterResponse>;
  getAssessmentResultsRegister(
    ctx: ServiceContext
  ): Promise<AssessmentResultsRegisterResponse>;
  getAssessmentResultParentById(
    ctx: ServiceContext,
    id: string
  ): Promise<AssessmentResultParentByIdResponseRow[]>;
  getRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ): Promise<RiskAssessmentResultsByRiskIdResponseRow[]>;
  getAssessmentActivitiesByParentId(
    ctx: ServiceContext,
    id: string
  ): Promise<AssessmentActivitiesByParentIdResponseRow[]>;
  getAssessmentById(
    ctx: ServiceContext,
    assessmentId: string
  ): Promise<GetAssessmentByIdResponseRow[]>;
  getAssessmentRCSAActivitiesByAssessmentId(
    ctx: ServiceContext,
    assessmentId: string
  ): Promise<AssessmentRCSAActivityByAssessmentIdResponseRow[]>;
  getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ): Promise<LatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse>;
  getLatestInternalAuditReportRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ): Promise<LatestInternalAuditReportRiskAssessmentResultsByRiskIdResponse>;
  getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ): Promise<ComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdResponse>;
  getInternalAuditReportRiskAssessmentResultsByRiskId(
    ctx: ServiceContext,
    riskId: string
  ): Promise<InternalAuditReportRiskAssessmentResultsByRiskIdResponse>;
  getLatestDocumentAssessmentResultByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ): Promise<LatestDocumentAssessmentResultByDocumentIdResponseRow[]>;
  getDocumentAssessmentResultsByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<DocumentAssessmentResultsByParentIdResponseRow[]>;
  insertAssessment(
    ctx: ServiceContext,
    input: CreateAssessmentRequest
  ): Promise<CreateAssessmentResponse>;
  updateAssessment(
    ctx: ServiceContext,
    input: UpdateAssessmentRequest
  ): Promise<UpdateAssessmentResponse>;
  deleteAssessment(ctx: ServiceContext, id: string): Promise<void>;
}

export interface AssessmentBackendService {
  getRiskAssessmentResultById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<RiskAssessmentResultByIdResponse | null>;
  getAssessmentList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<AssessmentListResponse>;
  getAssessmentById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<AssessmentByIdResponse | null>;
  getAssessmentByParentIssue(
    ctx: BackendServiceContext,
    opts: LinkedListQueryBySeqId
  ): Promise<AssessmentListResponse>;
}

export interface InternalAuditService {
  getInternalAuditEntitiesRegister(
    ctx: ServiceContext
  ): Promise<InternalAuditEntityRegisterResponse>;
  getInternalAuditReportsRegister(
    ctx: ServiceContext
  ): Promise<InternalAuditReportRegisterResponse>;
  getInternalAuditReportsByOriginatingItemId(
    ctx: ServiceContext,
    originatingItemId: string
  ): Promise<InternalAuditReportsByOriginatingItemIdResponse>;
  getInternalAuditById(
    ctx: ServiceContext,
    internalAuditId: string
  ): Promise<InternalAuditByIdResponse>;
  getInternalAuditReportById(
    ctx: ServiceContext,
    reportId: string
  ): Promise<InternalAuditReportByIdResponseRow[]>;
  getInternalAuditResultById(
    ctx: ServiceContext,
    internalAuditResultId: string
  ): Promise<InternalAuditResultByIdResponseRow[]>;
  getInternalAuditResultsByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<InternalAuditResultsByParentIdResponse>;
  getInternalAuditTestResultById(
    ctx: ServiceContext,
    id: string
  ): Promise<InternalAuditTestResultByIdResponse[]>;
  getLatestDocumentInternalAuditResultByDocumentId(
    ctx: ServiceContext,
    documentId: string
  ): Promise<GetLatestDocumentInternalAuditResultByDocumentIdResponseRow[]>;
}

export interface IndicatorService {
  getIndicatorsRegister(
    ctx: ServiceContext
  ): Promise<IndicatorRegisterResponse>;
  getIndicatorById(
    ctx: ServiceContext,
    id: string
  ): Promise<GetIndicatorByIdResponseRow[]>;
  getIndicatorResultsByIndicatorId(
    ctx: ServiceContext,
    indicatorId: string
  ): Promise<GetIndicatorResultsByIndicatorIdResponseRow[]>;
  getIndicatorsByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<GetIndicatorsByParentIdResponse>;
  insertIndicatorResult(
    ctx: ServiceContext,
    input: CreateIndicatorResultRequest
  ): Promise<CreateIndicatorResultResponse>;
  updateIndicatorResult(
    ctx: ServiceContext,
    input: UpdateIndicatorResultRequest
  ): Promise<UpdateIndicatorResultResponse>;
  deleteIndicators(ctx: ServiceContext, ids: string[]): Promise<void>;
  deleteIndicatorResults(ctx: ServiceContext, ids: string[]): Promise<void>;
  updateIndicator(
    ctx: ServiceContext,
    input: UpdateIndicatorRequest
  ): Promise<{ Id: string }>;
}

export interface IndicatorBackendService {
  getIndicatorList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<IndicatorListResponse>;
  getIndicatorById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<IndicatorByIdResponse | null>;
  getIndicatorResultList(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ): Promise<IndicatorResultListResponse>;
  getIndicatorResultById(
    ctx: BackendServiceContext,
    id: string
  ): Promise<IndicatorResultByIdResponse | null>;
}

export interface PermissionService {
  bulkCheck(
    ctx: ServiceContext,
    checks: {
      resourceName: string;
      resourceId?: string | undefined;
      action: 'read' | 'delete' | 'insert' | 'update';
      rootResourceCheck?: boolean | undefined;
    }[]
  ): Promise<
    {
      resourceName: string;
      resourceId?: string | undefined;
      action: 'read' | 'delete' | 'insert' | 'update';
    }[]
  >;
  checkNavigationVisibility(
    ctx: ServiceContext,
    parentTypes: ParentType[]
  ): Promise<{ parentType: ParentType; visible: boolean }[]>;
}

export interface LinkedItemService {
  getLinkedItems(
    ctx: ServiceContext,
    id: string
  ): Promise<GetLinkedItemsResponseRow[]>;
  getLinkedRisksByInternalAuditId(
    ctx: ServiceContext,
    internalAuditId: string
  ): Promise<GetLinkedRisksByInternalAuditIdResponse[]>;
  getLinkedItemRisks(
    ctx: ServiceContext,
    id: string
  ): Promise<GetLinkedItemRisksResponseRow[]>;
}

export interface AcceptancesService {
  getAcceptancesRegister(
    ctx: ServiceContext
  ): Promise<AcceptanceRegisterResponse>;
  getAcceptancesByParentRiskId(
    ctx: ServiceContext,
    riskId: string
  ): Promise<AcceptancesByParentRiskIdResponse>;
  getAcceptanceById(
    ctx: ServiceContext,
    acceptanceId: string
  ): Promise<GetAcceptanceByIdResponseRow[]>;
  insertAcceptance(
    ctx: ServiceContext,
    input: CreateAcceptanceRequest
  ): Promise<CreateAcceptanceResponse>;
  updateAcceptance(
    ctx: ServiceContext,
    input: UpdateAcceptanceRequest
  ): Promise<UpdateAcceptanceResponse>;
  deleteAcceptances(ctx: ServiceContext, ids: string[]): Promise<void>;
}

export interface ColourPaletteService {
  getColourPalettes(ctx: ServiceContext): Promise<ColourPaletteResponseRow[]>;
}

export interface TestResultService {
  getTestResults(ctx: ServiceContext): Promise<TestResultsResponse>;
  getTestResultById(
    ctx: ServiceContext,
    testResultId: string
  ): Promise<TestResultByIdResponseRow[]>;
  getLatestTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ): Promise<TestResultsByControlIdResponse>;
  getLatestInternalAuditReportTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ): Promise<InternalAuditReportTestResultsByControlIdResponse>;
  getLatestComplianceMonitoringAssessmentTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ): Promise<ComplianceMonitoringAssessmentTestResultsByControlIdResponse>;
  getTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ): Promise<TestResultsByControlIdResponse>;
  getInternalAuditReportTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ): Promise<InternalAuditReportTestResultsByControlIdResponse>;
  getComplianceMonitoringAssessmentTestResultsByControlId(
    ctx: ServiceContext,
    controlId: string
  ): Promise<ComplianceMonitoringAssessmentTestResultsByControlIdResponse>;
  insertControlTestResult(
    ctx: ServiceContext,
    input: CreateControlTestResultRequest
  ): Promise<CreateControlTestResultResponse>;
  updateTestResult(
    ctx: ServiceContext,
    input: UpdateTestResultRequest
  ): Promise<UpdateTestResultResponse>;
  deleteTestResults(ctx: ServiceContext, ids: string[]): Promise<void>;
}

export interface MyItemsService {
  getMyDueItems(
    ctx: ServiceContext,
    date: string,
    userId: string,
    ownershipFilter: {
      owner: boolean;
      contributor: boolean;
      groupOwner: boolean;
      groupContributor: boolean;
      inheritedOwner: boolean;
      inheritedContributor: boolean;
      inheritedGroupOwner: boolean;
      inheritedGroupContributor: boolean;
    }
  ): Promise<MyDueItemsResponse>;
}

export interface EntityService {
  getEntityRegister(ctx: ServiceContext): Promise<EntityRegisterResponse>;
  getEntityById(
    ctx: ServiceContext,
    entityId: string
  ): Promise<EntityByIdResponse>;
}
export interface ApprovalService {
  getGlobalApprovals(
    ctx: ServiceContext,
    isGlobal: boolean,
    parentId: string
  ): Promise<ApprovalResponseRow[]>;
}

export interface AggregationService {
  getAggregationSettingsForOrg(
    ctx: ServiceContext
  ): Promise<AggregationSettingsForOrgResponseRow[]>;
}

export interface OrganisationModuleService {
  getByOrgId(
    ctx: ServiceContext
  ): Promise<OrganisationModuleByOrgIdResponse | null>;
}

export interface FormConfigurationService {
  getByParentTypes(
    ctx: ServiceContext,
    parentTypes: ParentType[]
  ): Promise<GetFormConfigurationResponseRow[]>;

  createFormField(
    ctx: ServiceContext,
    input: CreateFormFieldRequest
  ): Promise<CreateFormFieldResponse>;

  updateFormField(
    ctx: ServiceContext,
    input: UpdateFormFieldRequest
  ): Promise<UpdateFormFieldResponse>;

  deleteFormField(
    ctx: ServiceContext,
    input: DeleteFormFieldRequest
  ): Promise<void>;

  canUpdateFormConfig(
    ctx: ServiceContext,
    resourceType: string
  ): Promise<boolean>;
}

export interface FormConfigurationBackendService {
  getByParentTypes(
    ctx: BackendServiceContext,
    parentTypes: ParentType[]
  ): Promise<{ formConfiguration: GetFormConfigurationResponseRow[] }>;
}

export interface ImpactService {
  getLatestImpactRatingsForRatedImpactsByRatedItemId(
    ctx: ServiceContext,
    ratedItemId: string
  ): Promise<GetLatestImpactRatingsForRatedImpactsByRatedItemIdResponseRow[]>;
}

export interface IngestionConfigService {
  getAll(ctx: ServiceContext): Promise<IngestionConfigResponseRow[]>;
}

export interface AppetiteService {
  getAppetitesGroupedByImpact(
    ctx: ServiceContext
  ): Promise<GetAppetitesGroupedByImpactResponseRow[]>;
  getActiveAppetitesRegister(
    ctx: ServiceContext
  ): Promise<AppetiteRegisterResponse>;
  getAppetitesByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<{ appetite_parent: AppetiteParentRegisterResponseRow[] }>;
  getAppetiteById(
    ctx: ServiceContext,
    appetiteId: string
  ): Promise<AppetiteByIdResponseRow[]>;
  getActiveAppetitesByParentId(
    ctx: ServiceContext,
    parentId: string
  ): Promise<GetActiveAppetitesByParentIdResponseRow[]>;
  insertAppetite(
    ctx: ServiceContext,
    input: CreateAppetiteRequest
  ): Promise<CreateAppetiteResponse>;
  updateAppetite(
    ctx: ServiceContext,
    input: UpdateAppetiteRequest
  ): Promise<UpdateAppetiteResponse>;
  deleteAppetites(ctx: ServiceContext, ids: string[]): Promise<void>;
}

export interface IssueUpdateService {
  getIssueUpdatesByParentIssueId(
    ctx: ServiceContext,
    id: string
  ): Promise<GetIssueUpdatesByParentIssueIdResponseRow[]>;
  getIssueUpdateById(
    ctx: ServiceContext,
    id: string
  ): Promise<GetIssueUpdateByIdResponseRow[]>;
  insertIssueUpdate(
    ctx: ServiceContext,
    input: CreateIssueUpdateRequest
  ): Promise<CreateIssueUpdateResponse>;
  deleteIssueUpdates(
    ctx: ServiceContext,
    input: DeleteIssueUpdatesRequest
  ): Promise<void>;
}

export interface IssueUpdateAuditService {
  getIssueUpdateAuditById(
    ctx: ServiceContext,
    id: string
  ): Promise<GetIssueUpdateAuditByIdResponseRow[]>;
}

export interface RiskAssessmentResultConfigAuditService {
  getRiskAssessmentResultConfigAuditById(
    ctx: ServiceContext,
    id: string
  ): Promise<GetRiskAssessmentResultConfigAuditByIdResponseRow[]>;
}

export interface RiskAssessmentResultImpactAuditService {
  getRiskAssessmentResultImpactAuditById(
    ctx: ServiceContext,
    id: string
  ): Promise<GetRiskAssessmentResultImpactAuditByIdResponseRow[]>;
}

export interface ImpactBackendService {
  getImpactList(
    ctx: BackendServiceContext,
    opts: ListQueryBySeqId
  ): Promise<ImpactListResponse>;
  getImpactById(
    ctx: BackendServiceContext,
    impactId: string
  ): Promise<ImpactByIdResponse | null>;
}

export interface LinkedItemBackendService {
  getLinkedItemList(
    ctx: BackendServiceContext,
    opts: LinkedListQueryByUuidTs
  ): Promise<LinkedItemListResponse>;
}

export interface AiFeedbackService {
  submitAiAssistantFeedback(
    ctx: ServiceContext,
    feedback: AiAssistantFeedbackRequest
  ): Promise<void>;
  submitWorkflowFeedback(
    ctx: ServiceContext,
    feedback: WorkflowFeedbackRequest
  ): Promise<void>;
}

export interface UserGroupService {
  getById(
    ctx: ServiceContext,
    id: string
  ): Promise<GetUserGroupByIdResponseRow[]>;
  getUsersByGroupId(
    ctx: ServiceContext,
    groupId: string
  ): Promise<GetUsersByGroupIdResponseRow[]>;
  getUserGroupsWithApprovers(
    ctx: ServiceContext
  ): Promise<GetUserGroupsWithApproversResponseRow[]>;
}

export type SsoSaveAction =
  | 'created'
  | 'updated_org_connection'
  | 'updated_login_experience'
  | 'no_change';

export const Strategy = {
  Ad: 'ad',
  Azure: 'waad',
  Google: 'google-apps',
  Okta: 'okta',
};

export type Strategy = (typeof Strategy)[keyof typeof Strategy];
export interface SaveSsoConfigInput {
  name?: string;
  strategy: Strategy;
  domain: string;
  clientId: string;
  clientSecret: string;
  addOrgConnection: boolean;
  connectionId?: string;
  domainAliases?: string[];
}

export interface SsoSaveResult {
  Id: string;
  Name: string;
  Strategy: string;
  Enabled: boolean;
  IsOrgConnected: boolean;
  Action: SsoSaveAction;
  Options: {
    Domain?: string;
    DomainAliases?: string[];
  };
}

export interface SsoConfigurationService {
  saveSsoConfiguration(
    ctx: ServiceContext,
    input: SaveSsoConfigInput
  ): Promise<SsoSaveResult>;
  deleteSsoConfiguration(
    ctx: ServiceContext,
    connectionId: string
  ): Promise<void>;
  getSsoConfigurations(ctx: ServiceContext): Promise<SsoConfigurationRow[]>;
}
