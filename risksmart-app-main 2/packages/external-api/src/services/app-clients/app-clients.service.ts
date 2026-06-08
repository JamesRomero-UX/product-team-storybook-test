import type { ResourceScope, ResourceScopeKey } from '../../auth/scopes';
import { resourceScopeList, resourceScopes } from '../../auth/scopes';
import type {
  IAuthClient,
  IClient,
  OrgClientItem,
} from '../../clients/client.interface';
import {
  AppClientNotFoundError,
  InvalidAppClientCredentialsError,
  InvalidAppClientScopesError,
} from '../../errors/app-client.errors';
import type {
  AppClientItemRequestInput,
  AppClientRequest,
} from '../../schemas/app-clients/app-client.schema';
import type { AuthTokenRequestData } from '../../schemas/auth.schema';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import { moduleConfigSchema } from '../../schemas/organisation/organisationModule.schema';
import { mapClientDataToCreateSchema } from '../../transformers/app-clients/app-client.transformer';
import { resolveScopesFromConfig } from '../../transformers/organisations/organisation-module.transformer';
import type { ServiceCallContext, ServiceConfig } from '../../types/service';
import { logger } from '../../utils/logger';
import { CURRENT_API_VERSION } from '../../versions/index';
import type { DocumentationService } from '../documentation/documentation.service';

export type AppClientsService = ReturnType<typeof appClientsService>;
export interface GetAppClientsResponse {
  data: OrgClientItem[];
  metadata: {
    allowedScopes: ResourceScope[];
    clientLimit: number;
    signedDocsPath: string;
  };
}

export interface AppClientServiceConfig extends ServiceConfig {
  clientLimit: number;
}

export interface AppClientsServiceProps {
  authClient: IAuthClient;
  dataClient: IClient;
  documentationService: DocumentationService;
}

