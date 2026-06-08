import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getDocumentFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t('policy.fields.Title'),
      columnHeader: i18n.t('policy.columns.title'),
      allowAsConditionSource: true,
    },
    Purpose: {
      fieldId: 'Purpose',
      formLabel: i18n.t('policy.fields.Purpose'),
      columnHeader: i18n.t('policy.columns.purpose'),
      allowTargetConditions: true,
    },
    ParentDocument: {
      fieldId: 'ParentDocument',
      formLabel: i18n.t('policy.fields.Parent'),
      columnHeader: i18n.t('policy.columns.parent'),
      allowTargetConditions: true,
    },
    DocumentType: {
      fieldId: 'DocumentType',
      formLabel: i18n.t('policy.fields.DocumentType'),
      columnHeader: i18n.t('policy.columns.type'),
      allowAsConditionSource: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'policy.types',
      },
    },
    linkedDocuments: {
      fieldId: 'linkedDocuments',
      formLabel: i18n.t('policy.fields.LinkedDocuments'),
      allowTargetConditions: true,
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t('policy.fields.Owner'),
      columnHeader: i18n.t('columns.owners'),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      allowAsConditionSource: true,
    },
    Contributors: {
      fieldId: 'Contributors',
      formLabel: i18n.t('fields.Contributor'),
      columnHeader: i18n.t('columns.contributors'),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    tags: {
      fieldId: 'tags',
      formLabel: i18n.t('fields.Tags'),
      columnHeader: i18n.t('columns.tags'),
      displayType: {
        displayType: 'tags',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    departments: {
      fieldId: 'departments',
      formLabel: i18n.t('fields.Departments'),
      columnHeader: i18n.t('columns.departments'),
      displayType: {
        displayType: 'departments',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
