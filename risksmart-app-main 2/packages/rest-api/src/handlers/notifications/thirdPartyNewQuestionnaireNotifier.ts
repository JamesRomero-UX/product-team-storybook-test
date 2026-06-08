import { Table } from 'sst/node/table';

import { getLogger } from '../../logger';
import { isNotificationsEnabled } from '../../services/orgUtilities';
import { checkIdempotencyKeyExists, setIdempotency } from './checkIdempotency';
import { triggerNotification } from './utilities';
const logger = getLogger();

const workflowKey = 'third-party-new-questionnaire';

export interface Props {
  OrgKey: string;
  Tenant: string;
  InvitationId: string;
  OrgName: string;
  LoginUrl: string;
  UserId: string;
  Message: string | null | undefined;
}

export const handler = async ({
  OrgKey,
  Tenant,
  InvitationId,
  OrgName,
  LoginUrl,
  UserId,
  Message,
}: Props) => {
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
  logger.info('Third party new questionnaire processing');
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
  logger.info('Idempotency check passed. Processing notification', {
    workflowKey,
  });

  await triggerNotification(
    workflowKey,
    {
      recipients: [UserId],
      data: {
        loginUrl: LoginUrl,
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
