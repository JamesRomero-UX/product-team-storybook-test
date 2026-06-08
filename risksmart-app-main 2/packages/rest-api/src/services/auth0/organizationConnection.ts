import { ManagementApiError, type ManagementClient } from 'auth0';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface CreateOrganizationConnectionBody {
  connection_id: string;
  assign_membership_on_login?: boolean;
  show_as_button?: boolean;
}

interface OrganizationConnectionParams {
  id: string;
  connectionId: string;
}

const createLogContext = (organizationId: string, connectionId: string) => ({
  organization_id: organizationId,
  connection_id: connectionId,
});

const isNotFoundError = (error: ManagementApiError): boolean =>
  error.statusCode === 404;

/**
 * Get an organization connection from Auth0
 * Returns null if the connection doesn't exist
 */
export const getOrganizationConnection = async (
  auth0Client: ManagementClient,
  params: OrganizationConnectionParams
) => {
  const logContext = createLogContext(params.id, params.connectionId);
  logger.info('Getting organization connection', logContext);

  try {
    const response =
      await auth0Client.organizations.getEnabledConnection(params);

    logger.info('Found organization connection', logContext);

    return response.data;
  } catch (error) {
    if (error instanceof ManagementApiError && isNotFoundError(error)) {
      logger.info('Organization connection not found', logContext);

      return null;
    }

    logger.error('Error getting organization connection', {
      ...logContext,
      error,
    });
    throw error;
  }
};

/**
 * Create an organization connection in Auth0
 */
export const createOrganizationConnection = async (
  auth0Client: ManagementClient,
  params: { id: string },
  body: CreateOrganizationConnectionBody
) => {
  const logContext = createLogContext(params.id, body.connection_id);
  logger.info('Creating organization connection', logContext);

  const response = await auth0Client.organizations.addEnabledConnection(
    params,
    body
  );

  if (response.status !== 201) {
    logger.error('Failed to create organization connection', {
      ...logContext,
      status: response.status,
    });
    throw new Error('Failed to create organization connection');
  }

  return response.data;
};

/**
 * Delete an organization connection from Auth0
 */
export const deleteOrganizationConnection = async (
  auth0Client: ManagementClient,
  params: OrganizationConnectionParams
) => {
  const logContext = createLogContext(params.id, params.connectionId);
  logger.info('Deleting organization connection', logContext);

  try {
    await auth0Client.organizations.deleteEnabledConnection(params);
  } catch (error) {
    if (error instanceof ManagementApiError && isNotFoundError(error)) {
      logger.info(
        'Organization connection not found, skipping delete',
        logContext
      );

      return;
    }
    logger.error('Error deleting organization connection', {
      ...logContext,
      error,
    });
    throw error;
  }
};
