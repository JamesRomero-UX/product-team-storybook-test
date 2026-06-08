import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import type { ServiceOptions } from 'src/services/types';

import { updateCustomRoleUser } from '../custom-role-user-service';
import { createUpdateCustomRoleUserCommandHandler } from './update-custom-role-user-command-handler';

export { UpdateCustomRoleUserCommand } from './update-custom-role-user-command-handler';

export const buildUpdateCustomRoleUserCommandHandler = (
  opts: ServiceOptions
) => {
  const hasuraClient = getHasuraBackendClient(
    opts.tenant,
    opts.orgKey,
    opts.userId,
    opts.userRole
  );
  const apiClient = getRisksmartApiClient(hasuraClient);

  const currentCustomRolesReader = async (userId: string) => {
    const { custom_role_user: currentCustomRoleUsers } =
      await apiClient.GetUserCustomRoles({
        userId,
      });

    return currentCustomRoleUsers;
  };

  const customRoleUserWriter = async (params: {
    userId: string;
    rolesToAdd: { CustomRoleId: string; UserId: string }[];
    roleIdsToRemove: string[];
  }) => {
    return await updateCustomRoleUser(hasuraClient, {
      userId: params.userId,
      rolesToAdd: params.rolesToAdd,
      roleIdsToRemove: params.roleIdsToRemove,
    });
  };

  return createUpdateCustomRoleUserCommandHandler({
    currentCustomRolesReader,
    customRoleUserWriter,
  });
};
