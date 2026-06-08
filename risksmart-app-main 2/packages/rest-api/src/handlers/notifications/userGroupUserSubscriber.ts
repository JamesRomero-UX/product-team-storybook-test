import { Knock } from '@knocklabs/node';
import { NotFoundException } from '@knocklabs/node/dist/src/common/exceptions';
import type { UserGroupUser } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
const logger = getLogger();

export const handler = eventBridgeEventHandler<
  string,
  DataChangeEvent<UserGroupUser, 'user_group_user'>,
  void
>(async (e) => {
  if (process.env.IS_LOCAL) {
    // Don't send notifications when running sst:dev
    return;
  }
  if (e.detail.table.name !== 'user_group_user') {
    throw new Error('Only user_group_user events are supported');
  }

  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);

  if (e.detail.event.op === 'DELETE') {
    logger.info('Deleting user subscription from group in knock');

    if (e.detail.event.data.old.UserId) {
      try {
        await knockClient.objects.deleteSubscriptions(
          'Org-user-groups',
          `${e.detail.event.data.old.OrgKey}-${e.detail.event.data.old.UserGroupId}`,
          {
            recipients: [e.detail.event.data.old.UserId],
          }
        );
      } catch (error) {
        if (error instanceof NotFoundException) {
          logger.warn(
            `Entity ${e.detail.event.data.old.OrgKey}-${e.detail.event.data.old.UserGroupId} not found`
          );
        } else {
          throw error;
        }
      }
    }

    return;
  }

  logger.info('Update user subscription to knock group');

  if (e.detail.event.data.new.UserId) {
    await knockClient.objects.addSubscriptions(
      'Org-user-groups',
      `${e.detail.event.data.new.OrgKey}-${e.detail.event.data.new.UserGroupId}`,
      {
        recipients: [e.detail.event.data.new.UserId],
      }
    );
  }
});
