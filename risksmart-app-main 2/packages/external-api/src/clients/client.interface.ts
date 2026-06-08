import type { GetFormConfigurationResponseRow } from '@risksmart-app/trpc/src/types';

import type { AppClientCreate } from '../schemas/app-clients/app-client.schema';
import type { AuthTokenRequestData } from '../schemas/auth.schema';
import type { TrpcClient } from '../trpc/client';

// Generic type helpers for trpc routes (instead of repeating type defs).
type TrpcQueryFn<
  Resource extends keyof TrpcClient['backend']['v1'],
  Method extends keyof TrpcClient['backend']['v1'][Resource],
> = TrpcClient['backend']['v1'][Resource][Method]['query'];

type TrpcQueryResponse<
  Resource extends keyof TrpcClient['backend']['v1'],
  Method extends keyof TrpcClient['backend']['v1'][Resource],
> = Awaited<ReturnType<TrpcQueryFn<Resource, Method>>>;

type TrpcQueryParams<
  Resource extends keyof TrpcClient['backend']['v1'],
  Method extends keyof TrpcClient['backend']['v1'][Resource],
> = Parameters<TrpcQueryFn<Resource, Method>>[0];

// Frontend type helpers
type TrpcFrontendQueryFn<
  Resource extends keyof TrpcClient['frontend'],
  Method extends keyof TrpcClient['frontend'][Resource],
> = TrpcClient['frontend'][Resource][Method]['query'];

type TrpcFrontendQueryResponse<
  Resource extends keyof TrpcClient['frontend'],
  Method extends keyof TrpcClient['frontend'][Resource],
> = Awaited<ReturnType<TrpcFrontendQueryFn<Resource, Method>>>;

export interface Context {
  authorization: string;
  [key: string]: unknown;
}

// Response types using generic helpers
export type RiskListQueryResponse = TrpcQueryResponse<'risk', 'riskList'>;
export type RiskByIdResponse = TrpcQueryResponse<'risk', 'riskById'>;
export type RiskListRatingResponse = TrpcQueryResponse<
  'risk',
  'riskAssessmentResultsList'
>;
export type RiskListAppetiteResponse = TrpcQueryResponse<
  'risk',
  'riskAppetitesList'
>;
export type RiskListImpactRatingResponse = TrpcQueryResponse<
  'risk',
  'riskImpactRatingsList'
>;
export type RiskListControlsResponse = TrpcQueryResponse<
  'risk',
  'riskControlsList'
>;
export type RiskListActionsResponse = TrpcQueryResponse<
  'risk',
  'riskActionsList'
>;
export type ControlListQueryResponse = TrpcQueryResponse<
  'control',
  'controlList'
>;
export type RiskListIndicatorsResponse = TrpcQueryResponse<
  'risk',
  'riskIndicatorsList'
>;
export type ListAcceptancesResponse = TrpcQueryResponse<
  'risk',
  'riskAcceptancesList'
>;
export type ControlByIdResponse = TrpcQueryResponse<'control', 'controlById'>;
export type FormConfigResponse = GetFormConfigurationResponseRow;
export type ActionListQueryResponse = TrpcQueryResponse<'action', 'actionList'>;
export type ActionByIdResponse = TrpcQueryResponse<'action', 'actionById'>;
export type IssueListQueryResponse = TrpcQueryResponse<'issue', 'issueList'>;
export type IssueByIdResponse = TrpcQueryResponse<'issue', 'issueById'>;
export type DocumentListQueryResponse = TrpcQueryResponse<
  'document',
  'documentList'
>;
export type DocumentByIdResponse = TrpcQueryResponse<
  'document',
  'documentById'
>;
export type AssessmentListQueryResponse = TrpcQueryResponse<
  'assessment',
  'assessmentList'
>;
export type AssessmentByIdResponse = TrpcQueryResponse<
  'assessment',
  'assessmentById'
>;
export type IndicatorListQueryResponse = TrpcQueryResponse<
  'indicator',
  'indicatorList'
>;
export type IndicatorByIdResponse = TrpcQueryResponse<
  'indicator',
  'indicatorById'
>;
export type IndicatorResultListQueryResponse = TrpcQueryResponse<
  'indicator',
  'indicatorResultList'
>;
export type IndicatorResultByIdResponse = TrpcQueryResponse<
  'indicator',
  'indicatorResultById'
>;
export type ObligationListQueryResponse = TrpcQueryResponse<
  'obligation',
  'obligationList'
>;
export type ObligationByIdResponse = TrpcQueryResponse<
  'obligation',
  'obligationById'
>;
export type ThirdPartyListQueryResponse = TrpcQueryResponse<
  'thirdParty',
  'thirdPartyList'
