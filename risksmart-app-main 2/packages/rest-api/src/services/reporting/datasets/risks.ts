import { getRisks as getSharedDataset } from '@risksmart-app/shared/reporting/datasets/risks';

import { createDataset } from './types';

export const getRisks = (_latest: boolean) => {
  return createDataset(getSharedDataset(), {
    pgTable: 'risksmart.risk',
    parentJoin: {
      idCol: null,
      pgTable: null,
      parentKeyCol: 'ParentRiskId',
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
      id: { fieldType: 'column', pgColumn: 'Id' },
      title: { fieldType: 'column', pgColumn: 'Title' },
      tier: { fieldType: 'column', pgColumn: 'Tier' },

      status: { fieldType: 'column', pgColumn: 'Status' },
      treatment: { fieldType: 'column', pgColumn: 'Treatment' },
      tags: { fieldType: 'inlineArrayJoin', type: 'tags' },
      departments: { fieldType: 'inlineArrayJoin', type: 'departments' },
      owners: { fieldType: 'inlineArrayJoin', type: 'ownerUsersAndGroups' },
      contributors: {
        fieldType: 'inlineArrayJoin',
        type: 'contributorUsersAndGroups',
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
      inherentRating: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'riskScore',
        pgColumn: 'InherentRating',
        metaPgColumns: {
          likelihood: 'InherentLikelihood',
          impact: 'InherentImpact',
        },
      },
      residualRating: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'riskScore',
        pgColumn: 'ResidualRating',
        metaPgColumns: {
          likelihood: 'ResidualLikelihood',
          impact: 'ResidualImpact',
        },
      },
      inherentScore: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'riskScore',
        pgColumn: 'InherentScore',
      },
      residualScore: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'riskScore',
        pgColumn: 'ResidualScore',
      },

      // #endregion schedule fields
    },
  });
};
