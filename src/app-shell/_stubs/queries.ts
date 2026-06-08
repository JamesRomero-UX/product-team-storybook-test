/* eslint-disable */
const noData = { data: undefined, loading: false, error: undefined, refetch: async () => ({}), fetchMore: async () => ({}), networkStatus: 7 };
const noDataHook = (..._args) => noData;
const noopMapper = (x) => x ?? [];

export const RiskAssessmentResultConfig = noopMapper;
export const mapTrpcAcceptancesToGraphQL = noopMapper;
export const mapTrpcActionsToGraphQL = noopMapper;
export const mapTrpcAssessmentsToGraphQL = noopMapper;
export const mapTrpcCausesToGraphQL = noopMapper;
export const mapTrpcConsequencesToGraphQL = noopMapper;
export const mapTrpcControlsToGraphQL = noopMapper;
export const mapTrpcDocumentsToGraphQL = noopMapper;
export const mapTrpcEnterpriseRisksToGraphQL = noopMapper;
export const mapTrpcIndicatorsToGraphQL = noopMapper;
export const mapTrpcInternalAuditEntitiesToGraphQL = noopMapper;
export const mapTrpcIssuesToGraphQL = noopMapper;
export const mapTrpcMyDueItemsToGraphQL = noopMapper;
export const mapTrpcObligationsToGraphQL = noopMapper;
export const mapTrpcRisksToGraphQL = noopMapper;
export const mapTrpcThirdPartiesToGraphQL = noopMapper;
export const useCanManageFormConfig = noDataHook;
export const useGetAcceptanceAuditById = noDataHook;
export const useGetAcceptanceById = noDataHook;
export const useGetAcceptancesByParentRiskId = noDataHook;
export const useGetAcceptancesRegister = noDataHook;
export const useGetActionAuditById = noDataHook;
export const useGetActionById = noDataHook;
export const useGetActionUpdateById = noDataHook;
export const useGetActionUpdatesByParentActionId = noDataHook;
export const useGetActionsByParentIdRegister = noDataHook;
export const useGetActionsRegister = noDataHook;
export const useGetAllAssessmentResults = noDataHook;
export const useGetAppetiteById = noDataHook;
export const useGetAppetitesByRiskId = noDataHook;
export const useGetAppetitesGroupedByImpact = noDataHook;
export const useGetAppetitesRegister = noDataHook;
export const useGetAssessmentActivitiesByParentId = noDataHook;
export const useGetAssessmentActivitiesRegister = noDataHook;
export const useGetAssessmentById = noDataHook;
export const useGetAssessmentResultById = noDataHook;
export const useGetAssessmentsRegister = noDataHook;
export const useGetAttestationConfig = noDataHook;
export const useGetAttestationCycles = noDataHook;
export const useGetAttestationCyclesRegister = noDataHook;
export const useGetAttestationStatus = noDataHook;
export const useGetAttestationsRegister = noDataHook;
export const useGetBusinessAreas = noDataHook;
export const useGetCauseById = noDataHook;
export const useGetCauseRegister = noDataHook;
export const useGetCausesByParentIssueId = noDataHook;
export const useGetChangeRequests = noDataHook;
export const useGetComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId = noDataHook;
export const useGetComplianceMonitoringAssessmentTestResultsByControlId = noDataHook;
export const useGetConsequenceAuditById = noDataHook;
export const useGetConsequenceById = noDataHook;
export const useGetConsequenceRegister = noDataHook;
export const useGetConsequencesByParentIssueId = noDataHook;
export const useGetControlById = noDataHook;
export const useGetControlGroups = noDataHook;
export const useGetControlGroupsByTitle = noDataHook;
export const useGetControlGroupsRegister = noDataHook;
export const useGetControlsBasic = noDataHook;
export const useGetControlsByUserId = noDataHook;
export const useGetControlsRegister = noDataHook;
export const useGetDepartments = noDataHook;
export const useGetDocumentAssessmentResultsByParentId = noDataHook;
export const useGetDocumentById = noDataHook;
export const useGetDocumentFileById = noDataHook;
export const useGetDocumentFilesByDocumentId = noDataHook;
export const useGetDocumentList = noDataHook;
export const useGetEnterpriseRiskById = noDataHook;
export const useGetEnterpriseRiskByTier = noDataHook;
export const useGetEnterpriseRisksRegister = noDataHook;
export const useGetEntities = noDataHook;
export const useGetEntityById = noDataHook;
export const useGetFormConfigurationByParentType = noDataHook;
export const useGetGlobalApprovals = noDataHook;
export const useGetIndicatorById = noDataHook;
export const useGetIndicatorRegister = noDataHook;
export const useGetIndicatorResultsByIndicatorId = noDataHook;
export const useGetIndicatorsByParentId = noDataHook;
export const useGetIngestionConfigs = noDataHook;
export const useGetInternalAuditEntitiesRegister = noDataHook;
export const useGetInternalAuditReportById = noDataHook;
export const useGetInternalAuditReportRiskAssessmentResultsByRiskId = noDataHook;
export const useGetInternalAuditReportTestResultsByControlId = noDataHook;
export const useGetInternalAuditReportsByOriginatingItemId = noDataHook;
export const useGetInternalAuditReportsRegister = noDataHook;
export const useGetInternalAuditResultsById = noDataHook;
export const useGetInternalAuditResultsByParentId = noDataHook;
export const useGetInternalAuditTestResultById = noDataHook;
export const useGetIssueAssessmentsByParentId = noDataHook;
export const useGetIssueById = noDataHook;
export const useGetIssueRegister = noDataHook;
export const useGetIssueUpdateAuditById = noDataHook;
export const useGetIssueUpdateById = noDataHook;
export const useGetIssueUpdateRegister = noDataHook;
export const useGetIssuesByParentId = noDataHook;
export const useGetLatestComplianceMonitoringAssessmentTestResultsByControlId = noDataHook;
export const useGetLatestDocumentFile = noDataHook;
export const useGetLatestInternalAuditReportTestResultsByControlId = noDataHook;
export const useGetLatestPublicDocumentFileByDocumentId = noDataHook;
export const useGetLatestQuestionnaireTemplateVersion = noDataHook;
export const useGetLatestRiskAssessmentResultConfig = noDataHook;
export const useGetLatestTestResultsByControlId = noDataHook;
export const useGetLinkedItemRisks = noDataHook;
export const useGetLinkedItems = noDataHook;
export const useGetLinkedRisksByInternalAuditId = noDataHook;
export const useGetObligationById = noDataHook;
export const useGetObligationChangeById = noDataHook;
export const useGetObligationChangesRegister = noDataHook;
export const useGetObligationImpactsByParentId = noDataHook;
export const useGetObligationsRegister = noDataHook;
export const useGetPolicyRegister = noDataHook;
export const useGetPublicDocumentFiles = noDataHook;
export const useGetQuestionnaireTemplateById = noDataHook;
export const useGetQuestionnaireTemplateRegister = noDataHook;
export const useGetQuestionnaireTemplateVersionById = noDataHook;
export const useGetQuestionnaireTemplateVersionsByQuestionnaireTemplateId = noDataHook;
export const useGetRiskAssessmentResultConfigAuditById = noDataHook;
export const useGetRiskAssessmentResultImpactAuditById = noDataHook;
export const useGetRiskAssessmentResultsByRiskId = noDataHook;
export const useGetRiskById = noDataHook;
export const useGetRiskRegister = noDataHook;
export const useGetSsoConfigurations = noDataHook;
export const useGetTags = noDataHook;
export const useGetTestResultById = noDataHook;
export const useGetTestResults = noDataHook;
export const useGetTestResultsByControlId = noDataHook;
export const useGetThirdPartyById = noDataHook;
export const useGetThirdPartyContacts = noDataHook;
export const useGetThirdPartyRegister = noDataHook;
export const useGetUserGroupById = noDataHook;
export const useGetUserGroupsWithApprovers = noDataHook;
export const useGetUsersByGroupId = noDataHook;

export const useGetCollectionTableProps = () => ({
  tableProps: { columnDefinitions: [], items: [], loading: false, trackBy: "Id" },
  collectionProps: {},
  filterProps: {},
  paginationProps: { currentPageIndex: 1, pagesCount: 1 },
  propertyFilterProps: { query: { tokens: [], operation: "and" }, filteringProperties: [], filteringOptions: [] },
});
// Production hook returns `parentTypes.map(pt => ({ parentType: pt, visible: true }))`
// when the trpc feature flag is off. The previous stub returned `data: undefined`,
// which caused `canViewNavType` in `useNavItems` to filter out every section
// → only the always-visible items (Home / Public Policies / Report An Issue /
// Requests / Automations / Settings) survived. We mimic the production fallback:
// return every requested parentType marked visible.
export const useCheckNavigationVisibility = (parentTypes?: string[]) => ({
  data: (parentTypes ?? []).map((parentType) => ({ parentType, visible: true })),
  loading: false,
  refetch: () => Promise.resolve(),
});
export default noDataHook;