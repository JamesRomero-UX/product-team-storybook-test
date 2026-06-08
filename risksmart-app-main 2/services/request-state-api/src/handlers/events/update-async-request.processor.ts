import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import type { UpdateAsyncRequest } from '@risksmart-app/events/src/types/command-types';
import { AsyncRequestEvent } from '@risksmart-app/events/src/types/common';
import {
  type OrgUserEventMetadata,
  type OrgUserEventTypes,
  orgUserMetadataSchema,
} from '@risksmart-app/events/src/types/orguser-events';
import type { EventBridgeEvent } from 'aws-lambda';
import { appendToRequest } from 'src/event-store/aggregator/facets';
import { getLogger } from 'src/utils/logger';

type UpdateAsyncRequestInputEvent = UpdateAsyncRequest<
  OrgUserEventTypes,
  OrgUserEventMetadata
>;

const logger = getLogger();

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 50;
const MAX_DELAY_MS = 2000;

/**
 * Retry with exponential backoff for handling concurrent DynamoDB transactions.
 * When multiple events try to update the same request state simultaneously,
 * they can fail due to conditional check failures. This retry logic helps
 * ensure all events eventually get processed.
 */
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      // Only retry on TransactionCanceledException (concurrent update conflict)
      if (
        error instanceof TransactionCanceledException ||
        (error instanceof Error &&
          error.name === 'TransactionCanceledException')
      ) {
        lastError = error as Error;
        const delay = Math.min(
          BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 50,
          MAX_DELAY_MS
        );
        logger.warn(
          `${operationName} failed due to concurrent update, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
          { attempt, delay }
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Non-retryable error, throw immediately
        throw error;
      }
    }
  }

  logger.error(
    `${operationName} failed after ${MAX_RETRIES} retries due to concurrent updates`
  );
  throw (
    lastError ??
    new Error(
      `${operationName} failed after ${MAX_RETRIES} retries due to concurrent updates`
    )
  );
};

export const processUpdateAsyncRequestEvent = async (
  event: EventBridgeEvent<string, OrgUserEventTypes>
): Promise<void> => {
  const { metadata, type } = event.detail;

  const parsedMetadata = orgUserMetadataSchema.safeParse(metadata);
  if (!parsedMetadata.success) {
    logger.info('Skipping non-org-user event', { type }); // events from different scopes (e.g. tenant) will probably need their own processor rather than overloading this one

    return;
  }

  const { tenant, userId, correlationId, orgKey } = parsedMetadata.data;

  logger.appendKeys({
    tenant,
    orgKey,
    userId,
    correlationId,
    type,
  });

  logger.info('Processing UpdateAsyncRequest event', {
    event,
  });

  try {
    const inputEvent: UpdateAsyncRequestInputEvent = {
      type: AsyncRequestEvent.UpdateAsyncRequest,
      data: {
        request: event.detail,
      },
      metadata: event.detail.metadata,
    };

    logger.info(
      'Constructed UpdateAsyncRequest event:',
      JSON.stringify(inputEvent, null, 2)
    );

    await retryWithBackoff(
      () =>
        appendToRequest(correlationId, tenant, {
          eventName: AsyncRequestEvent.UpdateAsyncRequest,
          event: inputEvent,
        }),
      'appendToRequest'
    );

    logger.info('UpdateAsyncRequest processing completed successfully');
  } catch (error) {
    logger.error('Error processing UpdateAsyncRequest event', error as Error);
    throw error;
  }
};
