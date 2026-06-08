import type { CommandTypeNames } from '@risksmart-app/events/src/types/command-types';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

import type { ServiceContext } from '../services/service.types';
import {
  type ErrorMessageOverrides,
  mapDataLayerError,
} from '../utils/error-mapping';
import { logger } from '../utils/logger';
import { toApiContext } from './client-utils';
import { DataLayerApiError } from './data-layer-api-client';
import {
  initiateAsyncRequest,
  type PollOptions,
  pollUntilComplete,
  RequestStateTaskStatus,
} from './request-state-api-client';

/**
 * Options for executing an async request with tracking
 */
export interface AsyncRequestOptions<TInput, TResponse> {
  /**
   * The command type for tracking (e.g., 'CREATE_ACTION_UPDATE')
   * Must be a valid CommandTypeNames from the events package
   */
  requestType: CommandTypeNames;

  /**
   * Transforms the input into a request body for the async request tracking
   * This is stored in the request state for auditing/debugging
   */
  buildRequestBody: (input: TInput) => Record<string, unknown>;

  /**
   * The actual API call function that performs the operation
   * Receives context, input, and correlation ID for tracking
   * Must return { data, status } tuple
   */
  apiCall: (
    ctx: ServiceContext,
    input: TInput,
    correlationId: string
  ) => Promise<{ data: TResponse; status: number }>;

  /**
   * Expected HTTP status code for success (default: 201 for creates)
   */
  successStatus?: number;

  /**
   * Custom error message overrides per HTTP status code
   */
  errorMessages?: ErrorMessageOverrides;

  /**
   * Polling options for waiting on async completion
   * Uses sensible defaults if not provided
   */
  pollOptions?: PollOptions;
}

/**
 * Executes an internal API call with full async request tracking
 *
 * This function handles the complete async request flow:
 * 1. Generates a correlation ID for tracking
 * 2. Initiates async request tracking via Request State API
 * 3. Executes the actual API call
 * 4. Maps HTTP errors to TRPCErrors
 * 5. Polls until async tasks complete (e.g., permission updates)
 * 6. Handles failed states with appropriate error messages
 *
 * @param ctx - Service context containing tenant, orgId, userId
 * @param input - Input data for the API call
 * @param options - Configuration for the async request
 * @returns The response data from the API call
 * @throws TRPCError on failure at any step
 *
 * @example
 * const result = await executeAsyncRequest(ctx, input, {
 *   requestType: 'CREATE_ACTION_UPDATE',
 *   buildRequestBody: (input) => ({
 *     ParentActionId: input.ParentActionId,
 *     Title: input.Title,
 *   }),
 *   apiCall: (ctx, input, correlationId) =>
 *     dataLayerApiClient.createActionUpdate(apiContext, input, correlationId),
 *   errorMessages: {
 *     403: 'You do not have permission to create action updates',
 *     404: 'Parent action not found',
 *   },
 * });
 */
export async function executeAsyncRequest<TInput, TResponse>(
  ctx: ServiceContext,
  input: TInput,
  options: AsyncRequestOptions<TInput, TResponse>
): Promise<TResponse> {
  const {
    requestType,
    buildRequestBody,
    apiCall,
    successStatus = 201,
    errorMessages,
    pollOptions,
  } = options;

  const correlationId = uuidv4();

  logger.info({ correlationId, requestType }, 'Starting async request');

  // Step 1: Initiate async request tracking
  const { status: initiateStatus } = await initiateAsyncRequest(
    toApiContext(ctx),
    correlationId,
    {
      type: requestType,
      request: buildRequestBody(input),
    }
  );

  if (initiateStatus !== 202) {
    logger.error(
      { correlationId, status: initiateStatus, requestType },
      'Failed to initiate async request tracking'
    );
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to initiate ${requestType} request`,
    });
  }

  // Step 2: Execute the actual API call
  let apiResponse: TResponse;
  let apiStatus: number;
  try {
    const result = await apiCall(ctx, input, correlationId);
    apiResponse = result.data;
    apiStatus = result.status;
  } catch (error) {
    if (error instanceof DataLayerApiError) {
      logger.error(
        {
          correlationId,
          status: error.status,
          requestType,
          response: error.responseBody,
        },
        'API returned error status'
      );
    }
    mapDataLayerError(error, errorMessages);
  }

  // Step 3: Verify expected success status (e.g., 201 vs 200 vs 204)
  if (apiStatus !== successStatus) {
    logger.error(
      { correlationId, status: apiStatus, requestType, response: apiResponse },
      'API returned unexpected success status'
    );
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Unexpected status ${apiStatus} for ${requestType} (expected ${successStatus})`,
    });
  }

  // Step 4: Poll until async tasks complete
  const finalState = await pollUntilComplete(
    ctx.tenant,
    correlationId,
    pollOptions
  );

  // Step 5: Handle failed state
  if (finalState.status === RequestStateTaskStatus.FAILED) {
    logger.error(
      { correlationId, requestType, error: finalState.error },
      'Async request failed during processing'
    );

    // Extract error message from failed state
    const errorMessage =
      typeof finalState.error === 'object' &&
      finalState.error !== null &&
      'message' in finalState.error
        ? String(finalState.error.message)
        : `${requestType} request failed`;

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: errorMessage,
    });
  }

  logger.info(
    { correlationId, requestType },
    'Async request completed successfully'
  );

  return apiResponse;
}
