import * as Sentry from '@sentry/aws-serverless';
import type { EventBridgeHandler } from 'aws-lambda';
import { monoLambdaEventBridgeHandler } from 'src/eventBridgeHandler';

import { getLogger } from '../../../logger';
import {
  actionDuePoller,
  actionOverduePoller,
  issueDuePoller,
  issueOverduePoller,
  policyAttestationReminderPoller,
  policyDocumentVersionReviewDuePoller,
  policyDocumentVersionReviewUpcomingPoller,
  scheduleDuePoller,
  scheduleOverduePoller,
} from '../index';

const logger = getLogger();

const POLLERS: {
  name: string;
  handler: EventBridgeHandler<string, { tenant: string }, void>;
}[] = [
  { name: 'actionDuePoller', handler: actionDuePoller },
  { name: 'actionOverduePoller', handler: actionOverduePoller },
  { name: 'issueDuePoller', handler: issueDuePoller },
  { name: 'issueOverduePoller', handler: issueOverduePoller },
  { name: 'scheduleDuePoller', handler: scheduleDuePoller },
  { name: 'scheduleOverduePoller', handler: scheduleOverduePoller },
  {
    name: 'policyAttestationReminderPoller',
    handler: policyAttestationReminderPoller,
  },
  {
    name: 'policyDocumentVersionReviewDuePoller',
    handler: policyDocumentVersionReviewDuePoller,
  },
  {
    name: 'policyDocumentVersionReviewUpcomingPoller',
    handler: policyDocumentVersionReviewUpcomingPoller,
  },
];

export const handler = monoLambdaEventBridgeHandler<
  string,
  { tenant: string },
  void
>(async (event, context, callback) => {
  logger.appendKeys({
    tenant: event.detail.tenant,
  });

  const errors: Error[] = [];
  for (const poller of POLLERS) {
    await Sentry.withScope(async (scope) => {
      await Sentry.startSpan({ name: poller.name }, async () => {
        scope.setTransactionName(poller.name);
        scope.setTag('handler', handler.name);
        try {
          logger.appendKeys({
            handler: poller.name,
          });
          logger.info('Processing polling handler');
          await poller.handler(event, context, callback);
          logger.info('Processed polling handler');
        } catch (error) {
          logger.error('Error processing polling handler', error as Error);
          scope.captureException(error);
          errors.push(error as Error);
        } finally {
          logger.resetKeys();
          logger.appendKeys({
            tenant: event.detail.tenant,
          });
        }
      });
    });
  }
  if (errors.length > 0) {
    logger.error('Had errors. Poller ending in failure', {
      errors,
    });
    throw new AggregateError(errors);
  } else {
    logger.info('Orchestration of poller processing complete.');
  }
});
