import type { ComponentType } from 'react';
import BadgeList from 'src/components/badge-list';
import { notEmpty } from 'src/utilityTypes';

import type { CustomFieldValue } from '@/utils/table/types';
import { matchToArrayField } from '@/utils/table/utils/customAttributeHelpers';

import { CustomAttributeDepartmentMultiSelect } from '../renderers/field-layouts/CustomAttributeDepartmentMultiSelect';
import type { CustomAttributeProps } from '../renderers/field-layouts/CustomAttributeProps';
import { getBasicFieldConfig } from './defaults';
import { type FieldTypeConfig } from './types';

export const departmentMultiselect: FieldTypeConfig = {
  i18nKey: 'customAttributes.fieldTypes.departmentmultiselect',
  FieldComponent:
    CustomAttributeDepartmentMultiSelect as unknown as ComponentType<CustomAttributeProps>,

  getTableFieldConfig: (renderProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customFieldValue: CustomFieldValue<any> = (
      { CustomAttributeData },
      { departmentTypeLookup }
    ) => {
      const departmentTypeIds = matchToArrayField(
        CustomAttributeData,
        renderProps.path
      );

      return departmentTypeIds
        ? departmentTypeIds
            .map((id) => departmentTypeLookup?.[id] ?? null)
            .filter(notEmpty)
        : [];
    };

    return {
      ...getBasicFieldConfig(renderProps),
      customFieldValue,
      filterOptions: {
        filteringProperties: {
          operators: [
            {
              operator: '=',
              match: (rowValues: unknown, filterValue: string) =>
                Array.isArray(rowValues) && rowValues.includes(filterValue),
            },
          ],
        },
        filteringOptions: (records) => {
          const names = Array.from(
            new Set(
              records.flatMap((data) =>
                matchToArrayField(data, renderProps.path)
              )
            )
          );

          return names.map((name) => ({
            value: name,
            label: name,
          }));
        },
      },
      cell: (data) => {
        const userFriendlyNames = matchToArrayField(data, renderProps.path);

        return <BadgeList badges={userFriendlyNames} />;
      },
      exportVal: (data) => matchToArrayField(data, renderProps.path).join(', '),
    };
  },
  getConditionalPropertyFilterProperty: (_, { departmentTypes }) => {
    return {
      operators: [
        {
          operator: '=',
          format: (value: string) =>
            departmentTypes.find((dept) => dept.DepartmentTypeId === value)
              ?.Name ?? value,
          match: (rowValues: unknown, filterValue: string) =>
            Array.isArray(rowValues) && rowValues.includes(filterValue),
        },
      ],
    };
  },
  getConditionalPropertyFilterOptions: (_, { departmentTypes }) => {
    return (
      departmentTypes.map((value) => ({
        value: value.DepartmentTypeId,
        label: value.Name,
      })) ?? []
    );
  },
  getCustomDataSourceFieldDefinition(renderProps) {
    return {
      defaultLabel: renderProps.label,
      displayType: 'badgeList',
      dataType: 'textArray',
    };
  },
  allowAsConditionSource: true,
};
