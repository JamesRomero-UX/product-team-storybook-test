import { logger } from './logger';
import { buildKindSchema } from './schemas';

export interface UISchemaElement {
  type: string;
  label?: string;
  scope: string;
}

export interface FieldConfigRecord {
  FieldId: string;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Hidden: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  Required: boolean;
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  ReadOnly: boolean;
  DefaultValue: string | string[] | number | null;
}

export interface SchemaProperty {
  description?: string;
  enum?: string[];
  format?: string;
  uniqueItems?: boolean;
}

export interface ParsedCustomFieldKey {
  id: string;
  kind: string;
}

// matches a pattern of <timestamp[ms]>_<kind[string]>
export const DATA_KEY_REGEX = /^(?<id>\d{13})_(?<kind>[a-z][a-z0-9_-]*)$/i;

// Parses a custom field key to extract the ID and kind.
export function parseCustomFieldKey(key: string): ParsedCustomFieldKey | null {
  const match = DATA_KEY_REGEX.exec(key);
  if (!match?.groups) {
    return null;
  }
  const { id = '', kind = '' } = match.groups;

  return { id, kind };
}

// Extracts label mappings from UI schema elements.
// Maps property names to their display labels.
export function extractLabelsFromUISchema(
  elements: unknown
): Map<string, string> {
  const labelByProp = new Map<string, string>();

  if (!Array.isArray(elements)) {
    return labelByProp;
  }

  const scopePrefix = '#/properties/';
  for (const element of elements as UISchemaElement[]) {
    if (element.type !== 'Control') {
      continue;
    }
    if (element.scope.startsWith(scopePrefix) && element.label) {
      labelByProp.set(element.scope.slice(scopePrefix.length), element.label);
    }
  }

  return labelByProp;
}

// Creates a map of field configurations indexed by property key.
// Strips the 'CustomAttributeData.' prefix from FieldId for easier lookup.
export function createFieldConfigMap<T extends FieldConfigRecord>(
  fieldsConfig: T[]
): Map<string, T> {
  const fieldConfigByProp = new Map<string, T>();
  const prefix = 'CustomAttributeData.';

  for (const fieldConfig of fieldsConfig) {
    if (fieldConfig.FieldId.startsWith(prefix)) {
      fieldConfigByProp.set(
        fieldConfig.FieldId.slice(prefix.length),
        fieldConfig
      );
    }
  }

  return fieldConfigByProp;
}

// Creates the data item portion of a custom field response.
export function createDataItem(
  id: string,
  value: string | number | boolean | readonly string[] | null,
  label?: string
): {
  id: string;
  value: string | number | boolean | readonly string[] | null;
  label?: string;
} {
  return Object.freeze({
    id,
    value,
    ...(label ? { label } : {}),
  });
}

// Creates the metadata item portion of a custom field response.
export function createMetadataItem(
  kind: string,
  schemaProp: SchemaProperty,
  fieldConfig: FieldConfigRecord
): {
  kind: string;
  description?: string;
  hidden: boolean;
  readOnly: boolean;
  required: boolean;
  defaultValue: string | string[] | number | null;
  enum?: string[];
  format?: string;
  uniqueItems?: boolean;
} {
  return Object.freeze({
    kind,
    description: schemaProp.description ?? undefined,
    hidden: fieldConfig.Hidden,
    readOnly: fieldConfig.ReadOnly,
    required: fieldConfig.Required,
    defaultValue: fieldConfig.DefaultValue,
    enum: schemaProp.enum ?? undefined,
    format: schemaProp.format ?? undefined,
    uniqueItems: schemaProp.uniqueItems ?? undefined,
  });
}

export interface CustomFieldLookupEntry {
  propKey: string;
  kind: string;
  schemaProp: { enum?: string[]; format?: string };
  fieldConfig: FieldConfigRecord | undefined;
}

export const buildCustomFieldIdLookup = (
  props: Record<string, { enum?: string[]; format?: string }>,
  fieldConfigMap: Map<string, FieldConfigRecord>
): Map<string, CustomFieldLookupEntry> => {
  const idLookup = new Map<string, CustomFieldLookupEntry>();
  for (const [propKey, schemaProp] of Object.entries(props)) {
    const parsed = parseCustomFieldKey(propKey);
    if (!parsed) {
      continue;
    }
    idLookup.set(parsed.id, {
      propKey,
      kind: parsed.kind,
      schemaProp,
      fieldConfig: fieldConfigMap.get(propKey),
    });
  }

  return idLookup;
};

export const validateCustomFieldValueByKind = (
  fieldId: string,
  kind: string,
  value: unknown,
  options: {
    schemaProp: { enum?: string[]; format?: string };
    throwValidationError: (message: string) => void;
  }
): void => {
  const { schemaProp, throwValidationError } = options;

  if (value === null) {
    throwValidationError(`Custom field ${fieldId} must not be null`);

    return;
  }

  const schema = buildKindSchema(kind, schemaProp);
  if (!schema) {
    throwValidationError(
      `Custom field ${fieldId} has unsupported kind: ${kind}`
    );

    return;
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    throwValidationError(
      `Custom field ${fieldId} (${kind}): ${result.error.issues[0]?.message ?? 'invalid value'}`
    );
  }
};

export interface ResolvedCustomFieldDefaults {
  defaults: Record<string, unknown>;
  missingRequiredIds: string[];
}

export const resolveCustomFieldDefaults = (
  props: Record<string, { enum?: string[]; format?: string }>,
  fieldConfigMap: Map<string, FieldConfigRecord>,
  customFieldIds: Set<string>,
  isCreate: boolean
): ResolvedCustomFieldDefaults => {
  const defaults: Record<string, unknown> = {};
  const missingRequiredIds: string[] = [];
  for (const [propKey] of Object.entries(props)) {
    const parsed = parseCustomFieldKey(propKey);
    if (!parsed) {
      continue;
    }
    const fieldConfig = fieldConfigMap.get(propKey);
    if (!fieldConfig) {
      continue;
    }
    const isInInput = customFieldIds.has(parsed.id);
    if (
      isCreate &&
      fieldConfig.Required &&
      !isInInput &&
      fieldConfig.DefaultValue == null
    ) {
      missingRequiredIds.push(parsed.id);
    }
    if (isCreate && fieldConfig.DefaultValue != null && !isInInput) {
      defaults[propKey] = fieldConfig.DefaultValue;
    }
  }

  return { defaults, missingRequiredIds };
};

export interface ValidateCustomFieldConfigOptions {
  propKey: string;
  rawValue: unknown;
  parsedKey: ParsedCustomFieldKey | null;
  fieldConfig: FieldConfigRecord | undefined;
}

// Validates that a custom field has all required configuration.
export function validateCustomFieldConfig(
  opts: ValidateCustomFieldConfigOptions
): boolean {
  const { propKey, rawValue, parsedKey, fieldConfig } = opts;
  const fieldWarnMessage = 'Skipped custom attribute field,';

  if (!parsedKey) {
    logger.warn(
      { propKey, rawValue },
      `${fieldWarnMessage} key did not match signature`
    );

    return false;
  }

  if (!fieldConfig) {
    logger.warn(
      { propKey, rawValue, fieldConfig },
      `${fieldWarnMessage} no fields_config entry`
    );

    return false;
  }

  return true;
}
