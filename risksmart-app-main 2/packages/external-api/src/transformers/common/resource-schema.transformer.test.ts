import { describe, expect, it } from 'vitest';

import type { FormConfigResponse } from '../../clients/client.interface';
import { transformResourceSchema } from './resource-schema.transformer';

const makeFormConfig = (
  overrides: Partial<FormConfigResponse> = {}
): FormConfigResponse =>
  ({
    ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
    customAttributeSchema: {
      Schema: {
        properties: {
          '1234567890123_text': {
            type: 'string',
            description: 'A text field',
          },
          '1234567890124_number': {
            type: 'number',
            description: 'A number field',
          },
        },
      },
      UiSchema: {
        elements: [
          {
            type: 'Control',
            label: 'Text Field',
            scope: '#/properties/1234567890123_text',
          },
          {
            type: 'Control',
            label: 'Number Field',
            scope: '#/properties/1234567890124_number',
          },
        ],
      },
    },
    fields_config: [
      {
        FieldId: 'CustomAttributeData.1234567890123_text',
        Hidden: false,
        Required: true,
        ReadOnly: false,
        DefaultValue: null,
      },
      {
        FieldId: 'CustomAttributeData.1234567890124_number',
        Hidden: false,
        Required: false,
        ReadOnly: false,
        DefaultValue: '42',
      },
    ],
    ...overrides,
  }) as unknown as FormConfigResponse;