>;
export type ThirdPartyByIdResponse = TrpcQueryResponse<
  'thirdParty',
  'thirdPartyById'
>;
export type UserByIdResponse = TrpcQueryResponse<'user', 'userById'>;
export type UsersListQueryResponse = TrpcQueryResponse<'user', 'userList'>;
export type EnterpriseRiskListQueryResponse = TrpcQueryResponse<
  'enterpriseRisk',
  'enterpriseRiskList'
>;
export type EnterpriseRiskByIdResponse = TrpcQueryResponse<
  'enterpriseRisk',
  'enterpriseRiskById'
>;
export type EnterpriseRiskChildRiskListQueryResponse = TrpcQueryResponse<
  'enterpriseRisk',
  'enterpriseRiskChildRiskList'
>;
export type ImpactRatingByIdResponse = TrpcQueryResponse<
  'impactRating',
  'impactRatingById'
>;
export type AppetiteByIdResponse = TrpcQueryResponse<
  'appetite',
  'appetiteById'
>;
export type RiskRatingByIdResponse = TrpcQueryResponse<
  'assessment',
  'riskAssessmentResultById'
>;
export type ImpactListQueryResponse = TrpcQueryResponse<'impact', 'impactList'>;
export type ImpactByIdResponse = TrpcQueryResponse<'impact', 'impactById'>;
export type UserGroupListQueryResponse = TrpcQueryResponse<
  'userGroup',
  'userGroupList'
>;
export type UserGroupByIdResponse = TrpcQueryResponse<
  'userGroup',
  'userGroupById'
>;
export type DepartmentTypeListQueryResponse = TrpcQueryResponse<
  'departmentType',
  'departmentTypeList'
>;
export type DepartmentTypeByIdResponse = TrpcQueryResponse<
  'departmentType',
  'departmentTypeById'
>;
export type DepartmentGroupTypeListQueryResponse = TrpcQueryResponse<
  'departmentGroupType',
  'departmentGroupTypeList'
>;
export type DepartmentGroupTypeByIdResponse = TrpcQueryResponse<
  'departmentGroupType',
  'departmentGroupTypeById'
>;
export type TagTypeListQueryResponse = TrpcQueryResponse<'tagType', 'tagTypeList'>;
export type TagTypeByIdResponse = TrpcQueryResponse<'tagType', 'tagTypeById'>;
export type AcceptanceByIdResponse = TrpcQueryResponse<
  'acceptance',
  'acceptanceById'
>;
export type RiskListApprovalResponse = TrpcQueryResponse<
  'risk',
  'riskApprovalsList'
>;
export type ApprovalByIdResponse = TrpcQueryResponse<
  'approval',
  'approvalById'
>;
export type LinkedItemsListResponse = TrpcQueryResponse<
  'linkedItem',
  'linkedItemList'
>;
export type FormConfigsByParentTypesResponse = TrpcQueryResponse<
  'formConfiguration',
  'getByParentTypes'
>;

// Issue nested endpoint response types
export type IssueCausesListResponse = TrpcQueryResponse<
  'issue',
  'issueCausesList'
>;
export type IssueCauseByIdResponse = TrpcQueryResponse<
  'issue',
  'issueCauseById'
>;
export type IssueConsequencesListResponse = TrpcQueryResponse<
  'issue',
  'issueConsequencesList'
>;
export type IssueConsequenceByIdResponse = TrpcQueryResponse<
  'issue',
  'issueConsequenceById'
>;
export type IssueUpdatesListResponse = TrpcQueryResponse<
  'issue',
  'issueUpdatesList'
>;
export type IssueUpdateByIdResponse = TrpcQueryResponse<
  'issue',
  'issueUpdateById'
>;
export type IssueActionsListResponse = TrpcQueryResponse<
  'issue',
  'issueActionsList'
>;
export type IssueAssessmentResponse = TrpcQueryResponse<
  'issue',
  'issueAssessment'
>;

export type OrganisationModuleResponse = TrpcFrontendQueryResponse<
  'organisationModule',
  'getByOrgId'
>;

