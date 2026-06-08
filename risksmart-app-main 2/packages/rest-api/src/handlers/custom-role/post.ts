import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertCustomRole } from 'src/services/custom-role/customRoleService';

import { CustomRolePostSchema } from './schema';

export const handler = backendRouteHandler(
  CustomRolePostSchema,
  async (body) => {
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const input = body.input.Input;

    const id = await insertCustomRole(hasuraClient, {
      RoleName: input.Name,
      Description: input.Description,
      customRoleAssignments: input.RoleKeys.map((roleKey) => ({
        RoleTypeKey: roleKey,
      })),
      users: input.UserIds.map((userId) => ({
        UserId: userId,
      })),
    });

    if (id == undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to insert custom role`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: id,
      }),
    };
  }
);
