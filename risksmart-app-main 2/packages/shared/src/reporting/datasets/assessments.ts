import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getAssessments = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.Assessment,
    label: i18n.format(t('assessment_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [ParentTypes.Assessment],
    fields: {
      ...getAuditColumns(),
      tags: {
        dataType: 'textArray',
        formConfig: {
          formId: 'assessment',
          fieldId: 'tags',
        },
        displayType: 'badgeList',
      },
      departments: {
        dataType: 'textArray',
        formConfig: {
          formId: 'assessment',
          fieldId: 'departments',
        },
        displayType: 'badgeList',
      },
      owners: {
        dataType: 'textArray',
        formConfig: {
          formId: 'assessment',
          fieldId: 'Owners',
        },
        displayType: 'badgeList',
      },
      contributors: {
        dataType: 'textArray',
        formConfig: {
          formId: 'assessment',
          fieldId: 'Contributors',
        },
        displayType: 'badgeList',
      },
      sequentialId: {
        dataType: 'number',
        displayType: 'number',
        defaultLabel: t('columns.id'),
        prefix: 'ASMT-',
      },
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      detailsLink: {
        dataType: 'guid',
        defaultLabel: t('assessments.columns.details_link'),
        displayType: 'detailsLink',
        entityInfoParentType: ParentTypes.Assessment,
      },
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'assessment',
          fieldId: 'Title',
        },
      },
      summary: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'assessment',
          fieldId: 'Summary',
        },
      },
      status: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'assessment_status',
        formConfig: {
          formId: 'assessment',
          fieldId: 'Status',
        },
      },
      outcome: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'assessment_outcome',
        formConfig: {
          formId: 'assessment',
          fieldId: 'Outcome',
        },
      },
      startDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'assessment',
          fieldId: 'StartDate',
        },
      },
      targetCompletionDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'assessment',
          fieldId: 'TargetCompletionDate',
        },
      },
      actualCompletionDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'assessment',
          fieldId: 'ActualCompletionDate',
        },
      },
      nextAssessmentDate: {
        dataType: 'date',
        displayType: 'date',
        formConfig: {
          formId: 'assessment',
          fieldId: 'NextTestDate',
        },
      },
      completedById: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('assessments.columns.CompletionById'),
      },
      completedByFriendlyName: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'assessment',
          fieldId: 'CompletedByUser',
        },
      },
    },
  }) as const satisfies SharedDataset;
