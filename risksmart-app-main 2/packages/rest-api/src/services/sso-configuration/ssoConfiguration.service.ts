import type { ManagementClient } from 'auth0';
import { getEnv, getOptionalEnv } from 'src/environment';
import { getLogger } from 'src/logger';
import { ssoConfigurationRepository } from 'src/repositories/sso-configuration/ssoConfiguration.repository';
import type { SessionData } from 'src/session';

import {
  createOrganizationConnection,
  deleteOrganizationConnection,
  getOrganizationConnection,
} from '../auth0/organizationConnection';
import {
  createSsoConnection,
  deleteSsoConnection,
  enableClientForConnection,
  getSsoConnectionById,
  updateSsoConnection,
} from '../auth0/ssoConnection';

const logger = getLogger();

// ============ Types ============

export type SsoSaveAction =
  | 'created'
  | 'updated_org_connection'
  | 'updated_login_experience'
  | 'no_change';

interface SsoSaveInput {
  strategy: string;
  domain: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
  addOrgConnection: boolean;
  connectionId?: string;
  domainAliases?: string[];
}

interface SsoSaveResult {
  Id: string;
  Name: string;
  Strategy: string;
  Enabled: boolean;
  IsOrgConnected: boolean;
  Action: SsoSaveAction;
  Options: {
    Domain?: string;
    DomainAliases?: string[];
  };
}

interface ExistingConfig {
  ConnectionId: string;
  Name: string;
  Strategy: string;
  ClientId: string;
  Domain?: string | null;
  DomainAliases?: string[] | null;
  IsOrganizationConnected?: boolean | null;
}

type ConnectedConfig = Omit<ExistingConfig, 'IsOrganizationConnected'> & {
  IsOrganizationConnected: boolean;
};

// ============ Shared Helpers ============

const createLogContext = (orgKey: string, connectionId?: string) => ({
  orgKey,
  ...(connectionId && { connectionId }),
});

const buildOrgConnectionBody = (connectionId: string) => ({
  connection_id: connectionId,
  assign_membership_on_login: true,
  show_as_button: false,
});

const buildSsoSaveResult = (opts: {
  id: string;
  name: string;
  strategy: string;
  isOrgConnected: boolean;
  action: SsoSaveAction;
  options?: { domain?: string; domainAliases?: string[] };
}): SsoSaveResult => ({
  Id: opts.id,
  Name: opts.name,
  Strategy: opts.strategy,
  Enabled: true,
  IsOrgConnected: opts.isOrgConnected,
  Action: opts.action,
  Options: {
    Domain: opts.options?.domain,
    DomainAliases: opts.options?.domainAliases,
  },
});

const hasConnectionChanges = (
  existingConfig: ExistingConfig,
  input: SsoSaveInput
): boolean =>
  existingConfig.Strategy !== input.strategy ||
  existingConfig.ClientId !== input.clientId;

const hasLoginExperienceChanges = (
  existingConfig: ExistingConfig,
  input: SsoSaveInput
): boolean => {
  const existingAliases = [...(existingConfig.DomainAliases ?? [])].sort();
  const inputAliases = [...(input.domainAliases ?? [])].sort();

  return JSON.stringify(existingAliases) !== JSON.stringify(inputAliases);
};

// ============ Delete Configuration ============

export const deleteSsoConfiguration = async (opts: {
  auth0Client: ManagementClient;
  sessionData: SessionData;
  orgKey: string;
  clientId: string;
}): Promise<{ deletedCount: number }> => {
  const { auth0Client, sessionData, orgKey, clientId } = opts;
  const repo = ssoConfigurationRepository(sessionData);

  const allConfigs = await repo.findAll();
  const configs = allConfigs.filter((config) => config.ClientId === clientId);

  logger.info('Found SSO configurations matching clientId', {
    orgKey,
    clientId,
    total: allConfigs.length,
    matched: configs.length,
  });

  let deletedCount = 0;

  for (const config of configs) {
    const connectionId = config.ConnectionId;
    const logContext = createLogContext(orgKey, connectionId);

    try {
      if (config.IsOrganizationConnected) {
        logger.info('Removing organization connection', logContext);
        await deleteOrganizationConnection(auth0Client, {
          id: orgKey,
          connectionId,
        });
      }

      logger.info('Deleting SSO connection from Auth0', logContext);
      await deleteSsoConnection(auth0Client, connectionId);

      logger.info('Deleting SSO configuration from DB', logContext);
      await repo.deleteByConnectionId(connectionId);

      deletedCount++;
    } catch (error) {
      logger.error('Error deleting SSO configuration', {
        ...logContext,
        error,
      });
      throw error;
    }
  }

  logger.info('SSO configuration cleanup complete', { orgKey, deletedCount });

  return { deletedCount };
};

