import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getIndicatorFormConfig = () => {
  return {
    Title: {
      fieldId: 'Title',
      formLabel: i18n.t(`indicators.fields.title`),
      columnHeader: i18n.t(`indicators.columns.title`),
    },
    Type: {
      fieldId: 'Type',
      formLabel: i18n.t(`indicators.fields.type`),
      displayType: { displayType: 'rating', ratingKey: 'indicator_type' },
    },
    Unit: {
      fieldId: 'Unit',
      formLabel: i18n.t(`indicators.fields.unit`),
      columnHeader: i18n.t(`indicators.columns.unit`),
    },
    LowerToleranceNum: {
      fieldId: 'LowerToleranceNum',
      formLabel: i18n.t(`indicators.fields.lower_tolerance_num`),
      columnHeader: i18n.t(`indicators.columns.lower_tolerance_num`),
      displayType: {
        displayType: 'number',
      },
    },
    LowerAppetiteNum: {
      fieldId: 'LowerAppetiteNum',
      formLabel: i18n.t(`indicators.fields.lower_appetite_num`),
      columnHeader: i18n.t(`indicators.columns.lower_appetite_num`),
      displayType: {
        displayType: 'number',
      },
    },
    UpperAppetiteNum: {
      fieldId: 'UpperAppetiteNum',
      formLabel: i18n.t(`indicators.fields.upper_appetite_num`),
      columnHeader: i18n.t(`indicators.columns.upper_appetite_num`),
      displayType: {
        displayType: 'number',
      },
    },
    UpperToleranceNum: {
      fieldId: 'UpperToleranceNum',
      formLabel: i18n.t(`indicators.fields.upper_tolerance_num`),
      columnHeader: i18n.t(`indicators.columns.upper_tolerance_num`),
      displayType: {
        displayType: 'number',
      },
    },
    TargetValueTxt: {
      fieldId: 'TargetValueTxt',
      formLabel: i18n.t(`indicators.fields.target_text_value`),
      columnHeader: i18n.t(`indicators.columns.target_text_value`),
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t(`indicators.fields.description`),
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
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`fields.newFiles`),
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
