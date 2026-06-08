import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';
import type { ModuleKey } from '@risksmart-app/modules/src/index';
import type { FieldDefinition } from '@risksmart-app/shared/reporting/datasets/types';
import type {
  GetDepartmentsQuery,
  GetUsersQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ComponentType } from 'react';

import type { CommonKeys } from '@/hooks/useCommonLookupLazy';
import type { JSONObject } from '@/types/types';
import type { FieldConfig } from '@/utils/table/types';

import type { ControlledBaseProps } from '../../types';
import type { FormFieldOptions } from '../edit-fields/fieldSchema';
import type { FieldRendererProps } from '../renderers/collection-layouts/types';
import type { CustomAttributeProps } from '../renderers/field-layouts/CustomAttributeProps';

export enum JsonSchemaFormat {
  Date = 'date',
  Link = 'uri',
}

export enum JsonSchemaType {
  Array = 'array',
  Boolean = 'boolean',
  Null = 'null',
  Number = 'number',
  Object = 'object',
  String = 'string',
}

export type FieldTypeConfig = {
  /**
   * Whether or not this custom attribute should be available within the UI
   */
  hasPermission?: (
    isModuleEnabled: (moduleKey: ModuleKey) => boolean
  ) => boolean;
  i18nKey: CommonKeys;
  /**
   * Component used alow user to choose a default value for this field.
   */
  DefaultValueComponent?: ComponentType<ControlledBaseProps<FormFieldOptions>>;
  /**
   * Component used to render the custom attribute field in the form.
   */
  FieldComponent: ComponentType<CustomAttributeProps>;
  /**
   * Retrieve the configuration required to render this custom attribute in the cloudscape table.
   * @param renderProps
   * @param options
   * @returns
   */
  getTableFieldConfig: (
    renderProps: FieldRendererProps,
    options: Partial<{
      enableRelativeDates: boolean;
      useAlternateValues: boolean;
    }>
  ) => FieldConfig<{
    CustomAttributeData: JSONObject;
  }>;

  /**
   * Use by the conditional property filter when editing conditions to correctly populate the correct options/filter component.
   * This is subtly different to table filtering as in a table we're filtering on the text value, but in a form it'll be the id value.
   * Also in a table you'll have a list of the possible values, whereas in a form we'll need to supply all possible values.
   * @param renderProps
   * @returns
   */
  getConditionalPropertyFilterProperty?: (
    renderProps: FieldRendererProps,
    // Ideally this function would request its own data, or the data would live on the renderProps, however as we only currently have two exceptions,
    // and almost all forms have these, going to make this data available up front
    data: {
      departmentTypes: GetDepartmentsQuery['department_type'];
      users: GetUsersQuery['user'];
    }
  ) => Pick<
    PropertyFilterProps.FilteringProperty,
    'operators' | 'defaultOperator'
  >;
  getConditionalPropertyFilterOptions?: (
    renderProps: FieldRendererProps,
    // Ideally this function would request its own data, or the data would live on the renderProps, however as we only currently have two exceptions,
    // and almost all forms have these, going to make this data available up front
    data: {
      departmentTypes: GetDepartmentsQuery['department_type'];
      users: GetUsersQuery['user'];
    }
  ) => Pick<PropertyFilterProps.FilteringOption, 'label' | 'value'>[];

  /**
   * value to display in the PDF export.
   * @returns
   */
  getPdfExportValue?: (
    renderProps: FieldRendererProps,
    item: {
      CustomAttributeData?: JSONObject | null | undefined;
    }
  ) => string;

  /**
   * Map to a FieldDefinition object as required by Custom Data Source definitions
   * @param renderProps
   * @returns
   */
  getCustomDataSourceFieldDefinition?: (
    renderProps: FieldRendererProps
  ) => FieldDefinition & { defaultLabel: string };

  /**
   * Set to true to allow the user to choose a default value for this field.
   * This value will be displayed on a new blank form
   */
  supportsDefaultValue?: boolean;

  /**
   * Set to true if the field has options that can be selected.
   * E.g. a select or multiselect field.
   */
  hasOptions?: boolean;

  /**
   * Set to true to enable the ability to add an alternative label
   */
  hasAlternateLabel?: boolean;

  /**
   * When set to true, allows this field to be used as a condition in rules.
   */
  allowAsConditionSource?: boolean;
};