// ============ Save Configuration (private helpers) ============

const cleanupCreatedConnection = async (
  auth0Client: ManagementClient,
  connectionId: string,
  orgKey: string
) => {
  const logContext = createLogContext(orgKey, connectionId);
  try {
    logger.info(
      'Cleaning up newly created Auth0 connection due to error',
      logContext
    );
    await deleteSsoConnection(auth0Client, connectionId);
    logger.info('Successfully cleaned up Auth0 connection', logContext);
  } catch (cleanupError) {
    logger.error('Failed to clean up newly created Auth0 connection', {
      ...logContext,
      error: cleanupError,
    });
  }
};

const updateOldConnection = async (
  auth0Client: ManagementClient,
  orgKey: string,
  oldConnectionId: string,
  newConnectionId: string
) => {
  logger.info('ConnectionId changed, cleaning up old Auth0 connection', {
    oldConnectionId,
    newConnectionId,
    orgKey,
  });

  const oldOrgConnection = await getOrganizationConnection(auth0Client, {
    id: orgKey,
    connectionId: oldConnectionId,
  });

  if (oldOrgConnection) {
    await deleteOrganizationConnection(auth0Client, {
      id: orgKey,
      connectionId: oldConnectionId,
    });
  }

  const oldSsoConnection = await getSsoConnectionById(
    auth0Client,
    oldConnectionId
  );

  if (oldSsoConnection) {
    await deleteSsoConnection(auth0Client, oldConnectionId);
    logger.info('Old Auth0 connection cleaned up successfully', {
      oldConnectionId,
      orgKey,
    });
  } else {
    logger.info('Old Auth0 connection already deleted', {
      oldConnectionId,
      orgKey,
    });
  }
};

const createNewConnection = async (opts: {
  input: SsoSaveInput;
  auth0Client: ManagementClient;
  sessionData: SessionData;
  orgKey: string;
  orgName: string;
  oldConfigs?: ExistingConfig[];
}): Promise<SsoSaveResult> => {
  const { input, auth0Client, sessionData, orgKey, orgName } = opts;
  const repo = ssoConfigurationRepository(sessionData);

  const shortId = crypto.randomUUID().split('-')[0];
  const connectionName = `${orgName.replaceAll(' ', '')}-${input.strategy}-${shortId}`;

  let ssoConnection;
  let orgConnectionResponse;

  try {
    logger.info('Creating connection with options', {
      name: connectionName,
      strategy: input.strategy,
      domain: input.domain,
      hasClientId: !!input.clientId,
    });

    ssoConnection = await createSsoConnection(auth0Client, {
      name: connectionName,
      strategy: input.strategy,
      options: {
        domain: input.domain,
        clientId: input.clientId,
        clientSecret: input.clientSecret,
        scope: 'openid',
        domainAliases: input.domainAliases,
      },
    });

    const clientIdsToEnable = [
      getEnv('AUTH0_RISK_SMART_REST_API_CLIENT_ID'),
      getEnv('REACT_APP_AUTH0_CLIENT_ID'),
      getOptionalEnv('AUTH0_RISK_SMART_CIRCLE_CLIENT_ID'),
    ].filter((id): id is string => !!id);

    await enableClientForConnection(
      auth0Client,
      ssoConnection.id,
      clientIdsToEnable
    );

    if (input.addOrgConnection) {
      orgConnectionResponse = await createOrganizationConnection(
        auth0Client,
        { id: orgKey },
        buildOrgConnectionBody(ssoConnection.id)
      );
    }

    for (const oldConfig of opts.oldConfigs ?? []) {
      if (oldConfig.ConnectionId !== ssoConnection.id) {
        await updateOldConnection(
          auth0Client,
          orgKey,
          oldConfig.ConnectionId,
          ssoConnection.id
        );
        await repo.deleteByConnectionId(oldConfig.ConnectionId);
      }
    }

    await repo.create({
      Name: ssoConnection.name,
      Strategy: ssoConnection.strategy,
      ClientId: input.clientId,
      ConnectionId: ssoConnection.id,
      Domain: input.domain,
      DomainAliases: input.domainAliases ?? [],
      IsActive: true,
      IsRestApiEnabled: true,
      IsOrganizationConnected: !!orgConnectionResponse,
    });

    return buildSsoSaveResult({
      id: ssoConnection.id,
      name: ssoConnection.name,
      strategy: ssoConnection.strategy,
      isOrgConnected: !!orgConnectionResponse,
      action: 'created',
      options: ssoConnection.options,
    });
  } catch (error) {
    logger.error('Error creating SSO configuration', { error, orgKey });

    if (ssoConnection?.id) {
      await cleanupCreatedConnection(auth0Client, ssoConnection.id, orgKey);
    }

    throw error;
  }
};

