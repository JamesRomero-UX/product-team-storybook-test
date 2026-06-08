import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getRiskAssessmentResults = () =>
  ({
    supportedLatest: true,
    hasAccess: () => true,
    objectType: ParentTypes.RiskAssessmentResult,
    label: 'Risk assessment results',
    customAttributeFormConfigurationParentTypes: [
      ParentTypes.ControlledRiskAssessmentResult,
      ParentTypes.UncontrolledRiskAssessmentResult,
    ],
    fields: {
      ...getAuditColumns(),
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      controlType: {
        dataType: 'text',
        displayType: 'commonLookup',
        i18nKey: 'assessmentResults.controlTypesCased',
        defaultLabel: t('assessmentResults.fields.ControlType'),
      },
      likelihood: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'likelihood',
        defaultLabel: t('assessmentResults.fields.Likelihood'),
      },
      impact: {
        dataType: 'number',
        displayType: 'rating',
        ratingKey: 'impact',
        defaultLabel: t('assessmentResults.fields.Impact'),
      },
      rationale: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('assessmentResults.fields.Rationale'),
      },
      rating: {
        dataType: 'text',
        displayType: 'metaRating',
        defaultLabel: t('assessmentResults.fields.Rating'),
      },
      testDate: {
        dataType: 'date',
        displayType: 'date',
        defaultLabel: t('assessmentResults.fields.TestDate'),
      },
    },
  }) as const satisfies SharedDataset;
