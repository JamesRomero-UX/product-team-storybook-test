import type { FormConfigResponse } from '../../clients/client.interface';
import { resourceSchemas } from '../../schemas/index';
import type {
  CustomAttributesResponseCompact,
  CustomAttributesResponseExpanded,
} from '../../schemas/schema.types';
import {
  createDataItem,
  createFieldConfigMap,
  createMetadataItem,
  extractLabelsFromUISchema,
  parseCustomFieldKey,
  type SchemaProperty,
  validateCustomFieldConfig,
} from '../../utils/custom-fields';
import { logger } from '../../utils/logger';

type FieldConfigByPropMap = Map<
  string,
  {
    FieldId: string;
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    Hidden: boolean;
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    Required: boolean;
    // no-dd-sa:typescript-best-practices/boolean-prop-naming
    ReadOnly: boolean;
    DefaultValue: string | string[] | number | null;
  }
>;

// Processes custom attribute data entries and creates compact field entries.
function processCustomFieldsCompact(
  inputData: Record<string, unknown>,
  props: Record<string, SchemaProperty>,
  labelByProp: Map<string, string>,
  fieldConfigByProp: FieldConfigByPropMap
): Array<[string, CustomAttributesResponseCompact['fields'][0]]> {
  const entries: Array<[string, CustomAttributesResponseCompact['fields'][0]]> =
    [];

  for (const [propKey, rawValue] of Object.entries(inputData)) {
    const parsedKey = parseCustomFieldKey(propKey);
    const fieldConfig = fieldConfigByProp.get(propKey);

    const isValid = validateCustomFieldConfig({
      propKey,
      rawValue,
      parsedKey,
      fieldConfig,
    });

    if (!isValid || !parsedKey) {
      continue;
    }

    const label = labelByProp.get(propKey);
    const dataItem = createDataItem(
      parsedKey.id,
      rawValue as string | number | boolean | readonly string[] | null,
      label
    );

    entries.push([parsedKey.id, Object.freeze({ data: dataItem })]);
  }

  return entries;
}

// Processes custom attribute data entries and creates expanded field entries with metadata.
function processCustomFieldsExpanded(
  inputData: Record<string, unknown>,
  props: Record<string, SchemaProperty>,
  labelByProp: Map<string, string>,
  fieldConfigByProp: FieldConfigByPropMap
): Array<[string, CustomAttributesResponseExpanded['fields'][0]]> {
  const entries: Array<
    [string, CustomAttributesResponseExpanded['fields'][0]]
  > = [];

  for (const [propKey, rawValue] of Object.entries(inputData)) {
    const parsedKey = parseCustomFieldKey(propKey);
    const schemaProp = props[propKey];
    const fieldConfig = fieldConfigByProp.get(propKey);

    const isValid = validateCustomFieldConfig({
      propKey,
      rawValue,
      parsedKey,
      fieldConfig,
    });

    if (!isValid || !parsedKey || !fieldConfig) {
      continue;
    }

    const label = labelByProp.get(propKey);
    const dataItem = createDataItem(
      parsedKey.id,
      rawValue as string | number | boolean | readonly string[] | null,
      label
    );
    const metadataItem = schemaProp
      ? createMetadataItem(parsedKey.kind, schemaProp, fieldConfig)
      : null;

    entries.push([
      parsedKey.id,
      Object.freeze({ data: dataItem, metadata: metadataItem }),
    ]);
  }

  return entries;
}

// Prepares configuration maps from form config for efficient field processing.
function prepareConfigMaps(formConfig: FormConfigResponse) {
  const { customAttributeSchema, fields_config: fieldsConfig } = formConfig;
  const props = resourceSchemas.PropertiesSchema.parse(
    customAttributeSchema?.Schema?.properties
  );
  const elements = customAttributeSchema?.UiSchema?.elements;

  if (!Array.isArray(elements)) {
    throw new Error('invalid transform structure for formConfig');
  }

  const labelByProp = extractLabelsFromUISchema(elements);
  const fieldConfigByProp = createFieldConfigMap(fieldsConfig);

  return { props, labelByProp, fieldConfigByProp };
}

// Transforms custom attribute data into a structured response format.
// Supports both compact and expanded formats based on the expandMeta option.
export function transformCustomFields<
  const T extends boolean | undefined = false,
>(
  data: unknown,
  formConfig: FormConfigResponse,
  opts?: { expandMeta?: T }
): CustomAttributesResponseExpanded | CustomAttributesResponseCompact {
  const { expandMeta = false } = opts ?? {};

  try {
    const inputData = resourceSchemas.customAttributeDataSchema.parse(data);
    const schemaUpdatedAt = formConfig.ModifiedAtTimestamp;
    const { props, labelByProp, fieldConfigByProp } =
      prepareConfigMaps(formConfig);

    const baseResponse = { schemaUpdatedAt } as const;

    if (expandMeta) {
      const expandedEntries = processCustomFieldsExpanded(
        inputData,
        props,
        labelByProp,
        fieldConfigByProp
      );
      const fields = Object.freeze(Object.fromEntries(expandedEntries));

      return resourceSchemas.CustomAttributesResponseExpandedSchema.parse({
        ...baseResponse,
        fields,
      });
    }

    const compactEntries = processCustomFieldsCompact(
      inputData,
      props,
      labelByProp,
      fieldConfigByProp
    );
    const fields = Object.freeze(Object.fromEntries(compactEntries));

    return resourceSchemas.CustomAttributesResponseCompactSchema.parse({
      ...baseResponse,
      fields,
    });
  } catch (error) {
    logger.error(
      { data, error, formConfig, opts },
      'Failed to transform custom field data'
    );

    throw error;
  }
}

export type TransformCustomFieldsFn = typeof transformCustomFields;
