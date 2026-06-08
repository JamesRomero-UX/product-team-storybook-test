import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FormConfigResponse } from '../../clients/client.interface';
import { transformCustomFields } from './custom-fields.transformer';

vi.mock('../../utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('custom-fields.transformer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('transformCustomFields', () => {
    const mockFormConfig = {
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
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
    } as unknown as FormConfigResponse;

    it('should transform custom fields with compact format (expandMeta=false)', () => {
      const data = {
        '1234567890123_text': 'Hello World',
        '1234567890124_number': 100,
      };

      const result = transformCustomFields(data, mockFormConfig, {
        expandMeta: false,
      });

      expect(result).toEqual({
        schemaUpdatedAt: '2024-01-01T00:00:00Z',
        fields: {
          '1234567890123': {
            data: {
              id: '1234567890123',
              value: 'Hello World',
              label: 'Text Field',
            },
          },
          '1234567890124': {
            data: {
              id: '1234567890124',
              value: 100,
              label: 'Number Field',
            },
          },
        },
      });
    });

    it('should transform custom fields with expanded format (expandMeta=true)', () => {
      const data = {
        '1234567890123_text': 'Hello World',
        '1234567890124_number': 100,
      };

      const result = transformCustomFields(data, mockFormConfig, {
        expandMeta: true,
      });

      expect(result).toEqual({
        schemaUpdatedAt: '2024-01-01T00:00:00Z',
        fields: {
          '1234567890123': {
            data: {
              id: '1234567890123',
              value: 'Hello World',
              label: 'Text Field',
            },
            metadata: {
              kind: 'text',
              description: 'A text field',
              hidden: false,
              readOnly: false,
              required: true,
              defaultValue: null,
            },
          },
          '1234567890124': {
            data: {
              id: '1234567890124',
              value: 100,
              label: 'Number Field',
            },
            metadata: {
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

    it('should handle empty custom attribute data', () => {
      const data = {};

      const result = transformCustomFields(data, mockFormConfig, {
        expandMeta: false,
      });

      expect(result).toEqual({
        schemaUpdatedAt: '2024-01-01T00:00:00Z',
        fields: {},
      });
    });

    it('should skip fields with invalid key format', async () => {
      const { logger } = await import('../../utils/logger');
      const data = {
        '1234567890123_text': 'Valid',
        invalidKey: 'Should be skipped',
      };

      const result = transformCustomFields(data, mockFormConfig, {
        expandMeta: false,
      });

      expect(result.fields).toEqual({
        '1234567890123': {
          data: {
            id: '1234567890123',
            value: 'Valid',
            label: 'Text Field',
          },
        },
      });
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ propKey: 'invalidKey' }),
        expect.stringContaining('key did not match signature')
      );
    });

    it('should set metadata to null for fields without schema property in expanded format', async () => {
      const { logger } = await import('../../utils/logger');

      // Create config with fields_config entry but no schema property for one field
      const configWithMissingSchema = {
        ...mockFormConfig,
        customAttributeSchema: {
          ...mockFormConfig.customAttributeSchema,
          Schema: {
            properties: {
              '1234567890123_text': {
                type: 'string',
                description: 'A text field',
              },
              // No schema property for 9999999999999_unknown
            },
          },
        },
        fields_config: [
          ...mockFormConfig.fields_config,
          {
            FieldId: 'CustomAttributeData.9999999999999_unknown',
            Hidden: false,
            Required: false,
            ReadOnly: false,
            DefaultValue: null,
          },
        ],
      } as unknown as FormConfigResponse;

      const data = {
        '1234567890123_text': 'Valid',
        '9999999999999_unknown': 'No schema',
      };

      const result = transformCustomFields(data, configWithMissingSchema, {
        expandMeta: true,
      });

      // Field without schema property should have metadata set to null
      expect(result.fields).toEqual({
        '1234567890123': {
          data: {
            id: '1234567890123',
            value: 'Valid',
            label: 'Text Field',
          },
          metadata: {
            kind: 'text',
            description: 'A text field',
            hidden: false,
            readOnly: false,
            required: true,
            defaultValue: null,
          },
        },
        '9999999999999': {
          data: {
            id: '9999999999999',
            value: 'No schema',
          },
          metadata: null,
        },
      });
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should skip fields without fields_config entry', async () => {
      const { logger } = await import('../../utils/logger');

      const configWithMissingField = {
        ...mockFormConfig,
        fields_config: [mockFormConfig.fields_config[0]!],
      } as unknown as FormConfigResponse;

      const data = {
        '1234567890123_text': 'Valid',
        '1234567890124_number': 100,
      };

      const result = transformCustomFields(data, configWithMissingField, {
        expandMeta: false,
      });

      expect(result.fields).toEqual({
        '1234567890123': {
          data: {
            id: '1234567890123',
            value: 'Valid',
            label: 'Text Field',
          },
        },
      });
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ propKey: '1234567890124_number' }),
        expect.stringContaining('no fields_config entry')
      );
    });

    it('should handle fields without labels', () => {
      const configWithoutLabels = {
        ...mockFormConfig,
        customAttributeSchema: {
          Schema: mockFormConfig.customAttributeSchema!.Schema,
          UiSchema: {
            elements: [
              {
                type: 'Control',
                scope: '#/properties/1234567890123_text',
              },
            ],
          },
        },
      } as unknown as FormConfigResponse;

      const data = {
        '1234567890123_text': 'No Label',
      };

      const result = transformCustomFields(data, configWithoutLabels, {
        expandMeta: false,
      });

      expect(result.fields).toEqual({
        '1234567890123': {
          data: {
            id: '1234567890123',
            value: 'No Label',
          },
        },
      });
    });

    it('should throw error for invalid form config structure', async () => {
      const { logger } = await import('../../utils/logger');
      const invalidConfig = {
        ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
        customAttributeSchema: {
          Schema: {
            properties: {},
          },
          UiSchema: {
            elements: 'invalid',
          },
        },
        fields_config: [],
      } as unknown as FormConfigResponse;

      const data = {};

      expect(() =>
        transformCustomFields(data, invalidConfig, { expandMeta: false })
      ).toThrow('invalid transform structure for formConfig');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should include enum and format in metadata when present', () => {
      const configWithEnum = {
        ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
        customAttributeSchema: {
          Schema: {
            properties: {
              '1234567890123_select': {
                type: 'string',
                description: 'A select field',
                enum: ['option1', 'option2', 'option3'],
                format: 'email',
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
      } as unknown as FormConfigResponse;

      const data = {
        '1234567890123_select': 'option1',
      };

      const result = transformCustomFields(data, configWithEnum, {
        expandMeta: true,
      });

      const field = result.fields['1234567890123'];
      if (field && 'metadata' in field) {
        expect(field.metadata).toMatchObject({
          kind: 'select',
          description: 'A select field',
          enum: ['option1', 'option2', 'option3'],
          format: 'email',
        });
      } else {
        throw new Error('Expected field to have metadata');
      }
    });
  });
});
