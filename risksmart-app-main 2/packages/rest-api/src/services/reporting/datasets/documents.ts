import { getDocuments as sharedDataset } from '@risksmart-app/shared/reporting/datasets/documents';

import { createDataset } from './types';

export const getDocuments = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.document',
    pk: 'Id',
    parentJoin: {
      pgTable: null,
      parentKeyCol: 'ParentDocument',
      idCol: null,
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
      id: {
        fieldType: 'column',
        pgColumn: 'Id',
      },
      sequentialId: {
        fieldType: 'column',
        pgColumn: 'SequentialId',
      },
      title: {
        fieldType: 'column',
        pgColumn: 'Title',
      },
      purpose: {
        fieldType: 'column',
        pgColumn: 'Purpose',
      },
      documentType: {
        fieldType: 'column',
        pgColumn: 'DocumentType',
      },
    },
  });
};
