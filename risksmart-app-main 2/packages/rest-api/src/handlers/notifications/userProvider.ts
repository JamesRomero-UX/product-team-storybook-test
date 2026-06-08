import { Knock } from '@knocklabs/node';
import type { User } from 'generated/graphql';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<User, 'user'>,
  void
>(async (e) => {
  if (process.env.IS_LOCAL) {
    // Don't send notifications when running sst:dev
    return;
  }
  if (e.detail.table.name !== 'user') {
    throw new Error('Only user events are supported');
  }

  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);

  if (e.detail.event.op === 'DELETE') {
    logger.info('Deleting user from knock');

    if (e.detail.event.data.old.Id) {
      await knockClient.users.delete(e.detail.event.data.old.Id);
    }

    return;
  }

  logger.info('Update user to knock');

  if (e.detail.event.data.new.Id) {
    await knockClient.users.identify(e.detail.event.data.new.Id, {
      name: e.detail.event.data.new.UserName ?? '',
      email: e.detail.event.data.new.Email ?? '',
      org_role: e.detail.event.data.new.RoleKey,
    });
  }
});
