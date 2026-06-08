import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getObligationFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t('obligations.fields.Title'),
      columnHeader: i18n.t('obligations.columns.Title'),
      allowAsConditionSource: true,
    },
    Type: {
      fieldId: 'Type',
      formLabel: i18n.t('obligations.fields.Type'),
      columnHeader: i18n.t('obligations.columns.Type'),
      allowAsConditionSource: true,
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'obligations.fields.types',
      },
    },
    ParentId: {
      fieldId: 'ParentId',
      formLabel: i18n.t('obligations.fields.ParentId'),
      columnHeader: i18n.t('obligations.columns.ParentTitle'),
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t('obligations.fields.Description'),
      columnHeader: i18n.t('obligations.columns.Description'),
    },
    Interpretation: {
      fieldId: 'Interpretation',
      formLabel: i18n.t('obligations.fields.Interpretation'),
      columnHeader: i18n.t('obligations.columns.Interpretation'),
      allowTargetConditions: true,
    },
    Adherence: {
      fieldId: 'Adherence',
      formLabel: i18n.t('obligations.fields.Adherence'),
      columnHeader: i18n.t('obligations.columns.Adherence'),
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t('fields.Owner'),
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
