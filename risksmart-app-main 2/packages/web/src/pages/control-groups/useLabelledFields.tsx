import { useMemo } from 'react';

import type { ControlGroupFlatFields, ControlGroupTableFields } from './types';

export const useLabelledFields = (
  records: ControlGroupFlatFields[] | undefined
) => {
  return useMemo<ControlGroupTableFields[] | undefined>(() => {
    return records?.map((d) => ({
      ...d,
      OwnerName: d.owner?.FriendlyName ?? null,
      LinkedControlCount: d.controls_aggregate.aggregate?.count ?? null,
      CreatedByUserName: d.createdByUser?.FriendlyName ?? null,
    }));
  }, [records]);
};
