import { getAcceptances as sharedDataset } from '@risksmart-app/shared/reporting/datasets/acceptances';

import { createDataset } from './types';

export const getAcceptances = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.acceptance',
    parentJoin: {
      idCol: 'Id',
      pgTable: 'risksmart.acceptance_parent',
      parentKeyCol: 'ParentId',
    },
    pk: 'Id',
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
    fields: {
      detailsLink: {
        fieldType: 'column',
        pgColumn: 'Id',
      },
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
      sequentialId: {
        fieldType: 'column',
        pgColumn: 'SequentialId',
      },
      id: { fieldType: 'column', pgColumn: 'Id' },

      title: {
        fieldType: 'column',
        pgColumn: 'Title',
      },

      acceptedFrom: {
        fieldType: 'column',
        pgColumn: 'DateAcceptedFrom',
      },
      acceptedTo: {
        fieldType: 'column',
        pgColumn: 'DateAcceptedTo',
      },
      details: {
        fieldType: 'column',
        pgColumn: 'Details',
      },
      status: {
        fieldType: 'column',
        pgColumn: 'Status',
      },
    },
  });
};
