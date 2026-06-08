import type { ModuleKey } from '@risksmart-app/modules/src/index';

import type { DataSourceType } from '../../reporting/schema';
import type { DatasourceRelationshipType } from '../api/schema';
import { getDatasetRelationships } from '../datasetRelationships';
import { getAcceptances } from './acceptances';
import { getActions } from './actions';
import { getActivities } from './activities';
import { getAppetites } from './appetites';
import { getAssessments } from './assessments';
import { getAttestationRecords } from './attestationRecords';
import { getCauses } from './causes';
import { getConsequences } from './consequences';
import { getControls } from './controls';
import { getDocuments } from './documents';
import { getDocumentVersions } from './documentVersions';
import { getIndicatorResults } from './indicatorResults';
import { getIndicators } from './indicators';
import { getIssues } from './issues';
import { getObligations } from './obligations';
import { getQuestionnaires } from './questionnaires';
import { getRcsaActivities } from './rcsaActivities';
import { getResponses } from './responses';
import { getRiskAssessmentResults } from './riskAssessmentResults';
import { getRisks } from './risks';
import { getTags } from './tags';
import { getTestResults } from './testResults';
import { getThirdParties } from './thirdParties';
import type { SharedDatasets } from './types';

export const getSharedDatasets = (): SharedDatasets => ({
  assessments: getAssessments(),
  attestationRecords: getAttestationRecords(),
  risks: getRisks(),
  obligations: getObligations(),
  actions: getActions(),
  issues: getIssues(),
  controls: getControls(),
  documents: getDocuments(),
  documentVersions: getDocumentVersions(),
  tags: getTags(),
  appetites: getAppetites(),
  acceptances: getAcceptances(),
  indicators: getIndicators(),
  indicatorResults: getIndicatorResults(),
  causes: getCauses(),
  consequences: getConsequences(),
  testResults: getTestResults(),
  riskAssessmentResults: getRiskAssessmentResults(),
  activities: getActivities(),
  rcsaActivities: getRcsaActivities(),
  thirdParties: getThirdParties(),
  responses: getResponses(),
  questionnaires: getQuestionnaires(),
});

export interface DatasourceOption {
  label: string;
  value: string;
  relationshipToParentIndex: DatasourceRelationshipType | null;
  type: DataSourceType;
}

/**
 * Retrieve possible related datasets
 * @param dataSource
 * @returns
 */
export const getRelatedDataSources = (
  dataSource: DataSourceType,
  isModuleEnabled: (moduleKey: ModuleKey) => boolean
): DatasourceOption[] => {
  const sharedDatasets = getSharedDatasets();
  const dataset = sharedDatasets[dataSource];

  const relationships = dataset.objectType
    ? getDatasetRelationships(dataset.objectType)
    : {};

  const relationshipsWithOverrides = {
    ...relationships,
    ...dataset.datasetRelationshipOverrides,
  };

  return Object.entries(relationshipsWithOverrides)
    .flatMap(([dsType, relationshipsToParentIndex]) => {
      // Object.entries returns string keys; assertion to DataSourceType is safe because the object's keys are DataSourceType values by construction.
      const type = dsType as DataSourceType;
      const ds = sharedDatasets[type];
      if (ds.disabled || !ds.hasAccess(isModuleEnabled)) {
        return [];
      }

      return relationshipsToParentIndex.map((relationshipToParentIndex) => ({
        value: `${type}|${relationshipToParentIndex}`,
        label: `${ds.label} (${relationshipToParentIndex})`,
        relationshipToParentIndex,
        type,
      }));
    })
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const getDataSources = (
  isModuleEnabled: (moduleKey: ModuleKey) => boolean
): DatasourceOption[] => {
  const sharedDatasets = getSharedDatasets();

  return Object.keys(sharedDatasets)
    .map((dsType) => {
      // Object.keys returns string[]; assertion to DataSourceType is safe because the object's keys are DataSourceType values by construction.
      const type = dsType as DataSourceType;
      const ds = sharedDatasets[type];

      return {
        label: ds.label,
        value: `${type}|`,
        disabled: ds.disabled,
        relationshipToParentIndex: null,
        type,
        hasAccess: ds.hasAccess,
      };
    })
    .filter((d) => d.hasAccess(isModuleEnabled))
    .filter((d) => !d.disabled)
    .sort((a, b) => a.label.localeCompare(b.label));
};
