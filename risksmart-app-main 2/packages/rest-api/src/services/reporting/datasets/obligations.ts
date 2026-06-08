import { getObligations as getSharedDataset } from '@risksmart-app/shared/reporting/datasets/obligations';

import { createDataset } from './types';

export const getObligations = (_latest: boolean) => {
  return createDataset(getSharedDataset(), {
    pgTable: 'risksmart.obligation',
    parentJoin: {
      idCol: null,
      pgTable: null,
      parentKeyCol: 'ParentId',
    },
    relations: {
      riskScore: {
        pgTable: 'risksmart.risk_score',
        columnMapping: [{ pk: 'RiskId', fk: 'Id' }],
      },
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
      details: { fieldType: 'column', pgColumn: 'Description' },
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
      // #endregion Audit columns
      detailsLink: {
        fieldType: 'column',
        pgColumn: 'Id',
      },
      sequentialId: {
        fieldType: 'column',
        pgColumn: 'SequentialId',
      },
      type: { fieldType: 'column', pgColumn: 'Type' },
      id: { fieldType: 'column', pgColumn: 'Id' },
      title: { fieldType: 'column', pgColumn: 'Title' },
      interpretation: { fieldType: 'column', pgColumn: 'Interpretation' },
      adherence: { fieldType: 'column', pgColumn: 'Adherence' },
      tags: { fieldType: 'inlineArrayJoin', type: 'tags' },
      departments: { fieldType: 'inlineArrayJoin', type: 'departments' },
      owners: { fieldType: 'inlineArrayJoin', type: 'ownerUsersAndGroups' },
      contributors: {
        fieldType: 'inlineArrayJoin',
        type: 'contributorUsersAndGroups',
      },
    },
  });
};
