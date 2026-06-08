import { wrapHandler } from '@sentry/aws-serverless';
import type { SQSHandler } from 'aws-lambda';
import _ from 'lodash';
import { getEnv } from 'src/environment';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from 'src/repositories/types';
import { auth0Service } from 'src/services/auth0';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import type { InviteToOrgRequest } from 'src/services/auth0/inviteThirdPartyUserToOrg';
import { getOrgDetails } from 'src/services/orgUtilities';
import { QuestionnaireInviteService } from 'src/services/questionnaire-invite/questionnaire-invite.service';

import { getLogger } from '../../logger';
import { handler as sendNewQuestionnaireNotification } from '../notifications/thirdPartyNewQuestionnaireNotifier';
import { handler as sendPasswordResetNotification } from '../notifications/thirdPartyPasswordResetNotifier';
import { InviteSchema } from './schema';
const logger = getLogger();

export const handler: SQSHandler = wrapHandler(async (event) => {
  const recordData = event.Records.map((record) =>
    InviteSchema.parse(JSON.parse(record.body))
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

  logger.info(`Processing invites for ${recordData.length} records`, {
    orgNames,
    recordCount: recordData.length,
  });

  await Promise.all(
    recordData.map(async (invitationData) => {
      const connectionName = getEnv('AUTH0_THIRD_PARTY_CONNECTION_NAME');
      const clientId = getEnv('AUTH0_THIRD_PARTY_CLIENT_ID');
      //if connection is not set, then we can't invite third parties
      if (!connectionName) {
        throw new Error(
          'Cannot invite third party without a connection name, check env AUTH0_THIRD_PARTY_CONNECTION_NAME'
        );
      }

      const auth0Client = getAuth0ManagementClient();
      const inviteRequest: InviteToOrgRequest = {
        orgId: invitationData.OrgKey,
        tenant: invitationData.Tenant,
        questionnaireInviteId: invitationData.QuestionnaireInviteId,
        connection: connectionName,
        clientId: clientId,
        send_email: true,
        inviter: {
          name: orgNames[invitationData.OrgKey] ?? '-',
        },
        invitee: {
          email: invitationData.UserEmail,
        },
      };

      logger.info('Creating invitation and user', { invitationData });

      const { changePasswordUrl, invitationUrl, userId, newUser, newMember } =
        await auth0Service.inviteThirdPartyUserToOrg(
          auth0Client,
          inviteRequest
        );

      const questionnaireInviteService = QuestionnaireInviteService({
        tenant: invitationData.Tenant,
        orgKey: invitationData.OrgKey,
        userId: SYSTEM_USER,
        userRole: CUSTOMER_SUPPORT_ROLE,
      });

      logger.info('Updating questionnaire invite with user id');

      try {
        const updateResult = await questionnaireInviteService.setUser(
          userId,
          invitationData.QuestionnaireInviteId
        );

        if (updateResult.UserId !== userId) {
          throw new Error(
            'Error updating questionnaire invite with user id, UserId mismatch'
          );
        }
      } catch (e) {
        logger.error('Error updating questionnaire invite with user id', { e });
        throw e;
      }

      if (newUser) {
        if (changePasswordUrl) {
          logger.info('New user - sending password reset notification');

          await sendPasswordResetNotification({
            OrgKey: invitationData.OrgKey,
            Tenant: invitationData.Tenant,
            InvitationId: invitationData.QuestionnaireInviteId,
            UserId: userId,
            Message: invitationData.Message,
            ChangePasswordUrl: changePasswordUrl,
            InvitationUrl: invitationUrl,
            OrgName: orgNames[invitationData.OrgKey] ?? '-',
          });
        }
      } else {
        logger.info('User exists - sending new questionnaire notification');

        await sendNewQuestionnaireNotification({
          OrgKey: invitationData.OrgKey,
          Tenant: invitationData.Tenant,
          InvitationId: invitationData.QuestionnaireInviteId,
          LoginUrl: newMember ? invitationUrl : '', // knock will use app url if left empty
          UserId: userId,
          Message: invitationData.Message,
          OrgName: orgNames[invitationData.OrgKey] ?? '-',
        });
      }
    })
  );
});