export interface IClient {
  queryRiskList(
    context: Context,
    query?: TrpcQueryParams<'risk', 'riskList'>
  ): Promise<TrpcQueryResponse<'risk', 'riskList'>>;
  getRiskById(
    context: Context,
    riskId: string
  ): Promise<TrpcQueryResponse<'risk', 'riskById'>>;
  queryRiskRatings(
    context: Context,
    query: TrpcQueryParams<'risk', 'riskAssessmentResultsList'>
  ): Promise<RiskListRatingResponse>;
  queryRiskAcceptancesList(
    context: Context,
    query: TrpcQueryParams<'risk', 'riskAcceptancesList'>
  ): Promise<ListAcceptancesResponse>;
  queryRiskImpactRatingList(
    context: Context,
    query: TrpcQueryParams<'risk', 'riskImpactRatingsList'>
  ): Promise<RiskListImpactRatingResponse>;
  queryRiskAppetiteList(
    context: Context,
    query: TrpcQueryParams<'risk', 'riskAppetitesList'>
  ): Promise<RiskListAppetiteResponse>;
  queryRiskControlsList(
    context: Context,
    query: TrpcQueryParams<'risk', 'riskControlsList'>
  ): Promise<TrpcQueryResponse<'risk', 'riskControlsList'>>;
  queryRiskIndicatorsList(
    context: Context,
    query: TrpcQueryParams<'risk', 'riskIndicatorsList'>
  ): Promise<TrpcQueryResponse<'risk', 'riskIndicatorsList'>>;
  queryRiskActionsList(
    context: Context,
    query: TrpcQueryParams<'risk', 'riskActionsList'>
  ): Promise<TrpcQueryResponse<'risk', 'riskActionsList'>>;
  queryControlList(
    context: Context,
    query?: TrpcQueryParams<'control', 'controlList'>
  ): Promise<TrpcQueryResponse<'control', 'controlList'>>;
  getControlById(
    context: Context,
    controlId: string
  ): Promise<TrpcQueryResponse<'control', 'controlById'>>;
  queryActionList(
    context: Context,
    query?: TrpcQueryParams<'action', 'actionList'>
  ): Promise<TrpcQueryResponse<'action', 'actionList'>>;
  getActionById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'action', 'actionById'>>;
  queryIssueList(
    context: Context,
    query?: TrpcQueryParams<'issue', 'issueList'>
  ): Promise<TrpcQueryResponse<'issue', 'issueList'>>;
  getIssueById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'issue', 'issueById'>>;
  queryDocumentList(
    context: Context,
    query?: TrpcQueryParams<'document', 'documentList'>
  ): Promise<TrpcQueryResponse<'document', 'documentList'>>;
  getDocumentById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'document', 'documentById'>>;
  queryAssessmentList(
    context: Context,
    query?: TrpcQueryParams<'assessment', 'assessmentList'>
  ): Promise<TrpcQueryResponse<'assessment', 'assessmentList'>>;
  getAssessmentById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'assessment', 'assessmentById'>>;
  queryIndicatorList(
    context: Context,
    query?: TrpcQueryParams<'indicator', 'indicatorList'>
  ): Promise<TrpcQueryResponse<'indicator', 'indicatorList'>>;
  getIndicatorById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'indicator', 'indicatorById'>>;
  queryIndicatorResultList(
    context: Context,
    query: TrpcQueryParams<'indicator', 'indicatorResultList'>
  ): Promise<IndicatorResultListQueryResponse>;
  getIndicatorResultById(
    context: Context,
    id: string
  ): Promise<IndicatorResultByIdResponse>;
  queryObligationList(
    context: Context,
    query?: TrpcQueryParams<'obligation', 'obligationList'>
  ): Promise<TrpcQueryResponse<'obligation', 'obligationList'>>;
  getObligationById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'obligation', 'obligationById'>>;
  queryThirdPartyList(
    context: Context,
    query?: TrpcQueryParams<'thirdParty', 'thirdPartyList'>
  ): Promise<TrpcQueryResponse<'thirdParty', 'thirdPartyList'>>;
  getThirdPartyById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'thirdParty', 'thirdPartyById'>>;
  queryUserList(
    context: Context,
    query?: TrpcQueryParams<'user', 'userList'>
  ): Promise<UsersListQueryResponse>;
  getUserById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'user', 'userById'>>;
  queryEnterpriseChildRisks(
    context: Context,
    query: TrpcQueryParams<'enterpriseRisk', 'enterpriseRiskChildRiskList'>
  ): Promise<EnterpriseRiskChildRiskListQueryResponse>;
  queryEnterpriseRiskList(
    context: Context,
    query?: TrpcQueryParams<'enterpriseRisk', 'enterpriseRiskList'>
  ): Promise<TrpcQueryResponse<'enterpriseRisk', 'enterpriseRiskList'>>;
  getEnterpriseRiskById(
    context: Context,
    id: string
  ): Promise<TrpcQueryResponse<'enterpriseRisk', 'enterpriseRiskById'>>;
  getAppetiteById(context: Context, id: string): Promise<AppetiteByIdResponse>;
  getImpactRatingById(
    context: Context,
    id: string
  ): Promise<ImpactRatingByIdResponse>;
  getRiskRatingById(
    context: Context,
    id: string
  ): Promise<RiskRatingByIdResponse>;
  queryImpactList(
    context: Context,
    query?: TrpcQueryParams<'impact', 'impactList'>
  ): Promise<ImpactListQueryResponse>;
  getImpactById(context: Context, id: string): Promise<ImpactByIdResponse>;
  getAcceptanceById(
    context: Context,
    id: string
  ): Promise<AcceptanceByIdResponse>;
  queryRiskApprovalsList(
    context: Context,
    query: TrpcQueryParams<'risk', 'riskApprovalsList'>
  ): Promise<RiskListApprovalResponse>;
  getApprovalById(context: Context, id: string): Promise<ApprovalByIdResponse>;
  queryLinkedItemsList(
    context: Context,
    query: TrpcQueryParams<'linkedItem', 'linkedItemList'>
  ): Promise<LinkedItemsListResponse>;

