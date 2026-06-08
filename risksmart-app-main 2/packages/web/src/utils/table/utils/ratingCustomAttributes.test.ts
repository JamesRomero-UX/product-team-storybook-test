import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';
import { describe, expect, it } from 'vitest';

import type { FieldConfig } from '../types';
import {
  convertRatingSchemasToFieldConfigs,
  convertRatingSchemaToFieldConfigs,
} from './ratingCustomAttributes';

const getHeader = (config: FieldConfig<never> | undefined) =>
  config && 'header' in config ? config.header : undefined;

const textSchema: CustomAttributeSchema = {
  Schema: {
    type: 'object',
    properties: {
      notes_text: { type: 'string', description: '' },
    },
  },
  UiSchema: {
    type: 'VerticalLayout',
    elements: [
      {
        type: 'Control',
        label: 'Notes',
        scope: '#/properties/notes_text',
      },
    ],
  },
};

const multiFieldSchema: CustomAttributeSchema = {
  Schema: {
    type: 'object',
    properties: {
      notes_text: { type: 'string', description: '' },
      priority_select: {
        enum: ['High', 'Medium', 'Low'],
        type: 'string',
        description: '',
      },
      review_date: { type: 'string', description: '' },
    },
  },
  UiSchema: {
    type: 'VerticalLayout',
    elements: [
      {
        type: 'Control',
        label: 'Notes',
        scope: '#/properties/notes_text',
      },
      {
        type: 'Control',
        label: 'Priority',
        scope: '#/properties/priority_select',
      },
      {
        type: 'Control',
        label: 'Review Date',
        scope: '#/properties/review_date',
      },
    ],
  },
};

