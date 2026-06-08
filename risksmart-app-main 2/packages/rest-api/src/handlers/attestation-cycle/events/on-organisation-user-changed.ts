import { resolveModuleEnabled } from '@risksmart-app/modules/src/index';
import type { AuthOrganisationuser } from 'generated/graphql';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import type { DataChangeEvent } from 'src/handlers/events/DataChangeEvent';
import { getLogger } from 'src/logger';
import { createAddUserToAudienceCommandHandler } from 'src/services/attestation-cycle/add-user-to-audience-handler';
import type { AddUserToAudienceCommand } from 'src/services/attestation-cycle/add-user-to-audience-handler/add-user-to-audience-handler';
import { createRemoveUserFromAudienceCommandHandler } from 'src/services/attestation-cycle/remove-user-from-audience-handler';
import type { RemoveUserFromAudienceCommand } from 'src/services/attestation-cycle/remove-user-from-audience-handler/remove-user-from-audience-handler';
import { userIdSchema } from 'src/services/attestation-cycle/user';
import { getOrgModuleContext } from 'src/services/orgUtilities';
import type { SessionData } from 'src/session';
import { getSessionData } from 'src/session';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<AuthOrganisationuser, 'organisationuser'>,
  void
>(async (event) => {
  const newItem = event.detail.event.data.new;
  const oldItem = event.detail.event.data.old;
  // Check for org key in session variables
  const sessionVariables = event.detail.event?.session_variables;
  if (!sessionVariables) {
    logger.info('No session variables in event, skipping');

    return;
  }

  const sessionOrgKey = sessionVariables['x-hasura-org-id'];
  if (!sessionOrgKey || sessionOrgKey.trim() === '') {
    logger.info('No org key in session variables, skipping');

    return;
  }

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
    case 'UPDATE':
      if (!newItem || !oldItem) {
        logger.info('No new or old item in event, skipping');

        return;
      }

      if (newItem.Status === oldItem.Status) {
        logger.info('No status change, skipping');

        return;
      }

      if (newItem.Status === 'archived') {
        await removeUserFromAudience(session, newItem);
      } else if (newItem.Status === 'active') {
        await addUserToAudience(session, newItem);
      }
      break;
  }
});

const addUserToAudience = async (
  session: SessionData,
  item: AuthOrganisationuser
) => {
  const handler = createAddUserToAudienceCommandHandler(session);

  const command: AddUserToAudienceCommand = {
    userId: userIdSchema.parse(item.User_Id),
    userGroupId: null,
  };

  await handler.execute(command);
};

const removeUserFromAudience = async (
  session: SessionData,
  item: AuthOrganisationuser
) => {
  const handler = createRemoveUserFromAudienceCommandHandler(session);

  const command: RemoveUserFromAudienceCommand = {
    userId: userIdSchema.parse(item.User_Id),
    userGroupId: null,
  };

  await handler.execute(command);
};
