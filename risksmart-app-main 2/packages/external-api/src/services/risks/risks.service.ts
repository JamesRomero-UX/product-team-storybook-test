import type {
  IClient,
  ImpactListQueryResponse,
  ListAcceptancesResponse,
  RiskListActionsResponse,
  RiskListAppetiteResponse,
  RiskListApprovalResponse,
  RiskListControlsResponse,
  RiskListIndicatorsResponse,
  RiskListQueryResponse,
  RiskListRatingResponse,
} from '../../clients/client.interface';
import type {
  LinkedListIdDateTimeQueryFetchFn,
  LinkedListQueryFetchFn,
  ListQueryFetchFn,
  ServiceCallContext,
} from '../../types/service';
import { logger } from '../../utils/logger';

export type RisksService = ReturnType<typeof risksService>;

export function risksService(client: IClient) {
  const getRisks: ListQueryFetchFn<RiskListQueryResponse['risk']> = async (
    query,
    ctx
  ) => {
    const rawResponse = await client.queryRiskList(
      {
        authorization: ctx.authToken,
      },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: rawResponse.risk, metadata: rawResponse.pageMetadata };
  };

  const getRiskById = async (riskId: string, ctx: ServiceCallContext) => {
    const risksResponse = await client.getRiskById(
      {
        authorization: ctx.authToken,
      },
      riskId
    );
    if (risksResponse === null) {
      return null;
    }

    const { risk, form_configuration } = risksResponse;

    return { data: risk, form_configuration };
  };

  const getRiskControls: LinkedListQueryFetchFn<
    RiskListControlsResponse['control']
  > = async (linkId, query, ctx) => {
    const response = await client.queryRiskControlsList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
        linkId,
      }
    );

    return { data: response.control, metadata: response.pageMetadata };
  };

  const getRiskActions: LinkedListQueryFetchFn<
    RiskListActionsResponse['action']
  > = async (linkId, query, ctx) => {
    const response = await client.queryRiskActionsList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
        linkId,
      }
    );

    return { data: response.action, metadata: response.pageMetadata };
  };

  const getRiskIndicators: LinkedListQueryFetchFn<
    RiskListIndicatorsResponse['indicator']
  > = async (linkId, query, ctx) => {
    const response = await client.queryRiskIndicatorsList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
        linkId,
      }
    );

    return { data: response.indicator, metadata: response.pageMetadata };
  };

  const getRiskAppetites: LinkedListQueryFetchFn<
    RiskListAppetiteResponse['appetite']
  > = async (linkId, query, ctx) => {
    const response = await client.queryRiskAppetiteList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
        linkId,
      }
    );

    return { data: response.appetite, metadata: response.pageMetadata };
  };

  const getRiskRatings: LinkedListIdDateTimeQueryFetchFn<
    RiskListRatingResponse['riskAssessmentResult']
  > = async (linkId, query, ctx) => {
    const response = await client.queryRiskRatings(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterDateTime: query.afterDateTime,
        afterId: query.afterId,
        beforeDateTime: query.beforeDateTime,
        beforeId: query.beforeId,
        linkId,
      }
    );

    return {
      data: response.riskAssessmentResult,
      metadata: response.pageMetadata,
    };
  };

  const getRiskRatingById = async (
    ids: Record<string, string>,
    ctx: ServiceCallContext
  ) => {
    const { id: riskId = '', ratingId = '' } = ids;
    const response = await client.getRiskRatingById(
      { authorization: ctx.authToken },
      ratingId
    );

    if (response === null) {
      return null;
    }
    const { riskAssessmentResult, form_configuration } = response;

    // make sure rating is parented by risk id (be odd if its not).
    const parentIds = new Set(
      riskAssessmentResult.parents.map(({ risk }) => risk?.Id ?? null)
    );
    if (!parentIds.has(riskId)) {
      logger.warn(
        { riskId, ratingId, parentIds },
        'rating exists but not longer linked to risk id'
      );

      return null;
    }

    return { data: riskAssessmentResult, form_configuration };
  };

  const getRiskAppetiteById = async (
    ids: Record<string, string>,
    ctx: ServiceCallContext
  ) => {
    const { id: riskId = '', appetiteId = '' } = ids;
    const response = await client.getAppetiteById(
      { authorization: ctx.authToken },
      appetiteId
    );

    if (response === null) {
      return null;
    }
    const { appetite, form_configuration } = response;
    // make sure  appetite is parented by risk id.

    const parentIds = new Set(
      appetite.parents.map(({ risk }) => risk?.Id ?? null)
    );
    if (!parentIds.has(riskId)) {
      logger.warn(
        { riskId, appetiteId, parentIds },
        'appetite exists but not found under risk'
      );

      return null;
    }

    return { data: appetite, form_configuration };
  };

  const getRiskAcceptanceById = async (
    ids: Record<string, string>,
    ctx: ServiceCallContext
  ) => {
    const { id: riskId = '', acceptanceId = '' } = ids;
    if (!riskId || !acceptanceId) {
      return null;
    }
    const response = await client.getAcceptanceById(
      { authorization: ctx.authToken },
      acceptanceId
    );
    if (response === null) {
      return null;
    }
    const { acceptance, form_configuration } = response;
    const parentIds = new Set(
      acceptance.parents.map(({ risk }) => risk?.Id ?? null)
    );
    if (!parentIds.has(riskId)) {
      logger.warn(
        { riskId, acceptanceId, parentIds },
        'acceptance exists but not found under risk'
      );

      return null;
    }

    return { data: acceptance, form_configuration };
  };

  const getRiskAcceptances: LinkedListQueryFetchFn<
    ListAcceptancesResponse['acceptance']
  > = async (linkId, query, ctx) => {
    const response = await client.queryRiskAcceptancesList(
      { authorization: ctx.authToken },
      { ...query, linkId }
    );

    return { data: response.acceptance, metadata: response.pageMetadata };
  };

  const getRiskImpacts: ListQueryFetchFn<
    ImpactListQueryResponse['impact']
  > = async (query, ctx) => {
    // only returns the impacts list non-filtered to risk
    // due to impacts not  parent-linked to risks in the DB as of yet.
    const response = await client.queryImpactList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterSequentialId: query.afterId,
        beforeSequentialId: query.beforeId,
      }
    );

    return { data: response.impact, metadata: response.pageMetadata };
  };

  const getRiskApprovals: LinkedListIdDateTimeQueryFetchFn<
    RiskListApprovalResponse['approval']
  > = async (linkId, query, ctx) => {
    const response = await client.queryRiskApprovalsList(
      { authorization: ctx.authToken },
      {
        limit: query.limit,
        afterDateTime: query.afterDateTime,
        afterId: query.afterId,
        beforeDateTime: query.beforeDateTime,
        beforeId: query.beforeId,
        linkId,
      }
    );

    return {
      data: response.approval,
      metadata: response.pageMetadata,
    };
  };

  const getRiskApprovalById = async (
    ids: Record<string, string>,
    ctx: ServiceCallContext
  ) => {
    const { id: riskId = '', approvalId = '' } = ids;
    if (!riskId || !approvalId) {
      return null;
    }
    const response = await client.getApprovalById(
      { authorization: ctx.authToken },
      approvalId
    );

    if (response === null) {
      return null;
    }
    const { approval, form_configuration } = response;

    // make sure approval is parented by risk id
    if (approval.ParentId !== riskId) {
      logger.warn(
        { riskId, approvalId, parentId: approval.ParentId },
        'approval exists but not found under risk'
      );

      return null;
    }

    return { data: approval, form_configuration };
  };

  return {
    getRisks,
    getRiskById,
    getRiskControls,
    getRiskActions,
    getRiskIndicators,
    getRiskAppetites,
    getRiskRatings,
    getRiskAppetiteById,
    getRiskRatingById,
    getRiskImpacts,
    getRiskAcceptances,
    getRiskAcceptanceById,
    getRiskApprovals,
    getRiskApprovalById,
  };
}
