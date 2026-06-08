import { getCauses as sharedDataset } from '@risksmart-app/shared/reporting/datasets/causes';

import { createDataset } from './types';

export const getCauses = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.cause',
    parentJoin: {
      pgTable: null,
      idCol: null,
      parentKeyCol: 'ParentIssueId',
    },
    relations: {
      createdBy: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'CreatedByUser' }],
      },
      modifiedBy: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'ModifiedByUser' }],
      },
    },
    pk: 'Id',
    fields: {
      // Audit columns
      createdAtTimestamp: {
        fieldType: 'column',
        pgColumn: 'CreatedAtTimestamp',
      },
      modifiedAtTimestamp: {
        fieldType: 'column',
        pgColumn: 'ModifiedAtTimestamp',
      },
      createdById: {
        fieldType: 'column',
        pgColumn: 'CreatedByUser',
      },
      modifiedById: {
        fieldType: 'column',
        pgColumn: 'ModifiedByUser',
      },
      createdByFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'createdBy',
        pgColumn: 'FriendlyName',
      },
      modifiedByFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'modifiedBy',
        pgColumn: 'FriendlyName',
      },
      // End audit
      title: { fieldType: 'column', pgColumn: 'Title' },
      id: { fieldType: 'column', pgColumn: 'Id' },
      description: {
        fieldType: 'column',
        pgColumn: 'Description',
      },
      significance: {
        fieldType: 'column',
        pgColumn: 'Significance',
      },
    },
  });
};
