import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import {
  DeleteUserRolesByIdsDocument,
  GetUserByIdDocument,
  GetUserRolesDocument,
  InsertUserDocument,
  InsertUserRolesDocument,
  UpdateUserDocument,
} from 'generated/graphql';

import { getLogger } from '../../logger';
const logger = getLogger();

export const insertAuthUser = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertUserDocument>
) => {
  logger.info('Inserting auth user');
  const result = await hasuraClient.mutate({
    mutation: InsertUserDocument,
    variables,
  });

  return result.data?.insert_auth_user_one?.Id;
};

export const getUserById = async (
  hasuraClient: ApolloClient<unknown>,
  userId: string
) => {
  logger.info('Getting user by id');
  const result = await hasuraClient.query({
    query: GetUserByIdDocument,
    variables: {
      Id: userId,
    },
  });
  if (result.errors) {
    logger.error('Error getting user by id', { errors: result.errors });
    throw new Error('Error getting user by id');
  }

  return result.data?.auth_user_by_pk;
};

export const updateUser = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateUserDocument>
) => {
  logger.info('Updating user');
  const result = await hasuraClient.mutate({
    mutation: UpdateUserDocument,
    variables,
  });
  if (result.errors) {
    logger.error('Error updating user', { errors: result.errors });
    throw new Error('Error updating user');
  }

  return result.data?.update_auth_user_by_pk?.Id;
};

export const deleteUserRolesByIds = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof DeleteUserRolesByIdsDocument>
) => {
  logger.info('Deleting user roles by IDs', { ids: variables.ids });
  const result = await hasuraClient.mutate({
    mutation: DeleteUserRolesByIdsDocument,
    variables,
  });

  return result.data?.delete_auth_user_role?.affected_rows || 0;
};

export const insertUserRoles = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof InsertUserRolesDocument>
) => {
  logger.info('Inserting user roles');
  const result = await hasuraClient.mutate({
    mutation: InsertUserRolesDocument,
    variables,
  });

  return result.data?.insert_auth_user_role?.returning || [];
};

export const getUserRoles = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof GetUserRolesDocument>
) => {
  logger.info('Getting user roles', {
    userId: variables.userId,
    orgKey: variables.orgKey,
  });
  const result = await hasuraClient.query({
    query: GetUserRolesDocument,
    variables,
  });

  if (result.errors) {
    logger.error('Error getting user roles', {
      errors: result.errors,
      variables,
    });
    throw new Error('Error getting user roles');
  }

  return result.data?.auth_user_role || [];
};
