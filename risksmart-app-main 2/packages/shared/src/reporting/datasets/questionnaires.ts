import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getQuestionnaires = () =>
  ({
    hasAccess: () => true,
    objectType: ParentTypes.QuestionnaireTemplateVersion,
    label: i18n.format(t('questionnaire_other'), 'capitalize'),
    customAttributeFormConfigurationParentTypes: [
      ParentTypes.QuestionnaireTemplate,
    ],
    fields: {
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      title: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'questionnaire_template',
          fieldId: 'Title',
        },
      },
      description: {
        dataType: 'text',
        displayType: 'text',
        formConfig: {
          formId: 'questionnaire_template',
          fieldId: 'Description',
        },
      },
      version: {
        dataType: 'text',
        displayType: 'text',
        defaultLabel: t('questionnaire_template_versions.columns.version'),
      },
      status: {
        dataType: 'text',
        displayType: 'rating',
        ratingKey: 'questionnaire_template_version_status',
        defaultLabel: t('questionnaire_template_versions.columns.status'),
      },
      owners: {
        dataType: 'textArray',
        displayType: 'badgeList',
        formConfig: {
          formId: 'questionnaire_template',
          fieldId: 'Owners',
        },
      },
      contributors: {
        dataType: 'textArray',
        displayType: 'badgeList',
        formConfig: {
          formId: 'questionnaire_template',
          fieldId: 'Contributors',
        },
      },
      tags: {
        dataType: 'textArray',
        displayType: 'badgeList',
        formConfig: {
          formId: 'questionnaire_template',
          fieldId: 'tags',
        },
      },
      departments: {
        dataType: 'textArray',
        displayType: 'badgeList',
        formConfig: {
          formId: 'questionnaire_template',
          fieldId: 'departments',
        },
      },
      ...getAuditColumns(),
    },
  }) as const satisfies SharedDataset;
