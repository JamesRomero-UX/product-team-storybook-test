import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import middy from '@middy/core';
import { getEnv } from '@risksmart-app/permitio/src/utils/environment';
import { getAllTenantConfigs } from '@risksmart-app/tenant-configuration/src/adaptors/database/index';
import { wrapHandler } from '@sentry/aws-serverless';
import type { ScheduledHandler } from 'aws-lambda';

import { getLogger } from '../logger';
import { initSentry } from '../sentry-init';

initSentry();
const logger = getLogger();

const sqsClient = new SQSClient({});

interface TenantConfig {
  tenant: string;
}

/**
 * TenantSyncPoller - Cron-triggered Lambda that queries tenants from the
 * GlobalTenantConfig DynamoDB table and sends sync messages to the FIFO queue.
 */
const tenantSyncPollerHandler: ScheduledHandler = async (event) => {
  logger.info('TenantSyncPoller invoked', { event });

  const queueUrl = getEnv('SYNC_QUEUE_URL');
  const region = getEnv('AWS_REGION');
  logger.info('Starting tenant sync polling', {
    queueUrl,
    region,
  });

  try {
    // Query all tenants from the GlobalTenantConfig table
    const tenants = await getAllTenantConfigs(region);

    logger.info('Found tenants to sync', { count: tenants.length });

    // Send a sync message for each tenant to the FIFO queue
    for (const tenant of tenants) {
      await sendSyncMessage(queueUrl, tenant);
    }

    logger.info('TenantSyncPoller completed successfully', {
      tenantsQueued: tenants.length,
    });
  } catch (error) {
    logger.error('TenantSyncPoller failed', { error });
    throw error;
  }
};

async function sendSyncMessage(
  queueUrl: string,
  tenant: TenantConfig
): Promise<void> {
  const sanitizedTenant = tenant.tenant.toLowerCase().trim();
  const messageBody = JSON.stringify({
    tenant: sanitizedTenant,
    timestamp: new Date().toISOString(),
  });

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: messageBody,
    MessageGroupId: sanitizedTenant, // Ensures FIFO ordering per tenant
    MessageDeduplicationId: `${sanitizedTenant}-${Date.now()}`, // Unique per sync attempt
  });

  await sqsClient.send(command);

  logger.info('Sync message sent for tenant', {
    tenant: sanitizedTenant,
  });
}

export const handler = wrapHandler(
  middy(tenantSyncPollerHandler).use(
    injectLambdaContext(logger, { resetKeys: true })
  )
);
