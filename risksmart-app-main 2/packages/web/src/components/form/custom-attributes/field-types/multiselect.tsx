import type { JSONObject } from '@segment/analytics-next/dist/types/core/events';
import type { ComponentType } from 'react';
import BadgeList from 'src/components/badge-list';

import {
  matchToArrayField,
  resolveDisplayValues,
} from '@/utils/table/utils/customAttributeHelpers';

import { CustomAttributeMultiSelect } from '../renderers/field-layouts/CustomAttributeMultiSelect';
import type { CustomAttributeProps } from '../renderers/field-layouts/CustomAttributeProps';
import { getBasicFieldConfig } from './defaults';
import { type FieldTypeConfig } from './types';

export const multiselect: FieldTypeConfig = {
  i18nKey: 'customAttributes.fieldTypes.multiselect',
  FieldComponent:
    // TODO: Support generic value type
    CustomAttributeMultiSelect as unknown as ComponentType<CustomAttributeProps>,
  getConditionalPropertyFilterProperty: () => ({
    defaultOperator: ':',
    operators: [
      {
        operator: ':',
        match: (rowValues: unknown, filterValue: string) =>
          Array.isArray(rowValues) && rowValues.includes(filterValue),
      },
      {
        operator: '!:',
        match: (rowValues: unknown, filterValue: string) =>
          !Array.isArray(rowValues) || !rowValues.includes(filterValue),
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
  getTableFieldConfig: (renderProps, options) => {
    const displayValues = resolveDisplayValues({
      formFieldOptions: renderProps.options,
      useAlternativeValues: options?.useAlternateValues ?? false,
    });

    return {
      ...getBasicFieldConfig(renderProps, {
        useAlternateValues: !!options.useAlternateValues,
      }),
      filterOptions: {
        filteringProperties: {
          operators: [
            {
              operator: '=',
              match: (rowValues: unknown, filterValue: string) =>
                Array.isArray(rowValues) && rowValues.includes(filterValue),
            },
            {
              operator: ':',
              match: (rowValues: unknown, filterValue: string) =>
                Array.isArray(rowValues) && rowValues.includes(filterValue),
            },
          ],
        },
        filteringOptions:
          renderProps.options?.map((value) => {
            if (value._tag === 'AltValueOption' && options.useAlternateValues) {
              return { value: value.AltValue, label: value.AltValue };
            } else {
              return { value: value.Value, label: value.Value };
            }
          }) ?? [],
      },

      customFieldValue: (item: { CustomAttributeData: JSONObject }) => {
        return matchToArrayField(
          item.CustomAttributeData,
          renderProps.path,
          displayValues
        );
      },

      cell: (data) => {
        return (
          <BadgeList
            badges={matchToArrayField(
              data.CustomAttributeData,
              renderProps.path,
              displayValues
            )}
          />
        );
      },
    };
  },

  getCustomDataSourceFieldDefinition(renderProps) {
    return {
      defaultLabel: renderProps.label,
      displayType: 'multiOptions',
      dataType: 'textArray',
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
  hasAlternateLabel: true,
  allowAsConditionSource: true,
};
