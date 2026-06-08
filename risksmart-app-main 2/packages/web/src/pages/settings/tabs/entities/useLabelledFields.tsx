import { useMemo } from 'react';
import { getAllOwnersCellValue } from 'src/rbac/contributorHelper';

import type { EntityFields, EntityRegisterFields } from './types';

export const useLabelledFields = (
  data: EntityFields[] | undefined
): EntityRegisterFields[] => {
  return useMemo(() => {
    return (
      data?.map((record) => ({
        ...record,
        ParentTitle: record.parent?.Name ?? '-',
        CreatedByUser: record.createdByUser?.FriendlyName ?? '-',
        ModifiedByUser: record.modifiedByUser?.FriendlyName ?? '-',
        Description: record.Description ?? '-',
        allOwners: getAllOwnersCellValue(record),
      })) ?? []
    );
  }, [data]);
};
