import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getInternalAuditEntityFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t('internalAudits.fields.Title'),
      allowAsConditionSource: true,
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t('internalAudits.fields.Description'),
      allowTargetConditions: true,
    },
    BusinessArea: {
      fieldId: 'BusinessArea',
      formLabel: i18n.t('internalAudits.fields.BusinessArea'),
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t(`fields.Owner`),
      columnHeader: i18n.t(`columns.owners`),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      allowAsConditionSource: true,
    },
    Contributors: {
      fieldId: 'Contributors',
      formLabel: i18n.t(`fields.Contributor`),
      columnHeader: i18n.t(`columns.contributors`),
      displayType: {
        displayType: 'users',
        multiple: true,
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    tags: {
      fieldId: 'tags',
      formLabel: i18n.t(`fields.Tags`),
      columnHeader: i18n.t(`columns.tags`),
      displayType: {
        displayType: 'tags',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    departments: {
      fieldId: 'departments',
      formLabel: i18n.t(`fields.Departments`),
      columnHeader: i18n.t(`columns.departments`),
      displayType: {
        displayType: 'departments',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
  } as const satisfies FormConfig;
};
