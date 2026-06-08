import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { init } from '@risksmart-app/i18n/src/i18n';

import { getDatasetRelationships } from './datasetRelationships';

describe('getDatasetRelationships', () => {
  beforeAll(async () => {
    await init();
  });

  it('should return relationships for risks', () => {
    const result = getDatasetRelationships(ParentTypes.Risk);

    expect(result).toEqual({
      // Note, this needs to be overridden by the dataset as can be both parent and child
      risks: ['sibling'],
      actions: ['child'],
      attestationRecords: ['sibling'],
      issues: ['child'],
      controls: ['child'],
      appetites: ['child'],
      acceptances: ['child'],
      indicators: ['child'],
      indicatorResults: ['child'],
      causes: ['child'],
      consequences: ['child'],
      documents: ['sibling'],
      documentVersions: ['sibling'],
      testResults: ['child'],
      riskAssessmentResults: ['child'],
      assessments: ['sibling'],
      activities: ['sibling'],
      obligations: ['sibling'],
      rcsaActivities: ['sibling'],
      thirdParties: ['sibling'],
      responses: ['sibling'],
      questionnaires: ['sibling'],
    });
  });

  it('should return relationships for issues', () => {
    const result = getDatasetRelationships(ParentTypes.Issue);

    expect(result).toEqual({
      risks: ['parent'],
      actions: ['child'],
      issues: ['sibling'],
      controls: ['parent'],
      appetites: ['sibling'],
      acceptances: ['sibling'],
      indicators: ['sibling'],
      indicatorResults: ['sibling'],
      causes: ['child'],
      consequences: ['child'],
      testResults: ['sibling'],
      riskAssessmentResults: ['sibling'],
      assessments: ['parent'],
      activities: ['sibling'],
      obligations: ['parent'],
      rcsaActivities: ['sibling'],
      attestationRecords: ['sibling'],
      documents: ['parent'],
      documentVersions: ['sibling'],
      thirdParties: ['parent'],
      responses: ['sibling'],
      questionnaires: ['sibling'],
    });
  });

  it('should return relationships for activities', () => {
    const result = getDatasetRelationships(ParentTypes.AssessmentActivity);

    expect(result).toEqual({
      risks: ['sibling'],
      actions: ['sibling'],
      issues: ['sibling'],
      controls: ['sibling'],
      appetites: ['sibling'],
      acceptances: ['sibling'],
      indicators: ['sibling'],
      indicatorResults: ['sibling'],
      causes: ['sibling'],
      consequences: ['sibling'],
      testResults: ['sibling'],
      riskAssessmentResults: ['sibling'],
      assessments: ['parent'],
      activities: ['sibling'],
      obligations: ['sibling'],
      rcsaActivities: ['sibling'],
      attestationRecords: ['sibling'],
      documents: ['sibling'],
      documentVersions: ['sibling'],
      thirdParties: ['sibling'],
      responses: ['sibling'],
      questionnaires: ['sibling'],
    });
  });

  it('should return relationships for assessment', () => {
    const result = getDatasetRelationships(ParentTypes.Assessment);
    expect(result).toEqual({
      risks: ['sibling'],
      actions: ['child'],
      issues: ['child'],
      controls: ['sibling'],
      appetites: ['sibling'],
      acceptances: ['sibling'],
      indicators: ['sibling'],
      indicatorResults: ['sibling'],
      causes: ['sibling'],
      consequences: ['sibling'],
      testResults: ['child'],
      riskAssessmentResults: ['child'],
      assessments: ['sibling'],
      activities: ['child'],
      obligations: ['sibling'],
      rcsaActivities: ['child'],
      attestationRecords: ['sibling'],
      documents: ['sibling'],
      documentVersions: ['sibling'],
      thirdParties: ['sibling'],
      responses: ['sibling'],
      questionnaires: ['sibling'],
    });
  });

  it('should return relationships for attestations', () => {
    const result = getDatasetRelationships(ParentTypes.AttestationRecord);
    expect(result).toEqual({
      risks: ['sibling'],
      actions: ['sibling'],
      issues: ['sibling'],
      controls: ['sibling'],
      appetites: ['sibling'],
      acceptances: ['sibling'],
      indicators: ['sibling'],
      indicatorResults: ['sibling'],
      causes: ['sibling'],
      consequences: ['sibling'],
      testResults: ['sibling'],
      riskAssessmentResults: ['sibling'],
      assessments: ['sibling'],
      activities: ['sibling'],
      obligations: ['sibling'],
      rcsaActivities: ['sibling'],
      attestationRecords: ['sibling'],
      documents: ['parent'],
      documentVersions: ['parent'],
      thirdParties: ['sibling'],
      responses: ['sibling'],
      questionnaires: ['sibling'],
    });
  });

  it('should return relationships for third parties', () => {
    const result = getDatasetRelationships(ParentTypes.ThirdParty);
    expect(result).toEqual(
      expect.objectContaining({
        responses: ['child'],
      })
    );
  });

  it('should return relationships for third party responses', () => {
    const result = getDatasetRelationships(ParentTypes.ThirdPartyResponse);
    expect(result).toEqual(
      expect.objectContaining({
        questionnaires: ['parent'],
        thirdParties: ['parent'],
      })
    );
  });

  it('should return relationships for questionnaire templates', () => {
    const result = getDatasetRelationships(ParentTypes.QuestionnaireTemplate);
    expect(result).toEqual(
      expect.objectContaining({
        questionnaires: ['child'],
      })
    );
  });

  it('should return relationships for questionnaire template versions', () => {
    const result = getDatasetRelationships(
      ParentTypes.QuestionnaireTemplateVersion
    );
    expect(result).toEqual(
      expect.objectContaining({
        responses: ['child'],
      })
    );
  });
});
