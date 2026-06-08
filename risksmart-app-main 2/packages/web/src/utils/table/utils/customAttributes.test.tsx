import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';
import { describe, expect, it } from 'vitest';

import { EMPTY_VALUE } from '@/utils/collectionUtils';

import {
  convertSchemasToFieldConfigs,
  getCustomAttributeRenderProps,
} from './customAttributes';

describe('customAttributes', () => {
  describe('getCustomAttributeRenderProps', () => {
    it('returns correct scope for each field', () => {
      const schema = {
        type: 'object',
        properties: {
          '123_text': { type: 'string' },
          '456_select': { type: 'array', enum: ['option1', 'option2'] },
          '789_textarea': { type: 'string' },
        },
      };

      const uiSchema = {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            label: 'Text Field',
            scope: '#/properties/123_text',
          },
          {
            type: 'Control',
            label: 'Select Field',
            scope: '#/properties/456_select',
          },
          {
            type: 'Control',
            label: 'Textarea Field',
            scope: '#/properties/789_textarea',
          },
        ],
      };

      const result = getCustomAttributeRenderProps(schema, uiSchema);

      expect(result).toHaveLength(3);
      expect(result[0].scope).toBe('#/properties/123_text');
      expect(result[1].scope).toBe('#/properties/456_select');
      expect(result[2].scope).toBe('#/properties/789_textarea');
    });

    it('returns fields in the same order as defined in uischema elements', () => {
      const schema = {
        type: 'object',
        properties: {
          '123_text': { type: 'string' },
          '456_select': { type: 'array', enum: ['option1', 'option2'] },
          '789_textarea': { type: 'string' },
          '999_date': { type: 'string' },
        },
      };

      const uiSchema = {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            label: 'First Field',
            scope: '#/properties/123_text',
          },
          {
            type: 'Control',
            label: 'Second Field',
            scope: '#/properties/456_select',
          },
          {
            type: 'Control',
            label: 'Third Field',
            scope: '#/properties/789_textarea',
          },
          {
            type: 'Control',
            label: 'Fourth Field',
            scope: '#/properties/999_date',
          },
        ],
      };

      const result = getCustomAttributeRenderProps(schema, uiSchema);

      expect(result).toHaveLength(4);
      expect(result[0].path).toBe('123_text');
      expect(result[0].label).toBe('First Field');
      expect(result[1].path).toBe('456_select');
      expect(result[1].label).toBe('Second Field');
      expect(result[2].path).toBe('789_textarea');
      expect(result[2].label).toBe('Third Field');
      expect(result[3].path).toBe('999_date');
      expect(result[3].label).toBe('Fourth Field');
    });

    it('preserves order when fields are defined in different schema order than uischema', () => {
      const schema = {
        type: 'object',
        properties: {
          zzz_text: { type: 'string' },
          aaa_select: { type: 'array', enum: ['option1', 'option2'] },
          mmm_textarea: { type: 'string' },
        },
      };

      // uischema defines different order than schema properties
      const uiSchema = {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            label: 'Middle Field',
            scope: '#/properties/mmm_textarea',
          },
          {
            type: 'Control',
            label: 'Last Field',
            scope: '#/properties/zzz_text',
          },
          {
            type: 'Control',
            label: 'First Field',
            scope: '#/properties/aaa_select',
          },
        ],
      };

      const result = getCustomAttributeRenderProps(schema, uiSchema);

      expect(result).toHaveLength(3);
      // Should follow uischema order, not schema properties order
      expect(result[0].path).toBe('mmm_textarea');
      expect(result[0].label).toBe('Middle Field');
      expect(result[1].path).toBe('zzz_text');
      expect(result[1].label).toBe('Last Field');
      expect(result[2].path).toBe('aaa_select');
      expect(result[2].label).toBe('First Field');
    });

    it('handles empty uischema elements array', () => {
      const schema = {
        type: 'object',
        properties: {
          test_text: { type: 'string' },
        },
      };

      const uiSchema = {
        type: 'VerticalLayout',
        elements: [],
      };

      const result = getCustomAttributeRenderProps(schema, uiSchema);

      expect(result).toHaveLength(0);
    });

    it('handles single field correctly', () => {
      const schema = {
        type: 'object',
        properties: {
          single_text: { type: 'string' },
        },
      };

      const uiSchema = {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            label: 'Only Field',
            scope: '#/properties/single_text',
          },
        ],
      };

      const result = getCustomAttributeRenderProps(schema, uiSchema);

      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('single_text');
      expect(result[0].label).toBe('Only Field');
    });

    it('maintains order with mixed field types', () => {
      const schema = {
        type: 'object',
        properties: {
          field1_date: { type: 'string' },
          field2_text: { type: 'string' },
          field3_select: { type: 'array', enum: ['a', 'b'] },
          field4_textarea: { type: 'string' },
          field5_link: { type: 'string' },
        },
      };

      const uiSchema = {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            label: 'Date Field',
            scope: '#/properties/field1_date',
          },
          {
            type: 'Control',
            label: 'Text Field',
            scope: '#/properties/field2_text',
          },
          {
            type: 'Control',
            label: 'Select Field',
            scope: '#/properties/field3_select',
          },
          {
            type: 'Control',
            label: 'Textarea Field',
            scope: '#/properties/field4_textarea',
          },
          {
            type: 'Control',
            label: 'Link Field',
            scope: '#/properties/field5_link',
          },
        ],
      };

      const result = getCustomAttributeRenderProps(schema, uiSchema);

      expect(result).toHaveLength(5);

      const expectedOrder = [
        { path: 'field1_date', label: 'Date Field' },
        { path: 'field2_text', label: 'Text Field' },
        { path: 'field3_select', label: 'Select Field' },
        { path: 'field4_textarea', label: 'Textarea Field' },
        { path: 'field5_link', label: 'Link Field' },
      ];

      expectedOrder.forEach((expected, index) => {
        expect(result[index].path).toBe(expected.path);
        expect(result[index].label).toBe(expected.label);
      });
    });
  });

  describe('convertSchemasToFieldConfigs', () => {
    it('sets the value of empty custom attribute fields to "-" (dash)', () => {
      const result = convertSchemasToFieldConfigs({
        customAttributeSchemas: [
          {
            Schema: {
              required: [],
              properties: {
                '1721833318624_select': {
                  enum: ['a', 'b', 'd'],
                  type: 'array',
                  description: '',
                  uniqueItems: true,
                },
                '1721833318625_text': {
                  type: 'string',
                  description: '',
                  uniqueItems: true,
                },
                '1721833318626_textarea': {
                  type: 'string',
                  description: '',
                  uniqueItems: true,
                },
                '1721833318627_date': {
                  type: 'string',
                  description: '',
                  uniqueItems: true,
                },
                '1721833318628_link': {
                  type: 'string',
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
                  label: 'Select test',
                  scope: '#/properties/1721833318624_select',
                },
                {
                  type: 'Control',
                  label: 'Text test',
                  scope: '#/properties/1721833318625_text',
                },
                {
                  type: 'Control',
                  label: 'Textarea test',
                  scope: '#/properties/1721833318626_textarea',
                },
                {
                  type: 'Control',
                  label: 'Date test',
                  scope: '#/properties/1721833318627_date',
                },
                {
                  type: 'Control',
                  label: 'Link test',
                  scope: '#/properties/1721833318628_link',
                },
              ],
            },
          },
        ],
        enableRelativeDates: false,
      });

      expect(
        result?.['1721833318624_select']?.cell?.({
          CustomAttributeData: { '1721833318624_select': null },
        })
      ).toEqual(EMPTY_VALUE);

      expect(
        result?.['1721833318625_text']?.cell?.({
          CustomAttributeData: { '1721833318625_text': null },
        })
      ).toEqual(EMPTY_VALUE);

      expect(
        result?.['1721833318626_textarea']?.cell?.({
          CustomAttributeData: { '1721833318626_textarea': null },
        })
      ).toEqual(EMPTY_VALUE);

      expect(
        result?.['1721833318627_date']?.cell?.({
          CustomAttributeData: { '1721833318627_date': null },
        })
      ).toEqual(EMPTY_VALUE);

      expect(
        result?.['1721833318627_date']?.exportVal?.({
          CustomAttributeData: { '1721833318627_date': null },
        })
      ).toEqual('');

      expect(
        result?.['1721833318628_link']?.cell?.({
          CustomAttributeData: { '1721833318628_link': null },
        })
      ).toEqual(EMPTY_VALUE);
    });

    describe('custom attribute schemas with alt values', () => {
      const customAttributeSchemas: CustomAttributeSchema[] = [
        {
          UiSchema: {
            type: 'VerticalLayout',
            elements: [
              {
                type: 'Control',
                label: 'What is your favourite colour?',
                scope: '#/properties/1756386967280_select',
                options: {
                  altLabel: 'FAVE_COL',
                },
              },
              {
                type: 'Control',
                label: 'Yes or no?',
                scope: '#/properties/1756463617921_select',
              },
            ],
          },
          Schema: {
            properties: {
              '1756386967280_select': {
                type: 'string',
                oneOf: [
                  {
                    const: 'COL_IR',
                    title: 'Infrared',
                  },
                  {
                    const: 'COL_UV',
                    title: 'Ultraviolet',
                  },
                  {
                    const: 'COL_OC',
                    title: 'Octarine',
                  },
                ],
                description: '<p>New Field Description 1</p>',
              },
              '1756463617921_select': {
                enum: ['Yes', 'No'],
                type: 'string',
                description: '',
              },
            },
          },
          Id: '1f220a33-1294-41bd-a4be-a3575ca5b5df',
        },
      ];

      describe('When alt label is present', () => {
        it('should return fieldConfig for both the alt label and the main label', () => {
          const actual = convertSchemasToFieldConfigs({
            customAttributeSchemas,
            enableRelativeDates: false,
          });

          //@ts-ignore
          expect(actual?.['1756386967280_select']?.header).toBe(
            'What is your favourite colour?'
          );
          //@ts-ignore
          expect(actual?.['1756386967280_select_alt']?.header).toBe('FAVE_COL');
          //@ts-ignore
          expect(actual?.['1756463617921_select']?.header).toBe('Yes or no?');
        });
      });
    });
  });
});
