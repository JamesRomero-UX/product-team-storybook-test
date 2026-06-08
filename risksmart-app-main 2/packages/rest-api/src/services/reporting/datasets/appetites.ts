import { getAppetites as sharedDataset } from '@risksmart-app/shared/reporting/datasets/appetites';

import { createDataset } from './types';

export const getAppetites = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.appetite',
    parentJoin: {
      idCol: 'Id',
      pgTable: 'risksmart.appetite_parent',
      parentKeyCol: 'ParentId',
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
      statement: {
        fieldType: 'column',
        pgColumn: 'Statement',
      },
      upperAppetite: {
        fieldType: 'column',
        pgColumn: 'UpperAppetite',
      },
      lowerAppetite: {
        fieldType: 'column',
        pgColumn: 'LowerAppetite',
      },
      effectiveDate: {
        fieldType: 'column',
        pgColumn: 'EffectiveDate',
      },
      type: {
        pgColumn: 'AppetiteType',
        fieldType: 'column',
      },
      status: {
        fieldType: 'column',
        isFromJoinTable: true,
        pgColumn: 'Status',
      },
    },
  });
};