  // Issue nested endpoints
  queryIssueCausesList(
    context: Context,
    query: TrpcQueryParams<'issue', 'issueCausesList'>
  ): Promise<IssueCausesListResponse>;
  getIssueCauseById(
    context: Context,
    id: string
  ): Promise<IssueCauseByIdResponse>;
  queryIssueConsequencesList(
    context: Context,
    query: TrpcQueryParams<'issue', 'issueConsequencesList'>
  ): Promise<IssueConsequencesListResponse>;
  getIssueConsequenceById(
    context: Context,
    id: string
  ): Promise<IssueConsequenceByIdResponse>;
  queryIssueUpdatesList(
    context: Context,
    query: TrpcQueryParams<'issue', 'issueUpdatesList'>
  ): Promise<IssueUpdatesListResponse>;
  getIssueUpdateById(
    context: Context,
    id: string
  ): Promise<IssueUpdateByIdResponse>;
  queryIssueActionsList(
    context: Context,
    query: TrpcQueryParams<'issue', 'issueActionsList'>
  ): Promise<IssueActionsListResponse>;
  queryIssueAssessment(
    context: Context,
    query: TrpcQueryParams<'issue', 'issueAssessment'>
  ): Promise<IssueAssessmentResponse>;
  queryOrganisationModule(
    context: Context
  ): Promise<OrganisationModuleResponse>;
  getFormConfigsByParentTypes(
    context: Context,
    parentTypes: TrpcQueryParams<
      'formConfiguration',
      'getByParentTypes'
    >['parentTypes']
  ): Promise<FormConfigsByParentTypesResponse>;
  queryUserGroupList(
    context: Context,
    query?: TrpcQueryParams<'userGroup', 'userGroupList'>
  ): Promise<UserGroupListQueryResponse>;
  getUserGroupById(
    context: Context,
    id: string
  ): Promise<UserGroupByIdResponse>;
  queryDepartmentTypeList(
    context: Context,
    query?: TrpcQueryParams<'departmentType', 'departmentTypeList'>
  ): Promise<DepartmentTypeListQueryResponse>;
  getDepartmentTypeById(
    context: Context,
    id: string
  ): Promise<DepartmentTypeByIdResponse>;
  queryDepartmentGroupTypeList(
    context: Context,
    query?: TrpcQueryParams<'departmentGroupType', 'departmentGroupTypeList'>
  ): Promise<DepartmentGroupTypeListQueryResponse>;
  getDepartmentGroupTypeById(
    context: Context,
    id: string
  ): Promise<DepartmentGroupTypeByIdResponse>;
  queryTagTypeList(
    context: Context,
    query?: TrpcQueryParams<'tagType', 'tagTypeList'>
  ): Promise<TagTypeListQueryResponse>;
  getTagTypeById(
    context: Context,
    id: string
  ): Promise<TagTypeByIdResponse | null>;
}

export interface NewClientResult {
  clientName: string;
  clientKey: string;
  clientSecret: string;
}

export interface ClientAccessTokenResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface OrgClientItem {
  clientName: string;
  scopes: string;
  createdAt: number;
  updatedAt: number;
  status: string;
  clientId: string;
  compatVersion: string;
  role: string;
  orgId: string;
  tenantId: string;
  rateLimitProfile?: string;
}
export interface IAuthClient {
  createNewClient(newClientData: AppClientCreate): Promise<NewClientResult>;
  createClientAccessToken(
    clientData: AuthTokenRequestData
  ): Promise<ClientAccessTokenResult>;
  getOrgClients(tenantId: string, orgId: string): Promise<OrgClientItem[]>;
  getActiveClient(clientId: string): Promise<OrgClientItem | null>;
  disableAndRemoveClient(clientId: string, actorId: string): Promise<void>;
}
