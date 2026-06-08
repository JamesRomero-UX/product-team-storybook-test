import { useQuery } from '@apollo/client';
import {
  GetUserGroupsDocument,
  GetUsersDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BadgeList from 'src/components/badge-list';
import type { LabelledIdArray } from 'src/rbac/types';

import { createIdLabelFieldPropertyFilter } from '@/utils/table/utils/filterUtils';

import type { FieldConfig } from '../types';

export function useGetApproversFieldConfig<
  T extends { allApprovers: LabelledIdArray },
>(): FieldConfig<T> {
  const { data: users } = useQuery(GetUsersDocument);
  const { data: userGroups } = useQuery(GetUserGroupsDocument);
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const userOptions =
    users?.user.map((u) => ({ label: u.FriendlyName ?? '', id: u.Id ?? '' })) ??
    [];
  const groupOptions = useMemo(
    () =>
      userGroups?.user_group.map((u) => ({ label: u.Name, id: u.Id })) ?? [],
    [userGroups?.user_group]
  );

  return {
    header: t('approvers'),
    cell: (item) => (
      <BadgeList badges={item.allApprovers.map((approved) => approved.label)} />
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
      return (
        a.allApprovers?.[0]?.label.localeCompare(
          b.allApprovers?.[0]?.label ?? ''
        ) || 0
      );
    },
    exportVal: (item) => item.allApprovers.map((a) => a.label).join(', '),
  };
}
