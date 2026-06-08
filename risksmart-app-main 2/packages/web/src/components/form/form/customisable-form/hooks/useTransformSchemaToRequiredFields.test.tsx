import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { z } from 'zod';

import {
  addRequireFieldsToSchema,
  getRequiredFields,
} from './useTransformSchemaToRequiredFields';

describe('useTransformSchemaToRequiredFields', () => {
  describe('addRequireFieldsToSchema', () => {
    it('should make change a boolean field required field', () => {
      const updatedSchema = addRequireFieldsToSchema(
        z.object({
          field1: z.boolean(),
          field2: z.boolean(),
          field3: z.boolean(),
        }),
        new Set(['field1', 'field2', 'field3'])
      );

      const result = updatedSchema.safeParse({
        field1: false,
        field2: true,
        field3: undefined,
      });
      expect(!result.success && result.error.issues).toEqual([
        {
          code: 'invalid_type',
          expected: 'boolean',
          received: 'undefined',
          path: ['field3'],
          message: 'Required',
        },
        {
          code: 'custom',
          fatal: true,
          message: 'Required',
          path: ['field3'],
        },
      ]);
    });

    it('should make change a non required field required', () => {
      const updatedSchema = addRequireFieldsToSchema(
        z.object({
          field1: z.string(),
          field2: z.string(),
        }),
        new Set(['field1'])
      );

      const result = updatedSchema.safeParse({
        field1: '',
        field2: '',
      });
      expect(!result.success && result.error.issues).toEqual([
        {
          code: 'custom',
          message: 'Required',
          fatal: true,
          path: ['field1'],
        },
      ]);
    });

    it('should make change a multiple non required fields required', () => {
      const updatedSchema = addRequireFieldsToSchema(
        z.object({
          field1: z.string(),
          field2: z.string(),
        }),
        new Set(['field1', 'field2'])
      );

      const result = updatedSchema.safeParse({
        field1: '',
        field2: '',
      });

      expect(!result.success && result.error.issues).toEqual([
        {
          code: 'custom',
          message: 'Required',
          fatal: true,
          path: ['field1'],
        },
        {
          code: 'custom',
          message: 'Required',
          fatal: true,
          path: ['field2'],
        },
      ]);
    });

    it('should make change a multiple nested non required fields required', () => {
      const CustomAttributeData = z.object({
        field1: z.string(),
        field2: z.string(),
      });
      const updatedSchema = addRequireFieldsToSchema(
        z.object({
          CustomAttributeData,
        }),
        new Set(['CustomAttributeData.field1', 'CustomAttributeData.field2'])
      );

      const result = updatedSchema.safeParse({
        CustomAttributeData: { field1: '', field2: '' },
      });

      expect(!result.success && result.error.issues).toEqual([
        {
          code: 'custom',
          message: 'Required',
          fatal: true,
          path: ['CustomAttributeData', 'field1'],
        },
        {
          code: 'custom',
          message: 'Required',
          fatal: true,
          path: ['CustomAttributeData', 'field2'],
        },
      ]);
    });
  });

  describe('getRequiredFields', () => {
    it('returns an empty object if no fields are required', () => {
      const requiredFields = getRequiredFields({
        allFieldIds: ['field1', 'field2'],
        defaultRequiredFields: [],
        fieldConfig: [],
        conditionallyHiddenFields: new Set(),
      });
      expect(requiredFields).toEqual(new Set());
    });

    it('returns an object with the field id as the key set to true if its a default is required', () => {
      const requiredFields = getRequiredFields({
        allFieldIds: ['field1', 'field2'],
        defaultRequiredFields: ['field1'],
        fieldConfig: [],
        conditionallyHiddenFields: new Set(),
      });
      expect(requiredFields).toEqual(new Set(['field1']));
    });

    it('returns an object with the field id as the key set to true if its required by configuration', () => {
      const requiredFields = getRequiredFields({
        allFieldIds: ['field1', 'field2'],
        defaultRequiredFields: [],
        conditionallyHiddenFields: new Set(),
        fieldConfig: [
          {
            FieldId: 'field1',
            Required: true,
            Hidden: false,
            ReadOnly: false,
            FormConfigurationParentType: Parent_Type_Enum.Action,
          },
        ],
      });
      expect(requiredFields).toEqual(new Set(['field1']));
    });

    it('does not incluide fields required by configuration if they are conditionally hidden', () => {
      const requiredFields = getRequiredFields({
        allFieldIds: ['field1', 'field2', 'field3'],
        defaultRequiredFields: [],
        conditionallyHiddenFields: new Set(['field1']),
        fieldConfig: [
          {
            FieldId: 'field1',
            Required: true,
            Hidden: false,
            ReadOnly: false,
            FormConfigurationParentType: Parent_Type_Enum.Action,
          },
          {
            FieldId: 'field3',
            Required: true,
            Hidden: false,
            ReadOnly: false,
            FormConfigurationParentType: Parent_Type_Enum.Action,
          },
        ],
      });
      // field 1 is required, but conditionally hidden
      expect(requiredFields).toEqual(new Set(['field3']));
    });

    it('returns an empty object if its defaulted is required, but not required by configuration', () => {
      const requiredFields = getRequiredFields({
        allFieldIds: ['field1', 'field2'],
        defaultRequiredFields: ['field1'],
        conditionallyHiddenFields: new Set(),
        fieldConfig: [
          {
            FieldId: 'field1',
            Required: false,
            Hidden: false,
            ReadOnly: false,
            FormConfigurationParentType: Parent_Type_Enum.Action,
          },
        ],
      });
      expect(requiredFields).toEqual(new Set());
    });
  });
});
