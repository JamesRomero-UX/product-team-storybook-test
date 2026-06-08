import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getActionFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`fields.Title`),
      columnHeader: i18n.t(`actions.columns.title`),
      allowAsConditionSource: true,
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t(`fields.Description`),
      columnHeader: i18n.t(`actions.columns.description`),
      allowTargetConditions: true,
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
    Status: {
      fieldId: 'Status',
      formLabel: i18n.t(`fields.Status`),
      columnHeader: i18n.t(`actions.columns.status`),
      allowAsConditionSource: true,
      displayType: { displayType: 'rating', ratingKey: 'action_status' },
    },
    DateRaised: {
      fieldId: 'DateRaised',
      formLabel: i18n.t(`actions.fields.DateRaised`),
      columnHeader: i18n.t(`actions.columns.date_raised`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
    },
    DateDue: {
      fieldId: 'DateDue',
      formLabel: i18n.t(`actions.fields.TargetCloseDate`),
      columnHeader: i18n.t(`actions.columns.due_date`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
    },
    ClosedDate: {
      fieldId: 'ClosedDate',
      formLabel: i18n.t(`actions.fields.ClosedDate`),
      columnHeader: i18n.t(`actions.columns.closed_date`),
      displayType: { displayType: 'date' },
      allowAsConditionSource: true,
    },
    Priority: {
      fieldId: 'Priority',
      formLabel: i18n.t(`actions.fields.Priority`),
      columnHeader: i18n.t(`actions.columns.priority`),
      displayType: { displayType: 'rating', ratingKey: 'priority' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`fields.newFiles`),
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
