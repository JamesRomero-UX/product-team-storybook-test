import _ from 'lodash';
import { useMemo } from 'react';

import type { CustomDatasource, CustomDatasourceTableFields } from './types';

export const useLabelledFields = (records: CustomDatasource[] | undefined) => {
  return useMemo<CustomDatasourceTableFields[] | undefined>(
    () =>
      records?.map((d) => ({
        Id: d.Id,
        Title: d.Title,
        ModifiedByUser: d.ModifiedByUser,
        CreatedByUser: d.CreatedByUser,
        CreatedAtTimestamp: d.CreatedAtTimestamp,
        ModifiedAtTimestamp: d.ModifiedAtTimestamp,
        CreatedByUserName: d.createdByUser?.FriendlyName || '-',
        ModifiedByUserName: d.modifiedByUser?.FriendlyName || '-',
      })),
    [records]
  );
};
