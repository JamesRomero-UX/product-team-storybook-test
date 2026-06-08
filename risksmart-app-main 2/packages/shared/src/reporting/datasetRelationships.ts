import type { ParentType } from '@risksmart-app/domain/src/types/consts';

import { isDescendant } from '../hierarchy/hierarchy';
import type { DatasourceRelationshipType } from './api/schema';
import { getSharedDatasets } from './datasets';
import type { DatasetRelationships } from './datasets/types';
import { dataSourceTypes } from './schema';

export const getDatasetRelationships = (
  sourceObjectType: ParentType
): DatasetRelationships => {
  const datasets = getSharedDatasets();
  const datasetRelationships: DatasetRelationships = {};

  for (const targetType of dataSourceTypes) {
    const relationships: DatasourceRelationshipType[] = [];
    const targetDataset = datasets[targetType];
    const targetObjectType = targetDataset.objectType;
    if (!sourceObjectType || !targetObjectType) {
      continue;
    }

    if (isDescendant(sourceObjectType, targetObjectType)) {
      relationships.push('child');
    }
    if (isDescendant(targetObjectType, sourceObjectType)) {
      relationships.push('parent');
    }
    if (relationships.length === 0) {
      relationships.push('sibling');
    }
    datasetRelationships[targetType] = relationships;
  }

  return datasetRelationships;
};
