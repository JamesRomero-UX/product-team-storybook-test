import type { GetUserSearchPreferencesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { act, renderHook, waitFor } from '@testing-library/react';
import { mockedUpsertRecentUsersResponses } from 'src/testing/mock-data/mockedUpsertRecentUsersResponses';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import { getWrapper } from 'src/testing/wrapper';

import useRecentUsers from './useRecentUsers';

describe('useRecentUsers', () => {
  const defaultUserSearchPreferences: GetUserSearchPreferencesQuery['user_search_preferences'][number] =
    {
      RecentUserIds: [],
      ShowGroups: true,
      FilterByActivePlatformUsers: false,
      ShowUserPlatformRole: true,
      ShowUserJobTitle: false,
      ShowDirectoryDepartment: false,
      ShowUserLocation: false,
      ShowUserEmail: true,
      ShowArchivedUsers: false,
      ShowInheritedContributors: false,
    };

  it('initially returns 0 users', async () => {
    const { result } = renderHook(() => useRecentUsers(), {
      wrapper: getWrapper([mockedUserSearchPreferencesResponses()], 'graphql'),
    });
    await waitFor(() => expect(result.current.loading).toEqual(false));
    expect(result.current.users.length).toEqual(0);
  });

  it('does not automatically return users that have been added', async () => {
    const { result } = renderHook(() => useRecentUsers(), {
      wrapper: getWrapper([mockedUserSearchPreferencesResponses()], 'graphql'),
    });
    await waitFor(() => expect(result.current.loading).toEqual(false));
    await act(async () => {
      result.current.add('user1');
    });

    await waitFor(() => expect(result.current.hasPendingChanges).toEqual(true));

    expect(result.current.users.length).toEqual(0);
  });

  it('returns committed users', async () => {
    const { result } = renderHook(() => useRecentUsers(), {
      wrapper: getWrapper(
        [
          mockedUserSearchPreferencesResponses(),
          mockedUpsertRecentUsersResponses({
            RecentUserIds: ['user1'],
          }),
          mockedUserSearchPreferencesResponses({
            user_search_preferences: [
              {
                ...defaultUserSearchPreferences,
                RecentUserIds: ['user1'],
              },
            ],
          }),
        ],
        'graphql'
      ),
    });

    await waitFor(() => expect(result.current.loading).toEqual(false));
    await act(async () => {
      await result.current.add('user1');
    });
    await waitFor(() => expect(result.current.hasPendingChanges).toEqual(true));

    await act(async () => {
      await result.current.commit();
    });
    await waitFor(() => expect(result.current.loading).toEqual(false));

    expect(result.current.users.length).toEqual(1);
    expect(result.current.users).toEqual(['user1']);
  });

  it('returns up to 5 committed users', async () => {
    const { result } = renderHook(() => useRecentUsers(), {
      wrapper: getWrapper(
        [
          mockedUserSearchPreferencesResponses(),
          mockedUpsertRecentUsersResponses({
            RecentUserIds: ['user5', 'user4', 'user3', 'user2', 'user1'],
          }),
          mockedUserSearchPreferencesResponses({
            user_search_preferences: [
              {
                ...defaultUserSearchPreferences,
                RecentUserIds: ['user5', 'user4', 'user3', 'user2', 'user1'],
              },
            ],
          }),
        ],
        'graphql'
      ),
    });
    await waitFor(() => expect(result.current.loading).toEqual(false));
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        result.current.add(`user${i}`);
      });
      await waitFor(() =>
        expect(result.current.hasPendingChanges).toEqual(true)
      );
    }

    await act(async () => {
      await result.current.commit();
    });

    await waitFor(() => expect(result.current.loading).toEqual(false));

    expect(result.current.users.length).toEqual(5);
    expect(result.current.users).toEqual([
      'user5',
      'user4',
      'user3',
      'user2',
      'user1',
    ]);
  });

  it('oldest added user removed after max of 5 users reached', async () => {
    const { result } = renderHook(() => useRecentUsers(), {
      wrapper: getWrapper(
        [
          mockedUserSearchPreferencesResponses(),
          mockedUpsertRecentUsersResponses({
            RecentUserIds: ['user6', 'user5', 'user4', 'user3', 'user2'],
          }),
          mockedUserSearchPreferencesResponses({
            user_search_preferences: [
              {
                ...defaultUserSearchPreferences,
                RecentUserIds: ['user6', 'user5', 'user4', 'user3', 'user2'],
              },
            ],
          }),
        ],
        'graphql'
      ),
    });
    await waitFor(() => expect(result.current.loading).toEqual(false));
    for (let i = 0; i < 7; i++) {
      await act(async () => {
        result.current.add(`user${i}`);
      });
      await waitFor(() =>
        expect(result.current.hasPendingChanges).toEqual(true)
      );
    }

    await act(async () => {
      await result.current.commit();
    });
    await waitFor(() => expect(result.current.loading).toEqual(false));

    expect(result.current.users.length).toEqual(5);
    expect(result.current.users).toEqual([
      'user6',
      'user5',
      'user4',
      'user3',
      'user2',
    ]);
  });

  it('duplicate added users are added to the front of the queue', async () => {
    const { result } = renderHook(() => useRecentUsers(), {
      wrapper: getWrapper(
        [
          mockedUserSearchPreferencesResponses(),
          mockedUpsertRecentUsersResponses({
            RecentUserIds: ['user4', 'user5', 'user3', 'user2', 'user1'],
          }),
          mockedUserSearchPreferencesResponses({
            user_search_preferences: [
              {
                ...defaultUserSearchPreferences,
                RecentUserIds: ['user4', 'user5', 'user3', 'user2', 'user1'],
              },
            ],
          }),
        ],
        'graphql'
      ),
    });
    await waitFor(() => expect(result.current.loading).toEqual(false));
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        result.current.add(`user${i}`);
      });

      await waitFor(() =>
        expect(result.current.hasPendingChanges).toEqual(true)
      );
    }
    await act(async () => {
      result.current.add('user4');
    });

    await waitFor(() => expect(result.current.hasPendingChanges).toEqual(true));
    await act(async () => {
      result.current.commit();
    });

    await waitFor(() => expect(result.current.loading).toEqual(false));

    expect(result.current.users.length).toEqual(5);
    expect(result.current.users).toEqual([
      'user4',
      'user5',
      'user3',
      'user2',
      'user1',
    ]);
  });
});
