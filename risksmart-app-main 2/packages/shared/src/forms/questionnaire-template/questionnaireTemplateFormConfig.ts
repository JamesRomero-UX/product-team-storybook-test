import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getQuestionnaireTemplateFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t('questionnaire_templates.fields.title'),
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t('questionnaire_templates.fields.description'),
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t(`fields.Owner`),
      columnHeader: i18n.t(`columns.owners`),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
    },
    Contributors: {
      fieldId: 'Contributors',
      formLabel: i18n.t(`fields.Contributor`),
      columnHeader: i18n.t(`columns.contributors`),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
    },
    tags: {
      fieldId: 'tags',
      formLabel: i18n.t(`fields.Tags`),
      columnHeader: i18n.t(`columns.tags`),
      displayType: {
        displayType: 'tags',
      },
    },
    departments: {
      fieldId: 'departments',
      formLabel: i18n.t(`fields.Departments`),
      columnHeader: i18n.t(`columns.departments`),
      displayType: {
        displayType: 'departments',
      },
    },
  } as const satisfies FormConfig;
};
