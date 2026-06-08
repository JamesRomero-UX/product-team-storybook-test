import { wrapHandler } from '@sentry/aws-serverless';
import type { SQSHandler } from 'aws-lambda';
import { ThirdPartyResponseEnumAction } from 'generated/graphql';
import _ from 'lodash';
import { Table } from 'sst/node/table';
import { z } from 'zod';

import { getLogger } from '../../logger';
import { getOrgDetails } from '../../services/orgUtilities';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import { triggerNotification } from './utilities';

const logger = getLogger();

const workflowKey = 'third-party-response-update-status';

export const UpdateStatusMessageSchema = z.object({
  Action: z.nativeEnum(ThirdPartyResponseEnumAction),
  ActionLabel: z.string(),
  OrgKey: z.string(),
  Tenant: z.string(),
  UserId: z.string(),
  ThirdPartyId: z.string().uuid(),
  ResponseId: z.string().uuid(),
  RecipientIds: z.string().array(),
  Reason: z.string().optional(),
  RequestType: z.string().optional(),
  QuestionnaireTitle: z.string(),
  QuestionnaireVersion: z.string(),
});

export const UpdateStatusMessageSchemaData = UpdateStatusMessageSchema._type;

export const handler: SQSHandler = wrapHandler(async (event) => {
  const recordData = event.Records.map((record) =>
    UpdateStatusMessageSchema.parse(JSON.parse(record.body))
  );

  const orgNames = (
    await Promise.all(
      _.uniqBy(recordData, (data) => [data.OrgKey, data.Tenant]).map(
        async ({ OrgKey, Tenant }) =>
          getOrgDetails({ orgKey: OrgKey, tenant: Tenant })
      )
    )
  ).reduce<Record<string, string>>((acc, org) => {
    acc[org.OrgKey] = org.OrgName;

    return acc;
  }, {});

  if (process.env.SST_STAGE === 'integration' || process.env.IS_LOCAL) {
    // Don't send notifications in integration tests or local dev for the time being
    return;
  }

  logger.info('Concurrently processing requests for status updates');

  await Promise.all(
    recordData.map(async (data) => {
      logger.info('Action', { Action: data.Action });

      const idempotencyRequired =
        data.Action !== ThirdPartyResponseEnumAction.RequestMoreInformation;

      const idempotencyKey = `${workflowKey}-${data.ResponseId}`;
      const childLogger = logger.createChild({
        persistentKeys: {
          idempotencyKey,
          orgKey: data.OrgKey,
          questionnaireVersion: data.QuestionnaireVersion,
          userId: data.UserId,
        },
      });

      childLogger.info('Processing status update for questionnaire response');

      if (idempotencyRequired) {
        const idempotencyKeyExists = await checkIdempotencyKeyExists(
          idempotencyKey,
          Table.ThirdParty_IdempotencyNotificationCheck.tableName
        );

        if (idempotencyKeyExists) {
          childLogger.info('Idempotency check failed');

          return;
        }
      }

      childLogger.info('Triggering workflow', {
        workflowKey,
      });

      await triggerNotification(workflowKey, {
        recipients: data.RecipientIds,
        data: {
          action: data.ActionLabel,
          orgName: orgNames[data.OrgKey],
          moreInformationReason: data.Reason,
          requestType: data.RequestType,
          questionnaireTitle: data.QuestionnaireTitle,
          questionnaireVersion: data.QuestionnaireVersion,
          responseId: data.ResponseId,
        },
        tenant: data.OrgKey, // Knock tenant = RiskSmart org
      });

      if (idempotencyRequired) {
        childLogger.info('Notification sent. Setting idempotency key');
        await setIdempotency(
          idempotencyKey,
          Table.ThirdParty_IdempotencyNotificationCheck.tableName
        );
      }

      childLogger.info('Notification processing complete.');
    })
  );

  logger.info('Lambda processing complete.');
});

export default handler;
