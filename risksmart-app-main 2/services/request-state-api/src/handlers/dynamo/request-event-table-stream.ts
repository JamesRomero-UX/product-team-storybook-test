import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import middy from '@middy/core';
import type { OrgUserEventMetadata } from '@risksmart-app/events/src/types/orguser-events';
import { sendToEventBridgeInBatches } from '@risksmart-app/shared/src/utils/eventBridge';
import { wrapHandler } from '@sentry/aws-serverless';
import type {
  AttributeValue,
  DynamoDBStreamEvent,
  DynamoDBStreamHandler,
} from 'aws-lambda';

import type { Record as EventRecord } from '../../event-store/db/db';
import { getLogger } from '../../utils/logger';
import { initSentry } from '../../utils/sentry-init';

initSentry();
const logger = getLogger();

type RequestEventRecord = EventRecord & {
  data?: unknown;
  metadata?: OrgUserEventMetadata;
  type?: string;
};

// Convert DynamoDB AttributeValue to regular JavaScript object using AWS SDK v3
const convertDynamoRecord = (
  dynamoRecord: Record<string, AttributeValue>
): RequestEventRecord | null => {
  try {
    // Use unmarshall from AWS SDK v3 to convert the record
    // Cast as any to work around type incompatibility between Lambda types and SDK types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const record = unmarshall(dynamoRecord as any) as Record<string, unknown>;

    // Validate required fields
    if (
      typeof record._id !== 'string' ||
      typeof record._rng !== 'string' ||
      typeof record._facet !== 'string' ||
      typeof record._typ !== 'string'
    ) {
      logger.warn('Missing or invalid required fields in DynamoDB record', {
        record,
      });

      return null;
    }

    return {
      _id: record._id,
      _rng: record._rng,
      _facet: record._facet,
      _typ: record._typ,
      _ts: typeof record._ts === 'number' ? record._ts : 0,
      _date: typeof record._date === 'string' ? record._date : '',
      _seq: typeof record._seq === 'number' ? record._seq : 0,
      data: record.data,
      metadata: record.metadata as OrgUserEventMetadata,
      type: record.type as string,
    };
  } catch (error) {
    logger.error('Error converting DynamoDB record', { error, dynamoRecord });

    return null;
  }
};

// Extract tenant from event metadata
const extractTenant = (record: RequestEventRecord): string | null => {
  // Tenant is available as a property on the event metadata
  if (record.metadata?.tenant) {
    return record.metadata.tenant;
  }

  logger.warn('No tenant found in event metadata', {
    recordId: record._id,
    metadata: record.metadata,
  });

  return null;
};

const streamHandler: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent
) => {
  logger.info('Processing DynamoDB stream event', {
    recordCount: event.Records.length,
  });

  const eventBridgeEntries: PutEventsRequestEntry[] = [];

  for (const streamRecord of event.Records) {
    try {
      // Only process INSERT and MODIFY events
      if (
        streamRecord.eventName !== 'INSERT' &&
        streamRecord.eventName !== 'MODIFY'
      ) {
        logger.debug('Skipping non-INSERT/MODIFY event', {
          eventName: streamRecord.eventName,
        });
        continue;
      }

      // Only process records with NEW_IMAGE
      if (!streamRecord.dynamodb?.NewImage) {
        logger.debug('Skipping record without NewImage');
        continue;
      }

      // Convert DynamoDB record to our format
      const record = convertDynamoRecord(streamRecord.dynamodb.NewImage);
      if (!record) {
        logger.warn('Failed to convert DynamoDB record, skipping');
        continue;
      }

      // Only process records with _rng starting with 'OUTBOUND'
      if (!record._rng.startsWith('OUTBOUND')) {
        logger.debug('Skipping non-OUTBOUND record', { rng: record._rng });
        continue;
      }

      // Extract tenant information
      const tenant = extractTenant(record);
      if (!tenant) {
        logger.warn('Unable to extract tenant from record, skipping', {
          recordId: record._id,
        });
        continue;
      }

      logger.info('Processing OUTBOUND record', {
        recordId: record._id,
        rng: record._rng,
        tenant,
        eventType: record._typ,
      });

      // Create EventBridge event detail from data and metadata
      const { _id, _rng, _facet, _typ, _ts, _date, _seq, ...eventDetail } =
        record;

      // Create EventBridge entry
      const eventEntry: PutEventsRequestEntry = {
        Source: 'risksmart.request-state-api',
        DetailType: _typ,
        Detail: JSON.stringify(eventDetail),
        EventBusName: process.env.EVENT_BUS_NAME || undefined, // Will use default bus if not set
      };

      eventBridgeEntries.push(eventEntry);
    } catch (error) {
      logger.error('Error processing stream record', {
        error,
        streamRecord: JSON.stringify(streamRecord, null, 2),
      });
      // Continue processing other records even if one fails
    }
  }

  // Send all events to EventBridge
  if (eventBridgeEntries.length > 0) {
    try {
      await sendToEventBridgeInBatches(eventBridgeEntries);
      logger.info('Successfully processed all OUTBOUND records', {
        processedCount: eventBridgeEntries.length,
      });
    } catch (error) {
      logger.error('Failed to send events to EventBridge', { error });
      throw error; // Fail the Lambda so DynamoDB will retry
    }
  } else {
    logger.info('No OUTBOUND records to process');
  }
};

export const handler = wrapHandler(
  middy(streamHandler).use(injectLambdaContext(logger, { resetKeys: true }))
);
