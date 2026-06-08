import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import * as Crypto from 'crypto';
import { getOptionalEnv } from 'src/environment';
import { ThirdPartyResponseService } from 'src/services/third-party-response/thirdPartyResponse.service';
import { Queue } from 'sst/node/queue';

import {
  AccessTypeEnum,
  ParentTypeEnum,
  ThirdPartyResponseStatusEnum,
} from '../../../generated/graphql';
import { backendRouteHandler } from '../../backendActionApiHandler';
import { QuestionnaireInviteService } from '../../services/questionnaire-invite/questionnaire-invite.service';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { getSessionData } from '../../session';
import type { InviteSchemaData } from '../third-party/schema';
import { chunk } from '../utils/batch';
import { PostSchema } from './schema';

const sqsEndpoint = getOptionalEnv('SQS_ENDPOINT');
const sqsClient = new SQSClient({ endpoint: sqsEndpoint });

export const handler = backendRouteHandler(PostSchema, async (request) => {
  const { tenant, orgKey, userId, userRole } = getSessionData(
    request.session_variables
  );

  await checkPermission(
    request,
    ParentTypeEnum.ThirdParty,
    AccessTypeEnum.Update,
    request.input.ThirdPartyId
  );

  const invitationService = QuestionnaireInviteService({
    tenant,
    orgKey,
    userId,
    userRole,
  });

  const thirdPartyResponseService = ThirdPartyResponseService({
    tenant,
    orgKey,
    userId,
    userRole,
  });

  const responsesAndInvites = await Promise.all(
    request.input.QuestionnaireTemplateVersionIds.map(async (versionId) => {
      const response = await thirdPartyResponseService.create({
        ParentId: request.input.ThirdPartyId,
        QuestionnaireTemplateVersionId: versionId,
        Status: ThirdPartyResponseStatusEnum.NotStarted,
        ResponseData: {},
      });

      const invites = request.input.UserEmails.flatMap((email) => {
        return {
          ParentId: response.Id,
          ThirdPartyId: request.input.ThirdPartyId,
          QuestionnaireTemplateVersionId: versionId,
          UserEmail: email,
          Message: request.input.Message,
        };
      });

      const questionnaireInvites = await invitationService.insert(invites);

      return { response, questionnaireInvites };
    })
  );

  const questionnaireInvites = responsesAndInvites.flatMap(
    (item) => item.questionnaireInvites
  );

  const responseBatches = chunk(questionnaireInvites);

  await Promise.all(
    responseBatches.map(async (batch) => {
      await sqsClient.send(
        new SendMessageBatchCommand({
          QueueUrl: Queue.ThirdPartyInvitationSqsQueue.queueUrl,
          Entries: batch.map((invite) => ({
            Id: Crypto.randomUUID(),
            MessageBody: JSON.stringify({
              ...invite,
              QuestionnaireInviteId: invite.Id,
              Inviter: userId,
              OrgKey: orgKey,
              Tenant: tenant,
            } satisfies InviteSchemaData),
          })),
        })
      );
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: responsesAndInvites.length,
    }),
  };
});
