import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';
import { issueTypeTaxonomy } from './variants';

export const getIssueFormConfig = (parentIssueType: ParentIssueType) => {
  const taxonomyLookup = issueTypeTaxonomy[parentIssueType];
  const taxonomy = taxonomyLookup.taxonomy;

  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`${taxonomy}.fields.Title`),
      columnHeader: i18n.t(`${taxonomy}.columns.title`),
      allowAsConditionSource: true,
    },
    Details: {
      fieldId: 'Details',
      formLabel: i18n.t(`${taxonomy}.fields.Details`),
      columnHeader: i18n.t(`${taxonomy}.columns.details`),
      allowTargetConditions: true,
    },
    ImpactsCustomer: {
      fieldId: 'ImpactsCustomer',
      formLabel: i18n.t(`${taxonomy}.fields.ImpactsCustomer`),
      columnHeader: i18n.t(`${taxonomy}.columns.impacts_customer`),
      displayType: { displayType: 'commonLookup', i18nKey: 'yesOrNo' },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    IsExternalIssue: {
      fieldId: 'IsExternalIssue',
      formLabel: i18n.t(`${taxonomy}.fields.IsExternalIssue`),
      columnHeader: i18n.t(`${taxonomy}.columns.internal_or_external_issue`),
      displayType: {
        displayType: 'commonLookup',
        i18nKey: 'issues.isExternalIssue',
      },
      allowAsConditionSource: true,
      allowTargetConditions: true,
    },
    DateOccurred: {
      fieldId: 'DateOccurred',
      formLabel: i18n.t(`${taxonomy}.fields.DateOccurred`),
      columnHeader: i18n.t(`${taxonomy}.columns.date_occurred`),
      allowAsConditionSource: true,
      displayType: { displayType: 'date' },
    },
    DateIdentified: {
      fieldId: 'DateIdentified',
      formLabel: i18n.t(`${taxonomy}.fields.DateIdentified`),
      columnHeader: i18n.t(`${taxonomy}.columns.date_identified`),
      allowAsConditionSource: true,
      displayType: { displayType: 'date' },
    },
    Owners: {
      fieldId: 'Owners',
      formLabel: i18n.t(`${taxonomy}.fields.Owner`),
      columnHeader: i18n.t(`columns.owners`),
      allowTargetConditions: true,
      allowAsConditionSource: true,
      displayType: {
        displayType: 'users',
        multiple: true,
      },
    },
    Contributors: {
      fieldId: 'Contributors',
      formLabel: i18n.t(`${taxonomy}.fields.Contributor`),
      columnHeader: i18n.t(`columns.contributors`),
      allowTargetConditions: true,
      allowAsConditionSource: true,
      displayType: {
        displayType: 'users',
        multiple: true,
      },
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`${taxonomy}.fields.newFiles`),
      allowTargetConditions: true,
    },
    tags: {
      fieldId: 'tags',
      formLabel: i18n.t(`${taxonomy}.fields.Tags`),
      columnHeader: i18n.t(`columns.tags`),
      allowTargetConditions: true,
      allowAsConditionSource: true,
      displayType: {
        displayType: 'tags',
      },
    },
    departments: {
      fieldId: 'departments',
      formLabel: i18n.t(`${taxonomy}.fields.Departments`),
      columnHeader: i18n.t(`columns.departments`),
      allowTargetConditions: true,
      allowAsConditionSource: true,
      displayType: {
        displayType: 'departments',
      },
    },
  } as const satisfies FormConfig;
};
