import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getRcsaActivities = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.AssessmentActivity,
    label: `RCSA ${i18n.format(t('activity_other'), 'capitalize')}`,
    customAttributeFormConfigurationParentTypes: [
      ParentTypes.AssessmentActivity,
    ],
    fields: {
      ...getAuditColumns(),
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'assessment_activity',
          fieldId: 'Title',
        },
      },
      summary: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'assessment_activity',
          fieldId: 'Summary',
        },
      },
      status: {
        dataType: 'text',
        displayType: 'commonLookup',
        i18nKey: 'assessmentActivities.status',
        formConfig: {
          formId: 'assessment_activity',
          fieldId: 'Status',
        },
      },
      completionDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'assessment_activity',
          fieldId: 'CompletionDate',
        },
      },
      owners: {
        dataType: 'textArray',
        defaultLabel: t('columns.owners'),
        displayType: 'badgeList',
      },
    },
  }) as const satisfies SharedDataset;
