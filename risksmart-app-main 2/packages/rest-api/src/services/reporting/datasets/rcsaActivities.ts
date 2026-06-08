import { getRcsaActivities as getSharedDataset } from '@risksmart-app/shared/reporting/datasets/rcsaActivities';

import { createDataset } from './types';

export const getRscaActivities = (_latest: boolean) => {
  return createDataset(getSharedDataset(), {
    pgTable: 'risksmart.rsca_assessment_activity_view',
    parentJoin: {
      idCol: null,
      pgTable: null,
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
      assignedUser: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'AssignedUser' }],
      },
    },

    pk: 'Id',
    fields: {
      // #region Audit columns
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
      title: { fieldType: 'column', pgColumn: 'Title' },
      summary: { fieldType: 'column', pgColumn: 'Summary' },
      status: { fieldType: 'column', pgColumn: 'Status' },
      completionDate: { fieldType: 'column', pgColumn: 'CompletionDate' },
      owners: { fieldType: 'inlineArrayJoin', type: 'ownerUsersAndGroups' },
    },
  });
};
