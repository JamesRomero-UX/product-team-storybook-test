import type { JsonSchema7, UISchemaElement } from '@jsonforms/core';
import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';
import { fieldTypesConfig } from 'src/components/form/custom-attributes/field-types';
import customAttributeRenderers, {
  jsonFormsDispatchRenderer,
} from 'src/components/form/custom-attributes/renderers/collection-layouts/customAttributeRenderers';
import type { FieldRendererProps } from 'src/components/form/custom-attributes/renderers/collection-layouts/types';

import type { JSONObject } from '@/types/types';

import type { FieldConfig, TableRecord } from '../types';

/**
 * Retrieve a list of field configs for a give custom attribute schema
 * @param schema
 * @param uiSchema
 * @returns
 */
export const getCustomAttributeRenderProps = (
  schema: JsonSchema7,
  uiSchema: UISchemaElement
): FieldRendererProps[] => {
  const renderers = customAttributeRenderers;

  return jsonFormsDispatchRenderer({
    renderers,
    rootSchema: schema,
    schema,
    uischema: uiSchema,
  });
};

/**
 * Returns an object containing all the custom attribute values
 * @param fields
 * @param record
 * @returns
 */
export const getCustomAttributeDataForRecord = <T extends TableRecord>(
  fields: Record<keyof T, FieldConfig<T>>,
  record: T,
  {
    userLookup,
    departmentTypeLookup,
  }: {
    userLookup: Record<string, string> | undefined;
    departmentTypeLookup?: Record<string, string>;
  }
) => {
  return Object.entries(fields).reduce((acc, [key, field]) => {
    if (field.custom) {
      return {
        ...acc,
        [key]: field.customFieldValue(record, {
          userLookup,
          departmentTypeLookup,
        }),
      };
    }

    return acc;
  }, {});
};

function convertSchemaToFieldConfig<
  T extends {
    CustomAttributeData: JSONObject;
  },
>({
  schemas,
  enableRelativeDates,
}: {
  schemas: CustomAttributeSchema | undefined;
  enableRelativeDates: boolean;
}): { [key: string]: FieldConfig<T> } {
  const config: { [key: string]: FieldConfig<T> } = {};
  if (!schemas?.Schema || !schemas?.UiSchema) {
    return config;
  }
  // render column collections from schemas.
  const collections = getCustomAttributeRenderProps(
    schemas?.Schema || {},
    schemas?.UiSchema || {}
  );

  // map collections to config using type.
  collections.forEach((renderProps) => {
    const { path, type, options, altLabel } = renderProps;

    const useAlternateValues =
      options?.some((o) => o._tag === 'AltValueOption') || !!altLabel;

    const fieldTypeConfig = fieldTypesConfig[type];
    if (!fieldTypeConfig) {
      console.warn(`No field type config found for type: ${type}`);

      return;
    }
    config[path] = fieldTypeConfig.getTableFieldConfig(renderProps, {
      enableRelativeDates,
    });

    if (useAlternateValues) {
      config[`${path}_alt`] = {
        ...fieldTypeConfig.getTableFieldConfig(renderProps, {
          enableRelativeDates,
          useAlternateValues,
        }),
        isVirtual: true,
      };
    }
  });

  return config;
}

export const convertSchemasToFieldConfigs = ({
  customAttributeSchemas,
  enableRelativeDates,
}: {
  customAttributeSchemas: CustomAttributeSchema[];
  enableRelativeDates: boolean;
}): ReturnType<typeof convertSchemaToFieldConfig> => {
  return customAttributeSchemas.reduce((configs, schemas) => {
    return {
      ...configs,
      ...convertSchemaToFieldConfig({ schemas, enableRelativeDates }),
    };
  }, {});
};
