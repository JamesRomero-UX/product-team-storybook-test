import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { t } from 'i18next';

import { getAuditColumns } from './shared';
import type { SharedDataset } from './types';

export const getIndicatorResults = () =>
  ({
    supportedLatest: true,
    hasAccess: () => true,
    objectType: ParentTypes.IndicatorResult,
    label: 'Indicator results',
    customAttributeFormConfigurationParentTypes: [ParentTypes.IndicatorResult],
    fields: {
      id: {
        dataType: 'guid',
        displayType: 'text',
        defaultLabel: t('columns.guid'),
      },
      details: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'indicator_result', fieldId: 'Description' },
      },
      date: {
        dataType: 'date',
        displayType: 'date',
        formConfig: { formId: 'indicator_result', fieldId: 'ResultDate' },
      },
      numberValue: {
        dataType: 'number',
        displayType: 'number',
        formConfig: { formId: 'indicator_result', fieldId: 'TargetValueNum' },
      },
      textValue: {
        dataType: 'text',
        displayType: 'text',
        formConfig: { formId: 'indicator_result', fieldId: 'TargetValueTxt' },
      },
      ...getAuditColumns(),
    },
  }) as const satisfies SharedDataset;
