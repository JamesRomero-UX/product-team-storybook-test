import type { FormConfigResponse } from '../../clients/client.interface';
import type { ResourceSchemaResponse } from '../../schemas/common/custom-fields.schema';
import { resourceSchemas } from '../../schemas/index';
import {
  createFieldConfigMap,
  createMetadataItem,
  extractLabelsFromUISchema,
  parseCustomFieldKey,
} from '../../utils/custom-fields';

const emptyResult = (schemaVersion: string | null): ResourceSchemaResponse => ({
  customFields: { schemaVersion, fields: {} },
});

// Transforms form configurations into a resource schema response (metadata-only, no values).
export function transformResourceSchema(
  formConfigurations: FormConfigResponse[]
): ResourceSchemaResponse {
  if (formConfigurations.length === 0) {
    return emptyResult(null);
  }

  const formConfig = formConfigurations[0]!;
  const schemaVersion = formConfig.ModifiedAtTimestamp;
  const { customAttributeSchema, fields_config: fieldsConfig } = formConfig;

  const props = resourceSchemas.PropertiesSchema.parse(
    customAttributeSchema?.Schema?.properties
  );

  const elements = customAttributeSchema?.UiSchema?.elements;
  if (!Array.isArray(elements)) {
    return emptyResult(schemaVersion);
  }

  const labelByProp = extractLabelsFromUISchema(elements);
  const fieldConfigByProp = createFieldConfigMap(fieldsConfig);

  const entries: [
    string,
    ReturnType<typeof createMetadataItem> & { id: string; label?: string },
  ][] = [];

  for (const propKey of Object.keys(props)) {
    const parsedKey = parseCustomFieldKey(propKey);
    if (!parsedKey) {
      continue;
    }

    const fieldConfig = fieldConfigByProp.get(propKey);
    if (!fieldConfig) {
      continue;
    }

    const schemaProp = props[propKey];
    if (!schemaProp) {
      continue;
    }

    const metadataItem = createMetadataItem(
      parsedKey.kind,
      schemaProp,
      fieldConfig
    );
    const label = labelByProp.get(propKey);

    entries.push([
      parsedKey.id,
      {
        id: parsedKey.id,
        ...(label ? { label } : {}),
        ...metadataItem,
      },
    ]);
  }

  const fields = Object.fromEntries(entries);

  return { customFields: { schemaVersion, fields } };
}
