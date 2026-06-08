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
import { getRscaActivities } from './rcsaActivities';
import { getResponses } from './responses';
import { getRiskAssessmentResults } from './riskAssessmentResults';
import { getRisks } from './risks';
import { getTags } from './tags';
import { getTestResults } from './testResults';
import { getThirdParties } from './thirdParties';

export const getDataSets = () => ({
  acceptances: getAcceptances,
  actions: getActions,
  activities: getActivities,
  appetites: getAppetites,
  assessments: getAssessments,
  attestationRecords: getAttestationRecords,
  causes: getCauses,
  consequences: getConsequences,
  controls: getControls,
  documents: getDocuments,
  documentVersions: getDocumentVersions,
  indicatorResults: getIndicatorResults,
  indicators: getIndicators,
  issues: getIssues,
  obligations: getObligations,
  rcsaActivities: getRscaActivities,
  riskAssessmentResults: getRiskAssessmentResults,
  risks: getRisks,
  tags: getTags,
  testResults: getTestResults,
  thirdParties: getThirdParties,
  responses: getResponses,
  questionnaires: getQuestionnaires,
});
export type Datasets = ReturnType<typeof getDataSets>;
