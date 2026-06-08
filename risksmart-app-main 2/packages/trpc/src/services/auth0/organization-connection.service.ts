import { ManagementApiError, type ManagementClient } from 'auth0';

import { logger } from '../../utils/logger';

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

export const getOrganizationConnection = async (
  auth0Client: ManagementClient,
  params: OrganizationConnectionParams
) => {
  const logContext = createLogContext(params.id, params.connectionId);
  logger.info(logContext, 'Getting organization connection');

  try {
    const response =
      await auth0Client.organizations.getEnabledConnection(params);

    logger.info(logContext, 'Found organization connection');

    return response.data;
  } catch (error) {
    if (error instanceof ManagementApiError && isNotFoundError(error)) {
      logger.info(logContext, 'Organization connection not found');

      return null;
    }

    logger.error(
      { ...logContext, error },
      'Error getting organization connection'
    );
    throw error;
  }
};

export const createOrganizationConnection = async (
  auth0Client: ManagementClient,
  params: { id: string },
  body: CreateOrganizationConnectionBody
) => {
  const logContext = createLogContext(params.id, body.connection_id);
  logger.info(logContext, 'Creating organization connection');

  const response = await auth0Client.organizations.addEnabledConnection(
    params,
    body
  );

  if (response.status !== 201) {
    logger.error(
      { ...logContext, status: response.status },
      'Failed to create organization connection'
    );
    throw new Error('Failed to create organization connection');
  }

  return response.data;
};

export const deleteOrganizationConnection = async (
  auth0Client: ManagementClient,
  params: OrganizationConnectionParams
) => {
  const logContext = createLogContext(params.id, params.connectionId);
  logger.info(logContext, 'Deleting organization connection');

  try {
    await auth0Client.organizations.deleteEnabledConnection(params);
  } catch (error) {
    if (error instanceof ManagementApiError && isNotFoundError(error)) {
      logger.info(
        logContext,
        'Organization connection not found, skipping delete'
      );

      return;
    }
    logger.error(
      { ...logContext, error },
      'Error deleting organization connection'
    );
    throw error;
  }
};
