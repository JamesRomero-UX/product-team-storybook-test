import { getAssessments as sharedDataset } from '@risksmart-app/shared/reporting/datasets/assessments';

import { createDataset } from './types';

export const getAssessments = (_latest: boolean) => {
  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.assessment',
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
      completedBy: {
        pgTable: 'risksmart.user_view_active',
        columnMapping: [{ pk: 'Id', fk: 'CompletedByUser' }],
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
      tags: { fieldType: 'inlineArrayJoin', type: 'tags' },
      departments: { fieldType: 'inlineArrayJoin', type: 'departments' },
      owners: { fieldType: 'inlineArrayJoin', type: 'ownerUsersAndGroups' },
      contributors: {
        fieldType: 'inlineArrayJoin',
        type: 'contributorUsersAndGroups',
      },
      title: { fieldType: 'column', pgColumn: 'Title' },
      summary: { fieldType: 'column', pgColumn: 'Summary' },
      status: { fieldType: 'column', pgColumn: 'Status' },
      outcome: { fieldType: 'column', pgColumn: 'Outcome' },
      startDate: { fieldType: 'column', pgColumn: 'StartDate' },
      targetCompletionDate: {
        fieldType: 'column',
        pgColumn: 'TargetCompletionDate',
      },
      actualCompletionDate: {
        fieldType: 'column',
        pgColumn: 'ActualCompletionDate',
      },
      nextAssessmentDate: { fieldType: 'column', pgColumn: 'NextTestDate' },

      completedById: {
        fieldType: 'column',
        pgColumn: 'CompletedByUser',
      },
      completedByFriendlyName: {
        fieldType: 'lazyJoinedColumn',
        tableRef: 'completedBy',
        pgColumn: 'FriendlyName',
      },
    },
  });
};
