import { getControls as sharedDataset } from '@risksmart-app/shared/reporting/datasets/controls';

import { createDataset } from './types';

export const getControls = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.control',
    pk: 'Id',
    parentJoin: {
      pgTable: 'risksmart.control_parent',
      parentKeyCol: 'ParentId',
      idCol: 'ControlId',
    },
    relations: {
      schedule: {
        pgTable: 'risksmart.schedule',
        columnMapping: [{ pk: 'Id', fk: 'Id' }],
      },
      scheduleState: {
        pgTable: 'risksmart.schedule_state',
        columnMapping: [{ pk: 'Id', fk: 'Id' }],
      },
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
      controlType: { fieldType: 'column', pgColumn: 'Type' },
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
      title: { fieldType: 'column', pgColumn: 'Title' },
      description: { fieldType: 'column', pgColumn: 'Description' },
      id: { fieldType: 'column', pgColumn: 'Id' },
      sequentialId: { fieldType: 'column', pgColumn: 'SequentialId' },
      tags: { fieldType: 'inlineArrayJoin', type: 'tags' },
      departments: {
        fieldType: 'inlineArrayJoin',
        type: 'departments',
      },

      // #region schedule fields
      ratingFrequency: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'schedule',
        pgColumn: 'Frequency',
      },
      latestRatingDate: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'scheduleState',
        pgColumn: 'LatestDate',
      },
      nextRatingDueDate: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'scheduleState',
        pgColumn: 'DueDate',
      },
      nextRatingOverdueDate: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'scheduleState',
        pgColumn: 'OverdueDate',
      },
      // #endregion schedule fields
    },
  });
};
