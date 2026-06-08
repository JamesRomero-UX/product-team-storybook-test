import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { GetDataExportScheduleExecutionsSubscription } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge/SimpleRatingBadge';

import type { CollectionData } from '@/utils/collectionUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

export type ExportExecutionFields = CollectionData<
  GetDataExportScheduleExecutionsSubscription['data_export_schedule_execution'][0]
>;

export type ExportExecutionTableFields = ExportExecutionFields & {
  ActiveSchedule: boolean;
  StatusLabelled: string;
  Frequency: string;
  StartDate: string;
  EndDate: string;
};

export const useGetCollectionTableProps = (
  records: ExportExecutionFields[],
  activeScheduleId: string | null
): TablePropsWithActions<ExportExecutionTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'dataExport' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'dataExport.columns',
  });
  const { getByValue, getLabel } = useRating('data_export_execution_status');

  const labelledFields = useMemo<ExportExecutionTableFields[]>(
    () =>
      records?.map((record) => {
        return {
          ...record,
          ActiveSchedule: record.ParentId === activeScheduleId,
          StatusLabelled: getLabel(record.Status),
          Frequency: record?.dataExportSchedule?.Frequency ?? '-',
          StartDate: record?.dataExportSchedule?.StartTimestamp ?? '-',
          EndDate: record?.dataExportSchedule?.EndTimestamp ?? '-',
        };
      }),
    [records, activeScheduleId, getLabel]
  );

  const fields: TableFields<ExportExecutionTableFields> = {
    ExecutionTimestamp: dateColumnFromConfig({
      header: { header: st('executionTimestamp') },
      dateField: 'ExecutionTimestamp',
      includeTime: true,
    }),
    StatusLabelled: {
      header: st('status'),
      cell: (item) => <SimpleRatingBadge rating={getByValue(item.Status)} />,
    },
    Errors: {
      header: st('errors'),
    },
    ActiveSchedule: {
      header: st('activeSchedule'),
      cell: (c) => (c.ActiveSchedule ? t('yes') : t('no')),
    },
    Frequency: {
      header: st('frequency'),
      cell: (item) =>
        item.Frequency.charAt(0).toUpperCase() + item.Frequency.slice(1),
    },
    StartDate: dateColumnFromConfig({
      header: { header: st('startDate') },
      dateField: 'StartDate',
      includeTime: false,
    }),
    EndDate: dateColumnFromConfig({
      header: { header: st('endDate') },
      dateField: 'EndDate',
      includeTime: false,
    }),
  };

  return useGetTableProps({
    customAttributeFormIds: [],
    tableId: 'dataExportExecutionRegister',
    data: labelledFields,
    entityLabel: t('entity_name'),
    fields,
    initialColumns: [
      'ExecutionTimestamp',
      'StatusLabelled',
      'Errors',
      'ActiveSchedule',
      'Frequency',
      'StartDate',
      'EndDate',
    ],
    defaultSortingState: {
      sortingColumn: 'ExecutionTimestamp',
      sortingDirection: 'desc',
    },
    preferencesStorageKey: 'DataExportExecutionTable-Preferences',
  });
};
