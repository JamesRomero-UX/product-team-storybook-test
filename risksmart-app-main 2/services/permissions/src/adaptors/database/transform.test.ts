import { describe, expect, it } from 'vitest';

import {
  mapEnrichedUserGroupsToUserGroupItems,
  mapEnrichedUserGroupToUserGroupItem,
  mapEnrichedUsersToUserItems,
  mapEnrichedUserToUserItem,
} from './transform';

describe('mappers', () => {
  describe('mapEnrichedUserToUserItem', () => {
    it('should map enriched user to user item', () => {
      const enrichedUser = { UserId: 'user-123' };

      const result = mapEnrichedUserToUserItem(enrichedUser);

      expect(result).toEqual({ userId: 'user-123' });
    });
  });

  describe('mapEnrichedUsersToUserItems', () => {
    it('should map an array of enriched users to user items', () => {
      const enrichedUsers = [
        { UserId: 'user-1' },
        { UserId: 'user-2' },
        { UserId: 'user-3' },
      ];

      const result = mapEnrichedUsersToUserItems(enrichedUsers);

      expect(result).toEqual([
        { userId: 'user-1' },
        { userId: 'user-2' },
        { userId: 'user-3' },
      ]);
    });
  });

  describe('mapEnrichedUserGroupToUserGroupItem', () => {
    it('should map enriched user group to user group item', () => {
      const enrichedUserGroup = { UserGroupId: 'group-123' };

      const result = mapEnrichedUserGroupToUserGroupItem(enrichedUserGroup);

      expect(result).toEqual({ userGroupId: 'group-123' });
    });
  });

  describe('mapEnrichedUserGroupsToUserGroupItems', () => {
    it('should map an array of enriched user groups to user group items', () => {
      const enrichedUserGroups = [
        { UserGroupId: 'group-1' },
        { UserGroupId: 'group-2' },
        { UserGroupId: 'group-3' },
      ];

      const result = mapEnrichedUserGroupsToUserGroupItems(enrichedUserGroups);

      expect(result).toEqual([
        { userGroupId: 'group-1' },
        { userGroupId: 'group-2' },
        { userGroupId: 'group-3' },
      ]);
    });
  });
});
