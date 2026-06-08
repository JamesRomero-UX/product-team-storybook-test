import type { ApolloClient } from '@apollo/client';
import { GetRoleByIdDocument, GetRolesDocument } from 'generated/graphql';

import { getLogger } from '../../logger';

const logger = getLogger();

export const getRoleById = async (
  hasuraClient: ApolloClient<unknown>,
  roleKey: string
) => {
  logger.info('Getting role by id', { roleKey });
  const result = await hasuraClient.query({
    query: GetRoleByIdDocument,
    variables: {
      roleKey: roleKey,
    },
  });

  if (result.errors) {
    logger.error('Error getting role by id', {
      errors: result.errors,
      roleKey,
    });
    throw new Error('Error getting role by id');
  }

  return result.data?.auth_role_type_by_pk;
};

export const getAllRoles = async (hasuraClient: ApolloClient<unknown>) => {
  logger.info('Getting all roles');
  const result = await hasuraClient.query({
    query: GetRolesDocument,
  });

  if (result.errors) {
    logger.error('Error getting all roles', { errors: result.errors });
    throw new Error('Error getting all roles');
  }

  return result.data?.auth_role_type || [];
};
