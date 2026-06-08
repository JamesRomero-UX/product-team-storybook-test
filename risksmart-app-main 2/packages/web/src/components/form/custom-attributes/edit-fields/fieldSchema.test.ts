import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import { describe, expect, it } from 'vitest';

import type { ConditionalFields } from '../../form/conditional-fields-provider/conditionsGraph';
import { buildFieldFormFields } from './fieldFormFieldsBuilder';
import type { FieldFormFields } from './fieldSchema';
import { getFieldSchema } from './fieldSchema';

describe('getFieldSchema', () => {
  describe('basic validation', () => {
    it('should validate a valid custom text field', () => {
      const schema = getFieldSchema('field1', []);

      const validData = buildFieldFormFields({
        IsCustomField: true,
        CustomFieldType: CustomAttributeFieldType.Text,
        CustomFieldOptions: [],
      });

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate a valid standard field', () => {
      const schema = getFieldSchema('field1', []);

      const validData = buildFieldFormFields({
        IsCustomField: false,
      });

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require Label field', () => {
      const schema = getFieldSchema('field1', []);

      const invalidData = buildFieldFormFields({
        IsCustomField: true,
        CustomFieldLabel: '', // Empty label should fail
        CustomFieldType: CustomAttributeFieldType.Text,
        CustomFieldOptions: [],
      });

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['CustomFieldLabel'],
              message: 'Required',
            }),
          ])
        );
      }
    });

    it.each(Object.values(CustomAttributeFieldType))(
      'should validate CustomAttributeFieldType %s value',
      (fieldType) => {
        const schema = getFieldSchema('field1', []);

        const validData = buildFieldFormFields({
          IsCustomField: true,
          CustomFieldLabel: `Test ${fieldType} Field`,
          CustomFieldType: fieldType,
          CustomFieldOptions: [{ Value: '1', GeneratedId: 'id1' }],
        });

        const result = schema.safeParse(validData);
        expect(result.success).toBe(true);
      }
    );
  });

  describe('option field validation for fields with options', () => {
    const fieldTypesWithOptions: CustomAttributeFieldType[] = [
      CustomAttributeFieldType.Select,
      CustomAttributeFieldType.MultiSelect,
    ];

    it.each(fieldTypesWithOptions)(
      'should require at least one option for %s field type',
      (fieldType) => {
        const schema = getFieldSchema('field1', []);

        const invalidData = buildFieldFormFields({
          IsCustomField: true,
          CustomFieldType: fieldType,
          CustomFieldOptions: [], // No options provided
        });

        const result = schema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                path: ['global'],
                message: 'There must be at least one option',
              }),
            ])
          );
        }
      }
    );

    it.each(fieldTypesWithOptions)(
      'should accept valid options for %s field type',
      (fieldType) => {
        const schema = getFieldSchema('field1', []);

        const validData = buildFieldFormFields({
          IsCustomField: true,
          CustomFieldType: fieldType,
          CustomFieldOptions: [
            { Value: 'Option 1', GeneratedId: 'id1' },
            { Value: 'Option 2', GeneratedId: 'id2' },
          ],
        });

        const result = schema.safeParse(validData);
        expect(result.success).toBe(true);
      }
    );

    it.each([
      CustomAttributeFieldType.Select,
      CustomAttributeFieldType.MultiSelect,
    ])('should reject duplicate options for %s field type', (fieldType) => {
      const schema = getFieldSchema('field1', []);

      const invalidData = buildFieldFormFields({
        IsCustomField: true,
        CustomFieldType: fieldType,
        CustomFieldOptions: [
          { Value: 'Option 1', GeneratedId: 'id1' },
          { Value: 'Option 1', GeneratedId: 'id2' }, // Duplicate value
        ],
      });

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['global'],
              message: 'Options must be unique',
            }),
          ])
        );
      }
    });

    it.each(fieldTypesWithOptions)(
      'should reject empty option values for %s field type',
      (fieldType) => {
        const schema = getFieldSchema('field1', []);

        const invalidData = buildFieldFormFields({
          IsCustomField: true,
          CustomFieldType: fieldType,
          CustomFieldOptions: [
            { Value: 'Option 1', GeneratedId: 'id1' },
            { Value: '', GeneratedId: 'id2' }, // Empty value
          ],
        });

        const result = schema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                path: ['global'],
                message: 'Each option must have a value',
              }),
            ])
          );
        }
      }
    );

    const fieldTypesWithoutOptions = [
      CustomAttributeFieldType.Text,
      CustomAttributeFieldType.Textarea,
      CustomAttributeFieldType.Date,
      CustomAttributeFieldType.Link,
    ];

    it.each(fieldTypesWithoutOptions)(
      'should not require options for %s field type',
      (fieldType) => {
        const schema = getFieldSchema('field1', []);

        const validData = buildFieldFormFields({
          IsCustomField: true,
          CustomFieldType: fieldType,
          CustomFieldOptions: [], // No options needed
        });

        const result = schema.safeParse(validData);
        expect(result.success).toBe(true);
      }
    );
  });

  describe('conditional field validation', () => {
    it('should pass validation when no conditions are present', () => {
      const schema = getFieldSchema('field1', []);

      const validData: FieldFormFields = buildFieldFormFields({
        IsCustomField: false,
        Conditions: null,
      });

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should pass validation when conditions exist but no cycles are detected', () => {
      const schema = getFieldSchema('field1', []);

      const validData = buildFieldFormFields({
        IsCustomField: true,
        CustomFieldType: CustomAttributeFieldType.Text,
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['yes'],
            },
          ],
        },
      });

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail validation when circular references are detected', () => {
      const mockFields: ConditionalFields = [
        {
          FieldId: 'field2',
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'field1',
                operator: '=',
                value: ['yes'],
              },
            ],
          },
        },
      ];

      const schema = getFieldSchema('field1', mockFields);

      const invalidData = buildFieldFormFields({
        IsCustomField: true,
        CustomFieldType: CustomAttributeFieldType.Text,
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['yes'],
            },
          ],
        },
      });

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['Conditions'],
              message:
                'Circular references detected in conditional logic. Please review and remove any circular references',
            }),
          ])
        );
      }
    });

    it('should validate conditions for standard fields', () => {
      const schema = getFieldSchema('field1', []);

      const validData = buildFieldFormFields({
        IsCustomField: false,
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['yes'],
            },
          ],
        },
      });

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('edge cases and complex scenarios', () => {
    it('should handle null and undefined values gracefully', () => {
      const schema = getFieldSchema('field1', []);

      const validData = buildFieldFormFields({
        IsCustomField: true,
        CustomFieldType: CustomAttributeFieldType.Text,
        CustomFieldOptions: undefined,
        Description: null,
        DefaultValue: null,
        Conditions: undefined,
      });

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate complex conditional scenarios', () => {
      const mockFields: ConditionalFields = [
        {
          FieldId: 'parentField',
          Conditions: null,
        },
        {
          FieldId: 'siblingField',
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'parentField',
                operator: '=',
                value: ['option1'],
              },
            ],
          },
        },
      ];

      const schema = getFieldSchema('currentField', mockFields);

      const validData: FieldFormFields = {
        EnableCustomLabel: false,
        IsCustomField: true,
        CustomFieldLabel: 'Dependent Field',
        CustomFieldType: CustomAttributeFieldType.Select,
        CustomFieldOptions: [
          { Value: 'Choice A', GeneratedId: 'id1' },
          { Value: 'Choice B', GeneratedId: 'id2' },
        ],
        CustomFieldShowAltValues: false,
        Required: true,
        Hidden: false,
        ReadOnly: false,
        Conditions: {
          operation: 'or',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'parentField',
              operator: '=',
              value: ['option2'],
            },
            {
              propertyKey: 'siblingField',
              operator: '=',
              value: ['choice1'],
            },
          ],
        },
      };

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle empty currentFieldId', () => {
      const schema = getFieldSchema('', []);

      const validData: FieldFormFields = buildFieldFormFields({
        IsCustomField: true,
        CustomFieldType: CustomAttributeFieldType.Text,
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['yes'],
            },
          ],
        },
      });

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should combine multiple validation errors', () => {
      const schema = getFieldSchema('field1', []);

      const invalidData: FieldFormFields = {
        EnableCustomLabel: true,
        IsCustomField: true,
        CustomFieldLabel: '', // Invalid: empty label
        CustomFieldType: CustomAttributeFieldType.Select,
        CustomFieldOptions: [], // Invalid: no options for select field
        Required: false,
        Hidden: false,
        ReadOnly: false,
        CustomFieldShowAltValues: false,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['CustomFieldLabel'],
              message: 'Required',
            }),
            expect.objectContaining({
              path: ['global'],
              message: 'There must be at least one option',
            }),
          ])
        );
      }
    });
  });
});
