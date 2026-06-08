import type {
  AcceptanceByIdResponse,
  ActionByIdResponse,
  ActionListQueryResponse,
  AppetiteByIdResponse,
  ApprovalByIdResponse,
  AssessmentByIdResponse,
  AssessmentListQueryResponse,
  ControlByIdResponse,
  ControlListQueryResponse,
  DepartmentGroupTypeByIdResponse,
  DepartmentGroupTypeListQueryResponse,
  DepartmentTypeByIdResponse,
  DepartmentTypeListQueryResponse,
  DocumentByIdResponse,
  DocumentListQueryResponse,
  EnterpriseRiskByIdResponse,
  EnterpriseRiskChildRiskListQueryResponse,
  EnterpriseRiskListQueryResponse,
  IClient,
  ImpactByIdResponse,
  ImpactListQueryResponse,
  ImpactRatingByIdResponse,
  IndicatorByIdResponse,
  IndicatorListQueryResponse,
  IndicatorResultByIdResponse,
  IndicatorResultListQueryResponse,
  IssueActionsListResponse,
  IssueAssessmentResponse,
  IssueByIdResponse,
  IssueCauseByIdResponse,
  IssueCausesListResponse,
  IssueConsequenceByIdResponse,
  IssueConsequencesListResponse,
  IssueListQueryResponse,
  IssueUpdateByIdResponse,
  IssueUpdatesListResponse,
  LinkedItemsListResponse,
  ListAcceptancesResponse,
  ObligationByIdResponse,
  ObligationListQueryResponse,
  OrganisationModuleResponse,
  RiskByIdResponse,
  RiskListActionsResponse,
  RiskListAppetiteResponse,
  RiskListApprovalResponse,
  RiskListControlsResponse,
  RiskListImpactRatingResponse,
  RiskListIndicatorsResponse,
  RiskListQueryResponse,
  RiskListRatingResponse,
  RiskRatingByIdResponse,
  TagTypeByIdResponse,
  TagTypeListQueryResponse,
  ThirdPartyByIdResponse,
  ThirdPartyListQueryResponse,
  UserByIdResponse,
  UserGroupByIdResponse,
  UserGroupListQueryResponse,
  UsersListQueryResponse,
} from '../clients/client.interface';
import { getMockRisk } from '../testing/mocks/mockRisks';

const mockRisk = getMockRisk();

