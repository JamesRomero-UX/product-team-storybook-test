import { Knock } from '@knocklabs/node';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
import { isNotificationsEnabled } from '../../services/orgUtilities';
import { triggerNotification } from './utilities';
const logger = getLogger();

const workflowKey = 'third-party-set-password';

export interface Props {
  OrgKey: string;
  Tenant: string;
  UserId: string;
  OrgName: string;
  ChangePasswordUrl: string;
  LoginUrl: string;
}

export const handler = async ({
  OrgKey,
  Tenant,
  UserId,
  ChangePasswordUrl,
  LoginUrl,
  OrgName,
}: Props) => {
  if (process.env.SST_STAGE === 'integration' || process.env.IS_LOCAL) {
    // Don't send notifications in integration tests or local dev for the time being
    return;
  }

  const isNotificationsEnabledResult = await isNotificationsEnabled({
    OrgKey,
    Tenant,
  });

  if (!isNotificationsEnabledResult) {
    return;
  }
  logger.appendKeys({
    orgKey: OrgKey,
    tenant: Tenant,
    userId: UserId,
  });
  logger.info('Third party set password processing');

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

  await triggerNotification(workflowKey, {
    recipients: [UserId],
    data: {
      changePasswordUrl: ChangePasswordUrl,
      loginUrl: LoginUrl,
      orgName: OrgName,
    },
    tenant: OrgKey, // Knock tenant = RiskSmart org
  });

  logger.info('Notification sent');
};

export default handler;
