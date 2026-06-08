import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { updateCustomRole } from 'src/services/custom-role/customRoleService';

import { CustomRolePutSchema } from './schema';

export const handler = backendRouteHandler(
  CustomRolePutSchema,
  async (body) => {
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const input = body.input.Input;

    const affectedRows = await updateCustomRole(hasuraClient, {
      RoleName: input.Name,
      Description: input.Description,
      Id: input.Id,
      roleAssignments: input.RoleKeys.map((roleKey) => ({
        RoleTypeKey: roleKey,
        CustomRoleId: input.Id,
      })),
      roleKeys: input.RoleKeys,
      users: input.UserIds.map((userId) => ({
        UserId: userId,
        CustomRoleId: input.Id,
      })),
      userIds: input.UserIds,
    });

    if (affectedRows == undefined || affectedRows === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to update custom role`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        affected_rows: affectedRows,
      }),
    };
  }
);
