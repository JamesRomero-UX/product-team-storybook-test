import { resolveModuleEnabled } from '@risksmart-app/modules/src/index';
import type { UserGroupUser } from 'generated/graphql';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';
import { getLogger } from 'src/logger';
import { createAddUserToAudienceCommandHandler } from 'src/services/attestation-cycle/add-user-to-audience-handler';
import type { AddUserToAudienceCommand } from 'src/services/attestation-cycle/add-user-to-audience-handler/add-user-to-audience-handler';
import { createRemoveUserFromAudienceCommandHandler } from 'src/services/attestation-cycle/remove-user-from-audience-handler';
import type { RemoveUserFromAudienceCommand } from 'src/services/attestation-cycle/remove-user-from-audience-handler/remove-user-from-audience-handler';
import { userIdSchema } from 'src/services/attestation-cycle/user';
import { userGroupIdSchema } from 'src/services/attestation-cycle/user-group';
import { getOrgModuleContext } from 'src/services/orgUtilities';
import type { SessionData } from 'src/session';
import { getSessionData } from 'src/session';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<UserGroupUser, 'user_group_user'>,
  void
>(async (event) => {
  const newItem = event.detail.event.data.new;
  const oldItem = event.detail.event.data.old;

  const session = getSessionData(event.detail.event?.session_variables);
  logger.appendKeys({
    ...session,
  });

  const orgOptions = { orgKey: session.orgKey, tenant: session.tenant };
  const { features, modules } = await getOrgModuleContext(orgOptions);
  const modulesSystemActive = features.includes('modules');

  const attestationsEnabled = resolveModuleEnabled({
    modules,
    moduleKey: 'document.subModules.attestation',
    modulesSystemActive,
    features,
  });

  if (!attestationsEnabled || !features.includes('attestation_improvements')) {
    logger.info('Attestation cycles are not enabled.');

    return;
  }

  switch (event.detail.event.op) {
    case 'INSERT':
      if (!newItem) {
        logger.info('No new item in event, skipping');

        return;
      }

      await addUserToAudience(session, newItem);
      break;
    case 'DELETE':
      if (!oldItem) {
        logger.info('No old item in event, skipping');

        return;
      }

      await removeUserFromAudience(session, oldItem);
      break;
    default:
      logger.info(
        `No command handler for ${event.detail.event.op} operation, skipping.`
      );
  }
});

const addUserToAudience = async (session: SessionData, item: UserGroupUser) => {
  const handler = createAddUserToAudienceCommandHandler(session);

  const command: AddUserToAudienceCommand = {
    userId: userIdSchema.parse(item.UserId),
    userGroupId: userGroupIdSchema.parse(item.UserGroupId),
  };

  await handler.execute(command);
};

const removeUserFromAudience = async (
  session: SessionData,
  item: UserGroupUser
) => {
  const handler = createRemoveUserFromAudienceCommandHandler(session);

  const command: RemoveUserFromAudienceCommand = {
    userId: userIdSchema.parse(item.UserId),
    userGroupId: userGroupIdSchema.parse(item.UserGroupId),
  };

  await handler.execute(command);
};
