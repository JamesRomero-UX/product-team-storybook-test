import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
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
  CreateRiskAssessmentResultRequest,
  CreateRiskRequest,
  CreateSsoConfigurationRequest,
  DeleteControlGroupRequest,
  DeleteFormFieldRequest,
  DeleteIssuesRequest,
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
  AggregationSettings,
  LatestDocumentAssessmentResult,
  LatestIndicatorResult,
  LatestObligationAssessmentResult,
  LatestRiskAssessmentResult,
  LatestTestResult,
  OldestActiveImpactTestDate,
  Schedule,
  ScheduleState,
} from '@risksmart-app/schedule-state/src/types';
import axios, { AxiosError } from 'axios';

import type { OwnershipFilter } from '../routers/frontend/my-items.router';
import type {
  ActionRegisterResponseRow,
  CreateAcceptanceResponse,
  CreateActionResponse,
  CreateActionUpdateResponse,
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
  CreateSsoConfigurationResponse,
  GetActionByIdResponseRow,
  GetActionUpdateByIdResponseRow,
  GetActionUpdatesByParentActionIdResponseRow,
  GetFormConfigurationResponseRow,
  GetUserGroupByIdResponseRow,
  GetUserGroupsWithApproversResponseRow,
  GetUsersByGroupIdResponseRow,
  MyDueActionsResponseRow,
  MyDueAssessmentActivitiesResponseRow,
  MyDueAssessmentsResponseRow,
  MyDueAttestationRecordsResponseRow,
  MyDueChangeRequestsResponseRow,
  MyDueControlsResponseRow,
  MyDueDocumentsResponseRow,
  MyDueIndicatorsResponseRow,
  MyDueIssuesResponseRow,
  MyDueObligationsResponseRow,
  MyDueRisksResponseRow,
  OrganisationRow,
  SsoConfigurationRow,
  UpdateAcceptanceResponse,
  UpdateAppetiteResponse,
  UpdateAssessmentResponse,
  UpdateFormFieldResponse,
  UpdateIndicatorResultResponse,
  UpdateIssueResponse,
  UpdateRiskResponse,
  UpdateTestResultResponse,
} from '../types';
import { logger } from '../utils/logger';
import type { CachedSsmParameter } from '../utils/ssm-parameter-client';
import {
  type ApiRequestContext,
  createCachedSsmParameter,
  getRequestHeaders,
  getUrlFromSsmParam,
} from './client-utils';

const DEFAULT_PAGE_SIZE = 500;
const MAX_PAGES = 500;

/**
 * Error thrown when the Data Layer API returns an HTTP 4xx/5xx response.
 */
export class DataLayerApiError extends Error {
  readonly status: number;
  readonly responseBody: unknown;

  constructor(status: number, responseBody: unknown, message: string) {
    super(message);
    this.name = 'DataLayerApiError';
    this.status = status;
    this.responseBody = responseBody;
  }
}

// Lazy-initialized SSM parameter client to avoid throwing at module load time
// when the environment variable is not set (e.g., in local Docker development)
let dataLayerUrlParam: CachedSsmParameter | null = null;

/**
 * Gets the data layer API URL from SSM Parameter Store.
 * In local dev, the SSM mock (scripts/local-mocks/ssm-mock.js) serves
 * the URL via AWS_ENDPOINT_URL_SSM.
 */
async function getDataLayerApiUrl(): Promise<string> {
  if (!dataLayerUrlParam) {
    dataLayerUrlParam = createCachedSsmParameter(
      'DATA_LAYER_CLIENT_API_URL_SSM_PARAM'
    );
  }

  return await getUrlFromSsmParam(dataLayerUrlParam);
}

/**
 * Response structure for paginated endpoints
 */

export interface PaginatedResponse<T> {
  data: T[];
  pageMetadata: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: number | null;
    previousCursor: number | null;
  };
}

/**
 * Response structure for single item endpoints
 */
export interface SingleItemResponse<T> {
  data: T;
}

/**
 * Configuration for a generic API request
 */
interface RequestConfig {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** URL path (appended to base API URL) */
  path: string;
  /** Optional query parameters */
  queryParams?: Record<string, string | string[] | boolean | undefined>;
  /** Optional request body (for POST/PUT/PATCH) */
  body?: unknown;
  /** Optional correlation ID for request tracking */
  correlationId?: string;
  /** Optional context for logging */
  logContext?: Record<string, unknown>;
  /** Log message for the request */
  logMessage?: string;
}

/**
 * Data Layer API client for tRPC package
 * Uses SSM Parameter Store for service URL discovery and SigV4 signing
 */
export class DataLayerApiClient {
  private apiUrl: string | null = null;

  private async getApiUrl(): Promise<string> {
    if (this.apiUrl) {
      return this.apiUrl;
    }
    const url = await getDataLayerApiUrl();
    this.apiUrl = url.replace(/\/$/, '');

    return this.apiUrl;
  }

