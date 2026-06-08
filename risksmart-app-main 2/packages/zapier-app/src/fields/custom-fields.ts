import type { Bundle, ZObject } from 'zapier-platform-core';

import { getBaseUrl } from '../utils/api.js';

interface CustomFieldData {
  label?: string;
  value: unknown;
}

interface CustomFieldMetadata {
  kind: string;
  description?: string;
  required?: boolean;
  enum?: string[];
}

interface CustomFieldEntry {
  data: CustomFieldData;
  metadata: CustomFieldMetadata | null;
}

interface EntityWithCustomFields {
  customFields?: {
    fields: Record<string, CustomFieldEntry>;
  };
}

interface ListResponse {
  data: EntityWithCustomFields[];
}

interface ZapierFieldDefinition {
  key: string;
  label: string;
  helpText: string;
  required: boolean;
  type?: string;
  choices?: string[];
  list?: boolean;
}

export const getCustomFields = async (
  z: ZObject,
  bundle: Bundle,
  entityType: string
): Promise<ZapierFieldDefinition[]> => {
  const response = await z.request({
    url: `${getBaseUrl(bundle)}/${entityType}`,
    params: {
      expand: 'customFields',
      page_size: '1',
    },
  });

  // Zapier platform types response.data as `{}`; actual shape is the list API contract.
  const body = response.data as ListResponse;
  const entity = body.data[0];

  if (!entity?.customFields?.fields) {
    return [];
  }

  const { fields } = entity.customFields;

  return Object.entries(fields).map(([fieldId, field]) => {
    const meta = field.metadata;
    const kind = meta?.kind ?? 'string';

    const base: ZapierFieldDefinition = {
      key: `custom_${fieldId}`,
      label: field.data.label ?? `Custom Field ${fieldId}`,
      helpText: meta?.description ?? '',
      required: meta?.required ?? false,
    };

    switch (kind) {
      case 'select':
        return { ...base, choices: meta?.enum ?? [] };
      case 'multiselect':
        return { ...base, choices: meta?.enum ?? [], list: true };
      case 'number':
        return { ...base, type: 'number' };
      case 'date':
        return { ...base, type: 'datetime' };
      case 'checkbox':
        return { ...base, type: 'boolean' };
      default:
        return { ...base, type: 'string' };
    }
  });
};

interface GetOutputFieldsOptions {
  z: ZObject;
  bundle: Bundle;
  entityType: string;
  staticFields: { key: string; label: string; type?: string }[];
}

export const getOutputFields = async ({
  z,
  bundle,
  entityType,
  staticFields,
}: GetOutputFieldsOptions): Promise<
  { key: string; label: string; type?: string }[]
> => {
  const customFields = await getCustomFields(z, bundle, entityType);

  return [...staticFields, ...customFields];
};
