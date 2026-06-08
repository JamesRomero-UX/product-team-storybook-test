import { ManagementApiError, type ManagementClient } from 'auth0';
import { getLogger } from 'src/logger';

const logger = getLogger();

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

export interface EnabledClientResponse {
  data: void;
  headers: Headers;
  status: number;
  statusText: string;
}

export interface UpdateSsoConnectionOptions {
  options?: {
    domain?: string;
    clientId?: string;
    clientSecret?: string;
    domainAliases?: string[];
  };
}

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

const isNotFoundError = (error: ManagementApiError): boolean =>
  error.statusCode === 404;

/**
 * Get a specific SSO connection by ID from Auth0
 * Returns null if the connection doesn't exist
 */
export const getSsoConnectionById = async (
  auth0Client: ManagementClient,
  connectionId: string
): Promise<SsoConnectionResponse | null> => {
  logger.info('Getting SSO connection by ID from Auth0', { connectionId });

  try {
    const response = await auth0Client.connections.get({ id: connectionId });

    return mapToSsoConnectionResponse(response.data);
  } catch (error) {
    if (error instanceof ManagementApiError && isNotFoundError(error)) {
      logger.info('SSO connection not found in Auth0', { connectionId });

      return null;
    }

    logger.error('Error getting SSO connection from Auth0', {
      connectionId,
      error,
    });
    throw error;
  }
};

/**
 * Create a new SSO connection in Auth0
 */
export const createSsoConnection = async (
  auth0Client: ManagementClient,
  options: CreateSsoConnectionOptions
): Promise<SsoConnectionResponse> => {
  const logContext = { name: options.name, strategy: options.strategy };
  logger.info('Creating SSO connection in Auth0', logContext);

  const connectionOptions = buildConnectionOptions(
    options.strategy,
    options.options
  );

  const response = await auth0Client.connections.create({
    name: options.name,
    strategy: options.strategy as 'okta' | 'waad' | 'ad' | 'oidc',
    options: connectionOptions,
  });

  if (response.status !== 201) {
    logger.error('Failed to create SSO connection in Auth0', {
      ...logContext,
      status: response.status,
    });
    throw new Error('Failed to create SSO connection in Auth0');
  }

  logger.info('SSO connection created in Auth0', {
    connectionId: response.data.id,
    name: response.data.name,
  });

  return mapToSsoConnectionResponse(response.data);
};

/**
 * Update an existing SSO connection's options in Auth0
 */
export const updateSsoConnection = async (
  auth0Client: ManagementClient,
  connectionId: string,
  options: UpdateSsoConnectionOptions
): Promise<SsoConnectionResponse> => {
  const logContext = { connectionId };
  logger.info('Updating SSO connection in Auth0', logContext);

  // Fetch existing connection to preserve required fields like issuer
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

  logger.info('SSO connection updated in Auth0', logContext);

  return mapToSsoConnectionResponse(response.data);
};

/**
 * Delete an SSO connection from Auth0
 */
export const deleteSsoConnection = async (
  auth0Client: ManagementClient,
  connectionId: string
): Promise<void> => {
  logger.info('Deleting SSO connection from Auth0', { connectionId });

  try {
    await auth0Client.connections.delete({ id: connectionId });
  } catch (error) {
    if (error instanceof ManagementApiError && isNotFoundError(error)) {
      logger.info('SSO connection not found in Auth0, skipping delete', {
        connectionId,
      });

      return;
    }
    logger.error('Error deleting SSO connection from Auth0', { error });
    throw error;
  }
};

/**
 * Enable one or more clients for an SSO connection in Auth0.
 * Skips client IDs that are already enabled.
 * Returns null if all clients are already enabled.
 */
export const enableClientForConnection = async (
  auth0Client: ManagementClient,
  connectionId: string,
  clientIds: string[]
): Promise<EnabledClientResponse | null> => {
  const logContext = { connectionId, clientIds };
  logger.info('Enabling clients for SSO connection in Auth0', logContext);

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
      return null;
    }

    const enabledClients = await auth0Client.connections.updateEnabledClients(
      { id: connectionId },
      clientsToEnable.map((id) => ({ client_id: id, status: true }))
    );

    logger.info('Clients enabled for SSO connection in Auth0', logContext);

    return enabledClients;
  } catch (error) {
    logger.error('Error enabling clients for SSO connection in Auth0', {
      ...logContext,
      error,
    });
    throw error;
  }
};
