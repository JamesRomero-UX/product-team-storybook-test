import dayjs from 'dayjs';

import { dateRangeFilterOperators } from '@/components/date-time-filter/dateFilterOperator';
import { EMPTY_VALUE } from '@/utils/collectionUtils';
import { toLocalDate } from '@/utils/dateUtils';
import { matchToField } from '@/utils/table/utils/customAttributeHelpers';

import { CustomAttributeDateInput } from '../renderers/field-layouts/CustomAttributeDateInput';
import { getBasicFieldConfig } from './defaults';
import { type FieldTypeConfig } from './types';

export const date: FieldTypeConfig = {
  i18nKey: 'customAttributes.fieldTypes.date',
  FieldComponent: CustomAttributeDateInput,
  getTableFieldConfig: (renderProps) => ({
    ...getBasicFieldConfig(renderProps),

    cell: (data) =>
      toLocalDate(matchToField(data.CustomAttributeData, renderProps.path)),
    filterOptions: {
      filteringProperties: {
        operators: dateRangeFilterOperators,
      },
    },
    exportVal: (item) =>
      matchToField(item.CustomAttributeData, renderProps.path) !== EMPTY_VALUE
        ? dayjs(
            String(matchToField(item.CustomAttributeData, renderProps.path))
          ).format('DD/MM/YYYY HH:mm')
        : '',
  }),
  getConditionalPropertyFilterProperty: () => ({
    operators: dateRangeFilterOperators,
  }),
  getPdfExportValue(renderProps, item) {
    return toLocalDate(
      matchToField(item.CustomAttributeData ?? null, renderProps.path)
    );
  },
  getCustomDataSourceFieldDefinition(renderProps) {
    return {
      defaultLabel: renderProps.label,
      displayType: 'date',
      dataType: 'text',
    };
  },
  allowAsConditionSource: true,
};