export const mockTrpcClient = (): IClient => {
  const queryRiskList = async () => {
    const response = {
      risk: [mockRisk],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 1,
      },
    } as RiskListQueryResponse;

    return Promise.resolve(response);
  };
  const getRiskById = async () => {
    const response = {
      risk: mockRisk,
      form_configuration: null,
    } as RiskByIdResponse;

    return Promise.resolve(response);
  };

  const queryRiskAppetiteList = async () => {
    const response = {
      appetite: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as RiskListAppetiteResponse;

    return Promise.resolve(response);
  };

  const queryRiskImpactRatingList = async () => {
    const response = {
      impactRating: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as RiskListImpactRatingResponse;

    return Promise.resolve(response);
  };

  const queryRiskControlsList = async () => {
    const response = {
      control: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as RiskListControlsResponse;

    return Promise.resolve(response);
  };

  const queryRiskIndicatorsList = async () => {
    const response = {
      indicator: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as RiskListIndicatorsResponse;

    return Promise.resolve(response);
  };

  const queryRiskActionsList = async () => {
    const response = {
      action: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as RiskListActionsResponse;

    return Promise.resolve(response);
  };

  const queryControlList = async () => {
    const response = {
      control: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as ControlListQueryResponse;

    return Promise.resolve(response);
  };

  const getControlById = async () => {
    const response = {} as ControlByIdResponse;

    return Promise.resolve(response);
  };

  const queryActionList = async () => {
    const response = {
      action: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as ActionListQueryResponse;

    return Promise.resolve(response);
  };

  const getActionById = async () => {
    const response = {} as ActionByIdResponse;

    return Promise.resolve(response);
  };

  const queryIssueList = async () => {
    const response = {
      issue: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as IssueListQueryResponse;

    return Promise.resolve(response);
  };

  const getIssueById = async () => {
    const response = {} as IssueByIdResponse;

    return Promise.resolve(response);
  };

  const queryDocumentList = async () => {
    const response = {
      document: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as DocumentListQueryResponse;

    return Promise.resolve(response);
  };

  const getDocumentById = async () => {
    const response = {} as DocumentByIdResponse;

    return Promise.resolve(response);
  };

  const queryAssessmentList = async () => {
    const response = {
      assessment: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as AssessmentListQueryResponse;

    return Promise.resolve(response);
  };

  const getAssessmentById = async () => {
    const response = {} as AssessmentByIdResponse;

    return Promise.resolve(response);
  };

  const queryIndicatorList = async () => {
    const response = {
      indicator: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as IndicatorListQueryResponse;

    return Promise.resolve(response);
  };

  const getIndicatorById = async () => {
    const response = {} as IndicatorByIdResponse;

    return Promise.resolve(response);
  };

  const queryObligationList = async () => {
    const response = {
      obligation: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as ObligationListQueryResponse;

    return Promise.resolve(response);
  };

  const getObligationById = async () => {
    const response = {} as ObligationByIdResponse;

    return Promise.resolve(response);
  };

  const queryThirdPartyList = async () => {
    const response = {
      thirdParty: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as ThirdPartyListQueryResponse;

    return Promise.resolve(response);
  };

  const getThirdPartyById = async () => {
    const response = {} as ThirdPartyByIdResponse;

    return Promise.resolve(response);
  };

  const getUserById = async () => {
    const response = {} as UserByIdResponse;

    return Promise.resolve(response);
  };

  const queryUserList = async () => {
    const response: UsersListQueryResponse = {
      user: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as unknown as UsersListQueryResponse;

    return Promise.resolve(response);
  };

  const queryEnterpriseRiskList = async () => {
    const response = {
      enterpriseRisk: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as EnterpriseRiskListQueryResponse;

    return Promise.resolve(response);
  };

  const getEnterpriseRiskById = async () => {
    const response = {
      enterpriseRisk: null,
      form_configuration: null,
    } as unknown as EnterpriseRiskByIdResponse;

    return Promise.resolve(response);
  };

  const queryEnterpriseChildRisks = async () => {
    const response = {
      risk: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as EnterpriseRiskChildRiskListQueryResponse;

    return Promise.resolve(response);
  };

  const getAppetiteById = async () => {
    const response = {
      appetite: null,
      form_configuration: null,
    } as unknown as AppetiteByIdResponse;

    return Promise.resolve(response);
  };

  const getImpactRatingById = async () => {
    const response = {
      impactRating: null,
      form_configuration: null,
    } as unknown as ImpactRatingByIdResponse;

    return Promise.resolve(response);
  };

  const queryRiskRatings = async () => {
    const response = {
      riskAssessmentResult: [],
      metadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as unknown as RiskListRatingResponse;

    return Promise.resolve(response);
  };

  const getRiskRatingById = async () => {
    const response = {
      riskAssessmentResult: null,
    } as unknown as RiskRatingByIdResponse;

    return Promise.resolve(response);
  };

  const queryImpactList = async () => {
    const response = {
      impact: [],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as ImpactListQueryResponse;

    return Promise.resolve(response);
  };

  const getImpactById = async () => {
    const response = {} as ImpactByIdResponse;

    return Promise.resolve(response);
  };

  const queryRiskAcceptancesList = async () => {
    const response = {
      acceptance: {
        data: [],
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      },
    } as unknown as ListAcceptancesResponse;

    return Promise.resolve(response);
  };

  const getAcceptanceById = async () => {
    const response = {} as AcceptanceByIdResponse;

    return Promise.resolve(response);
  };

  const queryRiskApprovalsList = async () => {
    const response = {
      approval: [],
      pageMetadata: {
        nextId: null,
        nextDateTime: null,
        prevId: null,
        prevDateTime: null,
        hasNext: false,
        hasPrev: false,
        count: 0,
      },
    } as unknown as RiskListApprovalResponse;

    return Promise.resolve(response);
  };

  const getApprovalById = async () => {
    const response = {} as ApprovalByIdResponse;

    return Promise.resolve(response);
  };

  const queryLinkedItemsList = async () => {
    const response = {} as LinkedItemsListResponse;

    return Promise.resolve(response);
  };

  // Issue nested endpoints
  const queryIssueCausesList = async () => {
    const response = {} as IssueCausesListResponse;

    return Promise.resolve(response);
  };
  const queryIndicatorResultList = async () => {
    const response = {} as IndicatorResultListQueryResponse;

    return Promise.resolve(response);
  };

  const getIssueCauseById = async () => {
    const response = {} as IssueCauseByIdResponse;

    return Promise.resolve(response);
  };

  const queryIssueConsequencesList = async () => {
    const response = {} as IssueConsequencesListResponse;

    return Promise.resolve(response);
  };

  const getIssueConsequenceById = async () => {
    const response = {} as IssueConsequenceByIdResponse;

    return Promise.resolve(response);
  };

  const queryIssueUpdatesList = async () => {
    const response = {} as IssueUpdatesListResponse;

    return Promise.resolve(response);
  };

  const getIssueUpdateById = async () => {
    const response = {} as IssueUpdateByIdResponse;

    return Promise.resolve(response);
  };

  const queryIssueActionsList = async () => {
    const response = {} as IssueActionsListResponse;

    return Promise.resolve(response);
  };

  const queryIssueAssessment = async () => {
    const response = {} as IssueAssessmentResponse;

    return Promise.resolve(response);
  };
  const getIndicatorResultById = async () => {
    const response = {} as IndicatorResultByIdResponse;

    return Promise.resolve(response);
  };

  const queryOrganisationModule = async () => {
    const response = {
      organisationModule: {
        ModuleSettings: {
          risk: { enabled: true, subModules: {} },
          action: { enabled: true, subModules: {} },
          issue: { enabled: true, subModules: {} },
          control: { enabled: true, subModules: {} },
          policy: { enabled: true, subModules: {} },
          obligation: { enabled: true, subModules: {} },
          thirdParty: { enabled: true, subModules: {} },
          asset: { enabled: true, subModules: {} },
          document: { enabled: true, subModules: {} },
          assessment: { enabled: true, subModules: {} },
          indicator: { enabled: true, subModules: {} },
          impact: { enabled: true, subModules: {} },
        },
      },
    } as unknown as OrganisationModuleResponse;

    return Promise.resolve(response);
  };

  return {
    getImpactRatingById,
    getAppetiteById,
    queryRiskList,
    getRiskById,
    queryRiskRatings,
    getRiskRatingById,
    queryRiskImpactRatingList,
    queryRiskAppetiteList,
    queryRiskControlsList,
    queryRiskIndicatorsList,
    queryRiskActionsList,
    queryControlList,
    getControlById,
    getActionById,
    queryActionList,
    queryIssueList,
    getIssueById,
    queryDocumentList,
    getDocumentById,
    queryAssessmentList,
    getAssessmentById,
    queryIndicatorList,
    getIndicatorById,
    queryIndicatorResultList,
    getIndicatorResultById,
    queryObligationList,
    getObligationById,
    queryImpactList,
    getImpactById,
    queryRiskAcceptancesList,
    getAcceptanceById,
    queryRiskApprovalsList,
    getApprovalById,
    queryLinkedItemsList,
    queryThirdPartyList,
    getThirdPartyById,
    getUserById,
    queryUserList,
    queryEnterpriseRiskList,
    getEnterpriseRiskById,
    queryEnterpriseChildRisks,
    queryIssueCausesList,
    getIssueCauseById,
    queryIssueConsequencesList,
    getIssueConsequenceById,
    queryIssueUpdatesList,
    getIssueUpdateById,
    queryIssueActionsList,
    queryIssueAssessment,
    queryOrganisationModule,
    getFormConfigsByParentTypes: () =>
      Promise.resolve({ formConfiguration: [] }),
    queryUserGroupList: () =>
      Promise.resolve({
        userGroup: [],
        pageMetadata: {
          nextId: null,
          nextDateTime: null,
          prevId: null,
          prevDateTime: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      } as unknown as UserGroupListQueryResponse),
    getUserGroupById: () =>
      Promise.resolve(null as unknown as UserGroupByIdResponse),
    queryDepartmentTypeList: () =>
      Promise.resolve({
        departmentType: [],
        pageMetadata: {
          nextId: null,
          nextDateTime: null,
          prevId: null,
          prevDateTime: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      } as unknown as DepartmentTypeListQueryResponse),
    getDepartmentTypeById: () =>
      Promise.resolve(null as unknown as DepartmentTypeByIdResponse),
    queryDepartmentGroupTypeList: () =>
      Promise.resolve({
        departmentGroupType: [],
        pageMetadata: {
          nextId: null,
          nextDateTime: null,
          prevId: null,
          prevDateTime: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      } as unknown as DepartmentGroupTypeListQueryResponse),
    getDepartmentGroupTypeById: () =>
      Promise.resolve(null as unknown as DepartmentGroupTypeByIdResponse),
    queryTagTypeList: () =>
      Promise.resolve({
        tagType: [],
        pageMetadata: {
          nextId: null,
          nextDateTime: null,
          prevId: null,
          prevDateTime: null,
          hasNext: false,
          hasPrev: false,
          count: 0,
        },
      } as unknown as TagTypeListQueryResponse),
    getTagTypeById: () =>
      Promise.resolve(null as unknown as TagTypeByIdResponse),
  };
};
