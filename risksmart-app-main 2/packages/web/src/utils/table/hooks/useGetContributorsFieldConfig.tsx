import { useQuery } from '@apollo/client';
import {
  GetUserGroupsDocument,
  GetUsersDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BadgeList from 'src/components/badge-list';
import { useDeepCompareMemoize } from 'use-deep-compare-effect';

import { toSingleCell } from '@/utils/table/utils/cellUtils';
import { createIdLabelFieldPropertyFilter } from '@/utils/table/utils/filterUtils';

import type { FieldConfig, Header } from '../types';

export function useGetContributorsFieldConfig<
  T extends {
    Id: string;
    allContributors: { label: string; id: string }[];
  },
>(header?: Header): FieldConfig<T> {
  const headerConfig = useDeepCompareMemoize(header);
  const { data: users } = useQuery(GetUsersDocument);
  const { data: userGroups } = useQuery(GetUserGroupsDocument);
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
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
      ...(headerConfig ?? { header: t('contributors') }),
      cell: (item) => (
        <BadgeList
          badges={item.allContributors.map((contributor) => contributor.label)}
        />
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
        const contributorsA = toSingleCell(a.allContributors);
        const contributorsB = toSingleCell(b.allContributors);

        return contributorsA.localeCompare(contributorsB);
      },
      exportVal: (item) =>
        item.allContributors
          .map((contributor) => contributor.label || '')
          .join(','),
    }),
    [groupOptions, t, userOptions, headerConfig]
  );
}
