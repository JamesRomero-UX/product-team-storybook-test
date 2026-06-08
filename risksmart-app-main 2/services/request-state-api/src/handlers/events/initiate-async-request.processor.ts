import type { InitiateAsyncRequest } from '@risksmart-app/events/src/types/command-types';
import type { RequestTypes } from '@risksmart-app/events/src/types/request-types';
import type { EventBridgeEvent } from 'aws-lambda';
import { appendToRequest } from 'src/event-store/aggregator/facets';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export const processInitiateAsyncRequestEvent = async (
  event: EventBridgeEvent<string, InitiateAsyncRequest<RequestTypes>>
): Promise<void> => {
  const { metadata, type, data } = event.detail;
  const { tenant, orgKey, userId, correlationId } = metadata;
  const { subType } = data;

  logger.appendKeys({
    tenant,
    orgKey,
    userId,
    correlationId,
    type,
    subType,
  });

  logger.info('Processing InitiateAsyncRequest event', {
    event,
  });

  try {
    const detailType = event['detail-type'];

    await appendToRequest(correlationId, tenant, {
      eventName: detailType,
      event: event.detail,
    });

    logger.info('InitiateAsyncRequest processing completed successfully');
  } catch (error) {
    logger.error('Error processing InitiateAsyncRequest event', error as Error);
    throw error;
  }
};