export function appClientsService(
  { authClient, dataClient, documentationService }: AppClientsServiceProps,
  config: AppClientServiceConfig
) {
  // Helper function to fetch and resolve allowed scopes based on org module settings
  const getAllowedScopes = async (
    ctx: ServiceCallContext
  ): Promise<ResourceScope[]> => {
    const { orgId = null, tenantId = null } = ctx;
    if (!orgId || !tenantId) {
      logger.warn(
        { orgId, tenantId },
        'Missing org | tenant ids for fetching allowed scopes'
      );

      return [];
    }

    const orgModules = await dataClient.queryOrganisationModule({
      authorization: ctx.authToken,
    });

    if (!orgModules?.organisationModule?.ModuleSettings) {
      logger.warn(
        { orgId, tenantId },
        'Missing org module settings, returning empty allowed scopes array'
      );

      return [];
    }

    const moduleSettings = orgModules.organisationModule.ModuleSettings;
    const moduleConfig = moduleConfigSchema.parse(moduleSettings);
    const allowedScopes = resolveScopesFromConfig(
      moduleConfig,
      resourceScopeList
    );

    if (allowedScopes.length === 0) {
      return [];
    }
    // add default scopes that are not module access based (users, departments, tags, etc).
    const defaultScopeKeys: ResourceScopeKey[] = [
      'users:get',
      'users:read',
      'users:list',
      'user-groups:read',
      'user-groups:get',
      'user-groups:list',
      'departments:read',
      'departments:get',
      'departments:list',
      'department-groups:read',
      'department-groups:get',
      'department-groups:list',
      'tags:read',
      'tags:get',
      'tags:list',
    ];
    const verifiedDefaultScopes = [...new Set(defaultScopeKeys)]
      .map((name) => resourceScopes.get(name))
      .filter((scope: ResourceScope | undefined) => scope !== undefined);

    if (verifiedDefaultScopes.length < defaultScopeKeys.length) {
      logger.warn(
        {
          orgId,
          tenantId,
          defaultScopeKeys,
          verifiedDefaultScopes,
        },
        `Missing scopes in verified scope list return `
      );
    }

    return [...allowedScopes, ...verifiedDefaultScopes];
  };

  const getAppClients = async (
    ctx: ServiceCallContext
  ): Promise<GetAppClientsResponse> => {
    const { orgId = null, tenantId = null } = ctx;
    if (!orgId || !tenantId) {
      logger.warn(
        { orgId, tenantId },
        'Missing org | tenant ids for fetching app client data'
      );
      throw new AppClientNotFoundError();
    }
    // fetch required data (app client list & org module config).
    const appClients = await authClient.getOrgClients(tenantId, orgId);
    const allowedScopes = await getAllowedScopes(ctx);
    const { signedDocsPath } =
      documentationService.getSignedDocumentationPath();

    return {
      data: appClients,
      metadata: {
        allowedScopes,
        clientLimit: config.clientLimit,
        signedDocsPath,
      },
    };
  };

  const removeAppClient = async (
    clientInput: AppClientItemRequestInput,
    ctx: MutateServiceContext
  ) => {
    const { orgId, actorId = 'system' } = ctx;
    const { clientId } = clientInput;

    logger.debug({ clientId, ctx }, 'Attempting to remove app client');

    await authClient.disableAndRemoveClient(clientId, actorId);

    logger.debug(
      { clientId, orgId, actorId },
      'Successfully removed app client'
    );

    return { data: { id: clientId } };
  };

  const createAppClient = async (
    clientInput: AppClientRequest,
    ctx: MutateServiceContext
  ) => {
    const timestampNow = Date.now();
    const { orgId, tenantId, actorId } = ctx;

    if (!actorId || !orgId || !tenantId) {
      logger.error(
        { orgId, tenantId, actorId },
        'ids missing from client credentials'
      );
      throw new InvalidAppClientCredentialsError();
    }

    logger.debug({ clientInput, ctx }, 'debug client create');

    // Validate scopes against allowed scopes from module settings
    const allowedScopes = await getAllowedScopes(ctx);
    if (allowedScopes.length === 0) {
      logger.error(
        {
          orgId,
          tenantId,
          allowedScopes,
        },
        'No allowed scopes found for org'
      );
      throw new InvalidAppClientScopesError('Invalid scopes requested');
    }
    const requestedScopes = clientInput.scopes || [];

    // Get the scope names from the allowed scopes objects
    const allowedScopeNames = new Set(
      allowedScopes.map((scope) => `${scope.name}`)
    );
    const invalidScopes = requestedScopes.filter(
      (scope) => !allowedScopeNames.has(scope)
    );
    // Check if all requested scopes are allowed
    if (invalidScopes.length > 0) {
      logger.error(
        {
          orgId,
          tenantId,
          requestedScopes,
          allowedScopeNames,
          invalidScopes,
        },
        'Invalid scopes requested for app client creation'
      );
      throw new InvalidAppClientScopesError(
        `Invalid scopes requested: ${invalidScopes.join(', ')}`
      );
    }
    // try to create a new client from context and client data.
    const newClientData = mapClientDataToCreateSchema(clientInput, {
      role: 'rs-external',
      compatVersion: CURRENT_API_VERSION,
      createdAt: timestampNow,
      createdBy: actorId,
      orgId,
      tenantId,
      rateLimitProfile: 'cruise',
    });
    const newClient = await authClient.createNewClient(newClientData);
    logger.info(
      clientInput,
      `Successfully created app client for ${orgId} by ${actorId}`
    );

    return { data: newClient };
  };

  const createAppClientToken = async (clientData: AuthTokenRequestData) => {
    const existingClient = await authClient.getActiveClient(
      clientData.clientKey
    );
    if (existingClient === null) {
      throw new AppClientNotFoundError();
    }

    return authClient.createClientAccessToken(clientData);
  };

  return {
    createAppClient,
    createAppClientToken,
    removeAppClient,
    getAppClients,
  };
}
