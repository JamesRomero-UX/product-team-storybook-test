import { Knock } from '@knocklabs/node';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { getLogger } from '../../logger';
import { isNotificationsEnabled } from '../../services/orgUtilities';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import { triggerNotification } from './utilities';
const logger = getLogger();

const workflowKey = 'third-party-password-reset';

export interface Props {
  OrgKey: string;
  Tenant: string;
  InvitationId: string;
  UserId: string;
  OrgName: string;
  ChangePasswordUrl: string;
  InvitationUrl: string;
  Message: string | null | undefined;
}

export const handler = async ({
  OrgKey,
  Tenant,
  InvitationId,
  UserId,
  ChangePasswordUrl,
  InvitationUrl,
  OrgName,
  Message,
}: Props) => {
  if (process.env.SST_STAGE === 'integration' || process.env.IS_LOCAL) {
    // Don't send notifications in integration tests or local dev for the time being
    return;
  }

  if (
    !(await isNotificationsEnabled({
      OrgKey,
      Tenant,
    }))
  ) {
    return;
  }
  logger.appendKeys({
    orgKey: OrgKey,
    tenant: Tenant,
    userId: UserId,
  });
  logger.info('Third party password reset processing');

  const idempotencyKey = `${workflowKey}-${InvitationId}`;
  logger.appendKeys({ idempotencyKey });
  logger.info('created idempotency Key');

  const idempotencyKeyExists = await checkIdempotencyKeyExists(
    idempotencyKey,
    Table.ThirdParty_IdempotencyNotificationCheck.tableName
  );

  if (idempotencyKeyExists) {
    logger.info('Idempotency check failed');

    return;
  }

  logger.info('Sending notification to knock');

  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);

  let knockUser;
  let retries = 0;

  // The user might not exist in Knock yet, so we need to wait for it to be created
  while (!knockUser && retries < 3) {
    try {
      const response = await knockClient.users.get(UserId);
      if (response) {
        knockUser = response;
        break;
      }
    } catch (e) {
      logger.error('Error getting user from Knock', { error: e });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries++;
    }
  }
  logger.info('Triggering workflow', {
    workflowKey,
  });

  await triggerNotification(
    workflowKey,
    {
      recipients: [UserId],
      data: {
        changePasswordUrl: ChangePasswordUrl,
        invitationUrl: InvitationUrl,
        orgName: OrgName,
        message: Message,
      },
      tenant: OrgKey, // Knock tenant = RiskSmart org
    },
    {
      idempotencyKey: idempotencyKey,
    }
  );

  logger.info('Notification sent. Setting idempotency key');
  await setIdempotency(
    idempotencyKey,
    Table.ThirdParty_IdempotencyNotificationCheck.tableName
  );

  logger.info('Notification processing complete.');
};

export default handler;
