import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLogger } from '../../logger';
import type { TenantSyncStats } from './common';
import { createUserSyncHandler, executeUserSync } from './permit-user-sync';
const logger = getLogger();
describe('permit-user-sync', () => {
  let mockUserRetriever: ReturnType<typeof vi.fn>;
  let mockUserCreator: ReturnType<typeof vi.fn>;
  let mockSyncStats: TenantSyncStats;
  let mockPermitUserMap: Map<string, unknown>;
  let mockUnassignedUsers: Set<string>;

  beforeEach(() => {
    mockUserRetriever = vi.fn();
    mockUserCreator = vi.fn();

    mockSyncStats = {
      tenant: 'test-tenant',
      usersCreated: 0,
      usersDeleted: 0,
      orgStats: [],
      timeMs: 0,
    };

    mockPermitUserMap = new Map();
    mockUnassignedUsers = new Set();
  });

  describe('createUserSyncHandler', () => {
    it('should create a handler with executeUserSync method', () => {
      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      const handler = createUserSyncHandler(dependencies);

      expect(handler).toHaveProperty('executeUserSync');
      expect(typeof handler.executeUserSync).toBe('function');
    });
  });

  describe('executeUserSync', () => {
    const mockUsers = [{ Id: 'user1' }, { Id: 'user2' }, { Id: 'user3' }];

    beforeEach(() => {
      mockUserRetriever.mockResolvedValue(mockUsers);
      mockUserCreator.mockResolvedValue(undefined);
    });

    it('should process users correctly', async () => {
      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserRetriever).toHaveBeenCalled();
    });

    it('should create users that do not exist in permit', async () => {
      // Add one user to permit map
      mockPermitUserMap.set('user2', {});

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserCreator).toHaveBeenCalledWith(['user1', 'user3']);
      expect(mockSyncStats.usersCreated).toBe(2);
    });

    it('should not create users that already exist in permit', async () => {
      // Add all users to permit map
      mockPermitUserMap.set('user1', {});
      mockPermitUserMap.set('user2', {});
      mockPermitUserMap.set('user3', {});

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserCreator).not.toHaveBeenCalled();
      expect(mockSyncStats.usersCreated).toBe(0);
    });

    it('should not create users that exist as unassigned users in permit', async () => {
      // Add user2 as an unassigned user in permit
      mockUnassignedUsers.add('user2');

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserCreator).toHaveBeenCalledWith(['user1', 'user3']);
      expect(mockSyncStats.usersCreated).toBe(2);
    });

    it('should not create users that exist in either permit map or unassigned users', async () => {
      // Add user1 to permit map
      mockPermitUserMap.set('user1', {});
      // Add user2 as an unassigned user
      mockUnassignedUsers.add('user2');

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserCreator).toHaveBeenCalledWith(['user3']);
      expect(mockSyncStats.usersCreated).toBe(1);
    });

    it('should handle empty user list gracefully', async () => {
      mockUserRetriever.mockResolvedValue([]);

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserCreator).not.toHaveBeenCalled();
      expect(mockSyncStats.usersCreated).toBe(0);
    });

    it('should create all users when permit map and unassigned users are empty', async () => {
      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserCreator).toHaveBeenCalledWith(['user1', 'user2', 'user3']);
      expect(mockSyncStats.usersCreated).toBe(3);
    });

    it('should handle partial user overlap correctly', async () => {
      // Add some users to permit map
      mockPermitUserMap.set('user1', {});
      mockPermitUserMap.set('user4', {}); // User not in current org

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserCreator).toHaveBeenCalledWith(['user2', 'user3']);
      expect(mockSyncStats.usersCreated).toBe(2);
    });

    it('should update sync stats correctly', async () => {
      // Start with some existing stats
      mockSyncStats.usersCreated = 5;

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockSyncStats.usersCreated).toBe(8); // 5 + 3 new users
    });

    it('should handle user creation errors gracefully', async () => {
      mockUserCreator.mockRejectedValue(new Error('Creation failed'));

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await expect(executeUserSync(dependencies)).rejects.toThrow(
        'Creation failed'
      );
    });

    it('should handle user retrieval errors gracefully', async () => {
      mockUserRetriever.mockRejectedValue(new Error('Retrieval failed'));

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await expect(executeUserSync(dependencies)).rejects.toThrow(
        'Retrieval failed'
      );
    });

    it('should work with complex user IDs', async () => {
      const complexUsers = [
        { Id: 'auth0|644151efc3a961d2784456d9' },
        { Id: 'google-oauth2|12345' },
        { Id: 'email|user@example.com' },
      ];

      mockUserRetriever.mockResolvedValue(complexUsers);

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      expect(mockUserCreator).toHaveBeenCalledWith([
        'auth0|644151efc3a961d2784456d9',
        'google-oauth2|12345',
        'email|user@example.com',
      ]);
      expect(mockSyncStats.usersCreated).toBe(3);
    });

    it('should preserve existing permit user map', async () => {
      const originalSize = mockPermitUserMap.size;
      mockPermitUserMap.set('existing-user', { some: 'data' });

      const dependencies = {
        userRetriever: mockUserRetriever,
        userCreator: mockUserCreator,
        syncStats: mockSyncStats,
        tenantLogger: logger,
        permitUserMap: mockPermitUserMap,
        unassignedUsers: mockUnassignedUsers,
      };

      await executeUserSync(dependencies);

      // Map should not be modified
      expect(mockPermitUserMap.size).toBe(originalSize + 1);
      expect(mockPermitUserMap.has('existing-user')).toBe(true);
    });
  });
});
