import { ManagementApiError, type ManagementClient } from 'auth0';

import { logger } from '../../utils/logger';

export type SsoStrategy = string;

export interface CreateSsoConnectionOptions {
  name: string;
  strategy: SsoStrategy;
  options: {
    tenant_domain?: string;
    domain?: string;
    clientId: string;
    clientSecret: string;
    domainAliases?: string[];
    scope?: string;
  };
}

type ConnectionOptionsInput = CreateSsoConnectionOptions['options'];

export interface SsoConnectionResponse {
  id: string;
  name: string;
  strategy: string;
  isEnabled: boolean;
  options: {
    domain?: string;
    domainAliases?: string[];
  };
}

interface Auth0Connection {
  id: string;
  name: string;
  strategy: string;
  display_name?: string;
  enabled_clients?: string[];
  options?: {
    domain?: string;
    domain_aliases?: string[];
  };
}

const baseConnectionOptions = (
  opts: ConnectionOptionsInput
): Record<string, unknown> => ({
  client_id: opts.clientId,
  client_secret: opts.clientSecret,
  scope: opts.scope ?? 'openid',
  ...(opts.domainAliases &&
    opts.domainAliases.length > 0 && {
      domain_aliases: opts.domainAliases,
    }),
});

const strategyDomainFields: Record<
  string,
  (domain: string) => Record<string, string>
> = {
  okta: (domain) => ({ domain }),
  waad: (domain) => ({ tenant_domain: domain }),
  ad: (domain) => ({ domain }),
  'google-apps': (domain) => ({ tenant_domain: domain, domain }),
};

const buildConnectionOptions = (
  strategy: string,
  opts: ConnectionOptionsInput
): Record<string, unknown> => {
  const domainFields = strategyDomainFields[strategy];
  if (!domainFields) {
    throw new Error(`Unsupported SSO strategy: ${strategy}`);
  }

  return {
    ...(opts.domain ? domainFields(opts.domain) : {}),
    ...baseConnectionOptions(opts),
  };
};

const mapToSsoConnectionResponse = (
  connection: Auth0Connection
): SsoConnectionResponse => ({
  id: connection.id,
  name: connection.name,
  strategy: connection.strategy,
  isEnabled: (connection.enabled_clients?.length ?? 0) > 0,
  options: {
    domain: connection.options?.domain,
    domainAliases: connection.options?.domain_aliases,
  },
});

export const createSsoConnection = async (
  auth0Client: ManagementClient,
  options: CreateSsoConnectionOptions
): Promise<SsoConnectionResponse> => {
  const logContext = { name: options.name, strategy: options.strategy };
  logger.info(logContext, 'Creating SSO connection in Auth0');

  const connectionOptions = buildConnectionOptions(
    options.strategy,
    options.options
  );

  const response = await auth0Client.connections.create({
    name: options.name,
    strategy: options.strategy as 'okta' | 'waad' | 'ad' | 'google-apps',
    options: connectionOptions,
  });

  if (response.status !== 201) {
    logger.error(
      { ...logContext, status: response.status },
      'Failed to create SSO connection in Auth0'
    );
    throw new Error('Failed to create SSO connection in Auth0');
  }

  logger.info(
    { connectionId: response.data.id, name: response.data.name },
    'SSO connection created in Auth0'
  );

  return mapToSsoConnectionResponse(response.data);
};

export const deleteConnection = async (
  auth0Client: ManagementClient,
  connectionId: string
): Promise<void> => {
  logger.info({ connectionId }, 'Deleting SSO connection from Auth0');

  try {
    await auth0Client.connections.delete({ id: connectionId });
  } catch (error) {
    if (error instanceof ManagementApiError && error.statusCode === 404) {
      logger.info(
        { connectionId },
        'SSO connection not found in Auth0, skipping delete'
      );

      return;
    }
    logger.error({ error }, 'Error deleting SSO connection from Auth0');
    throw error;
  }
};

export interface UpdateSsoConnectionOptions {
  options?: {
    domainAliases?: string[];
  };
}

export const updateSsoConnection = async (
  auth0Client: ManagementClient,
  connectionId: string,
  options: UpdateSsoConnectionOptions
): Promise<SsoConnectionResponse> => {
  logger.info({ connectionId }, 'Updating SSO connection in Auth0');

  const existing = await auth0Client.connections.get({ id: connectionId });
  const existingOptions = (existing.data.options ?? {}) as Record<
    string,
    unknown
  >;

  const mergedOptions = {
    ...existingOptions,
    ...(options.options?.domainAliases && {
      domain_aliases: options.options.domainAliases,
    }),
  };

  const response = await auth0Client.connections.update(
    { id: connectionId },
    { options: mergedOptions }
  );

  logger.info({ connectionId }, 'SSO connection updated in Auth0');

  return mapToSsoConnectionResponse(response.data);
};

export const enableClientForConnection = async (
  auth0Client: ManagementClient,
  connectionId: string,
  clientIds: string[]
): Promise<void> => {
  const logContext = { connectionId, clientIds };
  logger.info(logContext, 'Enabling clients for SSO connection in Auth0');

  try {
    const currentConnection = await auth0Client.connections.getEnabledClients({
      id: connectionId,
    });

    const existingClientIds = new Set(
      currentConnection.data.clients?.map((c) => c.client_id) ?? []
    );

    const clientsToEnable = clientIds.filter(
      (id) => !existingClientIds.has(id)
    );

    if (clientsToEnable.length === 0) {
      return;
    }

    await auth0Client.connections.updateEnabledClients(
      { id: connectionId },
      clientsToEnable.map((id) => ({ client_id: id, status: true }))
    );

    logger.info(logContext, 'Clients enabled for SSO connection in Auth0');
  } catch (error) {
    logger.error(
      { ...logContext, error },
      'Error enabling clients for SSO connection in Auth0'
    );
    throw error;
  }
};
