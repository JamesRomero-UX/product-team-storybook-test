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

export type IssueDueEventDetail = EventDetail<
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
  const minDateDue = dayjs(e.time).startOf('hour');
  logger.info('Polling for issues due', {
    minDateDue: minDateDue.toISOString(),
  });
  const { data, errors } = await hasuraClient.query({
    query: GetIssueAssessmentsByTargetCloseDateDocument,
    variables: {
      minTargetCloseDate: minDateDue.toISOString(),
      maxTargetCloseDate: minDateDue.add(14, 'day').toISOString(),
    },
  });
  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to retrieve issue assessments');
  }

  logger.info('Issues due', {
    issueAssessmentCount: data.issue_assessment.length,
  });

  const unsentEntries: PutEventsRequestEntry[] = data.issue_assessment.map(
    (ia) => {
      const detail: IssueDueEventDetail = {
        meta: { tenant },
        data: ia,
      };

      return {
        Detail: JSON.stringify(detail),
        DetailType: RisksmartDetailType.IssueDue,
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
