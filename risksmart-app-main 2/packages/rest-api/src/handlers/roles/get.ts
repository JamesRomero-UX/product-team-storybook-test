import { resolveModuleEnabled } from '@risksmart-app/modules/src/index';
import type { GetOrganizationMemberRoles200ResponseOneOfInner } from 'auth0';
import { NotFound } from 'http-errors';
import { initSentry } from 'src/sentryInit';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { getOrgModuleContext } from 'src/services/orgUtilities';
import { getUserById } from 'src/services/user/userService';
import { z } from 'zod';

import { backendRouteHandler } from '../../backendActionApiHandler';
import { getHasuraBackendClient } from '../../backendGraphqlClient';
import { getLogger } from '../../logger';
import { getAllRoles } from '../../services/role/roleService';
import { getSessionData } from '../../session';

const logger = getLogger();

initSentry();

const auth0Roles: GetOrganizationMemberRoles200ResponseOneOfInner[] = [];

export const handler = backendRouteHandler(z.any(), async (event) => {
  logger.debug('event', { event });
  const sessionData = getSessionData(event.session_variables);
  const orgOptions = { orgKey: sessionData.orgKey, tenant: sessionData.tenant };
  const { features, modules } = await getOrgModuleContext(orgOptions);
  const modulesSystemActive = features.includes('modules');

  // Check if trpc feature flag is enabled
  if (features.includes('trpc')) {
    logger.info('Using new role system (trpc enabled)');

    // Use the new role system
    const hasuraClient = getHasuraBackendClient(
      sessionData.tenant,
      sessionData.orgKey,
      sessionData.userId,
      'admin'
    );

    // Get user from Hasura
    const user = await getUserById(hasuraClient, sessionData.userId);
    if (!user) {
      throw new NotFound('User not found');
    }

    const permitRoles = await getAllRoles(hasuraClient);

    const filteredRoles = ['ThirdPartyRespondent'];

    if (!user.IsCustomerSupport) {
      filteredRoles.push('CustomerSuccess');
    }

    const filteredPermitRoles = permitRoles.filter(
      (role) => !filteredRoles.includes(role.RoleKey)
    );

    const roles = filteredPermitRoles.map((role) => ({
      id: role.RoleKey,
      name: role.Name,
      description: role.Description,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(roles),
    };
  }

  // Use the existing Auth0 role system
  logger.info('Using existing role system (trpc disabled)');
  const allowedRoles = [
    'RiskManager',
    'Public',
    'Standard',
    'ReadOnly',
    'StandardEnhanced',
  ];
  if (
    resolveModuleEnabled({
      modules,
      moduleKey: 'internal_audit_entity',
      modulesSystemActive,
      features,
    })
  ) {
    allowedRoles.push('InternalAudit');
  }
  if (features.includes('authentication')) {
    allowedRoles.push('TechnicalSupport');
  }
  logger.info('allowedRoles', { allowedRoles });
  if (auth0Roles.length === 0) {
    const auth0Client = getAuth0ManagementClient();
    logger.info('Fetching roles from Auth0');
    const response = await auth0Client.roles.getAll();
    auth0Roles.push(...response.data);
  }

  const roles = auth0Roles.filter((role) => allowedRoles.includes(role.name));

  return {
    statusCode: 200,
    body: JSON.stringify(roles),
  };
});
