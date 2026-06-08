import { beforeEach, describe, expect, it } from 'vitest';

import { getCustomFields, getOutputFields } from '../../src/fields/custom-fields.js';
import {
  createBundle,
  createMockZ,
  mockResponse,
  TEST_BASE_URL,
} from '../helpers/bundle.js';

const makeEntityResponse = (
  entities: Record<string, unknown>[]
) => ({
  data: entities,
});

const makeCustomField = (
  overrides: {
    label?: string;
    value?: unknown;
    kind?: string;
    enumValues?: string[];
    required?: boolean;
    description?: string;
  } = {}
) => ({
  data: {
    label: overrides.label,
    value: overrides.value ?? null,
  },
  metadata: {
    kind: overrides.kind ?? 'text',
    enum: overrides.enumValues,
    required: overrides.required ?? false,
    description: overrides.description,
  },
});

describe('getCustomFields', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('calls the correct URL with expand and page_size params', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([]))
    );
    const bundle = createBundle();
    await getCustomFields(z, bundle, 'risks');
    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${TEST_BASE_URL}/api/v1/risks`,
        params: { expand: 'customFields', page_size: '1' },
      })
    );
  });

  it('returns empty array when no entities returned', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([]);
  });

  it('returns empty array when entity has no customFields property', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([{ id: 'entity-1' }]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([]);
  });

  it('returns empty array when entity customFields.fields is empty', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        { id: 'entity-1', customFields: { fields: {} } },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([]);
  });

  it('maps select kind to choices field', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'Priority',
                kind: 'select',
                enumValues: ['low', 'medium', 'high'],
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([
      expect.objectContaining({
        key: 'custom_field-1',
        label: 'Priority',
        choices: ['low', 'medium', 'high'],
      }),
    ]);
    expect(result[0]).not.toHaveProperty('type');
    expect(result[0]).not.toHaveProperty('list');
  });

  it('maps multiselect kind to choices with list true', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'Tags',
                kind: 'multiselect',
                enumValues: ['a', 'b', 'c'],
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([
      expect.objectContaining({
        key: 'custom_field-1',
        label: 'Tags',
        choices: ['a', 'b', 'c'],
        list: true,
      }),
    ]);
    expect(result[0]).not.toHaveProperty('type');
  });

  it('maps number kind to type number', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'Score',
                kind: 'number',
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([
      expect.objectContaining({
        key: 'custom_field-1',
        label: 'Score',
        type: 'number',
      }),
    ]);
  });

  it('maps date kind to type datetime', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'Due Date',
                kind: 'date',
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([
      expect.objectContaining({
        key: 'custom_field-1',
        label: 'Due Date',
        type: 'datetime',
      }),
    ]);
  });

  it('maps checkbox kind to type boolean', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'Approved',
                kind: 'checkbox',
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([
      expect.objectContaining({
        key: 'custom_field-1',
        label: 'Approved',
        type: 'boolean',
      }),
    ]);
  });

  it('maps unknown kind to type string', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'Notes',
                kind: 'textarea',
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result).toEqual([
      expect.objectContaining({
        key: 'custom_field-1',
        label: 'Notes',
        type: 'string',
      }),
    ]);
  });

  it('uses label from field.data.label', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'My Custom Label',
                kind: 'text',
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result[0]?.label).toBe('My Custom Label');
  });

  it('falls back to "Custom Field {id}" when no label', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-42': makeCustomField({ kind: 'text' }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    expect(result[0]?.label).toBe('Custom Field field-42');
  });

  it('propagates required from metadata', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'Required Field',
                kind: 'text',
                required: true,
              }),
              'field-2': makeCustomField({
                label: 'Optional Field',
                kind: 'text',
                required: false,
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const result = await getCustomFields(z, bundle, 'risks');
    const requiredField = result.find((f) => f.key === 'custom_field-1');
    const optionalField = result.find((f) => f.key === 'custom_field-2');
    expect(requiredField?.required).toBe(true);
    expect(optionalField?.required).toBe(false);
  });
});

describe('getOutputFields', () => {
  let z: ReturnType<typeof createMockZ>;

  beforeEach(() => {
    z = createMockZ();
  });

  it('merges static and custom fields', async () => {
    z.request.mockResolvedValue(
      mockResponse(200, makeEntityResponse([
        {
          id: 'entity-1',
          customFields: {
            fields: {
              'field-1': makeCustomField({
                label: 'Priority',
                kind: 'select',
                enumValues: ['low', 'medium', 'high'],
                required: true,
                description: 'Risk priority',
              }),
            },
          },
        },
      ]))
    );
    const bundle = createBundle();
    const staticFields = [
      { key: 'id', label: 'ID', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
    ];
    const result = await getOutputFields({ z, bundle, entityType: 'risks', staticFields });
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ key: 'id', label: 'ID', type: 'string' });
    expect(result[1]).toEqual({ key: 'title', label: 'Title', type: 'string' });
    expect(result[2]).toEqual(
      expect.objectContaining({
        key: 'custom_field-1',
        label: 'Priority',
      })
    );
  });
});
