import i18n from '@risksmart-app/i18n/src/i18n';

import type { FormConfig } from '../types';

export const getIndicatorResultFormConfig = () => {
  return {
    TargetValueTxt: {
      fieldId: 'TargetValueTxt',
      formLabel: i18n.t(`indicator_results.fields.text_result`),
      columnHeader: i18n.t(`indicator_results.columns.result`),
    },
    TargetValueNum: {
      fieldId: 'TargetValueNum',
      formLabel: i18n.t(`indicator_results.fields.num_result`),
      columnHeader: i18n.t(`indicator_results.columns.result`),
      displayType: { displayType: 'number' },
    },
    ResultDate: {
      fieldId: 'ResultDate',
      formLabel: i18n.t(`indicator_results.fields.date`),
      columnHeader: i18n.t(`indicator_results.columns.date_time`),
      displayType: { displayType: 'date' },
    },
    Description: {
      fieldId: 'Description',
      formLabel: i18n.t(`indicator_results.fields.description`),
    },
    files: {
      fieldId: 'files',
      formLabel: i18n.t(`fields.newFiles`),
    },
  } as const satisfies FormConfig;
};
