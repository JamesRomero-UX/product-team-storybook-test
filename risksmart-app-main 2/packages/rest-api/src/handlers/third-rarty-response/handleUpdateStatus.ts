import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import i18n from '@risksmart-app/i18n/src/i18n';
import {
  getIsActionAllowed,
  getNewStatus,
} from '@risksmart-app/shared/third-party/responses/responseUtils';
import * as Crypto from 'crypto';
import { getOptionalEnv } from 'src/environment';
import { Queue } from 'sst/node/queue';
import { z } from 'zod';

import {
  AccessTypeEnum,
  ParentTypeEnum,
  ThirdPartyResponseEnumAction,
} from '../../../generated/graphql';
import { backendRouteHandler } from '../../backendActionApiHandler';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import { initI18n } from '../../i18n';
import { getLogger } from '../../logger';
import { getRisksmartApiClient } from '../../repositories/getRisksmartApiClient';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { getSessionData } from '../../session';
import type { UpdateStatusMessageSchemaData } from '../notifications/thirdPartyUpdateQuestionnaireResponseStatusNotifier';
import { chunk } from '../utils/batch';

const UpdateStatusSchema = z.object({
  Action: z.nativeEnum(ThirdPartyResponseEnumAction),
  ResponseIds: z.string().uuid().array(),
  Reason: z.string().optional(),
  RequestType: z.string().optional(),
  ShareWithRespondents: z.boolean().default(false),
  ThirdPartyId: z.string().uuid(),
});

const sqsEndpoint = getOptionalEnv('SQS_ENDPOINT');
const sqsClient = new SQSClient({ endpoint: sqsEndpoint });

const logger = getLogger();

export const handler = backendRouteHandler(
  UpdateStatusSchema,
  async (request) => {
    const { tenant, orgKey, userId, userRole } = getSessionData(
      request.session_variables
    );

    await checkPermission(
      request,
      ParentTypeEnum.ThirdPartyResponse,
      AccessTypeEnum.Update,
      request.input.ThirdPartyId
    );

    const hasuraClient = getHasuraBackendClient(
      tenant,
      orgKey,
      userId,
      userRole
    );

    const thirdPartyResponses = await getRisksmartApiClient(
      hasuraClient
    ).getThirdPartyResponses({
      where: { Id: { _in: request.input.ResponseIds } },
    });

    const transactionFailed = thirdPartyResponses?.third_party_response?.some(
      (response) => {
        const responseStatus = response?.Status;

        if (!response || !responseStatus) {
          logger.warn('Invalid response', { response });

          return true;
        }

        return !getIsActionAllowed(request.input.Action, responseStatus);
      }
    );

    if (transactionFailed) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid status change',
        }),
      };
    }

    const responses = await getRisksmartApiClient(
      hasuraClient
    ).updateThirdPartyResponses({
      Ids: request.input.ResponseIds,
      Status: getNewStatus(request.input.Action),
    });

    if (request.input.ShareWithRespondents) {
      const responseBatches = chunk(
        responses?.update_third_party_response?.returning || []
      );

      await initI18n(orgKey, hasuraClient);
      const actionLabel =
        i18n.t(
          `third_party_responses.updateStatus.actions.${request.input.Action}`
        ) || '-';

      await Promise.all(
        responseBatches.map(async (batch) => {
          await sqsClient.send(
            new SendMessageBatchCommand({
              QueueUrl: Queue.ThirdPartyResponseUpdateStatusSqsQueue.queueUrl,
              Entries: batch.map((response) => ({
                Id: Crypto.randomUUID(),
                MessageBody: JSON.stringify({
                  Action: request.input.Action,
                  ActionLabel: actionLabel,
                  OrgKey: orgKey,
                  Tenant: tenant,
                  UserId: userId,
                  ThirdPartyId: request.input.ThirdPartyId,
                  RecipientIds:
                    response.invitees.map((invitee) => invitee?.UserId || '') ||
                    [],
                  ResponseId: response.Id,
                  Reason: request.input.Reason || undefined,
                  RequestType: request.input?.RequestType || undefined,
                  QuestionnaireTitle:
                    response.questionnaireTemplateVersion?.parent?.Title || '',
                  QuestionnaireVersion:
                    response.questionnaireTemplateVersion?.Version || '',
                } satisfies typeof UpdateStatusMessageSchemaData),
              })),
            })
          );
        })
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        affected_rows: request.input.ResponseIds.length,
      }),
    };
  }
);
