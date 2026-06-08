import type { PermitSDK } from '@risksmart-app/permitio/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { processGroupChange } from './processGroupChange';

const mockPermitRsSDK = {
  createGroup: vi.fn(),
  deleteGroup: vi.fn(),
} as unknown as PermitSDK;

afterEach(() => {
  vi.clearAllMocks();
});

describe('processGroupChange', () => {
  describe('when OP is INSERT', () => {
    it('should create group', async () => {
      const config = {
        OP: 'INSERT' as const,
        OrgKey: 'test-org',
        Id: 'test-group-id',
      };

      await processGroupChange(mockPermitRsSDK, config);

      expect(mockPermitRsSDK.createGroup).toHaveBeenCalledWith(
        'test-group-id',
        'test-org'
      );
    });
  });

  describe('when OP is DELETE', () => {
    it('should delete group', async () => {
      const config = {
        OP: 'DELETE' as const,
        OrgKey: 'test-org',
        Id: 'test-group-id',
      };

      await processGroupChange(mockPermitRsSDK, config);

      expect(mockPermitRsSDK.deleteGroup).toHaveBeenCalledWith('test-group-id');
    });
  });

  describe('when OP is UPDATE', () => {
    it('should not perform any action', async () => {
      const config = {
        OP: 'UPDATE' as const,
        OrgKey: 'test-org',
        Id: 'test-group-id',
      };

      await processGroupChange(mockPermitRsSDK, config);

      expect(mockPermitRsSDK.createGroup).not.toHaveBeenCalled();
      expect(mockPermitRsSDK.deleteGroup).not.toHaveBeenCalled();
    });
  });
});
