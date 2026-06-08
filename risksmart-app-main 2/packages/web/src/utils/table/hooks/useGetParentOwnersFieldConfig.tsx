import { useQuery } from '@apollo/client';
import { GetUsersDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import BadgeList from 'src/components/badge-list';
import type { LabelledIdArray } from 'src/rbac/types';

import { createIdLabelFieldPropertyFilter } from '@/utils/table/utils/filterUtils';

import type { FieldConfig } from '../types';

export function useGetParentOwnersFieldConfig<
  T extends { parentOwners: LabelledIdArray },
>(): FieldConfig<T> {
  const { data: users } = useQuery(GetUsersDocument);
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const userOptions =
    users?.user.map((u) => ({ label: u.FriendlyName ?? '', id: u.Id ?? '' })) ??
    [];

  return {
    header: t('parentOwners', 'Parent Owner'),
    cell: (item) => (
      <BadgeList badges={item.parentOwners.map((owner) => owner.label)} />
    ),
    filterOptions: {
      filteringProperties: createIdLabelFieldPropertyFilter(userOptions),
      filteringOptions: userOptions.map((u) => ({
        value: u.id,
        label: u.label,
      })),
    },
    sortingComparator: (a, b) => {
      const ownersA = a.parentOwners.map((owner) => owner.label).join(', ');
      const ownersB = b.parentOwners.map((owner) => owner.label).join(', ');

      return ownersA.localeCompare(ownersB);
    },
    exportVal: (item) =>
      item.parentOwners.map((owner) => owner.label).join(', '),
    id: 'parentOwners',
  };
}
