import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { wrapHandler } from '@sentry/aws-serverless';
import type { SQSHandler, SQSRecord } from 'aws-lambda';

import { sync } from '../handlers/sync/sync';
import { getLogger } from '../logger';
import { initSentry } from '../sentry-init';

initSentry();
const logger = getLogger();

interface SyncMessage {
  tenant: string;
  timestamp: string;
}

/**
 * TenantSyncProcessor - SQS-triggered Lambda that processes tenant sync messages
 * from the FIFO queue. For each tenant, it:
 * 1. Queries all organizations for the tenant from the Tenant Config Table
 * 2. Gets nodes/links from the RiskSmart databases
 * 3. Performs bulk sync to PermitIO
 */
const tenantSyncProcessorHandler: SQSHandler = async (event) => {
  logger.info('TenantSyncProcessor invoked', {
    recordCount: event.Records.length,
  });

  for (const record of event.Records) {
    await processSyncMessage(record);
  }

  logger.info('TenantSyncProcessor completed successfully');
};

async function processSyncMessage(record: SQSRecord): Promise<void> {
  const message: SyncMessage = JSON.parse(record.body);
  logger.info('Processing sync message', {
    tenant: message.tenant,
    timestamp: message.timestamp,
  });

  try {
    await sync({ tenant: message.tenant });
    logger.info('Sync completed for tenant', {
      tenant: message.tenant,
    });
  } catch (error) {
    logger.error('Failed to process sync message', {
      tenant: message.tenant,
      error,
    });
    throw error;
  }
}

export const handler = wrapHandler(
  middy(tenantSyncProcessorHandler).use(
    injectLambdaContext(logger, { resetKeys: true })
  )
);
