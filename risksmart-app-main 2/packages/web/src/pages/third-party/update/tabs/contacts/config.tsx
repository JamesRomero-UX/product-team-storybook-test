import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { ThirdPartyContactWithStatus } from './types';

type OnClickEvent = (item: ThirdPartyContactWithStatus) => void;

const useGetFieldConfig = (
  onClick?: OnClickEvent
): TableFields<ThirdPartyContactWithStatus> => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts.columns',
  });
  const { t: commonT } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { getByValue: getByValueContactStatus } = useRating(
    'third_party_contact_status'
  );

  return useMemo(
    () => ({
      Email: {
        header: t('email'),
        cell: (item) =>
          onClick ? (
            <Link variant={'secondary'} onFollow={() => onClick(item)}>
              {item.Email}
            </Link>
          ) : (
            item.Email
          ),
        sortingField: 'Email',
        isRowHeader: true,
      },
      Name: {
        header: t('name'),
        cell: (item) => item.Name ?? '-',
        sortingField: 'Name',
      },
      JobTitle: {
        header: t('jobTitle'),
        cell: (item) => item.JobTitle ?? '-',
        sortingField: 'JobTitle',
      },
      status: {
        header: t('status'),
        cell: (item) => {
          const rating = getByValueContactStatus(item.status);

          return (
            <SimpleRatingBadge rating={rating}>
              {rating?.label}
            </SimpleRatingBadge>
          );
        },
        sortingField: 'status',
      },
      lastLogin: {
        header: t('lastLogin'),
        cell: (item) =>
          item.lastLogin ? new Date(item.lastLogin).toLocaleString() : '-',
        sortingField: 'lastLogin',
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: commonT('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
    }),
    [t, commonT, onClick, getByValueContactStatus]
  );
};

const useGetContactsTablePropsOptions = (
  records: ThirdPartyContactWithStatus[] | undefined,
  onClick?: OnClickEvent
): UseGetTablePropsOptions<ThirdPartyContactWithStatus> => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'third_party.contacts',
  });
  const fields = useGetFieldConfig(onClick);

  return useMemo(
    () => ({
      data: records,
      tableId: 'thirdPartyContactsTable',
      fields,
      customAttributeFormIds: [],
      entityLabel: t('entity_name'),
      enableFiltering: true,
      initialColumns: ['Email', 'Name', 'JobTitle', 'status', 'lastLogin'],
      preferencesStorageKey: 'ThirdPartyContactsTable-Preferences',
    }),
    [records, fields, t]
  );
};

export const useGetContactsTableProps = (
  records: ThirdPartyContactWithStatus[] | undefined,
  onClick?: OnClickEvent
): TablePropsWithActions<ThirdPartyContactWithStatus> => {
  const props = useGetContactsTablePropsOptions(records, onClick);

  return useGetTableProps(props);
};
