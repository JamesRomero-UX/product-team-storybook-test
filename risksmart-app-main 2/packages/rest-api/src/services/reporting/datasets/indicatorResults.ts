import { getIndicatorResults as sharedDataset } from '@risksmart-app/shared/reporting/datasets/indicatorResults';

import { createDataset } from './types';

const relations = {
  schedule: {
    pgTable: 'risksmart.schedule' as const,
    columnMapping: [{ pk: 'Id' as const, fk: 'Id' as const }],
  },
  scheduleState: {
    pgTable: 'risksmart.schedule_state' as const,
    columnMapping: [{ pk: 'Id' as const, fk: 'Id' as const }],
  },
  createdBy: {
    pgTable: 'risksmart.user_view_active' as const,
    columnMapping: [{ pk: 'Id' as const, fk: 'CreatedByUser' as const }],
  },
  modifiedBy: {
    pgTable: 'risksmart.user_view_active' as const,
    columnMapping: [{ pk: 'Id' as const, fk: 'ModifiedByUser' as const }],
  },
};

const fields = {
  id: { fieldType: 'column' as const, pgColumn: 'Id' as const },
  details: { fieldType: 'column' as const, pgColumn: 'Description' as const },
  date: { fieldType: 'column' as const, pgColumn: 'ResultDate' as const },
  numberValue: {
    fieldType: 'column' as const,
    pgColumn: 'TargetValueNum' as const,
  },
  textValue: {
    fieldType: 'column' as const,
    pgColumn: 'TargetValueTxt' as const,
  },
  // Audit columns
  createdAtTimestamp: {
    fieldType: 'column' as const,
    pgColumn: 'CreatedAtTimestamp' as const,
  },
  modifiedAtTimestamp: {
    fieldType: 'column' as const,
    pgColumn: 'ModifiedAtTimestamp' as const,
  },
  createdById: {
    fieldType: 'column' as const,
    pgColumn: 'CreatedByUser' as const,
  },
  modifiedById: {
    fieldType: 'column' as const,
    pgColumn: 'ModifiedByUser' as const,
  },
  createdByFriendlyName: {
    fieldType: 'lazyJoinedColumn' as const,
    tableRef: 'createdBy' as const,
    pgColumn: 'FriendlyName' as const,
  },
  modifiedByFriendlyName: {
    fieldType: 'lazyJoinedColumn' as const,
    tableRef: 'modifiedBy' as const,
    pgColumn: 'FriendlyName' as const,
  },
};

export const getIndicatorResults = (latest: boolean) => {
  if (latest) {
    return createDataset(sharedDataset(), {
      pgTable: 'risksmart.latest_indicator_result_view',
      pk: 'Id',
      parentJoin: {
        pgTable: null,
        idCol: null,
        parentKeyCol: 'IndicatorId',
      },
      relations,
      fields,
    });
  }

  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.indicator_result',
    pk: 'Id',
    parentJoin: {
      pgTable: null,
      idCol: null,
      parentKeyCol: 'IndicatorId',
    },
    relations,
    fields,
  });
};