  /**
   * Raw HTTP request - handles URL construction, headers, signing, and logging.
   * Returns the raw response data with no transformation.
   */
  private async rawRequest<TResponse>(
    context: ApiRequestContext,
    config: RequestConfig
  ): Promise<{ data: TResponse; status: number }> {
    const { tenant, orgKey, userId } = context;
    const {
      method,
      path,
      queryParams,
      body,
      correlationId,
      logContext = {},
      logMessage = `${method} ${path}`,
    } = config;

    // Build URL with query params
    const apiUrl = await this.getApiUrl();
    const queryString = this.buildQueryString(queryParams);
    const url = `${apiUrl}${path}${queryString}`;

    // Build headers
    const baseHeaders: Record<string, string> = {
      'x-tenant': tenant,
      'x-org-key': orgKey,
      'x-user-id': userId,
      'Content-Type': 'application/json',
    };
    if (correlationId) {
      baseHeaders['x-correlation-id'] = correlationId;
    }

    const bodyString = body ? JSON.stringify(body) : '';
    const headers = await getRequestHeaders(
      url,
      method,
      baseHeaders,
      bodyString
    );

    logger.debug({ tenant, orgKey, ...logContext }, logMessage);

    try {
      const response = await axios.request<TResponse>({
        method,
        url,
        headers,
        data: body,
        validateStatus: () => true, // Accept all status codes
      });

      if (response.status >= 400) {
        logger.error(
          {
            status: response.status,
            error: response.data,
            ...logContext,
          },
          `Failed: ${logMessage}`
        );

        throw new DataLayerApiError(
          response.status,
          response.data,
          `${logMessage} failed with status ${response.status}`
        );
      }

      logger.debug(
        { status: response.status, ...logContext },
        `Success: ${logMessage}`
      );

      return { data: response.data, status: response.status };
    } catch (error) {
      if (error instanceof AxiosError) {
        logger.error(
          {
            status: error.response?.status,
            error: error.message,
            ...logContext,
          },
          `Failed: ${logMessage}`
        );
        throw new Error(
          `${logMessage} failed: ${error.response?.status} ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Request for endpoints that return { data: T } wrapper.
   * Unwraps the response to return just T.
   * Throws DataLayerApiError on HTTP 4xx/5xx.
   */
  private async requestWrapped<T>(
    context: ApiRequestContext,
    config: RequestConfig
  ): Promise<{ data: T; status: number }> {
    const result = await this.rawRequest<SingleItemResponse<T>>(
      context,
      config
    );

    return { data: result.data.data, status: result.status };
  }

  /**
   * Request for single-item GET endpoints that return { data: T | T[] }.
   * Unwraps and normalizes to always return T[].
   * Throws DataLayerApiError on HTTP 4xx/5xx.
   */
  private async requestSingleItem<TItem>(
    context: ApiRequestContext,
    config: RequestConfig
  ): Promise<{ data: TItem[]; status: number }> {
    const result = await this.rawRequest<SingleItemResponse<TItem | TItem[]>>(
      context,
      config
    );

    const inner = result.data.data;

    return {
      data: Array.isArray(inner) ? inner : [inner],
      status: result.status,
    };
  }

  /**
   * Builds query string from params object, filtering out undefined values
   */
  private buildQueryString(
    params?: Record<string, string | string[] | boolean | undefined>
  ): string {
    if (!params) {
      return '';
    }

    const queryParams = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]): [string, string] => [
          k,
          Array.isArray(v) ? v.join(',') : String(v),
        ])
    );

    const queryString = queryParams.toString();

    return queryString ? `?${queryString}` : '';
  }

  /**
   * Fetches all pages from a paginated endpoint, accumulating results.
   */
  private async requestAllPages<T>(
    context: ApiRequestContext,
    config: RequestConfig,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<{ data: T[]; status: number }> {
    const allItems: T[] = [];
    let offset = 0;
    let hasNextPage = true;
    let pageCount = 0;
    while (hasNextPage && pageCount < MAX_PAGES) {
      pageCount++;
      const paginatedConfig: RequestConfig = {
        ...config,
        queryParams: {
          ...config.queryParams,
          limit: pageSize.toString(),
          offset: offset.toString(),
        },
      };

      const { data } = await this.rawRequest<PaginatedResponse<T>>(
        context,
        paginatedConfig
      );

      for (const item of data.data) {
        allItems.push(item);
      }

      hasNextPage = data.pageMetadata.hasNextPage;

      if (data.data.length === 0) {
        if (hasNextPage) {
          logger.warn(
            { path: config.path, offset, pageCount },
            `Empty page received with hasNextPage=true, stopping pagination: ${config.logMessage}`
          );
        }
        break;
      }

      offset = data.pageMetadata.nextCursor ?? offset + pageSize;
    }

    if (pageCount >= MAX_PAGES && hasNextPage) {
      logger.error(
        {
          path: config.path,
          totalItems: allItems.length,
          pageCount,
          maxPages: MAX_PAGES,
        },
        `Pagination limit reached: ${config.logMessage}`
      );
      throw new DataLayerApiError(
        500,
        {
          message: `Pagination limit reached for ${config.path}: fetched ${allItems.length} items across ${pageCount} pages, but more data exists.`,
        },
        `Pagination limit reached for ${config.path}: fetched ${allItems.length} items across ${pageCount} pages, but more data exists.`
      );
    }

    return { data: allItems, status: 200 };
  }

  /**
   * Get single action by ID
   * GET /actions/{id}
   */
  async getActionById(
    context: ApiRequestContext,
    actionId: string
  ): Promise<{ data: GetActionByIdResponseRow[]; status: number }> {
    return this.requestSingleItem<GetActionByIdResponseRow>(context, {
      method: 'GET',
      path: `/actions/${actionId}`,
      logContext: { actionId },
      logMessage: 'Fetching action by ID from Data Layer API',
    });
  }

  /**
   * Get actions register with optional filters.
   * Fetches all pages from the paginated data-layer endpoint.
   * GET /actions/register
   */
  async getActionsRegister(
    context: ApiRequestContext,
    options?: {
      parentId?: string;
      departmentTypeIds?: string[];
      tagTypeIds?: string[];
    }
  ): Promise<{
    data: ActionRegisterResponseRow[];
    status: number;
  }> {
    return this.requestAllPages<ActionRegisterResponseRow>(context, {
      method: 'GET',
      path: '/actions/register',
      queryParams: {
        parentId: options?.parentId,
        departmentTypeIds: options?.departmentTypeIds,
        tagTypeIds: options?.tagTypeIds,
      },
      logContext: { options },
      logMessage: 'Fetching actions register from Data Layer API',
    });
  }

  /**
   * Create a new action
   * POST /actions
   */
  async createAction(
    context: ApiRequestContext,
    input: CreateActionRequest,
    correlationId: string
  ): Promise<{ data: CreateActionResponse; status: number }> {
    return this.requestWrapped<CreateActionResponse>(context, {
      method: 'POST',
      path: '/actions',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating action via Data Layer API',
    });
  }

  /**
   * Get single action update by ID
   * GET /action-updates/{id}
   */
  async getActionUpdateById(
    context: ApiRequestContext,
    updateId: string
  ): Promise<{ data: GetActionUpdateByIdResponseRow[]; status: number }> {
    return this.requestSingleItem<GetActionUpdateByIdResponseRow>(context, {
      method: 'GET',
      path: `/action-updates/${updateId}`,
      logContext: { updateId },
      logMessage: 'Fetching action update by ID from Data Layer API',
    });
  }

  /**
   * Get action updates by parent action ID
   * GET /action-updates/by-parent/{parentActionId}
   */
  async getActionUpdatesByParentActionId(
    context: ApiRequestContext,
    parentActionId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    data: PaginatedResponse<GetActionUpdatesByParentActionIdResponseRow>;
    status: number;
  }> {
    return this.rawRequest<
      PaginatedResponse<GetActionUpdatesByParentActionIdResponseRow>
    >(context, {
      method: 'GET',
      path: `/action-updates/by-parent/${parentActionId}`,
      queryParams: {
        limit: options?.limit?.toString(),
        offset: options?.offset?.toString(),
      },
      logContext: { parentActionId, options },
      logMessage: 'Fetching action updates by parent from Data Layer API',
    });
  }

  /**
   * Create a new action update
   * POST /action-updates
   */
  async createActionUpdate(
    context: ApiRequestContext,
    input: CreateActionUpdateRequest,
    correlationId: string
  ): Promise<{ data: CreateActionUpdateResponse; status: number }> {
    return this.requestWrapped<CreateActionUpdateResponse>(context, {
      method: 'POST',
      path: '/action-updates',
      body: input,
      correlationId,
      logContext: { parentActionId: input.ParentActionId },
      logMessage: 'Creating action update via Data Layer API',
    });
  }

  /**
   * Delete action updates (batch)
   * DELETE /action-updates with body { Ids: string[] }
   */
  async deleteActionUpdates(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: '/action-updates',
      body: { Ids: ids },
      correlationId,
      logContext: { ids, count: ids.length },
      logMessage: 'Deleting action updates via Data Layer API',
    });
  }

  /**
   * Create a new control group
   * POST /control-groups
   */
  async createControlGroup(
    context: ApiRequestContext,
    input: CreateControlGroupRequest,
    correlationId: string
  ): Promise<{ data: CreateControlGroupResponse; status: number }> {
    return this.requestWrapped<CreateControlGroupResponse>(context, {
      method: 'POST',
      path: '/control-groups',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating control group via Data Layer API',
    });
  }

  /**
   * Delete a control group
   * DELETE /control-groups/{id}
   */
  async deleteControlGroup(
    context: ApiRequestContext,
    controlGroupId: string,
    body: DeleteControlGroupRequest,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: `/control-groups/${controlGroupId}`,
      body,
      correlationId,
      logContext: {
        controlGroupId,
        originalTimestamp: body.OriginalTimestamp,
      },
      logMessage: 'Deleting control group via Data Layer API',
    });
  }

  /**
   * Create a new issue update
   * POST /issue-updates
   */
  async createIssueUpdate(
    context: ApiRequestContext,
    input: CreateIssueUpdateRequest,
    correlationId: string
  ): Promise<{ data: CreateIssueUpdateResponse; status: number }> {
    return this.requestWrapped<CreateIssueUpdateResponse>(context, {
      method: 'POST',
      path: '/issue-updates',
      body: input,
      correlationId,
      logContext: { parentIssueId: input.ParentIssueId },
      logMessage: 'Creating issue update via Data Layer API',
    });
  }

  /**
   * Create a new issue
   * POST /issues
   */
  async createIssue(
    context: ApiRequestContext,
    input: CreateIssueRequest,
    correlationId: string
  ): Promise<{ data: CreateIssueResponse; status: number }> {
    return this.requestWrapped<CreateIssueResponse>(context, {
      method: 'POST',
      path: '/issues',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating issue via Data Layer API',
    });
  }

  /**
   * Update an existing issue
   * PUT /issues/{id}
   */
  async updateIssue(
    context: ApiRequestContext,
    input: UpdateIssueRequest,
    correlationId: string
  ): Promise<{ data: UpdateIssueResponse; status: number }> {
    return this.requestWrapped<UpdateIssueResponse>(context, {
      method: 'PUT',
      path: `/issues/${input.Id}`,
      body: input,
      correlationId,
      logContext: { issueId: input.Id },
      logMessage: 'Updating issue via Data Layer API',
    });
  }

  /**
   * Create a new issue assessment
   * POST /issue-assessments
   */
  async createIssueAssessment(
    context: ApiRequestContext,
    input: CreateIssueAssessmentRequest,
    correlationId: string
  ): Promise<{ data: { Id: string }; status: number }> {
    return this.requestWrapped<{ Id: string }>(context, {
      method: 'POST',
      path: '/issue-assessments',
      body: input,
      correlationId,
      logContext: { parentIssueId: input.ParentIssueId },
      logMessage: 'Creating issue assessment via Data Layer API',
    });
  }

  /**
   * Delete issue updates (batch)
   * DELETE /issue-updates with body { Ids: string[] }
   */
  async deleteIssueUpdates(
    context: ApiRequestContext,
    body: DeleteIssueUpdatesRequest,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: `/issue-updates`,
      body,
      correlationId,
      logContext: {
        ids: body.Ids,
      },
      logMessage: 'Deleting issue updates via Data Layer API',
    });
  }

  async deleteIssues(
    context: ApiRequestContext,
    body: DeleteIssuesRequest,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: '/issues',
      body,
      correlationId,
      logContext: {
        ids: body.Ids,
      },
      logMessage: 'Deleting issues via Data Layer API',
    });
  }

  /**
   * Update an existing indicator
   * PUT /indicators/{id}
   */
  async updateIndicator(
    context: ApiRequestContext,
    input: UpdateIndicatorRequest,
    correlationId: string
  ): Promise<{ data: { Id: string }; status: number }> {
    return this.requestWrapped<{ Id: string }>(context, {
      method: 'PUT',
      path: `/indicators/${input.Id}`,
      body: input,
      correlationId,
      logContext: { indicatorId: input.Id },
      logMessage: 'Updating indicator via Data Layer API',
    });
  }

  /**
   * POST /indicator-results
   */
  async createIndicatorResult(
    context: ApiRequestContext,
    input: CreateIndicatorResultRequest,
    correlationId: string
  ): Promise<{ data: CreateIndicatorResultResponse; status: number }> {
    return this.requestWrapped<CreateIndicatorResultResponse>(context, {
      method: 'POST',
      path: '/indicator-results',
      body: input,
      correlationId,
      logContext: { indicatorId: input.IndicatorId },
      logMessage: 'Creating indicator result via Data Layer API',
    });
  }

  async updateIndicatorResult(
    context: ApiRequestContext,
    input: UpdateIndicatorResultRequest,
    correlationId: string
  ): Promise<{ data: UpdateIndicatorResultResponse; status: number }> {
    return this.requestWrapped<UpdateIndicatorResultResponse>(context, {
      method: 'PUT',
      path: `/indicator-results/${input.Id}`,
      body: input,
      correlationId,
      logContext: { indicatorResultId: input.Id },
      logMessage: 'Updating indicator result via Data Layer API',
    });
  }

  async createObligationImpact(
    context: ApiRequestContext,
    input: CreateObligationImpactRequest,
    correlationId: string
  ): Promise<{ data: CreateObligationImpactResponse; status: number }> {
    return this.requestWrapped<CreateObligationImpactResponse>(context, {
      method: 'POST',
      path: '/obligation-impacts',
      body: input,
      correlationId,
      logContext: { parentObligationId: input.ParentObligationId },
      logMessage: 'Creating obligation impact via Data Layer API',
    });
  }

  async deleteObligationImpacts(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: `/obligation-impacts`,
      body: { Ids: ids },
      correlationId,
      logContext: {
        obligationImpactIds: ids,
      },
      logMessage: 'Deleting obligation impacts via Data Layer API',
    });
  }

  /**
   * Get form configurations with optional parent type filter
   * GET /form-configurations
   */
  async getFormConfigurations(
    context: ApiRequestContext,
    options?: {
      parentTypes?: ParentType[];
    }
  ): Promise<{
    data: GetFormConfigurationResponseRow[];
    status: number;
  }> {
    return this.requestWrapped<GetFormConfigurationResponseRow[]>(context, {
      method: 'GET',
      path: '/form-configurations',
      queryParams: {
        parentTypes: options?.parentTypes,
      },
      logContext: { parentTypes: options?.parentTypes },
      logMessage: 'Fetching form configurations from Data Layer API',
    });
  }

  /**
   * Create a new form field
   * POST /form-fields
   */
  async createFormField(
    context: ApiRequestContext,
    input: CreateFormFieldRequest,
    correlationId: string
  ): Promise<{ data: CreateFormFieldResponse; status: number }> {
    return this.requestWrapped<CreateFormFieldResponse>(context, {
      method: 'POST',
      path: '/form-fields',
      body: input,
      correlationId,
      logContext: { parentType: input.ParentType, label: input.Label },
      logMessage: 'Creating form field via Data Layer API',
    });
  }

  /**
   * Update an existing form field
   * PUT /form-fields
   */
  async updateFormField(
    context: ApiRequestContext,
    input: UpdateFormFieldRequest,
    correlationId: string
  ): Promise<{ data: UpdateFormFieldResponse; status: number }> {
    return this.requestWrapped<UpdateFormFieldResponse>(context, {
      method: 'PUT',
      path: '/form-fields',
      body: input,
      correlationId,
      logContext: { parentType: input.ParentType, fieldId: input.FieldId },
      logMessage: 'Updating form field via Data Layer API',
    });
  }

  /**
   * Delete a form field
   * DELETE /form-fields
   */
  async deleteFormField(
    context: ApiRequestContext,
    input: DeleteFormFieldRequest,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: '/form-fields',
      body: input,
      correlationId,
      logContext: { parentType: input.ParentType, fieldId: input.FieldId },
      logMessage: 'Deleting form field via Data Layer API',
    });
  }

  /**
   * Get all user groups with approver/user aggregate counts
   * GET /user-groups
   */
  async getUserGroupsWithApprovers(context: ApiRequestContext): Promise<{
    data: GetUserGroupsWithApproversResponseRow[];
    status: number;
  }> {
    return this.requestWrapped<GetUserGroupsWithApproversResponseRow[]>(
      context,
      {
        method: 'GET',
        path: '/user-groups',
        logMessage: 'Fetching user groups with approvers from Data Layer API',
      }
    );
  }

  /**
   * Get single user group by ID
   * GET /user-groups/{id}
   */
  async getUserGroupById(
    context: ApiRequestContext,
    userGroupId: string
  ): Promise<{ data: GetUserGroupByIdResponseRow[]; status: number }> {
    return this.requestSingleItem<GetUserGroupByIdResponseRow>(context, {
      method: 'GET',
      path: `/user-groups/${userGroupId}`,
      logContext: { userGroupId },
      logMessage: 'Fetching user group by ID from Data Layer API',
    });
  }

  /**
   * Get users by group ID
   * GET /user-groups/{groupId}/users
   */
  async getUsersByGroupId(
    context: ApiRequestContext,
    groupId: string
  ): Promise<{ data: GetUsersByGroupIdResponseRow[]; status: number }> {
    return this.requestWrapped<GetUsersByGroupIdResponseRow[]>(context, {
      method: 'GET',
      path: `/user-groups/${groupId}/users`,
      logContext: { groupId },
      logMessage: 'Fetching users by group ID from Data Layer API',
    });
  }

  /**
   * Get my due actions
   * GET /my-items/due-actions
   */
  async getMyDueActions(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueActionsResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueActionsResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-actions',
      queryParams: {
        date: options.date,
        userId: options.userId,
        ...options.ownershipFilter,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due actions from Data Layer API',
    });
  }

  /**
   * Get my due assessments
   * GET /my-items/due-assessments
   */
  async getMyDueAssessments(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueAssessmentsResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueAssessmentsResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-assessments',
      queryParams: {
        date: options.date,
        userId: options.userId,
        ...options.ownershipFilter,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due assessments from Data Layer API',
    });
  }

  /**
   * Get my due assessment activities
   * GET /my-items/due-assessment-activities
   */
  async getMyDueAssessmentActivities(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueAssessmentActivitiesResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueAssessmentActivitiesResponseRow[]>(
      context,
      {
        method: 'GET',
        path: '/my-items/due-assessment-activities',
        queryParams: {
          date: options.date,
          userId: options.userId,
          ...options.ownershipFilter,
        },
        logContext: { date: options.date },
        logMessage: 'Fetching my due assessment activities from Data Layer API',
      }
    );
  }

  /**
   * Get my due attestation records
   * GET /my-items/due-attestation-records
   */
  async getMyDueAttestationRecords(
    context: ApiRequestContext,
    options: { date: string; userId: string }
  ): Promise<{ data: MyDueAttestationRecordsResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueAttestationRecordsResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-attestation-records',
      queryParams: {
        date: options.date,
        userId: options.userId,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due attestation records from Data Layer API',
    });
  }

  /**
   * Get my due controls
   * GET /my-items/due-controls
   */
  async getMyDueControls(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueControlsResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueControlsResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-controls',
      queryParams: {
        date: options.date,
        userId: options.userId,
        ...options.ownershipFilter,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due controls from Data Layer API',
    });
  }

  /**
   * Get my due documents
   * GET /my-items/due-documents
   */
  async getMyDueDocuments(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueDocumentsResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueDocumentsResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-documents',
      queryParams: {
        date: options.date,
        userId: options.userId,
        ...options.ownershipFilter,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due documents from Data Layer API',
    });
  }

  /**
   * Get my due indicators
   * GET /my-items/due-indicators
   */
  async getMyDueIndicators(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueIndicatorsResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueIndicatorsResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-indicators',
      queryParams: {
        date: options.date,
        userId: options.userId,
        ...options.ownershipFilter,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due indicators from Data Layer API',
    });
  }

  /**
   * Get my due issues
   * GET /my-items/due-issues
   */
  async getMyDueIssues(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueIssuesResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueIssuesResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-issues',
      queryParams: {
        date: options.date,
        userId: options.userId,
        ...options.ownershipFilter,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due issues from Data Layer API',
    });
  }

  /**
   * Get my due obligations
   * GET /my-items/due-obligations
   */
  async getMyDueObligations(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueObligationsResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueObligationsResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-obligations',
      queryParams: {
        date: options.date,
        userId: options.userId,
        ...options.ownershipFilter,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due obligations from Data Layer API',
    });
  }

  /**
   * Get my due risks
   * GET /my-items/due-risks
   */
  async getMyDueRisks(
    context: ApiRequestContext,
    options: { date: string; userId: string; ownershipFilter: OwnershipFilter }
  ): Promise<{ data: MyDueRisksResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueRisksResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-risks',
      queryParams: {
        date: options.date,
        userId: options.userId,
        ...options.ownershipFilter,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due risks from Data Layer API',
    });
  }

  /**
   * Get my due change requests
   * GET /my-items/due-change-requests
   */
  async getMyDueChangeRequests(
    context: ApiRequestContext,
    options: { date: string; userId: string }
  ): Promise<{ data: MyDueChangeRequestsResponseRow[]; status: number }> {
    return this.requestWrapped<MyDueChangeRequestsResponseRow[]>(context, {
      method: 'GET',
      path: '/my-items/due-change-requests',
      queryParams: {
        date: options.date,
        userId: options.userId,
      },
      logContext: { date: options.date },
      logMessage: 'Fetching my due change requests from Data Layer API',
    });
  }

  /**
   * Get all SSO configurations for the organisation
   * GET /sso-configurations
   */
  async getSsoConfigurations(
    context: ApiRequestContext
  ): Promise<{ data: SsoConfigurationRow[]; status: number }> {
    return this.requestWrapped<SsoConfigurationRow[]>(context, {
      method: 'GET',
      path: '/sso-configurations',
      logMessage: 'Fetching SSO configurations from Data Layer API',
    });
  }

  /**
   * Create a new SSO configuration
   * POST /sso-configurations
   */
  async createSsoConfiguration(
    context: ApiRequestContext,
    input: CreateSsoConfigurationRequest,
    correlationId: string
  ): Promise<{ data: CreateSsoConfigurationResponse; status: number }> {
    return this.rawRequest<CreateSsoConfigurationResponse>(context, {
      method: 'POST',
      path: '/sso-configurations',
      body: input,
      correlationId,
      logContext: { connectionId: input.ConnectionId },
      logMessage: 'Creating SSO configuration via Data Layer API',
    });
  }

  /**
   * Delete an SSO configuration by connection ID
   * DELETE /sso-configurations/{connectionId}
   */
  async deleteSsoConfiguration(
    context: ApiRequestContext,
    connectionId: string,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: `/sso-configurations/${connectionId}`,
      correlationId,
      body: {},
      logContext: { connectionId },
      logMessage: 'Deleting SSO configuration via Data Layer API',
    });
  }
  /**
   * Get an organisation by OrgKey
   * GET /organisations/{orgKey}
   */
  async getOrganisation(
    context: ApiRequestContext
  ): Promise<{ data: OrganisationRow[]; status: number }> {
    return this.requestSingleItem<OrganisationRow>(context, {
      method: 'GET',
      path: `/organisations/${context.orgKey}`,
      logMessage: 'Fetching organisation from Data Layer API',
    });
  }

  /**
   * Create a new obligation
   * POST /obligations
   */
  async createObligation(
    context: ApiRequestContext,
    input: CreateObligationRequest,
    correlationId: string
  ): Promise<{ data: CreateObligationResponse; status: number }> {
    return this.requestWrapped<CreateObligationResponse>(context, {
      method: 'POST',
      path: '/obligations',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating obligation via Data Layer API',
    });
  }

  /**
   * Create a new control
   * POST /controls
   */
  async createControl(
    context: ApiRequestContext,
    input: CreateControlRequest,
    correlationId: string
  ): Promise<{ data: CreateControlResponse; status: number }> {
    return this.requestWrapped<CreateControlResponse>(context, {
      method: 'POST',
      path: '/controls',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating control via Data Layer API',
    });
  }

  /**
   * Create a new control test result
   * POST /test-results
   */
  async createControlTestResult(
    context: ApiRequestContext,
    input: CreateControlTestResultRequest,
    correlationId: string
  ): Promise<{ data: CreateControlTestResultResponse; status: number }> {
    return this.rawRequest<CreateControlTestResultResponse>(context, {
      method: 'POST',
      path: '/test-results',
      body: input,
      correlationId,
      logContext: { controlIds: input.ControlIds },
      logMessage: 'Creating control test result via Data Layer API',
    });
  }

  /**
   * Update an existing test result
   * PUT /test-results/{id}
   */
  async updateTestResult(
    context: ApiRequestContext,
    input: UpdateTestResultRequest,
    correlationId: string
  ): Promise<{ data: UpdateTestResultResponse; status: number }> {
    return this.requestWrapped<UpdateTestResultResponse>(context, {
      method: 'PUT',
      path: `/test-results/${input.Id}`,
      body: input,
      correlationId,
      logContext: { testResultId: input.Id },
      logMessage: 'Updating test result via Data Layer API',
    });
  }

  /**
   * Delete test results (batch)
   * DELETE /test-results with body { Ids: string[] }
   */
  async deleteTestResults(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: '/test-results',
      body: { Ids: ids },
      correlationId,
      logContext: { ids, count: ids.length },
      logMessage: 'Deleting test results via Data Layer API',
    });
  }

  /**
   * Delete indicator results (batch)
   * DELETE /indicator-results with body { Ids: string[] }
   */
  async deleteIndicatorResults(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: '/indicator-results',
      body: { Ids: ids },
      correlationId,
      logContext: { ids, count: ids.length },
      logMessage: 'Deleting indicator results via Data Layer API',
    });
  }

  /**
   * Delete indicators (batch)
   * DELETE /indicators with body { Ids: string[] }
   */
  async deleteIndicators(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: '/indicators',
      body: { Ids: ids },
      correlationId,
      logContext: { ids, count: ids.length },
      logMessage: 'Deleting indicators via Data Layer API',
    });
  }

  /**
   * Create a new risk assessment result
   * POST /risk-assessment-results
   */
  async createRiskAssessmentResult(
    context: ApiRequestContext,
    input: CreateRiskAssessmentResultRequest,
    correlationId: string
  ): Promise<{ data: { Ids: string[] }; status: number }> {
    return this.rawRequest<{ Ids: string[] }>(context, {
      method: 'POST',
      path: '/risk-assessment-results',
      body: input,
      correlationId,
      logContext: { riskIds: input.RiskIds },
      logMessage: 'Creating risk assessment result via Data Layer API',
    });
  }

  /**
   * Create a new risk
   * POST /risks
   */
  async createRisk(
    context: ApiRequestContext,
    input: CreateRiskRequest,
    correlationId: string
  ): Promise<{ data: CreateRiskResponse; status: number }> {
    return this.requestWrapped<CreateRiskResponse>(context, {
      method: 'POST',
      path: '/risks',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating risk via Data Layer API',
    });
  }

  /**
   * Delete a risk
   * DELETE /risks/{id}
   */
  async deleteRisk(
    context: ApiRequestContext,
    riskId: string,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: `/risks/${riskId}`,
      body: {},
      correlationId,
      logContext: { riskId },
      logMessage: 'Deleting risk via Data Layer API',
    });
  }

  /**
   * Update an existing risk
   * PUT /risks/{id}
   */
  async updateRisk(
    context: ApiRequestContext,
    input: UpdateRiskRequest,
    correlationId: string
  ): Promise<{ data: UpdateRiskResponse; status: number }> {
    return this.requestWrapped<UpdateRiskResponse>(context, {
      method: 'PUT',
      path: `/risks/${input.Id}`,
      body: input,
      correlationId,
      logContext: { riskId: input.Id },
      logMessage: 'Updating risk via Data Layer API',
    });
  }

  /**
   * Create a new appetite
   * POST /appetites
   */
  async createAppetite(
    context: ApiRequestContext,
    input: CreateAppetiteRequest,
    correlationId: string
  ): Promise<{ data: { Id: string }; status: number }> {
    return this.requestWrapped<{ Id: string }>(context, {
      method: 'POST',
      path: '/appetites',
      body: input,
      correlationId,
      logContext: {
        appetiteType: input.AppetiteType,
      },
      logMessage: 'Creating appetite via Data Layer API',
    });
  }

  /**
   * Delete appetites (batch)
   * DELETE /appetites with body { Ids: string[] }
   */
  async deleteAppetites(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: '/appetites',
      body: { Ids: ids },
      correlationId,
      logContext: { ids, count: ids.length },
      logMessage: 'Deleting appetites via Data Layer API',
    });
  }

  /**
   * Update an existing appetite
   * PUT /appetites/{id}
   */
  async updateAppetite(
    context: ApiRequestContext,
    input: UpdateAppetiteRequest,
    correlationId: string
  ): Promise<{ data: UpdateAppetiteResponse; status: number }> {
    return this.requestWrapped<UpdateAppetiteResponse>(context, {
      method: 'PUT',
      path: `/appetites/${input.Id}`,
      body: input,
      correlationId,
      logContext: { appetiteId: input.Id },
      logMessage: 'Updating appetite via Data Layer API',
    });
  }

  /**
   * Delete acceptances (batch)
   * DELETE /acceptances with body { Ids: string[] }
   */
  async deleteAcceptances(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: '/acceptances',
      body: { Ids: ids },
      correlationId,
      logContext: { ids, count: ids.length },
      logMessage: 'Deleting acceptances via Data Layer API',
    });
  }

  /**
   * Create a new acceptance
   * POST /acceptances
   */
  async createAcceptance(
    context: ApiRequestContext,
    input: CreateAcceptanceRequest,
    correlationId: string
  ): Promise<{ data: CreateAcceptanceResponse; status: number }> {
    return this.requestWrapped<CreateAcceptanceResponse>(context, {
      method: 'POST',
      path: '/acceptances',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating acceptance via Data Layer API',
    });
  }

  /**
   * Update an existing acceptance
   * PUT /acceptances/{id}
   */
  async updateAcceptance(
    context: ApiRequestContext,
    input: UpdateAcceptanceRequest,
    correlationId: string
  ): Promise<{ data: UpdateAcceptanceResponse; status: number }> {
    return this.requestWrapped<UpdateAcceptanceResponse>(context, {
      method: 'PUT',
      path: `/acceptances/${input.Id}`,
      body: input,
      correlationId,
      logContext: { acceptanceId: input.Id },
      logMessage: 'Updating acceptance via Data Layer API',
    });
  }

  /**
   * Create a new assessment
   * POST /assessments
   */
  async createAssessment(
    context: ApiRequestContext,
    input: CreateAssessmentRequest,
    correlationId: string
  ): Promise<{ data: CreateAssessmentResponse; status: number }> {
    return this.requestWrapped<CreateAssessmentResponse>(context, {
      method: 'POST',
      path: '/assessments',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating assessment via Data Layer API',
    });
  }

  /**
   * Update an existing assessment
   * PUT /assessments/{id}
   */
  async updateAssessment(
    context: ApiRequestContext,
    input: UpdateAssessmentRequest,
    correlationId: string
  ): Promise<{ data: UpdateAssessmentResponse; status: number }> {
    return this.requestWrapped<UpdateAssessmentResponse>(context, {
      method: 'PUT',
      path: `/assessments/${input.Id}`,
      body: input,
      correlationId,
      logContext: { assessmentId: input.Id },
      logMessage: 'Updating assessment via Data Layer API',
    });
  }

  /**
   * Delete an assessment
   * DELETE /assessments/{id}
   */
  async deleteAssessment(
    context: ApiRequestContext,
    assessmentId: string,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'DELETE',
      path: `/assessments/${assessmentId}`,
      body: {},
      correlationId,
      logContext: { assessmentId },
      logMessage: 'Deleting assessment via Data Layer API',
    });
  }

  // ── Cause methods ──────────────────────────────────────────────────

  /**
   * Create a cause
   * POST /causes
   */
  async createCause(
    context: ApiRequestContext,
    input: CreateCauseRequest,
    correlationId: string
  ): Promise<{ data: { Id: string }; status: number }> {
    return this.requestWrapped<{ Id: string }>(context, {
      method: 'POST',
      path: '/causes',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating cause via Data Layer API',
    });
  }

  /**
   * Update a cause
   * PUT /causes/{id}
   */
  async updateCause(
    context: ApiRequestContext,
    id: string,
    input: UpdateCauseRequest,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'PUT',
      path: `/causes/${id}`,
      body: input,
      correlationId,
      logContext: { causeId: id },
      logMessage: 'Updating cause via Data Layer API',
    });
  }

  /**
   * Delete causes
   * DELETE /causes
   */
  async deleteCauses(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: { deletedCount: number }; status: number }> {
    return this.rawRequest<{ deletedCount: number }>(context, {
      method: 'DELETE',
      path: '/causes',
      body: { Ids: ids },
      correlationId,
      logContext: { ids, count: ids.length },
      logMessage: 'Deleting causes via Data Layer API',
    });
  }

  /**
   * Create a consequence
   * POST /consequences
   */
  async createConsequence(
    context: ApiRequestContext,
    input: CreateConsequenceRequest,
    correlationId: string
  ): Promise<{ data: { Id: string }; status: number }> {
    return this.requestWrapped<{ Id: string }>(context, {
      method: 'POST',
      path: '/consequences',
      body: input,
      correlationId,
      logContext: { title: input.Title },
      logMessage: 'Creating consequence via Data Layer API',
    });
  }

  /**
   * Update a consequence
   * PUT /consequences/{id}
   */
  async updateConsequence(
    context: ApiRequestContext,
    id: string,
    input: UpdateConsequenceRequest,
    correlationId: string
  ): Promise<{ data: void; status: number }> {
    return this.rawRequest<void>(context, {
      method: 'PUT',
      path: `/consequences/${id}`,
      body: input,
      correlationId,
      logContext: { consequenceId: id },
      logMessage: 'Updating consequence via Data Layer API',
    });
  }

  /**
   * Delete consequences
   * DELETE /consequences
   */
  async deleteConsequences(
    context: ApiRequestContext,
    ids: string[],
    correlationId: string
  ): Promise<{ data: { deletedCount: number }; status: number }> {
    return this.rawRequest<{ deletedCount: number }>(context, {
      method: 'DELETE',
      path: '/consequences',
      body: { Ids: ids },
      correlationId,
      logContext: { ids, count: ids.length },
      logMessage: 'Deleting consequences via Data Layer API',
    });
  }

  // ── Schedule state methods ──────────────────────────────────────────

  /**
   * Get schedule by entity ID
   * GET /schedules/{id}
   */
  async getSchedule(
    context: ApiRequestContext,
    id: string
  ): Promise<{ data: Schedule; status: number }> {
    return this.requestWrapped<Schedule>(context, {
      method: 'GET',
      path: `/schedules/${id}`,
      logContext: { id },
      logMessage: 'Fetching schedule from Data Layer API',
    });
  }

  /**
   * Get schedule state by entity ID
   * GET /schedule-states/{id}
   */
  async getScheduleState(
    context: ApiRequestContext,
    id: string
  ): Promise<{ data: ScheduleState; status: number }> {
    return this.requestWrapped<ScheduleState>(context, {
      method: 'GET',
      path: `/schedule-states/${id}`,
      logContext: { id },
      logMessage: 'Fetching schedule state from Data Layer API',
    });
  }

  /**
   * Upsert schedule state
   * PUT /schedule-states/{id}
   */
  async upsertScheduleState(
    context: ApiRequestContext,
    id: string,
    body: {
      LatestDate: string | null;
      DueDate: string | null;
      OverdueDate: string | null;
    }
  ): Promise<{ data: { Id: string }; status: number }> {
    return this.rawRequest<{ Id: string }>(context, {
      method: 'PUT',
      path: `/schedule-states/${id}`,
      body,
      logContext: { id },
      logMessage: 'Upserting schedule state via Data Layer API',
    });
  }

  /**
   * Get latest risk assessment result by risk ID
   * GET /risk-assessment-results/latest-by-risk/{riskId}
   */
  async getLatestRiskAssessmentResultByRisk(
    context: ApiRequestContext,
    riskId: string
  ): Promise<{ data: LatestRiskAssessmentResult; status: number }> {
    return this.requestWrapped<LatestRiskAssessmentResult>(context, {
      method: 'GET',
      path: `/risk-assessment-results/latest-by-risk/${riskId}`,
      logContext: { riskId },
      logMessage: 'Fetching latest risk assessment result from Data Layer API',
    });
  }

  /**
   * Get aggregation settings
   * GET /aggregation-settings
   */
  async getAggregationSettings(
    context: ApiRequestContext
  ): Promise<{ data: AggregationSettings; status: number }> {
    return this.requestWrapped<AggregationSettings>(context, {
      method: 'GET',
      path: '/aggregation-settings',
      logMessage: 'Fetching aggregation settings from Data Layer API',
    });
  }

  /**
   * Get latest test result by control ID
   * GET /test-results/latest-by-control/{controlId}
   */
  async getLatestTestResultByControl(
    context: ApiRequestContext,
    controlId: string
  ): Promise<{ data: LatestTestResult; status: number }> {
    return this.requestWrapped<LatestTestResult>(context, {
      method: 'GET',
      path: `/test-results/latest-by-control/${controlId}`,
      logContext: { controlId },
      logMessage: 'Fetching latest test result from Data Layer API',
    });
  }

  /**
   * Get latest document assessment result by document ID
   * GET /document-assessment-results/latest-by-document/{documentId}
   */
  async getLatestDocumentAssessmentResultByDocument(
    context: ApiRequestContext,
    documentId: string
  ): Promise<{ data: LatestDocumentAssessmentResult; status: number }> {
    return this.requestWrapped<LatestDocumentAssessmentResult>(context, {
      method: 'GET',
      path: `/document-assessment-results/latest-by-document/${documentId}`,
      logContext: { documentId },
      logMessage:
        'Fetching latest document assessment result from Data Layer API',
    });
  }

  /**
   * Get latest obligation assessment result by obligation ID
   * GET /obligation-assessment-results/latest-by-obligation/{obligationId}
   */
  async getLatestObligationAssessmentResultByObligation(
    context: ApiRequestContext,
    obligationId: string
  ): Promise<{ data: LatestObligationAssessmentResult; status: number }> {
    return this.requestWrapped<LatestObligationAssessmentResult>(context, {
      method: 'GET',
      path: `/obligation-assessment-results/latest-by-obligation/${obligationId}`,
      logContext: { obligationId },
      logMessage:
        'Fetching latest obligation assessment result from Data Layer API',
    });
  }

  /**
   * Get latest indicator result by indicator ID
   * GET /indicator-results/latest-by-indicator/{indicatorId}
   */
  async getLatestIndicatorResultByIndicator(
    context: ApiRequestContext,
    indicatorId: string
  ): Promise<{ data: LatestIndicatorResult; status: number }> {
    return this.requestWrapped<LatestIndicatorResult>(context, {
      method: 'GET',
      path: `/indicator-results/latest-by-indicator/${indicatorId}`,
      logContext: { indicatorId },
      logMessage: 'Fetching latest indicator result from Data Layer API',
    });
  }

  /**
   * Get oldest active impact test date by risk ID
   * GET /impact-ratings/oldest-active-by-risk/{riskId}
   */
  async getOldestActiveImpactTestDateByRisk(
    context: ApiRequestContext,
    riskId: string
  ): Promise<{ data: OldestActiveImpactTestDate; status: number }> {
    return this.rawRequest<OldestActiveImpactTestDate>(context, {
      method: 'GET',
      path: `/impact-ratings/oldest-active-by-risk/${riskId}`,
      logContext: { riskId },
      logMessage: 'Fetching oldest active impact test date from Data Layer API',
    });
  }
}

// Export a singleton instance of the client
export const dataLayerApiClient = new DataLayerApiClient();
