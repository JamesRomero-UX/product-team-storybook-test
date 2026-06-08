import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import Link from '@risksmart-app/components/src/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { DataImportFields, DataImportTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<DataImportTableFields> => {
  const { t } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });
  const { getByValue } = useRating('data_import_status');

  return useMemo(
    () => ({
      Id: {
        header: t('guid'),
        cell: (data) => {
          return <Link href={data.Id}>{data.Id}</Link>;
        },
      },
      StatusLabel: {
        header: t('status'),
        cell: (data) => <SimpleRatingBadge rating={getByValue(data.Status)} />,
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      ModifiedByUser: { header: t('updated_by_id') },
      ModifiedByUserName: { header: t('updated_by_username') },
      CreatedByUserName: { header: t('created_by_username') },
    }),
    [getByValue, t]
  );
};

const useGetDataImportTableProps = (
  records: DataImportFields[] | undefined
): UseGetTablePropsOptions<DataImportTableFields> => {
  const labelledFields = useLabelledFields(records);
  const { t } = useTranslation(['common'], { keyPrefix: 'dataImport' });
  const fields = useGetFieldConfig();

  return {
    tableId: 'dataImportRegister',
    data: labelledFields,
    entityLabel: t('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'DataImportsRegisterTable-PreferencesV1',
    enableFiltering: true,
    initialColumns: [
      'Id',
      'StatusLabel',
      'CreatedByUserName',
      'CreatedAtTimestamp',
    ],
    fields,
    customAttributeFormIds: [],
  };
};

export const useGetCollectionTableProps = (
  records: DataImportFields[] | undefined
): TablePropsWithActions<DataImportTableFields> => {
  const props = useGetDataImportTableProps(records);

  return useGetTableProps(props);
};
