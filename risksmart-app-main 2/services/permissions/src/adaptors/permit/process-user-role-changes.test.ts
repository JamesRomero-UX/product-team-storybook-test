import type { Logger } from '@aws-lambda-powertools/logger';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { CreateUserRoleChangesProcessorProps } from './process-user-role-changes';
import { createUserRoleChangesProcessor } from './process-user-role-changes';

describe('process-user-role-changes', () => {
  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockTryAssignRole = vi.fn();
  const mockTryUnassignRole = vi.fn();

  const builderProps: CreateUserRoleChangesProcessorProps = {
    logger: mockLogger as Logger,
    tryAssignRole: mockTryAssignRole,
    tryUnassignRole: mockTryUnassignRole,
  };

  const baseParams = {
    orgKey: 'test-org',
    objectId: 'test-object-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTryAssignRole.mockResolvedValue(undefined);
    mockTryUnassignRole.mockResolvedValue(undefined);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Insert operation', () => {
    it('should return early when desiredUsersForRole is empty', async () => {
      const processUserRoleChanges =
        createUserRoleChangesProcessor(builderProps);

      await processUserRoleChanges({
        ...baseParams,
        op: PermissionsOperation.Insert,
        desiredUsersForRole: [],
        role: 'Owner',
      });

      expect(mockTryAssignRole).not.toHaveBeenCalled();
    });

    it('should assign Owner role to users', async () => {
      const desiredUsersForRole = [{ userId: 'user-1' }, { userId: 'user-2' }];
      const processUserRoleChanges =
        createUserRoleChangesProcessor(builderProps);

      await processUserRoleChanges({
        ...baseParams,
        op: PermissionsOperation.Insert,
        desiredUsersForRole,
        role: 'Owner',
      });

      expect(mockTryAssignRole).toHaveBeenCalledTimes(2);
      expect(mockTryAssignRole).toHaveBeenNthCalledWith(1, {
        resource_instance: 'rs_node:test-object-id',
        role: 'Owner',
        tenant: 'test-org',
        user: 'user-1',
      });
      expect(mockTryAssignRole).toHaveBeenNthCalledWith(2, {
        resource_instance: 'rs_node:test-object-id',
        role: 'Owner',
        tenant: 'test-org',
        user: 'user-2',
      });
    });

    it('should assign Contributor role to users', async () => {
      const desiredUsersForRole = [{ userId: 'user-3' }];
      const processUserRoleChanges =
        createUserRoleChangesProcessor(builderProps);

      await processUserRoleChanges({
        ...baseParams,
        op: PermissionsOperation.Insert,
        desiredUsersForRole,
        role: 'Contributor',
      });

      expect(mockTryAssignRole).toHaveBeenCalledWith({
        resource_instance: 'rs_node:test-object-id',
        role: 'Contributor',
        tenant: 'test-org',
        user: 'user-3',
      });
    });

    it('should not try to unassign roles for Insert operations', async () => {
      const desiredUsersForRole = [{ userId: 'user-1' }];
      const processUserRoleChanges =
        createUserRoleChangesProcessor(builderProps);

      await processUserRoleChanges({
        ...baseParams,
        op: PermissionsOperation.Insert,
        desiredUsersForRole,
        role: 'Owner',
      });

      expect(mockTryUnassignRole).not.toHaveBeenCalled();
    });
  });

  describe('Update operation', () => {
    describe('owners', () => {
      it('should remove old owner role assignments and create new ones', async () => {
        const existingRoleAssignments = [
          { user: 'user-1', role: 'Owner' },
          { user: 'user-2', role: 'Owner' },
        ];

        const processUserRoleChanges =
          createUserRoleChangesProcessor(builderProps);

        await processUserRoleChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredUsersForRole: [{ userId: 'user-2' }, { userId: 'user-3' }],
          role: 'Owner',
          existingRoleAssignments,
        });

        expect(mockTryUnassignRole).toHaveBeenCalledTimes(1);
        expect(mockTryUnassignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-1',
        });

        expect(mockTryAssignRole).toHaveBeenCalledTimes(2);
        expect(mockTryAssignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-2',
        });
        expect(mockTryAssignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-3',
        });
      });

      it('should remove old owner role assignments without creating new ones if not needed', async () => {
        const existingRoleAssignments = [
          { user: 'user-1', role: 'Owner' },
          { user: 'user-2', role: 'Owner' },
        ];

        const processUserRoleChanges =
          createUserRoleChangesProcessor(builderProps);

        await processUserRoleChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredUsersForRole: [],
          role: 'Owner',
          existingRoleAssignments,
        });

        expect(mockTryUnassignRole).toHaveBeenCalledTimes(2);
        expect(mockTryUnassignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-1',
        });
        expect(mockTryUnassignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-2',
        });

        expect(mockTryAssignRole).not.toHaveBeenCalled();
      });

      it('should not remove old owner role assignments if none present but create new ones as needed', async () => {
        const processUserRoleChanges =
          createUserRoleChangesProcessor(builderProps);

        await processUserRoleChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredUsersForRole: [{ userId: 'user-1' }, { userId: 'user-2' }],
          role: 'Owner',
          existingRoleAssignments: [],
        });

        expect(mockTryUnassignRole).not.toHaveBeenCalled();

        expect(mockTryAssignRole).toHaveBeenCalledTimes(2);
        expect(mockTryAssignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-1',
        });
        expect(mockTryAssignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'user-2',
        });
      });

      it('should filter by Owner role when processing owners', async () => {
        const existingRoleAssignments = [
          { user: 'owner-user-1', role: 'Owner' },
          { user: 'contributor-user-1', role: 'Contributor' },
          { user: 'owner-user-2', role: 'Owner' },
        ];

        const processUserRoleChanges =
          createUserRoleChangesProcessor(builderProps);

        await processUserRoleChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredUsersForRole: [{ userId: 'owner-user-2' }],
          role: 'Owner',
          existingRoleAssignments,
        });

        // Should unassign only owner-user-1, not contributor-user-1
        expect(mockTryUnassignRole).toHaveBeenCalledTimes(1);
        expect(mockTryUnassignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Owner',
          tenant: 'test-org',
          user: 'owner-user-1',
        });
      });
    });

    describe('contributors', () => {
      it('should remove old contributor role assignments and create new ones', async () => {
        const existingRoleAssignments = [
          { user: 'user-1', role: 'Contributor' },
          { user: 'user-2', role: 'Contributor' },
        ];

        const processUserRoleChanges =
          createUserRoleChangesProcessor(builderProps);

        await processUserRoleChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredUsersForRole: [{ userId: 'user-2' }, { userId: 'user-3' }],
          role: 'Contributor',
          existingRoleAssignments,
        });

        expect(mockTryUnassignRole).toHaveBeenCalledTimes(1);
        expect(mockTryUnassignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-1',
        });

        expect(mockTryAssignRole).toHaveBeenCalledTimes(2);
        expect(mockTryAssignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-2',
        });
        expect(mockTryAssignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-3',
        });
      });

      it('should remove old contributor role assignments without creating new ones if not needed', async () => {
        const existingRoleAssignments = [
          { user: 'user-1', role: 'Contributor' },
          { user: 'user-2', role: 'Contributor' },
        ];

        const processUserRoleChanges =
          createUserRoleChangesProcessor(builderProps);

        await processUserRoleChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredUsersForRole: [],
          role: 'Contributor',
          existingRoleAssignments,
        });

        expect(mockTryUnassignRole).toHaveBeenCalledTimes(2);
        expect(mockTryUnassignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-1',
        });
        expect(mockTryUnassignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-2',
        });

        expect(mockTryAssignRole).not.toHaveBeenCalled();
      });

      it('should not remove old contributor role assignments if none present but create new ones as needed', async () => {
        const processUserRoleChanges =
          createUserRoleChangesProcessor(builderProps);

        await processUserRoleChanges({
          ...baseParams,
          op: PermissionsOperation.Update,
          desiredUsersForRole: [{ userId: 'user-1' }, { userId: 'user-2' }],
          role: 'Contributor',
          existingRoleAssignments: [],
        });

        expect(mockTryUnassignRole).not.toHaveBeenCalled();

        expect(mockTryAssignRole).toHaveBeenCalledTimes(2);
        expect(mockTryAssignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-1',
        });
        expect(mockTryAssignRole).toHaveBeenCalledWith({
          resource_instance: 'rs_node:test-object-id',
          role: 'Contributor',
          tenant: 'test-org',
          user: 'user-2',
        });
      });
    });
  });
});
