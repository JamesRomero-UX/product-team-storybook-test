import type { Logger } from '@aws-lambda-powertools/logger';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { CreateUserChangesProcessorProps } from './process-user-changes';
import { createUserChangesProcessor } from './process-user-changes';

describe('process-user-changes', () => {
  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockTryCreateUser = vi.fn();
  const mockTryDeleteUser = vi.fn();

  const builderProps: CreateUserChangesProcessorProps = {
    logger: mockLogger as Logger,
    tryCreateUser: mockTryCreateUser,
    tryDeleteUser: mockTryDeleteUser,
  };

  const TEST_USER_ID = 'auth0|abc123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockTryCreateUser.mockResolvedValue(undefined);
    mockTryDeleteUser.mockResolvedValue(undefined);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Insert operation', () => {
    it('should call tryCreateUser with the correct key', async () => {
      const processUserChanges = createUserChangesProcessor(builderProps);

      await processUserChanges({
        op: PermissionsOperation.Insert,
        userId: TEST_USER_ID,
      });

      expect(mockTryCreateUser).toHaveBeenCalledExactlyOnceWith({
        key: TEST_USER_ID,
      });
    });

    it('should propagate errors thrown by tryCreateUser', async () => {
      mockTryCreateUser.mockRejectedValueOnce(new Error('Permit API error'));
      const processUserChanges = createUserChangesProcessor(builderProps);

      await expect(
        processUserChanges({
          op: PermissionsOperation.Insert,
          userId: TEST_USER_ID,
        })
      ).rejects.toThrow('Permit API error');
    });
  });

  describe('Delete operation', () => {
    it('should call tryDeleteUser with the correct key', async () => {
      const processUserChanges = createUserChangesProcessor(builderProps);

      await processUserChanges({
        op: PermissionsOperation.Delete,
        userId: TEST_USER_ID,
      });

      expect(mockTryDeleteUser).toHaveBeenCalledExactlyOnceWith({
        key: TEST_USER_ID,
      });
    });

    it('should propagate errors thrown by tryDeleteUser', async () => {
      mockTryDeleteUser.mockRejectedValueOnce(new Error('Permit API error'));
      const processUserChanges = createUserChangesProcessor(builderProps);

      await expect(
        processUserChanges({
          op: PermissionsOperation.Delete,
          userId: TEST_USER_ID,
        })
      ).rejects.toThrow('Permit API error');
    });
  });
});
