import type { ComponentType } from 'react';
import type { JSONObject } from 'src/@types';

import {
  matchToField,
  resolveDisplayValues,
} from '@/utils/table/utils/customAttributeHelpers';

import ControlledSelect from '../../controlled-select';
import type { ControlledBaseProps } from '../../types';
import type { FormFieldOptions } from '../edit-fields/fieldSchema';
import { CustomAttributeSelect } from '../renderers/field-layouts/CustomAttributeSelect';
import { getBasicFieldConfig } from './defaults';
import { type FieldTypeConfig } from './types';

export const select: FieldTypeConfig = {
  i18nKey: 'customAttributes.fieldTypes.select',
  DefaultValueComponent: ControlledSelect as ComponentType<
    ControlledBaseProps<FormFieldOptions>
  >,
  FieldComponent: CustomAttributeSelect,

  getTableFieldConfig: (renderProps, options) => {
    const displayValues = resolveDisplayValues({
      formFieldOptions: renderProps.options,
      useAlternativeValues: options?.useAlternateValues ?? false,
    });

    return {
      ...getBasicFieldConfig(renderProps, {
        useAlternateValues: !!options.useAlternateValues,
      }),

      customFieldValue: (item: { CustomAttributeData: JSONObject }) => {
        return matchToField(
          item.CustomAttributeData,
          renderProps.path,
          displayValues
        );
      },

      cell: (data) => {
        return matchToField(
          data.CustomAttributeData,
          renderProps.path,
          displayValues
        );
      },
    };
  },
  getConditionalPropertyFilterProperty: () => ({
    operators: [
      {
        operator: '=',
        match: (rowValues: unknown, filterValue: string) =>
          rowValues === filterValue,
      },
      {
        operator: '!=',
        match: (rowValues: unknown, filterValue: string) =>
          rowValues !== filterValue,
      },
    ],
  }),
  getConditionalPropertyFilterOptions: (renderProps) => {
    return (
      renderProps.options?.map((option) => {
        if (option._tag === 'StringOption') {
          return { value: option.Value, label: option.Value };
        } else {
          return { value: option.AltValue, label: option.Value };
        }
      }) ?? []
    );
  },
  getCustomDataSourceFieldDefinition(renderProps) {
    return {
      defaultLabel: renderProps.label,
      displayType: 'options',
      dataType: 'text',
      getOptions: () =>
        renderProps.options?.map((o) => {
          if (o._tag === 'StringOption') {
            return { value: o.Value, label: o.Value };
          } else {
            return { value: o.AltValue, label: o.Value };
          }
        }) ?? [],
    };
  },

  hasOptions: true,
  supportsDefaultValue: true,
  hasAlternateLabel: true,
  allowAsConditionSource: true,
};
