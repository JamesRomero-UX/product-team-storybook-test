import { getTestResults as sharedDataset } from '@risksmart-app/shared/reporting/datasets/testResults';

import { createDataset } from './types';

const relations = {
  createdBy: {
    pgTable: 'risksmart.user_view_active' as const,
    columnMapping: [{ pk: 'Id' as const, fk: 'CreatedByUser' as const }],
  },
  modifiedBy: {
    pgTable: 'risksmart.user_view_active' as const,
    columnMapping: [{ pk: 'Id' as const, fk: 'ModifiedByUser' as const }],
  },
  performedBy: {
    pgTable: 'risksmart.user_view_active' as const,
    columnMapping: [{ pk: 'Id' as const, fk: 'Submitter' as const }],
  },
};

const fields = {
  // Audit columns
  createdAtTimestamp: {
    fieldType: 'column' as const,
    pgColumn: 'CreatedAtTimestamp' as const,
  },
  modifiedAtTimestamp: {
    fieldType: 'column' as const,
    pgColumn: 'ModifiedAtTimestamp' as const,
  },
  createdById: {
    fieldType: 'column' as const,
    pgColumn: 'CreatedByUser' as const,
  },
  modifiedById: {
    fieldType: 'column' as const,
    pgColumn: 'ModifiedByUser' as const,
  },
  createdByFriendlyName: {
    fieldType: 'lazyJoinedColumn' as const,
    tableRef: 'createdBy' as const,
    pgColumn: 'FriendlyName' as const,
  },
  modifiedByFriendlyName: {
    fieldType: 'lazyJoinedColumn' as const,
    tableRef: 'modifiedBy' as const,
    pgColumn: 'FriendlyName' as const,
  },
  // End audit
  title: { fieldType: 'column' as const, pgColumn: 'Title' as const },
  sequentialId: {
    fieldType: 'column' as const,
    pgColumn: 'SequentialId' as const,
  },
  id: { fieldType: 'column' as const, pgColumn: 'Id' as const },
  details: { fieldType: 'column' as const, pgColumn: 'Description' as const },
  designEffectiveness: {
    fieldType: 'column' as const,
    pgColumn: 'DesignEffectiveness' as const,
  },
  performanceEffectiveness: {
    fieldType: 'column' as const,
    pgColumn: 'PerformanceEffectiveness' as const,
  },
  performedById: {
    fieldType: 'column' as const,
    pgColumn: 'Submitter' as const,
  },
  performedByFriendlyName: {
    fieldType: 'lazyJoinedColumn' as const,
    tableRef: 'performedBy' as const,
    pgColumn: 'FriendlyName' as const,
  },
  testDate: { fieldType: 'column' as const, pgColumn: 'TestDate' as const },
  testResult: {
    fieldType: 'column' as const,
    pgColumn: 'OverallEffectiveness' as const,
  },
  typeType: {
    fieldType: 'column' as const,
    pgColumn: 'TestType' as const,
  },
};

const pk = 'Id' as const;

export const getTestResults = (latest: boolean) => {
  if (latest) {
    return createDataset(sharedDataset(), {
      pgTable: 'risksmart.latest_test_result_view',
      parentJoin: {
        pgTable: 'risksmart.assessment_result_parent',
        idCol: 'Id',
        parentKeyCol: 'ParentId',
      },
      parentJoinForSingleParent: {
        pgTable: null,
        idCol: null,
        parentKeyCol: 'ParentId',
      },
      relations,
      pk,
      fields,
    });
  }

  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.test_result',
    parentJoin: {
      pgTable: 'risksmart.assessment_result_parent',
      idCol: 'Id',
      parentKeyCol: 'ParentId',
    },
    relations,
    pk,
    fields,
  });
};
