import { getRiskAssessmentResults as sharedDataset } from '@risksmart-app/shared/reporting/datasets/riskAssessmentResults';
import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';

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
  riskRatingDefinition: {
    pgTable: 'risksmart.risk_rating_definition' as const,
    columnMapping: [
      { pk: 'Value' as const, fk: 'Rating' as const },
      { pk: 'ControlType' as const, fk: 'ControlType' as const },
    ],
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
  id: {
    fieldType: 'column' as const,
    pgColumn: 'Id' as const,
  },
  testDate: {
    fieldType: 'column' as const,
    pgColumn: 'TestDate' as const,
  },
  controlType: {
    fieldType: 'column' as const,
    pgColumn: 'ControlType' as const,
  },
  likelihood: {
    fieldType: 'column' as const,
    pgColumn: 'Likelihood' as const,
  },
  impact: {
    fieldType: 'column' as const,
    pgColumn: 'Impact' as const,
  },
  rating: {
    fieldType: 'lazyJoinedColumn' as const,
    tableRef: 'riskRatingDefinition' as const,
    pgColumn: 'Label' as const,
    metaPgColumns: { color: 'Color' as const, sort: 'Value' as const },
    sourceMetaPgColumns: {
      likelihood: 'Likelihood' as const,
      impact: 'Impact' as const,
    },
  },
  rationale: {
    fieldType: 'column' as const,
    pgColumn: 'Rationale' as const,
  },
};

const pk = 'Id' as const;

export const getRiskAssessmentResults = (
  latest: boolean,
  leftDatasetType: DataSourceType | null
) => {
  if (latest) {
    if (leftDatasetType === 'assessments') {
      return createDataset(sharedDataset(), {
        pgTable: 'risksmart.latest_assessment_risk_assessment_result_view',
        pk: 'Id',
        parentJoin: {
          pgTable: 'risksmart.assessment_result_parent',
          parentKeyCol: 'ParentId',
          idCol: 'Id',
        },
        parentJoinForSingleParent: {
          pgTable: null,
          idCol: null,
          parentKeyCol: 'ParentId',
        },
        relations,
        fields,
      });
    }

    return createDataset(sharedDataset(), {
      pgTable: 'risksmart.latest_risk_assessment_result_view',
      pk,
      parentJoin: {
        pgTable: 'risksmart.assessment_result_parent',
        parentKeyCol: 'ParentId',
        idCol: 'Id',
      },
      parentJoinForSingleParent: {
        pgTable: null,
        idCol: null,
        parentKeyCol: 'ParentId',
      },
      relations,
      fields,
    });
  }

  return createDataset(sharedDataset(), {
    pgTable: 'risksmart.risk_assessment_result',
    pk,
    parentJoin: {
      pgTable: 'risksmart.assessment_result_parent',
      parentKeyCol: 'ParentId',
      idCol: 'Id',
    },
    relations,
    fields,
  });
};
