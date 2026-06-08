import type { Logger } from '@aws-lambda-powertools/logger';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsOperation } from '../../types';
import type { CreateUserGroupChangesProcessorProps } from './process-user-group-changes';
import { createUserGroupChangesProcessor } from './process-user-group-changes';

describe('process-user-group-changes', () => {
  const mockLogger: Partial<Logger> = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
    debug: vi.fn(),
  };

  const mockTryCreateUserGroup = vi.fn();

  const builderProps: CreateUserGroupChangesProcessorProps = {
    logger: mockLogger as Logger,
    tryCreateUserGroup: mockTryCreateUserGroup,
  };

  const TEST_USER_GROUP_ID = 'a1b2c3d4-uuid';
  const TEST_ORG_KEY = 'org_abc123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockTryCreateUserGroup.mockResolvedValue(undefined);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Insert operation', () => {
    it('should call tryCreateUserGroup with the correct userGroupId and orgKey', async () => {
      const processUserGroupChanges =
        createUserGroupChangesProcessor(builderProps);

      await processUserGroupChanges({
        op: PermissionsOperation.Insert,
        userGroupId: TEST_USER_GROUP_ID,
        orgKey: TEST_ORG_KEY,
      });

      expect(mockTryCreateUserGroup).toHaveBeenCalledExactlyOnceWith(
        TEST_USER_GROUP_ID,
        TEST_ORG_KEY
      );
    });

    it('should propagate errors thrown by tryCreateUserGroup', async () => {
      mockTryCreateUserGroup.mockRejectedValueOnce(
        new Error('Permit API error')
      );
      const processUserGroupChanges =
        createUserGroupChangesProcessor(builderProps);

      await expect(
        processUserGroupChanges({
          op: PermissionsOperation.Insert,
          userGroupId: TEST_USER_GROUP_ID,
          orgKey: TEST_ORG_KEY,
        })
      ).rejects.toThrow('Permit API error');
    });
  });
});
