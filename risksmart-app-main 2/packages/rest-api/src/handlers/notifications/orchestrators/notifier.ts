import * as Sentry from '@sentry/aws-serverless';
import { monoLambdaEventBridgeHandler } from 'src/eventBridgeHandler';

import { getLogger } from '../../../logger';
import {
  actionDueNotifier,
  actionNotifier,
  actionOverdueNotifier,
  attestationNotifier,
  changeRequestNotifier,
  controlNotifier,
  documentNotifier,
  issueDueNotifier,
  issueNotifier,
  issueOverdueNotifier,
  policyAttestationReminderNotifier,
  policyDocumentVersionReviewDueNotifier,
  policyDocumentVersionReviewUpcomingNotifier,
  riskNotifier,
  scheduleNotifier,
  thirdPartyResponseSubmittedNotifier,
  userGroupProvider,
  userGroupUserSubscriber,
} from '../index';
import type { DETAIL_TYPES, GenericEventHandler, TABLE_NAMES } from './types';

const logger = getLogger();

const SCHEDULED_NOTIFICATION_ROUTING: {
  [key in DETAIL_TYPES]: {
    name: string;
    handler: GenericEventHandler;
  }[];
} = {
  IssueDue: [{ name: 'issueDueNotifier', handler: issueDueNotifier }],
  IssueOverdue: [
    { name: 'issueOverdueNotifier', handler: issueOverdueNotifier },
  ],
  ActionDue: [{ name: 'actionDueNotifier', handler: actionDueNotifier }],
  ActionOverdue: [
    { name: 'actionOverdueNotifier', handler: actionOverdueNotifier },
  ],
  ScheduleDue: [{ name: 'scheduleNotifier', handler: scheduleNotifier }],
  ScheduleOverdue: [{ name: 'scheduleNotifier', handler: scheduleNotifier }],
  PolicyAttestationReminder: [
    {
      name: 'policyAttestationReminderNotifier',
      handler: policyAttestationReminderNotifier,
    },
  ],
  PolicyDocumentVersionReviewDue: [
    {
      name: 'policyDocumentVersionReviewDueNotifier',
      handler: policyDocumentVersionReviewDueNotifier,
    },
  ],
  PolicyDocumentVersionReviewUpcoming: [
    {
      name: 'policyDocumentVersionReviewUpcomingNotifier',
      handler: policyDocumentVersionReviewUpcomingNotifier,
    },
  ],
};

const DATA_CHANGE_NOTIFICATION_ROUTING: {
  [key in TABLE_NAMES]: {
    name: string;
    handler: GenericEventHandler;
  }[];
} = {
  acceptance: [{ name: 'riskNotifier', handler: riskNotifier }],
  action: [{ name: 'actionNotifier', handler: actionNotifier }],
  action_update: [{ name: 'actionNotifier', handler: actionNotifier }],
  appetite: [{ name: 'riskNotifier', handler: riskNotifier }],
  approver_response: [
    { name: 'changeRequestNotifier', handler: changeRequestNotifier },
  ],
  attestation_record: [
    { name: 'attestationNotifier', handler: attestationNotifier },
  ],
  cause: [{ name: 'issueNotifier', handler: issueNotifier }],
  consequence: [{ name: 'issueNotifier', handler: issueNotifier }],
  control: [{ name: 'controlNotifier', handler: controlNotifier }],
  document: [{ name: 'documentNotifier', handler: documentNotifier }],
  document_file: [{ name: 'documentNotifier', handler: documentNotifier }],
  indicator: [
    { name: 'riskNotifier', handler: riskNotifier },
    { name: 'controlNotifier', handler: controlNotifier },
  ],
  indicator_result: [
    { name: 'riskNotifier', handler: riskNotifier },
    { name: 'controlNotifier', handler: controlNotifier },
  ],
  issue: [{ name: 'issueNotifier', handler: issueNotifier }],
  issue_update: [{ name: 'issueNotifier', handler: issueNotifier }],
  performance: [{ name: 'controlNotifier', handler: controlNotifier }],
  risk: [{ name: 'riskNotifier', handler: riskNotifier }],
  risk_assessment_result: [{ name: 'riskNotifier', handler: riskNotifier }],
  test_result: [{ name: 'controlNotifier', handler: controlNotifier }],
  third_party_response: [
    {
      name: 'thirdPartyResponseSubmittedNotifier',
      handler: thirdPartyResponseSubmittedNotifier,
    },
  ],
  user_group: [{ name: 'userGroupProvider', handler: userGroupProvider }],
  user_group_user: [
    { name: 'userGroupUserSubscriber', handler: userGroupUserSubscriber },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = monoLambdaEventBridgeHandler<any, any, void>(
  async (event, context, callback) => {
    let handlers: {
      name: string;
      handler: GenericEventHandler;
    }[];
    const detailType = event['detail-type'];
    if (detailType !== 'DataChanged') {
      handlers = SCHEDULED_NOTIFICATION_ROUTING[detailType as DETAIL_TYPES];
    } else {
      const dataChangeEventDetail = event.detail as { table: { name: string } };
      const tableName = dataChangeEventDetail?.table?.name as TABLE_NAMES;
      if (!tableName) {
        throw new Error('No table present on data change event');
      }
      handlers = DATA_CHANGE_NOTIFICATION_ROUTING[tableName];
    }
    if (!handlers || handlers.length === 0) {
      logger.info('No handlers found to process.');

      return;
    }

    const errors: Error[] = [];
    for (const handler of handlers) {
      await Sentry.withScope(async (scope) => {
        await Sentry.startSpan({ name: handler.name }, async () => {
          scope.setTag('handler', handler.name);
          scope.setTransactionName(handler.name);
          try {
            logger.appendKeys({
              handler: handler.name,
            });
            logger.info('Processing handler');
            await handler.handler(event, context, callback);
            logger.info('Processed handler');
          } catch (error) {
            logger.error('Error processing handler', error as Error);
            scope.captureException(error);
            errors.push(error as Error);
          } finally {
            logger.resetKeys();
          }
        });
      });
    }
    if (errors.length > 0) {
      logger.error('Had errors. Notification ending in failure', {
        errors,
      });
      throw new AggregateError(errors);
    } else {
      logger.info('Orchestration notification processing complete.');
    }
  }
);
