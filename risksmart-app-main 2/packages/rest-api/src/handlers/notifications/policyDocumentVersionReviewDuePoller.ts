import type { PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';
import dayjs from 'dayjs';
import type { GetDocumentFilesByReviewDateQuery } from 'generated/graphql';
import { GetDocumentFilesByReviewDateDocument } from 'generated/graphql';
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

type Record = GetDocumentFilesByReviewDateQuery['document_file'][number];

export type PolicyDocumentVersionReviewDueEventDetail = EventDetail<
  Meta,
  Record
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
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  // events are only accurate to nearest minute
  const minNextReviewDate = dayjs(e.time).startOf('hour');
  const maxNextReviewDate = minNextReviewDate.add(1, 'hour');
  logger.info('Requesting due review between ', {
    minNextReviewDate: minNextReviewDate.toISOString(),
    maxNextReviewDate: maxNextReviewDate.toISOString(),
  });
  const { data, errors } = await hasuraClient.query({
    query: GetDocumentFilesByReviewDateDocument,
    variables: {
      minNextReviewDate: minNextReviewDate.toISOString(),
      maxNextReviewDate: maxNextReviewDate.toISOString(),
    },
  });
  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to retrieve document files');
  }

  logger.info('Policy versions due', {
    policyVersionsDue: data.document_file.length,
  });
  const unsentEntries: PutEventsRequestEntry[] = data.document_file.map(
    (ia) => {
      const detail: PolicyDocumentVersionReviewDueEventDetail = {
        meta: { tenant },
        data: ia,
      };

      return {
        Detail: JSON.stringify(detail),
        DetailType: RisksmartDetailType.PolicyDocumentVersionReviewDue,
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
