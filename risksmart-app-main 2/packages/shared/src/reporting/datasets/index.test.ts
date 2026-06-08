import { init } from '@risksmart-app/i18n/src/i18n';

import type { DataSourceType } from '../schema';
import type { DatasourceOption } from '.';
import { getRelatedDataSources } from '.';

describe('datasets', () => {
  beforeAll(async () => {
    await init();
  });

  describe('getRelatedDataSources', () => {
    const cases: {
      dataSource: DataSourceType;
      expectedResult: DatasourceOption[];
    }[] = [
      {
        dataSource: 'risks',
        expectedResult: [
          {
            value: 'acceptances|child',
            label: 'Acceptances (child)',
            relationshipToParentIndex: 'child',
            type: 'acceptances',
          },
          {
            value: 'actions|child',
            label: 'Actions (child)',
            relationshipToParentIndex: 'child',
            type: 'actions',
          },
          {
            value: 'activities|sibling',
            label: 'Activities (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'activities',
          },
          {
            value: 'appetites|child',
            label: 'Appetites (child)',
            relationshipToParentIndex: 'child',
            type: 'appetites',
          },
          {
            value: 'assessments|sibling',
            label: 'Assessments (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'assessments',
          },
          {
            value: 'attestationRecords|sibling',
            label: 'Attestations (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'attestationRecords',
          },
          {
            value: 'causes|child',
            label: 'Causes (child)',
            relationshipToParentIndex: 'child',
            type: 'causes',
          },
          {
            value: 'consequences|child',
            label: 'Consequences (child)',
            relationshipToParentIndex: 'child',
            type: 'consequences',
          },
          {
            value: 'controls|child',
            label: 'Controls (child)',
            relationshipToParentIndex: 'child',
            type: 'controls',
          },
          {
            value: 'documentVersions|sibling',
            label: 'Document versions (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'documentVersions',
          },
          {
            value: 'documents|sibling',
            label: 'Documents (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'documents',
          },
          {
            value: 'indicatorResults|child',
            label: 'Indicator results (child)',
            relationshipToParentIndex: 'child',
            type: 'indicatorResults',
          },
          {
            value: 'indicators|child',
            label: 'Indicators (child)',
            relationshipToParentIndex: 'child',
            type: 'indicators',
          },
          {
            value: 'issues|child',
            label: 'Issues (child)',
            relationshipToParentIndex: 'child',
            type: 'issues',
          },
          {
            label: 'Obligations (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'obligations',
            value: 'obligations|sibling',
          },
          {
            label: 'Questionnaires (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'questionnaires',
            value: 'questionnaires|sibling',
          },
          {
            value: 'rcsaActivities|sibling',
            label: 'RCSA Activities (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'rcsaActivities',
          },
          {
            label: 'Responses (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'responses',
            value: 'responses|sibling',
          },
          {
            value: 'riskAssessmentResults|child',
            label: 'Risk assessment results (child)',
            relationshipToParentIndex: 'child',
            type: 'riskAssessmentResults',
          },
          {
            value: 'risks|child',
            label: 'Risks (child)',
            relationshipToParentIndex: 'child',
            type: 'risks',
          },
          {
            value: 'risks|parent',
            label: 'Risks (parent)',
            relationshipToParentIndex: 'parent',
            type: 'risks',
          },

          {
            value: 'testResults|child',
            label: 'Test Results (child)',
            relationshipToParentIndex: 'child',
            type: 'testResults',
          },
          {
            label: 'Third parties (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'thirdParties',
            value: 'thirdParties|sibling',
          },
        ],
      },
      {
        dataSource: 'controls',
        expectedResult: [
          {
            value: 'acceptances|sibling',
            label: 'Acceptances (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'acceptances',
          },
          {
            value: 'actions|child',
            label: 'Actions (child)',
            relationshipToParentIndex: 'child',
            type: 'actions',
          },
          {
            value: 'activities|sibling',
            label: 'Activities (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'activities',
          },
          {
            value: 'appetites|sibling',
            label: 'Appetites (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'appetites',
          },
          {
            value: 'assessments|sibling',
            label: 'Assessments (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'assessments',
          },
          {
            value: 'attestationRecords|sibling',
            label: 'Attestations (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'attestationRecords',
          },
          {
            value: 'causes|child',
            label: 'Causes (child)',
            relationshipToParentIndex: 'child',
            type: 'causes',
          },
          {
            value: 'consequences|child',
            label: 'Consequences (child)',
            relationshipToParentIndex: 'child',
            type: 'consequences',
          },
          {
            value: 'controls|sibling',
            label: 'Controls (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'controls',
          },
          {
            value: 'documentVersions|sibling',
            label: 'Document versions (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'documentVersions',
          },
          {
            value: 'documents|sibling',
            label: 'Documents (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'documents',
          },
          {
            value: 'indicatorResults|child',
            label: 'Indicator results (child)',
            relationshipToParentIndex: 'child',
            type: 'indicatorResults',
          },
          {
            value: 'indicators|child',
            label: 'Indicators (child)',
            relationshipToParentIndex: 'child',
            type: 'indicators',
          },
          {
            value: 'issues|child',
            label: 'Issues (child)',
            relationshipToParentIndex: 'child',
            type: 'issues',
          },
          {
            label: 'Obligations (parent)',
            relationshipToParentIndex: 'parent',
            type: 'obligations',
            value: 'obligations|parent',
          },
          {
            label: 'Questionnaires (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'questionnaires',
            value: 'questionnaires|sibling',
          },
          {
            value: 'rcsaActivities|sibling',
            label: 'RCSA Activities (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'rcsaActivities',
          },
          {
            label: 'Responses (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'responses',
            value: 'responses|sibling',
          },
          {
            value: 'riskAssessmentResults|sibling',
            label: 'Risk assessment results (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'riskAssessmentResults',
          },
          {
            value: 'risks|parent',
            label: 'Risks (parent)',
            relationshipToParentIndex: 'parent',
            type: 'risks',
          },
          {
            value: 'testResults|child',
            label: 'Test Results (child)',
            relationshipToParentIndex: 'child',
            type: 'testResults',
          },
          {
            label: 'Third parties (parent)',
            relationshipToParentIndex: 'parent',
            type: 'thirdParties',
            value: 'thirdParties|parent',
          },
        ],
      },
      {
        dataSource: 'attestationRecords',
        expectedResult: [
          {
            value: 'acceptances|sibling',
            label: 'Acceptances (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'acceptances',
          },
          {
            value: 'actions|sibling',
            label: 'Actions (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'actions',
          },
          {
            value: 'activities|sibling',
            label: 'Activities (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'activities',
          },
          {
            value: 'appetites|sibling',
            label: 'Appetites (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'appetites',
          },
          {
            value: 'assessments|sibling',
            label: 'Assessments (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'assessments',
          },
          {
            value: 'attestationRecords|sibling',
            label: 'Attestations (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'attestationRecords',
          },
          {
            value: 'causes|sibling',
            label: 'Causes (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'causes',
          },
          {
            value: 'consequences|sibling',
            label: 'Consequences (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'consequences',
          },
          {
            value: 'controls|sibling',
            label: 'Controls (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'controls',
          },
          {
            value: 'documentVersions|parent',
            label: 'Document versions (parent)',
            relationshipToParentIndex: 'parent',
            type: 'documentVersions',
          },
          {
            value: 'documents|parent',
            label: 'Documents (parent)',
            relationshipToParentIndex: 'parent',
            type: 'documents',
          },
          {
            value: 'indicatorResults|sibling',
            label: 'Indicator results (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'indicatorResults',
          },
          {
            value: 'indicators|sibling',
            label: 'Indicators (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'indicators',
          },
          {
            value: 'issues|sibling',
            label: 'Issues (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'issues',
          },
          {
            label: 'Obligations (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'obligations',
            value: 'obligations|sibling',
          },
          {
            label: 'Questionnaires (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'questionnaires',
            value: 'questionnaires|sibling',
          },
          {
            value: 'rcsaActivities|sibling',
            label: 'RCSA Activities (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'rcsaActivities',
          },
          {
            label: 'Responses (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'responses',
            value: 'responses|sibling',
          },
          {
            value: 'riskAssessmentResults|sibling',
            label: 'Risk assessment results (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'riskAssessmentResults',
          },
          {
            value: 'risks|sibling',
            label: 'Risks (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'risks',
          },
          {
            value: 'testResults|sibling',
            label: 'Test Results (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'testResults',
          },
          {
            label: 'Third parties (sibling)',
            relationshipToParentIndex: 'sibling',
            type: 'thirdParties',
            value: 'thirdParties|sibling',
          },
        ],
      },
    ];

    it.each(cases)(
      'returns data source options for $dataSource',
      ({ dataSource, expectedResult }) => {
        const children = getRelatedDataSources(dataSource, () => true);
        expect(children).toEqual(expectedResult);
      }
    );
  });
});
