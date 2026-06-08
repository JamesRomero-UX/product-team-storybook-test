import { getIndicators as sharedDataset } from '@risksmart-app/shared/reporting/datasets/indicators';

import { createDataset } from './types';

export const getIndicators = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.indicator',
    parentJoin: {
      idCol: 'IndicatorId',
      pgTable: 'risksmart.indicator_parent',
      parentKeyCol: 'ParentId',
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

    pk: 'Id',
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

      sequentialId: {
        fieldType: 'column',
        pgColumn: 'SequentialId',
      },
      id: { fieldType: 'column', pgColumn: 'Id' },
      name: { fieldType: 'column', pgColumn: 'Title' },
      details: { fieldType: 'column', pgColumn: 'Description' },
      lowerTolerance: {
        fieldType: 'column',
        pgColumn: 'LowerToleranceNum',
      },
      lowerAppetite: {
        fieldType: 'column',
        pgColumn: 'LowerAppetiteNum',
      },
      upperAppetite: {
        fieldType: 'column',
        pgColumn: 'UpperAppetiteNum',
      },
      upperTolerance: {
        fieldType: 'column',
        pgColumn: 'UpperToleranceNum',
      },
      tags: { fieldType: 'inlineArrayJoin', type: 'tags' },
      departments: {
        fieldType: 'inlineArrayJoin',
        type: 'departments',
      },
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
      type: { fieldType: 'column', pgColumn: 'Type' },
      unit: { fieldType: 'column', pgColumn: 'Unit' },
      expectedTextValue: {
        fieldType: 'column',
        pgColumn: 'TargetValueTxt',
      },
    },
  });
};
