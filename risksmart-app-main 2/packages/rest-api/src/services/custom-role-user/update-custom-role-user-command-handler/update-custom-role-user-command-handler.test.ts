import { describe, expect, it, vi } from 'vitest';

import { createUpdateCustomRoleUserCommandHandler } from './update-custom-role-user-command-handler';

describe('UpdateCustomRoleUserCommandHandler', () => {
  it('should add and remove roles correctly', async () => {
    // Arrange
    const mockCurrentCustomRolesReader = vi
      .fn()
      .mockResolvedValue([
        { CustomRoleId: 'existing-role-1' },
        { CustomRoleId: 'existing-role-2' },
      ]);

    const mockCustomRoleUserWriter = vi.fn().mockResolvedValue({
      insertedRows: 1,
      deletedRows: 1,
    });

    const handler = createUpdateCustomRoleUserCommandHandler({
      currentCustomRolesReader: mockCurrentCustomRolesReader,
      customRoleUserWriter: mockCustomRoleUserWriter,
    });

    const command = {
      userId: 'user-123',
      customRoleIds: ['existing-role-1', 'new-role-1'], // Keep existing-role-1, add new-role-1, remove existing-role-2
    };

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(mockCurrentCustomRolesReader).toHaveBeenCalledWith('user-123');
    expect(mockCustomRoleUserWriter).toHaveBeenCalledWith({
      userId: 'user-123',
      rolesToAdd: [{ CustomRoleId: 'new-role-1', UserId: 'user-123' }],
      roleIdsToRemove: ['existing-role-2'],
    });
    expect(result.affectedRows).toBe(2);
  });

  it('should handle case when no changes are needed', async () => {
    // Arrange
    const mockCurrentCustomRolesReader = vi
      .fn()
      .mockResolvedValue([
        { CustomRoleId: 'role-1' },
        { CustomRoleId: 'role-2' },
      ]);

    const mockCustomRoleUserWriter = vi.fn().mockResolvedValue({
      insertedRows: 0,
      deletedRows: 0,
    });

    const handler = createUpdateCustomRoleUserCommandHandler({
      currentCustomRolesReader: mockCurrentCustomRolesReader,
      customRoleUserWriter: mockCustomRoleUserWriter,
    });

    const command = {
      userId: 'user-123',
      customRoleIds: ['role-1', 'role-2'], // Same as existing
    };

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(mockCustomRoleUserWriter).toHaveBeenCalledWith({
      userId: 'user-123',
      rolesToAdd: [],
      roleIdsToRemove: [],
    });
    expect(result.affectedRows).toBe(0);
  });

  it('should throw error when writer operation fails', async () => {
    // Arrange
    const mockCurrentCustomRolesReader = vi.fn().mockResolvedValue([]);

    const mockCustomRoleUserWriter = vi.fn().mockResolvedValue({
      insertedRows: undefined, // Simulate failure
      deletedRows: 0,
    });

    const handler = createUpdateCustomRoleUserCommandHandler({
      currentCustomRolesReader: mockCurrentCustomRolesReader,
      customRoleUserWriter: mockCustomRoleUserWriter,
    });

    const command = {
      userId: 'user-123',
      customRoleIds: ['new-role-1'],
    };

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'Failed to update custom roles for the user'
    );
  });
});
