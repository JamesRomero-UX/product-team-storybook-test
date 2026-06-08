import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';

import type { DataImportErrorFields } from './types';

const useGetFieldConfig = (): TableFields<DataImportErrorFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'dataImportResult.columns',
  });

  return useMemo(
    () => ({
      ImportObject: {
        header: st('importObject'),
      },
      RowNumber: {
        header: st('rowNumber'),
      },
      Message: {
        header: st('message'),
      },
    }),
    [st]
  );
};

const useGetDataImportErrorTableProps = (
  records: DataImportErrorFields[] | undefined
): UseGetTablePropsOptions<DataImportErrorFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'dataImportResult' });
  const fields = useGetFieldConfig();

  return {
    data: records,
    customAttributeFormIds: [],
    entityLabel: t('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'DataImportErrorTable-PreferencesV1',
    enableFiltering: true,
    initialColumns: ['RowNumber', 'ImportObject', 'Message'],
    fields,
  };
};

export const useGetCollectionTableProps = (
  records: DataImportErrorFields[] | undefined
): TablePropsWithActions<DataImportErrorFields> => {
  const props = useGetDataImportErrorTableProps(records);

  return useGetTableProps(props);
};
