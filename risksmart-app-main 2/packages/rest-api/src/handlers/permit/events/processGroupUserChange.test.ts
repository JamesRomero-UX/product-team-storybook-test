import type { PermitSDK } from '@risksmart-app/permitio/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { processGroupUserChange } from './processGroupUserChange';

const mockPermitRsSDK = {
  addUserToGroup: vi.fn(),
  removeUserFromGroup: vi.fn(),
} as unknown as PermitSDK;

afterEach(() => {
  vi.clearAllMocks();
});

describe('processGroupUserChange', () => {
  describe('when UserId is not provided', () => {
    it('should skip processing', async () => {
      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-group-id',
        UserId: undefined,
      };

      await processGroupUserChange(mockPermitRsSDK, config);

      expect(mockPermitRsSDK.addUserToGroup).not.toHaveBeenCalled();
      expect(mockPermitRsSDK.removeUserFromGroup).not.toHaveBeenCalled();
    });
  });

  describe('when OP is INSERT', () => {
    it('should add user to group', async () => {
      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-group-id',
        UserId: 'test-user-id',
      };

      await processGroupUserChange(mockPermitRsSDK, config);

      expect(mockPermitRsSDK.addUserToGroup).toHaveBeenCalledWith(
        'test-group-id',
        'test-user-id',
        'test-org'
      );
    });
  });

  describe('when OP is DELETE', () => {
    it('should remove user from group', async () => {
      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-group-id',
        UserId: 'test-user-id',
      };

      await processGroupUserChange(mockPermitRsSDK, config);

      expect(mockPermitRsSDK.removeUserFromGroup).toHaveBeenCalledWith(
        'test-group-id',
        'test-user-id',
        'test-org'
      );
    });
  });

  describe('when OP is UPDATE', () => {
    it('should not perform any action', async () => {
      const config = {
        OP: 'UPDATE' as const,
        OrgKey: 'test-org',
        Id: 'test-group-id',
        UserId: 'test-user-id',
      };

      await processGroupUserChange(mockPermitRsSDK, config);

      expect(mockPermitRsSDK.addUserToGroup).not.toHaveBeenCalled();
      expect(mockPermitRsSDK.removeUserFromGroup).not.toHaveBeenCalled();
    });
  });
});
