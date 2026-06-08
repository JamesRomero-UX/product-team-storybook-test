import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';

import Link from '@/components/link';
import type { UseGetTablePropsOptions } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { customDatasourceUrl } from '@/utils/urls';

import type { CustomDatasource, CustomDatasourceTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<CustomDatasourceTableFields> => {
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'customDatasources.columns',
  });

  return useMemo(
    () => ({
      Title: {
        header: st('title'),
        cell: (item) => (
          <Link variant={'secondary'} href={customDatasourceUrl(item.Id)}>
            {item.Title}
          </Link>
        ),
        maxWidth: MAX_COL_WIDTH,
        isRowHeader: true,
      },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: st('createdOn') },
        dateField: 'CreatedAtTimestamp',
      }),
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: st('updatedOn') },
        dateField: 'ModifiedAtTimestamp',
      }),
      ModifiedByUser: {
        header: st('updatedById'),
      },
      ModifiedByUserName: {
        header: st('updatedByUsername'),
      },
      Id: {
        header: st('guid'),
      },
    }),
    [st]
  );
};

const useGetCustomDataSourceTableProps = (
  records: CustomDatasource[] | undefined
): UseGetTablePropsOptions<CustomDatasourceTableFields> => {
  const { t: stc } = useTranslation(['common']);

  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records);

  return useMemo(
    () => ({
      customAttributeFormIds: [],
      tableId: 'customDatasourceRegister',
      data: labelledFields,
      entityLabel: stc('customDatasources.entity_name'),
      emptyCollectionAction: <></>,
      preferencesStorageKey: 'CustomDatasourceRegisterTable-Preferences',
      enableFiltering: true,
      initialColumns: ['Title'],
      fields,
    }),
    [fields, labelledFields, stc]
  );
};

export const useGetCollectionTableProps = (
  records: CustomDatasource[] | undefined
): TablePropsWithActions<CustomDatasourceTableFields> => {
  const props = useGetCustomDataSourceTableProps(records);

  return useGetTableProps(props);
};