describe('transformResourceSchema', () => {
  it('returns empty result with null schemaVersion for empty formConfigurations', () => {
    const result = transformResourceSchema([]);

    expect(result).toEqual({
      customFields: {
        schemaVersion: null,
        fields: {},
      },
    });
  });

  it('returns happy path result with all fields from form config', () => {
    const result = transformResourceSchema([makeFormConfig()]);

    expect(result).toEqual({
      customFields: {
        schemaVersion: '2024-01-01T00:00:00.000Z',
        fields: {
          '1234567890123': {
            id: '1234567890123',
            label: 'Text Field',
            kind: 'text',
            description: 'A text field',
            hidden: false,
            readOnly: false,
            required: true,
            defaultValue: null,
          },
          '1234567890124': {
            id: '1234567890124',
            label: 'Number Field',
            kind: 'number',
            description: 'A number field',
            hidden: false,
            readOnly: false,
            required: false,
            defaultValue: '42',
          },
        },
      },
    });
  });

  it('returns empty fields with schemaVersion when UiSchema.elements is not an array', () => {
    const formConfig = makeFormConfig({
      customAttributeSchema: {
        Schema: { properties: { '1234567890123_text': { type: 'string' } } },
        UiSchema: { elements: 'invalid' },
      },
    } as unknown as Partial<FormConfigResponse>);

    const result = transformResourceSchema([formConfig]);

    expect(result).toEqual({
      customFields: {
        schemaVersion: '2024-01-01T00:00:00.000Z',
        fields: {},
      },
    });
  });

  it('skips field when fieldConfig is missing', () => {
    const formConfig = makeFormConfig({
      fields_config: [
        {
          FieldId: 'CustomAttributeData.1234567890123_text',
          Hidden: false,
          Required: false,
          ReadOnly: false,
          DefaultValue: null,
        },
        // no entry for 1234567890124_number
      ],
    } as unknown as Partial<FormConfigResponse>);

    const result = transformResourceSchema([formConfig]);

    expect(Object.keys(result.customFields.fields)).toEqual(['1234567890123']);
  });

  it('skips field when parsedKey is null (bad key format)', () => {
    const formConfig = makeFormConfig({
      customAttributeSchema: {
        Schema: {
          properties: {
            invalidkey: { type: 'string' },
            '1234567890123_text': { type: 'string' },
          },
        },
        UiSchema: {
          elements: [
            {
              type: 'Control',
              label: 'Text Field',
              scope: '#/properties/1234567890123_text',
            },
          ],
        },
      },
      fields_config: [
        {
          FieldId: 'CustomAttributeData.invalidkey',
          Hidden: false,
          Required: false,
          ReadOnly: false,
          DefaultValue: null,
        },
        {
          FieldId: 'CustomAttributeData.1234567890123_text',
          Hidden: false,
          Required: false,
          ReadOnly: false,
          DefaultValue: null,
        },
      ],
    } as unknown as Partial<FormConfigResponse>);

    const result = transformResourceSchema([formConfig]);

    expect(Object.keys(result.customFields.fields)).toEqual(['1234567890123']);
  });

  it('skips field when schemaProp is missing', () => {
    const formConfig = makeFormConfig({
      customAttributeSchema: {
        Schema: {
          // no properties at all -> props will be empty {}
          properties: {},
        },
        UiSchema: {
          elements: [],
        },
      },
      fields_config: [
        {
          FieldId: 'CustomAttributeData.1234567890123_text',
          Hidden: false,
          Required: false,
          ReadOnly: false,
          DefaultValue: null,
        },
      ],
    } as unknown as Partial<FormConfigResponse>);

    const result = transformResourceSchema([formConfig]);

    // props is empty, so no fields are iterated
    expect(result.customFields.fields).toEqual({});
  });

  it('uses only the first formConfig when multiple are provided', () => {
    const firstConfig = makeFormConfig({
      ModifiedAtTimestamp: '2024-06-01T00:00:00.000Z',
      customAttributeSchema: {
        Schema: {
          properties: {
            '1234567890123_text': { type: 'string' },
          },
        },
        UiSchema: {
          elements: [
            {
              type: 'Control',
              label: 'Text',
              scope: '#/properties/1234567890123_text',
            },
          ],
        },
      },
      fields_config: [
        {
          FieldId: 'CustomAttributeData.1234567890123_text',
          Hidden: false,
          Required: false,
          ReadOnly: false,
          DefaultValue: null,
        },
      ],
    } as unknown as Partial<FormConfigResponse>);

    const secondConfig = makeFormConfig({
      ModifiedAtTimestamp: '2025-01-01T00:00:00.000Z',
    });

    const result = transformResourceSchema([firstConfig, secondConfig]);

    expect(result.customFields.schemaVersion).toBe('2024-06-01T00:00:00.000Z');
    expect(Object.keys(result.customFields.fields)).toEqual(['1234567890123']);
  });

  it('includes enum in metadata when present', () => {
    const formConfig = makeFormConfig({
      customAttributeSchema: {
        Schema: {
          properties: {
            '1234567890123_select': {
              type: 'string',
              enum: ['option1', 'option2'],
            },
          },
        },
        UiSchema: {
          elements: [
            {
              type: 'Control',
              label: 'Select Field',
              scope: '#/properties/1234567890123_select',
            },
          ],
        },
      },
      fields_config: [
        {
          FieldId: 'CustomAttributeData.1234567890123_select',
          Hidden: false,
          Required: false,
          ReadOnly: false,
          DefaultValue: null,
        },
      ],
    } as unknown as Partial<FormConfigResponse>);

    const result = transformResourceSchema([formConfig]);

    expect(result.customFields.fields['1234567890123']).toMatchObject({
      kind: 'select',
      enum: ['option1', 'option2'],
    });
  });

  it.each([
    ['2024-01-15T10:30:00.000Z'],
    ['2023-12-31T23:59:59.999Z'],
    ['2025-06-01T00:00:00.000Z'],
  ])('preserves schemaVersion timestamp %s', (timestamp) => {
    const formConfig = makeFormConfig({
      ModifiedAtTimestamp: timestamp,
      customAttributeSchema: {
        Schema: { properties: {} },
        UiSchema: { elements: [] },
      },
      fields_config: [],
    } as unknown as Partial<FormConfigResponse>);

    const result = transformResourceSchema([formConfig]);

    expect(result.customFields.schemaVersion).toBe(timestamp);
  });
});
