import type { OrgFeature } from '@risksmart-app/modules/src/index';
import { getFormConfigRegistry } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { FormFieldConfig } from '@risksmart-app/shared/forms/types';
import { getSharedDatasets } from '@risksmart-app/shared/reporting/datasets';
import type { FieldDefinition } from '@risksmart-app/shared/reporting/datasets/types';
import type { DataSourceType } from '@risksmart-app/shared/reporting/schema';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { fieldTypesConfig } from 'src/components/form/custom-attributes/field-types';
import type { FieldRendererProps } from 'src/components/form/custom-attributes/renderers/collection-layouts/types';

import { getCustomAttributeRenderProps } from '@/utils/table/utils/customAttributes';

import type { CustomAttributeSchemaLookup } from './types';

export type FieldDefinitionWithId = FieldDefinition & {
  fieldId: string;
  /**
   * User defined label
   */
  label?: string;
};

const customAttributeFieldIdPrefix = 'custom/';

export type FieldDefinitionWithIdAndDefaultLabel = FieldDefinitionWithId & {
  defaultLabel: string;
};

export const DatasetModel = (
  dataSourceType: DataSourceType,
  customAttributeSchemaLookup: CustomAttributeSchemaLookup,
  formFieldConfigurations:
    | GetFormCustomisationQuery['form_field_configuration']
    | null,
  hasParent: boolean,
  enabledFeatures: OrgFeature[]
) => {
  const dataset = getSharedDatasets()[dataSourceType];

  /**
   * Retrieves all standard dataset fields
   */
  const getStandardFields = (): FieldDefinitionWithIdAndDefaultLabel[] => {
    const formRegistry = getFormConfigRegistry(enabledFeatures);
    const fields: FieldDefinitionWithIdAndDefaultLabel[] = Object.keys(
      dataset.fields
    ).map((fieldId) => {
      const field = dataset.fields[fieldId];
      let defaultLabel: string;
      if ('defaultLabel' in field) {
        defaultLabel = field.defaultLabel;
      } else {
        const form = formRegistry[field.formConfig.formId];
        const fieldDetails: FormFieldConfig =
          form[field.formConfig.fieldId as keyof typeof form];
        defaultLabel = fieldDetails.formLabel;

        const formFieldConfig = formFieldConfigurations?.find(
          (f) =>
            f.FormConfigurationParentType == field.formConfig.formId &&
            f.FieldId == field.formConfig.fieldId
        );
        if (formFieldConfig && formFieldConfig.Label) {
          defaultLabel = formFieldConfig.Label;
        }
      }

      return {
        fieldId,
        ...field,
        defaultLabel,
      };
    });

    return fields;
  };

  /**
   * Retrieves all custom attribute fields
   */
  const getCustomAttributeFields =
    (): FieldDefinitionWithIdAndDefaultLabel[] => {
      const fields: FieldDefinitionWithIdAndDefaultLabel[] = [];
      if (!dataset.customAttributeFormConfigurationParentTypes) {
        return fields;
      }
      dataset.customAttributeFormConfigurationParentTypes.forEach(
        (parentType) => {
          const customAttributeSchema = customAttributeSchemaLookup[parentType];
          if (!customAttributeSchema) {
            return;
          }
          const customAttributeFields = getCustomAttributeRenderProps(
            customAttributeSchema.Schema,
            customAttributeSchema.UiSchema
          );

          for (const customAttributeField of customAttributeFields) {
            let fieldDef: FieldDefinition & { defaultLabel: string } = {
              defaultLabel: customAttributeField.label,
              displayType: 'text',
              dataType: 'text',
            };
            const fieldConfig = fieldTypesConfig[customAttributeField.type];
            if (fieldConfig.getCustomDataSourceFieldDefinition) {
              fieldDef =
                fieldConfig.getCustomDataSourceFieldDefinition(
                  customAttributeField
                );
            }
            fields.push({
              ...fieldDef,
              fieldId: getCustomAttributeFieldId(customAttributeField),
            });
          }
        }
      );

      return fields;
    };

  const standardFields = getStandardFields();
  const customAttributeFields = getCustomAttributeFields();

  const fields = [...standardFields, ...customAttributeFields].filter(
    (f) => !f.onlyShowIfChild || hasParent
  );

  return { fields, customAttributeFields };
};

const getCustomAttributeFieldId = (customAttributeField: FieldRendererProps) =>
  `${customAttributeFieldIdPrefix}${customAttributeField.path}`;
