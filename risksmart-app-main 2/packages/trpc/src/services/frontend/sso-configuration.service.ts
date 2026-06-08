import { bulkCheck } from '@risksmart-app/permitio/src/permit';
import { TRPCError } from '@trpc/server';

import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import { getAuth0ManagementClient } from '../../clients/get-auth0-management-client';
import type {
  CreateSsoConfigurationResponse,
  SsoConfigurationRow,
} from '../../types';
import { getEnv, getOptionalEnv } from '../../utils/environment';
import { mapHttpStatusToTRPCError } from '../../utils/error-mapping';
import { logger } from '../../utils/logger';
import { getOrgDetails } from '../../utils/org-utils';
import {
  createSsoConnection,
  deleteConnection,
  enableClientForConnection,
  type SsoConnectionResponse,
  updateSsoConnection,
} from '../auth0/enterprise-connection.service';
import {
  createOrganizationConnection,
  deleteOrganizationConnection,
} from '../auth0/organization-connection.service';
import type {
  SaveSsoConfigInput,
  ServiceContext,
  SsoConfigurationService,
  SsoSaveAction,
  SsoSaveResult,
} from '../service.types';

const buildSsoConfigResult = (opts: {
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

const buildOrgConnectionBody = (connectionId: string) => ({
  connection_id: connectionId,
  assign_membership_on_login: true,
  show_as_button: false,
});

const hasConnectionChanges = (
  existingConfig: SsoConfigurationRow,
  input: SaveSsoConfigInput
): boolean =>
  existingConfig.Strategy !== input.strategy ||
  existingConfig.ClientId !== input.clientId;

const hasLoginExperienceChanges = (
  existingConfig: SsoConfigurationRow,
  input: SaveSsoConfigInput
): boolean => {
  const existingAliases = [...(existingConfig.DomainAliases ?? [])].sort();
  const inputAliases = [...(input.domainAliases ?? [])].sort();

  return JSON.stringify(existingAliases) !== JSON.stringify(inputAliases);
};

const getClientIdsToEnable = (): string[] => {
  const clientIds = [
    getEnv('AUTH0_RISK_SMART_REST_API_CLIENT_ID'),
    getEnv('REACT_APP_AUTH0_CLIENT_ID'),
  ];

  const circleClientId = getOptionalEnv('AUTH0_RISK_SMART_CIRCLE_CLIENT_ID');
  if (circleClientId) {
    clientIds.push(circleClientId);
  }

  return clientIds;
};

export class SsoConfigurationServiceImpl implements SsoConfigurationService {
  private async assertPermission(
    ctx: ServiceContext,
    action: 'insert' | 'delete'
  ): Promise<void> {
    logger.info(
      { userId: ctx.userId, orgKey: ctx.orgId, action },
      'Checking permissions for SSO configuration action'
    );
    const result = await bulkCheck(
      [{ resourceName: 'sso_configuration', action }],
      ctx.userId,
      ctx.orgId
    );
    if (!result.some((check) => check.action === action)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You do not have permission to ${action} SSO configurations`,
      });
    }
  }

  async getSsoConfigurations(
    ctx: ServiceContext
  ): Promise<SsoConfigurationRow[]> {
    const { data, status } = await dataLayerApiClient.getSsoConfigurations(
      toApiContext(ctx)
    );

    if (status >= 400) {
      throw mapHttpStatusToTRPCError(status, data);
    }

    return data;
  }

  async deleteSsoConfiguration(
    ctx: ServiceContext,
    connectionId: string
  ): Promise<void> {
    await this.assertPermission(ctx, 'delete');
    const configs = await this.getSsoConfigurations(ctx);
    const config = configs.find((c) => c.ConnectionId === connectionId);

    await this.deleteConnectionAndRecord(
      ctx,
      connectionId,
      !!config?.IsOrganizationConnected,
      {
        403: 'You do not have permission to delete SSO configurations',
        404: 'SSO configuration not found',
      }
    );
  }

  async saveSsoConfiguration(
    ctx: ServiceContext,
    input: SaveSsoConfigInput
  ): Promise<SsoSaveResult> {
    await this.assertPermission(ctx, 'insert');
    const existingConfigs = await this.getSsoConfigurations(ctx);
    const existingConfig = existingConfigs.find(
      (c) =>
        c.ConnectionId === input.connectionId || c.ClientId === input.clientId
    );

    if (!existingConfig) {
      return this.createNewConnection(ctx, input, existingConfigs);
    }

    const isOrgConnected = !!existingConfig.IsOrganizationConnected;

    if (isOrgConnected !== input.addOrgConnection) {
      return this.updateOrgConnectionStatus(ctx, input, {
        ...existingConfig,
        IsOrganizationConnected: isOrgConnected,
      });
    }

    // Connection-defining fields changed — must recreate the Auth0 connection
    if (hasConnectionChanges(existingConfig, input)) {
      return this.createNewConnection(
        ctx,
        {
          ...input,
          connectionId: existingConfig.ConnectionId,
        },
        existingConfigs
      );
    }

    // Login experience domains changed — update Auth0 connection + DB record
    if (hasLoginExperienceChanges(existingConfig, input)) {
      return this.updateLoginExperience(ctx, input, existingConfig);
    }

    return buildSsoConfigResult({
      id: existingConfig.ConnectionId,
      name: existingConfig.Name,
      strategy: existingConfig.Strategy,
      isOrgConnected,
      action: 'no_change',
    });
  }

  /**
   * Core three-step deletion: remove org connection (if connected), delete the
   * Auth0 connection, then remove the DB record via the data-layer.
   */
  private async deleteConnectionAndRecord(
    ctx: ServiceContext,
    connectionId: string,
    isOrgConnected: boolean,
    errorMessages: Record<number, string>
  ): Promise<void> {
    const auth0Client = getAuth0ManagementClient();

    if (isOrgConnected) {
      await deleteOrganizationConnection(auth0Client, {
        id: ctx.orgId,
        connectionId,
      });
    }

    await deleteConnection(auth0Client, connectionId);
    await this.deleteDbRecord(ctx, connectionId, errorMessages);
  }

  /**
   * Removes an SSO configuration DB record via the data-layer async request.
   */
  private async deleteDbRecord(
    ctx: ServiceContext,
    connectionId: string,
    errorMessages: Record<number, string> = {}
  ): Promise<void> {
    await executeAsyncRequest(
      ctx,
      { ConnectionId: connectionId },
      {
        requestType: 'DELETE_SSO_CONFIGURATION',
        buildRequestBody: (i) => ({ ConnectionId: i.ConnectionId }),
        apiCall: (ctx, _input, correlationId) =>
          dataLayerApiClient.deleteSsoConfiguration(
            toApiContext(ctx),
            connectionId,
            correlationId
          ),
        successStatus: 204,
        errorMessages,
      }
    );
  }

  /** Deletes a previously existing SSO config (Auth0 + DB) during a replacement. */
  private async deleteOldConfig(
    ctx: ServiceContext,
    config: SsoConfigurationRow
  ): Promise<void> {
    logger.info(
      { connectionId: config.ConnectionId, orgKey: ctx.orgId },
      'Deleting old SSO configuration'
    );

    await this.deleteConnectionAndRecord(
      ctx,
      config.ConnectionId,
      !!config.IsOrganizationConnected,
      { 404: 'SSO configuration not found during cleanup' }
    );
  }

  /** Persists a new SSO configuration record to the data-layer. */
  private async persistSsoConfig(
    ctx: ServiceContext,
    createInput: Parameters<
      typeof dataLayerApiClient.createSsoConfiguration
    >[1],
    errorMessages: Record<number, string> = {}
  ): Promise<void> {
    await executeAsyncRequest<
      typeof createInput,
      CreateSsoConfigurationResponse
    >(ctx, createInput, {
      requestType: 'CREATE_SSO_CONFIGURATION',
      buildRequestBody: (i) => ({ ...i }),
      apiCall: (ctx, i, correlationId) =>
        dataLayerApiClient.createSsoConfiguration(
          toApiContext(ctx),
          i,
          correlationId
        ),
      errorMessages,
    });
  }

  /**
   * Best-effort Auth0-only cleanup when a new connection creation fails mid-flight.
   */
  private async cleanupCreatedConnection(
    ctx: ServiceContext,
    connectionId: string
  ): Promise<void> {
    try {
      await dataLayerApiClient.deleteSsoConfiguration(
        toApiContext(ctx),
        connectionId,
        crypto.randomUUID()
      );
    } catch (dbCleanupError) {
      logger.error(
        { connectionId, error: dbCleanupError },
        'Failed to clean up SSO configuration DB record'
      );
    }

    const auth0Client = getAuth0ManagementClient();
    try {
      logger.info(
        { connectionId, orgKey: ctx.orgId },
        'Cleaning up newly created Auth0 connection due to error'
      );
      await deleteConnection(auth0Client, connectionId);
      logger.info(
        { connectionId, orgKey: ctx.orgId },
        'Successfully cleaned up Auth0 connection'
      );
    } catch (cleanupError) {
      logger.error(
        { connectionId, orgKey: ctx.orgId, error: cleanupError },
        'Failed to clean up newly created Auth0 connection'
      );
    }
  }

  private async createNewConnection(
    ctx: ServiceContext,
    input: SaveSsoConfigInput,
    existingConfigs: SsoConfigurationRow[]
  ): Promise<SsoSaveResult> {
    const auth0Client = getAuth0ManagementClient();
    const { OrgName: orgName } = await getOrgDetails(ctx);
    const shortId = crypto.randomUUID().split('-')[0];
    const connectionName = `${orgName.replace(/[^a-zA-Z0-9-_]/g, '')}-${input.strategy}-${shortId}`;

    let ssoConnection: SsoConnectionResponse | undefined;
    let isOrgConnected = false;

    try {
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

      await enableClientForConnection(
        auth0Client,
        ssoConnection.id,
        getClientIdsToEnable()
      );

      if (input.addOrgConnection) {
        await createOrganizationConnection(
          auth0Client,
          { id: ctx.orgId },
          buildOrgConnectionBody(ssoConnection.id)
        );
        isOrgConnected = true;
      }

      // Delete all pre-existing configs for this org (except the one just created)
      const configsToDelete = existingConfigs.filter(
        (c) => c.ConnectionId !== ssoConnection!.id
      );

      for (const config of configsToDelete) {
        await this.deleteOldConfig(ctx, config);
      }

      await this.persistSsoConfig(
        ctx,
        {
          Name: ssoConnection.name,
          Strategy: ssoConnection.strategy,
          ClientId: input.clientId,
          ConnectionId: ssoConnection.id,
          Domain: input.domain,
          DomainAliases: input.domainAliases ?? [],
          IsActive: true,
          IsRestApiEnabled: true,
          IsOrganizationConnected: isOrgConnected,
        },
        {
          403: 'You do not have permission to create SSO configurations',
        }
      );

      return buildSsoConfigResult({
        id: ssoConnection.id,
        name: ssoConnection.name,
        strategy: ssoConnection.strategy,
        isOrgConnected,
        action: 'created',
        options: ssoConnection.options,
      });
    } catch (error) {
      logger.error(
        { error, orgKey: ctx.orgId },
        'Error creating SSO configuration'
      );

      if (ssoConnection?.id) {
        await this.cleanupCreatedConnection(ctx, ssoConnection.id);
      }

      throw error;
    }
  }

  private async updateOrgConnectionStatus(
    ctx: ServiceContext,
    input: SaveSsoConfigInput,
    existingConfig: SsoConfigurationRow & { IsOrganizationConnected: boolean }
  ): Promise<SsoSaveResult> {
    const auth0Client = getAuth0ManagementClient();

    if (input.addOrgConnection && !existingConfig.IsOrganizationConnected) {
      await createOrganizationConnection(
        auth0Client,
        { id: ctx.orgId },
        buildOrgConnectionBody(existingConfig.ConnectionId)
      );
    } else if (
      !input.addOrgConnection &&
      existingConfig.IsOrganizationConnected
    ) {
      await deleteOrganizationConnection(auth0Client, {
        id: ctx.orgId,
        connectionId: existingConfig.ConnectionId,
      });
    }

    // Delete and recreate the DB record with updated IsOrganizationConnected
    // (data-layer doesn't have an update endpoint; Auth0 connection is unchanged)
    const originalRecord = {
      Name: existingConfig.Name,
      Strategy: existingConfig.Strategy,
      ClientId: existingConfig.ClientId,
      ConnectionId: existingConfig.ConnectionId,
      Domain: existingConfig.Domain,
      DomainAliases: existingConfig.DomainAliases ?? [],
      IsActive: existingConfig.IsActive ?? true,
      IsRestApiEnabled: existingConfig.IsRestApiEnabled ?? true,
      IsOrganizationConnected: existingConfig.IsOrganizationConnected,
    };

    await this.deleteDbRecord(ctx, existingConfig.ConnectionId);

    try {
      await this.persistSsoConfig(ctx, {
        ...originalRecord,
        IsOrganizationConnected: input.addOrgConnection,
      });
    } catch (error) {
      logger.error(
        { connectionId: existingConfig.ConnectionId, error },
        'Failed to persist updated SSO config, attempting to restore original'
      );
      await this.persistSsoConfig(ctx, originalRecord).catch((restoreErr) =>
        logger.error(
          { connectionId: existingConfig.ConnectionId, error: restoreErr },
          'Failed to restore original SSO config after update failure'
        )
      );
      throw error;
    }

    return buildSsoConfigResult({
      id: existingConfig.ConnectionId,
      name: existingConfig.Name,
      strategy: existingConfig.Strategy,
      isOrgConnected: input.addOrgConnection,
      action: 'updated_org_connection',
    });
  }

  private async updateLoginExperience(
    ctx: ServiceContext,
    input: SaveSsoConfigInput,
    existingConfig: SsoConfigurationRow
  ): Promise<SsoSaveResult> {
    const auth0Client = getAuth0ManagementClient();
    const newAliases = input.domainAliases ?? [];

    await updateSsoConnection(auth0Client, existingConfig.ConnectionId, {
      options: { domainAliases: newAliases },
    });

    // Delete + recreate DB record with updated DomainAliases
    // (data-layer doesn't have an update endpoint)
    const originalRecord = {
      Name: existingConfig.Name,
      Strategy: existingConfig.Strategy,
      ClientId: existingConfig.ClientId,
      ConnectionId: existingConfig.ConnectionId,
      Domain: existingConfig.Domain,
      DomainAliases: existingConfig.DomainAliases ?? [],
      IsActive: existingConfig.IsActive ?? true,
      IsRestApiEnabled: existingConfig.IsRestApiEnabled ?? true,
      IsOrganizationConnected: !!existingConfig.IsOrganizationConnected,
    };

    await this.deleteDbRecord(ctx, existingConfig.ConnectionId);

    try {
      await this.persistSsoConfig(ctx, {
        ...originalRecord,
        DomainAliases: newAliases,
      });
    } catch (error) {
      logger.error(
        { connectionId: existingConfig.ConnectionId, error },
        'Failed to persist updated SSO config, attempting to restore original'
      );
      await this.persistSsoConfig(ctx, originalRecord).catch((restoreErr) =>
        logger.error(
          { connectionId: existingConfig.ConnectionId, error: restoreErr },
          'Failed to restore original SSO config after login experience update failure'
        )
      );
      throw error;
    }

    return buildSsoConfigResult({
      id: existingConfig.ConnectionId,
      name: existingConfig.Name,
      strategy: existingConfig.Strategy,
      isOrgConnected: !!existingConfig.IsOrganizationConnected,
      action: 'updated_login_experience',
      options: {
        domain: input.domain,
        domainAliases: newAliases,
      },
    });
  }
}
