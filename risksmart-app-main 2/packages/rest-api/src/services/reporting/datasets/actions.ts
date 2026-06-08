import { getActions as sharedDataset } from '@risksmart-app/shared/reporting/datasets/actions';

import { createDataset } from './types';

export const getActions = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.action',
    pk: 'Id',
    parentJoin: {
      pgTable: 'risksmart.action_parent',
      parentKeyCol: 'ParentId',
      idCol: 'ActionId',
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
      actionStatus: {
        pgTable: 'risksmart.action_status_view',
        columnMapping: [{ pk: 'Id', fk: 'Id' }],
      },
    },
    fields: {
      owners: { fieldType: 'inlineArrayJoin', type: 'ownerUsersAndGroups' },
      contributors: {
        fieldType: 'inlineArrayJoin',
        type: 'contributorUsersAndGroups',
      },
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
      title: {
        fieldType: 'column',
        pgColumn: 'Title',
      },
      id: {
        fieldType: 'column',
        pgColumn: 'Id',
      },
      sequentialId: {
        fieldType: 'column',
        pgColumn: 'SequentialId',
      },
      closedDate: {
        fieldType: 'column',
        pgColumn: 'ClosedDate',
      },
      dateRaised: {
        fieldType: 'column',
        pgColumn: 'DateRaised',
      },
      dateDue: {
        fieldType: 'column',
        pgColumn: 'DateDue',
      },
      priority: {
        fieldType: 'column',
        pgColumn: 'Priority',
      },
      tags: { fieldType: 'inlineArrayJoin', type: 'tags' },
      departments: {
        fieldType: 'inlineArrayJoin',
        type: 'departments',
      },
      description: {
        fieldType: 'column',
        pgColumn: 'Description',
      },
      status: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'actionStatus',
        pgColumn: 'Status',
      },
    },
  });
};
