import { useRating } from '@risksmart-app/components/src/hooks/useRating';

import type { DataImportFields, DataImportTableFields } from './types';

export const useLabelledFields = (
  records: DataImportFields[] | undefined
): DataImportTableFields[] => {
  const { getLabel } = useRating('data_import_status');

  return (
    records?.map((record) => ({
      ...record,
      ModifiedByUserName: record.modifiedByUser?.FriendlyName ?? '-',
      CreatedByUserName: record.createdByUser?.FriendlyName ?? '-',
      StatusLabel: getLabel(record.Status),
    })) ?? []
  );
};
