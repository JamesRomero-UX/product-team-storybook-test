import { Knock } from '@knocklabs/node';
import type { UserGroup } from 'generated/graphql';
import { eventBridgeEventHandler } from 'src/eventBridgeHandler';
import { Config } from 'sst/node/config';

import { getLogger } from '../../logger';
import type { DataChangeEvent } from '../events/DataChangeEvent';
const logger = getLogger();

export const handler = eventBridgeEventHandler<
  string,
  DataChangeEvent<UserGroup, 'user_group'>,
  void
>(async (e) => {
  if (process.env.IS_LOCAL) {
    // Don't send notifications when running sst:dev
    return;
  }
  if (e.detail.table.name !== 'user_group') {
    throw new Error('Only user_group events are supported');
  }

  const knockClient = new Knock(Config.KNOCK_SECRET_KEY);

  if (e.detail.event.op === 'DELETE') {
    logger.info('Deleting group from knock');

    if (e.detail.event.data.old.Id) {
      await knockClient.objects.delete(
        'Org-user-groups',
        `${e.detail.event.data.old.OrgKey}-${e.detail.event.data.old.Id}`
      );
    }

    return;
  }

  logger.info('Update user to knock');

  if (e.detail.event.data.new.Id) {
    await knockClient.objects.set(
      'Org-user-groups',
      `${e.detail.event.data.new.OrgKey}-${e.detail.event.data.new.Id}`,
      {
        name: e.detail.event.data.new.Name,
        email: e.detail.event.data.new.Email,
        org_id: e.detail.event.data.new.OrgKey,
      }
    );
  }
});