describe('ratingCustomAttributes', () => {
  describe('convertRatingSchemaToFieldConfigs', () => {
    it('returns empty object when schema is undefined', () => {
      const result = convertRatingSchemaToFieldConfigs({
        schema: undefined,
        controlTypePrefix: 'uncontrolled',
        controlTypeLabel: 'Inherent',
        enableRelativeDates: false,
      });

      expect(result).toEqual({});
    });

    it('returns empty object when schema has no Schema property', () => {
      const result = convertRatingSchemaToFieldConfigs({
        schema: { UiSchema: textSchema.UiSchema } as CustomAttributeSchema,
        controlTypePrefix: 'uncontrolled',
        controlTypeLabel: 'Inherent',
        enableRelativeDates: false,
      });

      expect(result).toEqual({});
    });

    it('generates field configs with prefixed keys for uncontrolled', () => {
      const result = convertRatingSchemaToFieldConfigs({
        schema: textSchema,
        controlTypePrefix: 'uncontrolled',
        controlTypeLabel: 'Inherent',
        enableRelativeDates: false,
      });

      expect(Object.keys(result)).toEqual(['uncontrolled__notes_text']);
      expect(result['uncontrolled__notes_text']).toBeDefined();
    });

    it('generates field configs with prefixed keys for controlled', () => {
      const result = convertRatingSchemaToFieldConfigs({
        schema: textSchema,
        controlTypePrefix: 'controlled',
        controlTypeLabel: 'Residual',
        enableRelativeDates: false,
      });

      expect(Object.keys(result)).toEqual(['controlled__notes_text']);
      expect(result['controlled__notes_text']).toBeDefined();
    });

    it('includes control type label in header', () => {
      const result = convertRatingSchemaToFieldConfigs({
        schema: textSchema,
        controlTypePrefix: 'uncontrolled',
        controlTypeLabel: 'Inherent',
        enableRelativeDates: false,
      });

      expect(getHeader(result['uncontrolled__notes_text'])).toBe(
        'Notes (Inherent)'
      );
    });

    it('generates configs for multiple field types', () => {
      const result = convertRatingSchemaToFieldConfigs({
        schema: multiFieldSchema,
        controlTypePrefix: 'controlled',
        controlTypeLabel: 'Residual',
        enableRelativeDates: false,
      });

      expect(Object.keys(result)).toEqual([
        'controlled__notes_text',
        'controlled__priority_select',
        'controlled__review_date',
      ]);

      expect(getHeader(result['controlled__notes_text'])).toBe(
        'Notes (Residual)'
      );
      expect(getHeader(result['controlled__priority_select'])).toBe(
        'Priority (Residual)'
      );
      expect(getHeader(result['controlled__review_date'])).toBe(
        'Review Date (Residual)'
      );
    });

    it('marks all fields as custom', () => {
      const result = convertRatingSchemaToFieldConfigs({
        schema: textSchema,
        controlTypePrefix: 'uncontrolled',
        controlTypeLabel: 'Inherent',
        enableRelativeDates: false,
      });

      expect(result['uncontrolled__notes_text']?.custom).toBe(true);
    });

    it('cell renderer reads from prefixed path in CustomAttributeData', () => {
      const result = convertRatingSchemaToFieldConfigs({
        schema: textSchema,
        controlTypePrefix: 'uncontrolled',
        controlTypeLabel: 'Inherent',
        enableRelativeDates: false,
      });

      const cellValue = result['uncontrolled__notes_text']?.cell?.({
        CustomAttributeData: { uncontrolled__notes_text: 'Test value' },
      });

      expect(cellValue).toBe('Test value');
    });

    it('handles alt-value columns for select fields with oneOf', () => {
      const altValueSchema: CustomAttributeSchema = {
        Schema: {
          type: 'object',
          properties: {
            status_select: {
              type: 'string',
              oneOf: [
                { const: 'CODE_A', title: 'Active' },
                { const: 'CODE_I', title: 'Inactive' },
              ],
            },
          },
        },
        UiSchema: {
          type: 'VerticalLayout',
          elements: [
            {
              type: 'Control',
              label: 'Status',
              scope: '#/properties/status_select',
              options: {
                altLabel: 'Status Code',
              },
            },
          ],
        },
      };

      const result = convertRatingSchemaToFieldConfigs({
        schema: altValueSchema,
        controlTypePrefix: 'uncontrolled',
        controlTypeLabel: 'Inherent',
        enableRelativeDates: false,
      });

      expect(result['uncontrolled__status_select']).toBeDefined();
      expect(result['uncontrolled__status_select_alt']).toBeDefined();
      expect(result['uncontrolled__status_select_alt']?.isVirtual).toBe(true);
      expect(getHeader(result['uncontrolled__status_select'])).toBe(
        'Status (Inherent)'
      );
      expect(getHeader(result['uncontrolled__status_select_alt'])).toBe(
        'Status Code (Inherent)'
      );
    });
  });

  describe('convertRatingSchemasToFieldConfigs', () => {
    it('generates fields for both control types', () => {
      const result = convertRatingSchemasToFieldConfigs({
        uncontrolledSchema: textSchema,
        controlledSchema: textSchema,
        uncontrolledLabel: 'Inherent',
        controlledLabel: 'Residual',
        enableRelativeDates: false,
      });

      expect(result['uncontrolled__notes_text']).toBeDefined();
      expect(result['controlled__notes_text']).toBeDefined();
      expect(getHeader(result['uncontrolled__notes_text'])).toBe(
        'Notes (Inherent)'
      );
      expect(getHeader(result['controlled__notes_text'])).toBe(
        'Notes (Residual)'
      );
    });

    it('handles only uncontrolled schema present', () => {
      const result = convertRatingSchemasToFieldConfigs({
        uncontrolledSchema: textSchema,
        controlledSchema: undefined,
        uncontrolledLabel: 'Inherent',
        controlledLabel: 'Residual',
        enableRelativeDates: false,
      });

      expect(Object.keys(result)).toEqual(['uncontrolled__notes_text']);
    });

    it('handles only controlled schema present', () => {
      const result = convertRatingSchemasToFieldConfigs({
        uncontrolledSchema: undefined,
        controlledSchema: textSchema,
        uncontrolledLabel: 'Inherent',
        controlledLabel: 'Residual',
        enableRelativeDates: false,
      });

      expect(Object.keys(result)).toEqual(['controlled__notes_text']);
    });

    it('handles different schemas for each control type', () => {
      const controlledOnlySchema: CustomAttributeSchema = {
        Schema: {
          type: 'object',
          properties: {
            mitigation_text: { type: 'string', description: '' },
          },
        },
        UiSchema: {
          type: 'VerticalLayout',
          elements: [
            {
              type: 'Control',
              label: 'Mitigation',
              scope: '#/properties/mitigation_text',
            },
          ],
        },
      };

      const result = convertRatingSchemasToFieldConfigs({
        uncontrolledSchema: textSchema,
        controlledSchema: controlledOnlySchema,
        uncontrolledLabel: 'Inherent',
        controlledLabel: 'Residual',
        enableRelativeDates: false,
      });

      expect(getHeader(result['uncontrolled__notes_text'])).toBe(
        'Notes (Inherent)'
      );
      expect(getHeader(result['controlled__mitigation_text'])).toBe(
        'Mitigation (Residual)'
      );
      expect(result['controlled__notes_text']).toBeUndefined();
      expect(result['uncontrolled__mitigation_text']).toBeUndefined();
    });

    it('uses custom taxonomy labels', () => {
      const result = convertRatingSchemasToFieldConfigs({
        uncontrolledSchema: textSchema,
        controlledSchema: textSchema,
        uncontrolledLabel: 'Brut',
        controlledLabel: 'Net',
        enableRelativeDates: false,
      });

      expect(getHeader(result['uncontrolled__notes_text'])).toBe(
        'Notes (Brut)'
      );
      expect(getHeader(result['controlled__notes_text'])).toBe('Notes (Net)');
    });
  });
});
