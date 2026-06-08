import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ApiClient } from 'src/providers/ExternalApiProvider';

import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

export type ExternalApiClientTableFields = ApiClient & {
  [key: string]: unknown;
};

export const useGetCollectionTableProps = (
  records: ApiClient[]
): TablePropsWithActions<ExternalApiClientTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'externalApi' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'externalApi.columns',
  });

  const labelledFields = useMemo<ExternalApiClientTableFields[]>(
    () =>
      records?.map((record) => {
        return {
          ...record,
        };
      }),
    [records]
  );

  const fields: TableFields<ExternalApiClientTableFields> = {
    name: {
      header: st('name'),
    },
    clientId: {
      header: st('clientKey'),
    },
    apiVersion: {
      header: st('apiVersion'),
    },
    status: {
      header: st('status'),
    },
    createdAt: dateColumnFromConfig({
      header: { header: st('createdAtTimestamp') },
      dateField: 'createdAt',
    }),
  };

  return useGetTableProps({
    tableId: 'externalApiClientsRegister',
    data: labelledFields,
    entityLabel: t('entity_name'),
    fields,
    initialColumns: ['name', 'clientId', 'apiVersion', 'status'],
    preferencesStorageKey: 'ExternalApiClientsSettingsTable-Preferences',
    customAttributeFormIds: [],
  });
};
