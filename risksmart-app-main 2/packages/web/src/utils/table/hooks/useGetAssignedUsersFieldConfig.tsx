import { useQuery } from '@apollo/client';
import {
  GetUserGroupsDocument,
  GetUsersDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import BadgeList from 'src/components/badge-list';

import { toSingleCell } from '@/utils/table/utils/cellUtils';
import { createIdLabelFieldPropertyFilter } from '@/utils/table/utils/filterUtils';

import type { FieldConfig } from '../types';

export function useGetAssignedUsersFieldConfig<
  T extends {
    Id: string;
    allAssignedUsers: { label: string; id: string }[];
  },
>(header: string): FieldConfig<T> {
  const { data: users } = useQuery(GetUsersDocument);
  const { data: userGroups } = useQuery(GetUserGroupsDocument);
  const userOptions = useMemo(
    () =>
      users?.user.map((u) => ({
        label: u.FriendlyName ?? '',
        id: u.Id ?? '',
      })) ?? [],
    [users?.user]
  );
  const groupOptions = useMemo(
    () =>
      userGroups?.user_group.map((u) => ({ label: u.Name, id: u.Id })) ?? [],
    [userGroups?.user_group]
  );

  return useMemo(
    () => ({
      header,
      cell: (item) => (
        <BadgeList badges={item.allAssignedUsers.map((u) => u.label)} />
      ),
      filterOptions: {
        filteringProperties: createIdLabelFieldPropertyFilter([
          ...userOptions,
          ...groupOptions,
        ]),
        filteringOptions: [...userOptions, ...groupOptions].map((u) => ({
          value: u.id,
          label: u.label,
        })),
      },
      sortingComparator: (a, b) => {
        const ownersA = toSingleCell(a.allAssignedUsers);
        const ownersB = toSingleCell(b.allAssignedUsers);

        return ownersA.localeCompare(ownersB);
      },
      exportVal: (item) =>
        item.allAssignedUsers.map((u) => u.label || '').join(','),
    }),
    [groupOptions, header, userOptions]
  );
}
