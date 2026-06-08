import { createTrpcClient } from '../trpc/client';
import type {
  AssessmentByIdResponse,
  AssessmentListQueryResponse,
  Context,
  DepartmentGroupTypeByIdResponse,
  DepartmentGroupTypeListQueryResponse,
  DepartmentTypeByIdResponse,
  DepartmentTypeListQueryResponse,
  IClient,
  IndicatorByIdResponse,
  IndicatorListQueryResponse,
  IndicatorResultByIdResponse,
  IndicatorResultListQueryResponse,
  ObligationByIdResponse,
  ObligationListQueryResponse,
  RiskByIdResponse,
  RiskListQueryResponse,
  TagTypeByIdResponse,
  TagTypeListQueryResponse,
  ThirdPartyByIdResponse,
  ThirdPartyListQueryResponse,
  UserByIdResponse,
  UserGroupByIdResponse,
  UserGroupListQueryResponse,
} from './client.interface';

// Adapter for tRPC client data.
export function TrpcClientAdapter(
  trpcUrl: string,
  appVersion: string
): IClient {
  const fullTrpcClient = createTrpcClient(trpcUrl, appVersion);
  const trpcClient = fullTrpcClient.backend.v1;
  const frontendClient = fullTrpcClient.frontend;

  return {
    queryRiskList(context: Context, query): Promise<RiskListQueryResponse> {
      return trpcClient.risk.riskList.query(query, {
        context,
      });
    },
    getRiskById(context: Context, riskId: string): Promise<RiskByIdResponse> {
      return trpcClient.risk.riskById.query({ riskId }, { context });
    },
    getRiskRatingById(context, id) {
      return trpcClient.assessment.riskAssessmentResultById.query(
        { id },
        { context }
      );
    },
    queryRiskRatings(context, query) {
      return trpcClient.risk.riskAssessmentResultsList.query(query, {
        context,
      });
    },
    queryRiskAppetiteList(context, query) {
      return trpcClient.risk.riskAppetitesList.query(query, {
        context,
      });
    },
    queryRiskImpactRatingList(context, query) {
      return trpcClient.risk.riskImpactRatingsList.query(query, {
        context,
      });
    },
    queryRiskAcceptancesList(context, query) {
      return trpcClient.risk.riskAcceptancesList.query(query, { context });
    },
    queryRiskControlsList(context, query) {
      return trpcClient.risk.riskControlsList.query(query, {
        context,
      });
    },
    queryRiskIndicatorsList(context, query) {
      return trpcClient.risk.riskIndicatorsList.query(query, {
        context,
      });
    },
    queryRiskActionsList(context, query) {
      return trpcClient.risk.riskActionsList.query(query, {
        context,
      });
    },
    queryControlList(context: Context, query) {
      return trpcClient.control.controlList.query(query, {
        context,
      });
    },
    getControlById(context: Context, controlId: string) {
      return trpcClient.control.controlById.query({ controlId }, { context });
    },
    queryActionList(context, query) {
      return trpcClient.action.actionList.query(query, { context });
    },
    getActionById(context, id) {
      return trpcClient.action.actionById.query({ actionId: id }, { context });
    },
    queryIssueList(context, query) {
      return trpcClient.issue.issueList.query(query, { context });
    },
    getIssueById(context, id) {
      return trpcClient.issue.issueById.query({ issueId: id }, { context });
    },
    queryDocumentList(context, query) {
      return trpcClient.document.documentList.query(query, {
        context,
      });
    },
    getDocumentById(context, id) {
      return trpcClient.document.documentById.query(
        { documentId: id },
        { context }
      );
    },
    queryAssessmentList(
      context: Context,
      query
    ): Promise<AssessmentListQueryResponse> {
      return trpcClient.assessment.assessmentList.query(query, {
        context,
      });
    },
    getAssessmentById(
      context: Context,
      id: string
    ): Promise<AssessmentByIdResponse> {
      return trpcClient.assessment.assessmentById.query(
        { assessmentId: id },
        { context }
      );
    },
    queryIndicatorList(
      context: Context,
      query
    ): Promise<IndicatorListQueryResponse> {
      return trpcClient.indicator.indicatorList.query(query, {
        context,
      });
    },
    getIndicatorById(
      context: Context,
      id: string
    ): Promise<IndicatorByIdResponse> {
      return trpcClient.indicator.indicatorById.query(
        { indicatorId: id },
        { context }
      );
    },
    queryIndicatorResultList(
      context: Context,
      query
    ): Promise<IndicatorResultListQueryResponse> {
      return trpcClient.indicator.indicatorResultList.query(query, {
        context,
      });
    },
    getIndicatorResultById(
      context: Context,
      id: string
    ): Promise<IndicatorResultByIdResponse> {
      return trpcClient.indicator.indicatorResultById.query(
        { indicatorResultId: id },
        { context }
      );
    },
    queryObligationList(
      context: Context,
      query
    ): Promise<ObligationListQueryResponse> {
      return trpcClient.obligation.obligationList.query(query, {
        context,
      });
    },
    getObligationById(
      context: Context,
      id: string
    ): Promise<ObligationByIdResponse> {
      return trpcClient.obligation.obligationById.query(
        { obligationId: id },
        { context }
      );
    },
    queryThirdPartyList(
      context: Context,
      query
    ): Promise<ThirdPartyListQueryResponse> {
      return trpcClient.thirdParty.thirdPartyList.query(query, {
        context,
      });
    },
    getThirdPartyById(
      context: Context,
      id: string
    ): Promise<ThirdPartyByIdResponse> {
      return trpcClient.thirdParty.thirdPartyById.query(
        { thirdPartyId: id },
        { context }
      );
    },
    queryUserList(context, query) {
      return trpcClient.user.userList.query(query, { context });
    },
    getUserById(context: Context, id: string): Promise<UserByIdResponse> {
      return trpcClient.user.userById.query({ userId: id }, { context });
    },
    queryEnterpriseRiskList(context, query) {
      return trpcClient.enterpriseRisk.enterpriseRiskList.query(query, {
        context,
      });
    },
    getEnterpriseRiskById(context, id) {
      return trpcClient.enterpriseRisk.enterpriseRiskById.query(
        { enterpriseRiskId: id },
        { context }
      );
    },
    queryEnterpriseChildRisks(context, query) {
      return trpcClient.enterpriseRisk.enterpriseRiskChildRiskList.query(
        query,
        { context }
      );
    },
    getAppetiteById(context, id) {
      return trpcClient.appetite.appetiteById.query({ id }, { context });
    },
    getImpactRatingById(context, id) {
      return trpcClient.impactRating.impactRatingById.query(
        { id },
        { context }
      );
    },
    queryImpactList(context, query) {
      return trpcClient.impact.impactList.query(query, { context });
    },
    getImpactById(context, id) {
      return trpcClient.impact.impactById.query({ id }, { context });
    },
    getAcceptanceById(context, id) {
      return trpcClient.acceptance.acceptanceById.query({ id }, { context });
    },
    queryRiskApprovalsList(context, query) {
      return trpcClient.risk.riskApprovalsList.query(query, { context });
    },
    getApprovalById(context, id) {
      return trpcClient.approval.approvalById.query({ id }, { context });
    },
    queryLinkedItemsList(context, query) {
      return trpcClient.linkedItem.linkedItemList.query(query, { context });
    },
    // Issue nested endpoints
    queryIssueCausesList(context, query) {
      return trpcClient.issue.issueCausesList.query(query, { context });
    },
    getIssueCauseById(context, id) {
      return trpcClient.issue.issueCauseById.query({ id }, { context });
    },
    queryIssueConsequencesList(context, query) {
      return trpcClient.issue.issueConsequencesList.query(query, { context });
    },
    getIssueConsequenceById(context, id) {
      return trpcClient.issue.issueConsequenceById.query({ id }, { context });
    },
    queryIssueUpdatesList(context, query) {
      return trpcClient.issue.issueUpdatesList.query(query, { context });
    },
    getIssueUpdateById(context, id) {
      return trpcClient.issue.issueUpdateById.query({ id }, { context });
    },
    queryIssueActionsList(context, query) {
      return trpcClient.issue.issueActionsList.query(query, { context });
    },
    queryIssueAssessment(context, query) {
      return trpcClient.issue.issueAssessment.query(query, { context });
    },
    queryOrganisationModule(context) {
      return frontendClient.organisationModule.getByOrgId.query(undefined, {
        context,
      });
    },
    getFormConfigsByParentTypes(context, parentTypes) {
      return trpcClient.formConfiguration.getByParentTypes.query(
        { parentTypes },
        { context }
      );
    },
    queryUserGroupList(
      context: Context,
      query
    ): Promise<UserGroupListQueryResponse> {
      return trpcClient.userGroup.userGroupList.query(query, { context });
    },
    getUserGroupById(
      context: Context,
      id: string
    ): Promise<UserGroupByIdResponse> {
      return trpcClient.userGroup.userGroupById.query(
        { userGroupId: id },
        { context }
      );
    },
    queryDepartmentTypeList(
      context: Context,
      query
    ): Promise<DepartmentTypeListQueryResponse> {
      return trpcClient.departmentType.departmentTypeList.query(query, {
        context,
      });
    },
    getDepartmentTypeById(
      context: Context,
      id: string
    ): Promise<DepartmentTypeByIdResponse> {
      return trpcClient.departmentType.departmentTypeById.query(
        { departmentTypeId: id },
        { context }
      );
    },
    queryDepartmentGroupTypeList(
      context: Context,
      query
    ): Promise<DepartmentGroupTypeListQueryResponse> {
      return trpcClient.departmentGroupType.departmentGroupTypeList.query(query, {
        context,
      });
    },
    getDepartmentGroupTypeById(
      context: Context,
      id: string
    ): Promise<DepartmentGroupTypeByIdResponse> {
      return trpcClient.departmentGroupType.departmentGroupTypeById.query(
        { departmentGroupTypeId: id },
        { context }
      );
    },
    queryTagTypeList(
      context: Context,
      query
    ): Promise<TagTypeListQueryResponse> {
      return trpcClient.tagType.tagTypeList.query(query, { context });
    },
    getTagTypeById(
      context: Context,
      id: string
    ): Promise<TagTypeByIdResponse | null> {
      return trpcClient.tagType.tagTypeById.query(
        { tagTypeId: id },
        { context }
      );
    },
  };
}