const updateOrgConnectionStatus = async (opts: {
  input: SsoSaveInput;
  auth0Client: ManagementClient;
  sessionData: SessionData;
  orgKey: string;
  existingConfig: ConnectedConfig;
}): Promise<SsoSaveResult> => {
  const { input, auth0Client, sessionData, orgKey, existingConfig } = opts;
  const repo = ssoConfigurationRepository(sessionData);

  if (input.addOrgConnection && !existingConfig.IsOrganizationConnected) {
    await createOrganizationConnection(
      auth0Client,
      { id: orgKey },
      buildOrgConnectionBody(existingConfig.ConnectionId)
    );
    await repo.updateByConnectionId(existingConfig.ConnectionId, {
      IsOrganizationConnected: true,
    });
  } else if (
    !input.addOrgConnection &&
    existingConfig.IsOrganizationConnected
  ) {
    await deleteOrganizationConnection(auth0Client, {
      id: orgKey,
      connectionId: existingConfig.ConnectionId,
    });
    await repo.updateByConnectionId(existingConfig.ConnectionId, {
      IsOrganizationConnected: false,
    });
  }

  return buildSsoSaveResult({
    id: existingConfig.ConnectionId,
    name: existingConfig.Name,
    strategy: existingConfig.Strategy,
    isOrgConnected: input.addOrgConnection,
    action: 'updated_org_connection',
  });
};

// ============ Save Configuration (main export) ============

export const saveSsoConfiguration = async (opts: {
  input: SsoSaveInput;
  auth0Client: ManagementClient;
  sessionData: SessionData;
  orgKey: string;
  orgName: string;
}): Promise<SsoSaveResult> => {
  const { input, auth0Client, sessionData, orgKey, orgName } = opts;
  const repo = ssoConfigurationRepository(sessionData);

  // Look up existing config from DB
  const existingConfigs = await repo.findAll();
  logger.info('existing SSO configurations for org', {
    orgKey,
    count: existingConfigs.length,
  });
  const existingConfig = existingConfigs.find(
    (c) =>
      c.ConnectionId === input.connectionId || c.ClientId === input.clientId
  );

  // If not found in DB or clientId changed, create new connection
  if (!existingConfig) {
    return createNewConnection({
      input,
      auth0Client,
      sessionData,
      orgKey,
      orgName,
      oldConfigs: existingConfigs,
    });
  }

  const isOrgConnected = !!existingConfig.IsOrganizationConnected;

  // Only org connection status changed
  if (isOrgConnected !== input.addOrgConnection) {
    return updateOrgConnectionStatus({
      input,
      auth0Client,
      sessionData,
      orgKey,
      existingConfig: {
        ...existingConfig,
        IsOrganizationConnected: isOrgConnected,
      },
    });
  }

  // Check if connection-defining fields have changed
  if (hasConnectionChanges(existingConfig, input)) {
    return createNewConnection({
      input,
      auth0Client,
      sessionData,
      orgKey,
      orgName,
      oldConfigs: existingConfigs,
    });
  }

  // Check if login experience domains changed
  if (hasLoginExperienceChanges(existingConfig, input)) {
    const newAliases = input.domainAliases ?? [];
    await updateSsoConnection(auth0Client, existingConfig.ConnectionId, {
      options: { domainAliases: newAliases },
    });
    await repo.updateByConnectionId(existingConfig.ConnectionId, {
      DomainAliases: newAliases,
    });

    return buildSsoSaveResult({
      id: existingConfig.ConnectionId,
      name: existingConfig.Name,
      strategy: existingConfig.Strategy,
      isOrgConnected,
      action: 'updated_login_experience',
      options: {
        domain: input.domain,
        domainAliases: newAliases,
      },
    });
  }

  // No changes detected
  return buildSsoSaveResult({
    id: existingConfig.ConnectionId,
    name: existingConfig.Name,
    strategy: existingConfig.Strategy,
    isOrgConnected,
    action: 'no_change',
  });
};
