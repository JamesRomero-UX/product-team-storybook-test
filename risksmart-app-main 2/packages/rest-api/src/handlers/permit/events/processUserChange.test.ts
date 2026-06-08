import type { PermitSDK } from '@risksmart-app/permitio/types';
import type { Permit } from 'permitio';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { processUserChange } from './processUserChange';

const mockPermit = {
  api: {
    users: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
} as unknown as Permit;

const mockPermitRsSDK = {
  userExists: vi.fn(),
} as unknown as PermitSDK;

afterEach(() => {
  vi.clearAllMocks();
});

describe('processUserChange', () => {
  describe('when OP is DELETE', () => {
    it('should skip deletion if user does not exist', async () => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(false);

      const config = {
        OP: 'DELETE' as const,
        Id: 'test-user-id',
      };

      await processUserChange(mockPermit, mockPermitRsSDK, config);

      expect(mockPermitRsSDK.userExists).toHaveBeenCalledWith('test-user-id');
      expect(mockPermit.api.users.delete).not.toHaveBeenCalled();
    });

    it('should delete user if user exists', async () => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(true);

      const config = {
        OP: 'DELETE' as const,
        Id: 'test-user-id',
      };

      await processUserChange(mockPermit, mockPermitRsSDK, config);

      expect(mockPermitRsSDK.userExists).toHaveBeenCalledWith('test-user-id');
      expect(mockPermit.api.users.delete).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('when OP is INSERT', () => {
    it('should skip creation if user already exists', async () => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(true);

      const config = {
        OP: 'INSERT' as const,
        Id: 'test-user-id',
      };

      await processUserChange(mockPermit, mockPermitRsSDK, config);

      expect(mockPermitRsSDK.userExists).toHaveBeenCalledWith('test-user-id');

      expect(mockPermit.api.users.create).not.toHaveBeenCalled();
    });

    it('should create user if user does not exist', async () => {
      vi.mocked(mockPermitRsSDK.userExists).mockResolvedValue(false);

      const config = {
        OP: 'INSERT' as const,
        Id: 'test-user-id',
      };

      await processUserChange(mockPermit, mockPermitRsSDK, config);

      expect(mockPermitRsSDK.userExists).toHaveBeenCalledWith('test-user-id');
      expect(mockPermit.api.users.create).toHaveBeenCalledWith({
        key: 'test-user-id',
      });
    });
  });
});
