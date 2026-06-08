import { ZodSchema } from 'zod';

import type { CustomAttributeSchemaData } from '../sheets/types';
import { convertJsonSchemaToZod } from './customAttributeSchemaValidation';

describe('fileProcessor', () => {
  describe('convertJsonSchemaToZod', () => {
    const customAttributeSchema: CustomAttributeSchemaData = {
      Id: '123',
      Schema: {
        properties: {
          '1702984168447_link': {
            type: 'string',
            format: 'uri',
            description: 'uischema defined uri input',
          },
          '1702985488895_date': {
            type: 'string',
            format: 'date',
            description: 'uischema defined date picker',
          },
          '1702983795778_select': {
            enum: ['b', 'c', 'd', 'e', 'f'],
            type: 'string',
          },
          '1730817653827_multiselect': {
            enum: ['A', 'B'],
            type: 'array',
            description: '',
            uniqueItems: true,
          },
        },
      },
      UiSchema: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            label: 'Link Label',
            scope: '#/properties/1702984168447_link',
          },
          {
            type: 'Control',
            label: 'Date Label',
            scope: '#/properties/1702985488895_date',
          },
          {
            type: 'Control',
            label: 'Select Label',
            scope: '#/properties/1702983795778_select',
          },
          {
            type: 'Control',
            label: 'MultiSelect Label',
            scope: '#/properties/1730817653827_multiselect',
          },
        ],
      },
    };
    it('converts a simple json schema into a zod schema', () => {
      const zodSchema = convertJsonSchemaToZod(customAttributeSchema);
      expect(zodSchema instanceof ZodSchema).toEqual(true);
    });

    it('allows known fields', () => {
      const zodSchema = convertJsonSchemaToZod(customAttributeSchema);
      const result = zodSchema.parse({
        'Link Label': 'ok',
        'Select Label': 'b',
        'Date Label': '2024-05-01T00:00:00+00:00',
        'MultiSelect Label': 'A;B',
      });
      expect(result).toEqual({
        'Link Label': 'ok',
        'Select Label': 'b',
        'Date Label': '2024-05-01T00:00:00+00:00',
        'MultiSelect Label': ['A', 'B'],
      });
    });

    it('allows nulls', () => {
      const zodSchema = convertJsonSchemaToZod(customAttributeSchema);
      const result = zodSchema.parse({
        'Link Label': null,
        'Select Label': null,
        'Date Label': null,
        'MultiSelect Label': null,
      });
      expect(result).toEqual({
        'Link Label': null,
        'Select Label': null,
        'Date Label': null,
        'MultiSelect Label': null,
      });
    });

    it('Numbers saved as strings for text fields', () => {
      const zodSchema = convertJsonSchemaToZod(customAttributeSchema);
      const result = zodSchema.parse({
        'Link Label': 1,
        'Select Label': null,
        'Date Label': null,
        'MultiSelect Label': null,
      });
      expect(result).toEqual({
        'Link Label': '1',
        'Select Label': null,
        'Date Label': null,
        'MultiSelect Label': null,
      });
    });

    it('requires all custom attributes', () => {
      const zodSchema = convertJsonSchemaToZod(customAttributeSchema);
      const result = zodSchema.safeParse({
        'Date Label': '2024-05-01T00:00:00+00:00',
        'Select Label': 'b',
      });
      expect(result.success).toEqual(false);
    });
  });
});
