import { getLogger } from 'src/logger';
import z from 'zod';

const logger = getLogger();

const _updateCustomRoleUserCommandSchema = z.object({
  userId: z.string(),
  customRoleIds: z.array(z.string().uuid()),
});

export type UpdateCustomRoleUserCommand = Readonly<
  z.infer<typeof _updateCustomRoleUserCommandSchema>
>;

interface UpdateCustomRoleUserCommandHandler {
  execute(command: UpdateCustomRoleUserCommand): Promise<{
    affectedRows: number;
  }>;
}

interface Dependencies {
  currentCustomRolesReader: (userId: string) => Promise<
    {
      CustomRoleId: string;
    }[]
  >;
  customRoleUserWriter: (params: {
    userId: string;
    rolesToAdd: { CustomRoleId: string; UserId: string }[];
    roleIdsToRemove: string[];
  }) => Promise<{
    insertedRows: number | undefined;
    deletedRows: number | undefined;
  }>;
}

export const createUpdateCustomRoleUserCommandHandler = ({
  currentCustomRolesReader,
  customRoleUserWriter,
}: Dependencies): UpdateCustomRoleUserCommandHandler => ({
  execute: async (
    command: UpdateCustomRoleUserCommand
  ): Promise<{
    affectedRows: number;
  }> => {
    logger.info('Executing update custom role user command', {
      userId: command.userId,
      customRoleIds: command.customRoleIds,
    });

    // Get current roles for the user
    const currentCustomRoleUsers = await currentCustomRolesReader(
      command.userId
    );

    const currentRoleIds = new Set(
      currentCustomRoleUsers.map((role) => role.CustomRoleId)
    );
    const incomingRoleIds = new Set(command.customRoleIds);

    const roleIdsToAdd = command.customRoleIds.filter(
      (roleId) => !currentRoleIds.has(roleId)
    );
    const roleIdsToRemove = currentCustomRoleUsers
      .filter((currentRole) => !incomingRoleIds.has(currentRole.CustomRoleId))
      .map((role) => role.CustomRoleId);

    logger.info('Role changes to apply', {
      roleIdsToAdd,
      roleIdsToRemove,
    });

    // Apply the changes
    const { insertedRows, deletedRows } = await customRoleUserWriter({
      userId: command.userId,
      rolesToAdd: roleIdsToAdd.map((roleId) => ({
        CustomRoleId: roleId,
        UserId: command.userId,
      })),
      roleIdsToRemove,
    });

    // Validate the operation succeeded
    if (
      (insertedRows ?? 0) !== roleIdsToAdd.length ||
      (deletedRows ?? 0) !== roleIdsToRemove.length
    ) {
      throw new Error('Failed to update custom roles for the user');
    }

    const affectedRows = (insertedRows ?? 0) + (deletedRows ?? 0);

    logger.info('Custom role user update completed', {
      affectedRows,
      insertedRows,
      deletedRows,
    });

    return { affectedRows };
  },
});
