import type { ComponentType } from 'react';
import BadgeList from 'src/components/badge-list';
import { notEmpty } from 'src/utilityTypes';

import type { CustomFieldValue } from '@/utils/table/types';
import { matchToArrayField } from '@/utils/table/utils/customAttributeHelpers';

import type { CustomAttributeProps } from '../renderers/field-layouts/CustomAttributeProps';
import { CustomAttributeUserMultiSelect } from '../renderers/field-layouts/CustomAttributeUserMultiSelect';
import { getBasicFieldConfig } from './defaults';
import { type FieldTypeConfig } from './types';

export const userMultiselect: FieldTypeConfig = {
  i18nKey: 'customAttributes.fieldTypes.usermultiselect',
  FieldComponent:
    CustomAttributeUserMultiSelect as unknown as ComponentType<CustomAttributeProps>,
  getTableFieldConfig: (renderProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customFieldValue: CustomFieldValue<any> = (
      { CustomAttributeData },
      { userLookup }
    ) => {
      const userIds = matchToArrayField(CustomAttributeData, renderProps.path);

      return userIds
        ? userIds.map((id) => userLookup?.[id] ?? null).filter(notEmpty)
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
          const userFriendlyNames = Array.from(
            new Set(
              records.flatMap((data) =>
                matchToArrayField(data, renderProps.path)
              )
            )
          );

          return userFriendlyNames.map((name) => ({
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
  getCustomDataSourceFieldDefinition(renderProps) {
    return {
      defaultLabel: renderProps.label,
      displayType: 'badgeList',
      dataType: 'textArray',
    };
  },
  getConditionalPropertyFilterProperty: (_, { users }) => {
    return {
      operators: [
        {
          operator: '=',
          format: (value: string) =>
            users.find((user) => user.Id === value)?.FriendlyName ?? value,
          match: (rowValues: unknown, filterValue: string) =>
            Array.isArray(rowValues) && rowValues.includes(filterValue),
        },
      ],
    };
  },
  getConditionalPropertyFilterOptions: (_, { users }) => {
    return (
      users.map((value) => ({
        value: value.Id!,
        label: value.FriendlyName!,
      })) ?? []
    );
  },
  allowAsConditionSource: true,
};
