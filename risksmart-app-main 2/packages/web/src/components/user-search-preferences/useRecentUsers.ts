import { useMutation, useQuery } from '@apollo/client';
import {
  GetUserSearchPreferencesDocument,
  UpsertRecentUsersDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { evictField } from '@/utils/graphqlUtils';

type RecentUsersResponse = {
  /**
   * Add a recent user.
   * Note, these won't be made available in recentlySelectedUsers
   * @param userId
   * @returns
   */
  add: (userId: string) => void;
  /**
   * Commit new recent users to local storage
   * @returns
   */
  commit: () => Promise<void>;
  hasPendingChanges: boolean;
  loading: boolean;
  users: string[];
};

const useRecentUsers = (): RecentUsersResponse => {
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: recentUsers } = useQuery(GetUserSearchPreferencesDocument, {});
  const users = useMemo(
    () => recentUsers?.user_search_preferences?.[0]?.RecentUserIds ?? [],
    [recentUsers?.user_search_preferences]
  );
  const [upsetRecentUsers] = useMutation(UpsertRecentUsersDocument, {
    update: (cache) => {
      evictField(cache, 'user_search_preferences');
    },
  });

  useEffect(() => {
    // ensure local users are kept up to date when database records have changed.
    // Important when we have multiple user controls on same form
    setLocalRecentUsers(users);
    setLoading(false);
  }, [users]);

  const [localRecentUsers, setLocalRecentUsers] = useState<string[]>([]);

  const recentUsersQueueSize = 5;

  const add = useCallback(
    (userId: string) => {
      let idsToKeep: string[] = [];
      if (localRecentUsers.includes(userId)) {
        // Move user to front of queue
        idsToKeep = localRecentUsers.filter((id) => id !== userId);
      } else if (localRecentUsers.length >= recentUsersQueueSize) {
        // Remove oldest item, and new item
        idsToKeep = localRecentUsers.slice(0, recentUsersQueueSize - 1);
      } else {
        idsToKeep = localRecentUsers;
      }

      setLocalRecentUsers([userId, ...idsToKeep]);
      setHasPendingChanges(true);
    },
    [localRecentUsers]
  );

  const commit = useCallback(async () => {
    setLoading(true);
    await upsetRecentUsers({ variables: { RecentUserIds: localRecentUsers } });
    setLoading(false);
  }, [localRecentUsers, upsetRecentUsers]);

  return {
    add,
    commit,
    users,
    hasPendingChanges,
    loading,
  };
};

export default useRecentUsers;
