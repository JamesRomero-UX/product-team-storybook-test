import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import dayjs from 'dayjs';
import type { GetIssueAssessmentsByTargetCloseDateQuery } from 'generated/graphql';
import { GetIssueAssessmentsByTargetCloseDateDocument } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';
import { EventBus } from 'sst/node/event-bus';

import { getLogger } from '../../logger';
import type { EventDetail, Meta } from './eventBridgeUtils';
import {
  RisksmartDetailType,
  sendToEventBridgeInBatches,
} from './eventBridgeUtils';
const logger = getLogger();

export type IssueOverdueEventDetail = EventDetail<
  Meta,
  GetIssueAssessmentsByTargetCloseDateQuery['issue_assessment'][0]
>;

export const handler = eventBridgeEventHandler<
  string,
  { tenant: string },
  void
>(async (e) => {
  const tenant = e.detail.tenant;
  logger.appendKeys({
    tenant,
  });

  const hasuraClient = await getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  // events are only accurate to nearest minute
  const startOfHour = dayjs(e.time).startOf('hour');
  const minTargetCloseDate = startOfHour.subtract(1, 'day');
  logger.info('Polling for issues over due', {
    minTargetCloseDate: minTargetCloseDate.toISOString(),
  });

  const { data, errors } = await hasuraClient.query({
    query: GetIssueAssessmentsByTargetCloseDateDocument,
    variables: {
      minTargetCloseDate: minTargetCloseDate.toISOString(),
      maxTargetCloseDate: minTargetCloseDate.add(1, 'hour').toISOString(),
    },
  });
  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to retrieve issue assessments');
  }

  logger.info('Issues overdue', {
    issueAssessmentLength: data.issue_assessment.length,
  });

  const unsentEntries: PutEventsRequestEntry[] = data.issue_assessment.map(
    (ia) => {
      const detail: IssueOverdueEventDetail = {
        meta: { tenant },
        data: ia,
      };

      return {
        Detail: JSON.stringify(detail),
        DetailType: RisksmartDetailType.IssueOverdue,
        Source: 'risksmart.notifications',
        EventBusName: EventBus.SharedEventBus.eventBusName,
      };
    }
  );

  logger.info('sending to event bridge', {
    unsentEntriesCount: unsentEntries.length,
  });

  await sendToEventBridgeInBatches(unsentEntries);
  logger.info('Completed processing');
});
