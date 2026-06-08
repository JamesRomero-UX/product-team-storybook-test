import type { ApolloClient } from '@apollo/client';
import type { VariablesOf } from '@graphql-typed-document-node/core';
import type { UserStatusEnum } from 'generated/graphql';
import {
  UpdateAuthUserDocument,
  UpdateOrganisationUserDocument,
} from 'generated/graphql';
import { NotFound } from 'http-errors';

export const updateUser = async (
  hasuraClient: ApolloClient<unknown>,
  userId: string,
  orgKey: string,
  updates: Record<string, unknown>
) => {
  const {
    External_Id,
    Status,
    Email,
    UserName,
    FirstName,
    LastName,
    DisplayName,
    JobTitle,
    Department,
    OfficeLocation,
  } = updates;

  if (External_Id || Status) {
    await updateOrganisationUser(hasuraClient, {
      User_Id: userId,
      OrgKey: orgKey,
      _set: {
        ModifiedAtTimestamp: 'now()',
        ModifiedByUser: 'SCIM',
        ...((External_Id as string) && { External_Id: External_Id as string }),
        ...((Status as UserStatusEnum) && { Status: Status as UserStatusEnum }),
      },
    });
  }
  const updatedUser = await updateAuthUser(hasuraClient, {
    User_Id: userId,
    OrgKey: orgKey,
    _set: {
      ModifiedAtTimestamp: 'now()',
      ModifiedByUser: 'SCIM',
      ...((External_Id as string) && { External_Id: External_Id as string }),
      ...((Status as UserStatusEnum) && { Status: Status as UserStatusEnum }),
      ...((Email as string) && { Email: Email as string }),
      ...((UserName as string) && { UserName: UserName as string }),
      ...((FirstName as string) && { FirstName: FirstName as string }),
      ...((LastName as string) && { LastName: LastName as string }),
      ...((DisplayName as string) && { DisplayName: DisplayName as string }),
      ...((JobTitle as string) && { JobTitle: JobTitle as string }),
      ...((Department as string) && { Department: Department as string }),
      ...((OfficeLocation as string) && {
        OfficeLocation: OfficeLocation as string,
      }),
    },
  });

  return updatedUser;
};

const updateOrganisationUser = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateOrganisationUserDocument>
) => {
  console.log('Updating organisation user');
  const result = await hasuraClient.mutate({
    mutation: UpdateOrganisationUserDocument,
    variables,
  });
  if (result.errors) {
    console.error('Error updating organisation user', result.errors);
    throw new Error('Error updating organisation user');
  }
};

const updateAuthUser = async (
  hasuraClient: ApolloClient<unknown>,
  variables: VariablesOf<typeof UpdateAuthUserDocument>
) => {
  console.log('Updating user');

  const result = await hasuraClient.mutate({
    mutation: UpdateAuthUserDocument,
    variables,
  });
  if (result.errors) {
    console.error('Error updating user', result.errors);
    throw new Error('Error updating user');
  }
  if (!result.data?.update_auth_user?.returning.length) {
    console.error('User not found', result);
    throw new NotFound('User not found.');
  }

  return result.data.update_auth_user.returning[0];
};
