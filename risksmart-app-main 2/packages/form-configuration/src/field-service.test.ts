import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import { describe, expect, it } from 'vitest';

import type { TypedFormFieldConfiguration } from './field-service';
import { removeFieldFromConditions } from './field-service';

// Helper function to create minimal FormFieldConfiguration mocks
const buildFormFieldConfiguration = (
  overrides: Partial<TypedFormFieldConfiguration> = {}
): TypedFormFieldConfiguration => ({
  FieldId: 'mock-field-id',
  Label: 'Mock Field',
  CreatedAtTimestamp: '2024-01-01T00:00:00Z',
  CreatedByUser: 'mock-user',
  FormConfigurationParentType: ParentTypes.Action,
  Hidden: false,
  ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
  ModifiedByUser: 'mock-user',
  Required: false,
  ReadOnly: false,
  Conditions: null,
  OrgKey: 'Org123',
  ...overrides,
});

describe('removeFieldFromConditions', () => {
  describe('when removing a field that exists in conditions', () => {
    it('should remove the field from token groups in conditions', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'fieldToDelete',
                operator: '=',
                value: ['value1'],
              },
              {
                propertyKey: 'otherField',
                operator: '=',
                value: ['value2'],
              },
            ],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'fieldToDelete',
        formFieldConfiguration: mockFormFields,
      });

      expect(result).toHaveLength(1);

      const firstResult = result[0];

      if (!firstResult) {
        throw new Error('Expected result to have at least one element');
      }

      expect(firstResult.Conditions?.tokenGroups).toHaveLength(1);

      const tokenGroup = firstResult.Conditions!.tokenGroups[0]!;
      if ('tokens' in tokenGroup) {
        throw new Error('Expected tokenGroup to not have tokens property');
      }

      expect(tokenGroup.propertyKey).toBe('otherField');
    });

    it('should set conditions to null if all token groups are removed', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'fieldToDelete',
                operator: '=',
                value: ['value1'],
              },
            ],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'fieldToDelete',
        formFieldConfiguration: mockFormFields,
      });

      expect(result[0]!.Conditions).toBeNull();
    });
  });

  describe('when removing a field that does not exist in conditions', () => {
    it('should return 0 changed records', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'someOtherField',
                operator: '=',
                value: ['value1'],
              },
            ],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'nonExistentField',
        formFieldConfiguration: mockFormFields,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('when fields have no conditions', () => {
    it('should return fields unchanged if they have no conditions', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          Conditions: null,
        }),
        buildFormFieldConfiguration({
          // No Conditions property override, will use default null
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'anyField',
        formFieldConfiguration: mockFormFields,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('when working with mixed scenarios', () => {
    it('should handle fields with and without conditions appropriately', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'fieldToDelete',
                operator: '=',
                value: ['value1'],
              },
              {
                propertyKey: 'keepThisField',
                operator: '=',
                value: ['value2'],
              },
            ],
          },
        }),
        buildFormFieldConfiguration({
          Conditions: null,
        }),
        buildFormFieldConfiguration({
          Conditions: {
            operation: 'or',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'anotherField',
                operator: ':',
                value: ['text'],
              },
            ],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'fieldToDelete',
        formFieldConfiguration: mockFormFields,
      });

      expect(result).toHaveLength(1);

      const r1TokenGroup1 = result[0]!.Conditions!.tokenGroups[0]!;
      if ('tokens' in r1TokenGroup1) {
        throw new Error('Expected tokenGroup to not have tokens property');
      }

      // Field 1 should have fieldToDelete removed but keepThisField preserved
      expect(result[0]!.Conditions?.tokenGroups).toHaveLength(1);
      expect(r1TokenGroup1.propertyKey).toBe('keepThisField');
    });
  });

  describe('when dealing with multiple token groups with same propertyKey', () => {
    it('should remove all token groups that match the deleted field ID', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'fieldToDelete',
                operator: '=',
                value: ['value1'],
              },
              {
                propertyKey: 'otherField',
                operator: '=',
                value: ['value2'],
              },
              {
                propertyKey: 'fieldToDelete',
                operator: '=',
                value: ['option1', 'option2'],
              },
            ],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'fieldToDelete',
        formFieldConfiguration: mockFormFields,
      });

      const tokenGroup = result[0]!.Conditions!.tokenGroups[0]!;
      if ('tokens' in tokenGroup) {
        throw new Error('Expected tokenGroup to not have tokens property');
      }

      expect(result[0]!.Conditions?.tokenGroups).toHaveLength(1);
      expect(tokenGroup?.propertyKey).toBe('otherField');
    });
  });

  describe('when configuration array is empty', () => {
    it('should return an empty array', () => {
      const result = removeFieldFromConditions({
        deletedFieldId: 'anyField',
        formFieldConfiguration: [],
      });

      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as deleted field ID', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: '',
                operator: '=',
                value: ['value1'],
              },
              {
                propertyKey: 'normalField',
                operator: '=',
                value: ['value2'],
              },
            ],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: '',
        formFieldConfiguration: mockFormFields,
      });

      const tokenGroup = result[0]!.Conditions!.tokenGroups[0]!;
      if ('tokens' in tokenGroup) {
        throw new Error('Expected tokenGroup to not have tokens property');
      }

      expect(result[0]!.Conditions?.tokenGroups).toHaveLength(1);
      expect(tokenGroup.propertyKey).toBe('normalField');
    });

    it('should preserve field properties other than Conditions', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          FieldId: 'field1',
          Label: 'Field 1',
          Required: true,
          Hidden: false,
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'fieldToDelete',
                operator: '=',
                value: ['value1'],
              },
            ],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'fieldToDelete',
        formFieldConfiguration: mockFormFields,
      });

      expect(result[0]!.FieldId).toBe('field1');
      expect(result[0]!.Label).toBe('Field 1');
      expect(result[0]!.Required).toBe(true);
      expect(result[0]!.Hidden).toBe(false);
      expect(result[0]!.Conditions).toBeNull();
    });

    it('should ignore conditions with no token groups', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          FieldId: 'field1',
          Label: 'Field 1',
          Conditions: {
            operation: 'and',
            tokenGroups: [],
            tokens: [],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'anyField',
        formFieldConfiguration: mockFormFields,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('immutability', () => {
    it('should not modify the original form field configuration array', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          FieldId: 'field1',
          Label: 'Field 1',
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'fieldToDelete',
                operator: '=',
                value: ['value1'],
              },
            ],
          },
        }),
      ];
      const firstMockField = mockFormFields[0];

      if (!firstMockField) {
        throw new Error('Expected result to have at least one element');
      }

      const originalLength = firstMockField.Conditions!.tokenGroups.length;

      removeFieldFromConditions({
        deletedFieldId: 'fieldToDelete',
        formFieldConfiguration: mockFormFields,
      });

      // Original should remain unchanged
      expect(firstMockField.Conditions!.tokenGroups).toHaveLength(
        originalLength
      );
      const tokenGroup = firstMockField.Conditions!.tokenGroups[0]!;
      if ('tokens' in tokenGroup) {
        throw new Error('Expected tokenGroup to not have tokens property');
      }

      expect(tokenGroup.propertyKey).toBe('fieldToDelete');
    });

    it('should return new objects, not references to originals', () => {
      const mockFormFields: TypedFormFieldConfiguration[] = [
        buildFormFieldConfiguration({
          FieldId: 'field1',
          Label: 'Field 1',
          Conditions: {
            operation: 'and',
            tokens: [],
            tokenGroups: [
              {
                propertyKey: 'someField',
                operator: '=',
                value: ['value1'],
              },
              {
                propertyKey: 'deletedField',
                operator: '=',
                value: ['value1'],
              },
            ],
          },
        }),
      ];

      const result = removeFieldFromConditions({
        deletedFieldId: 'deletedField',
        formFieldConfiguration: mockFormFields,
      });

      // Should be different object references
      expect(result).not.toBe(mockFormFields);
      expect(result[0]).not.toBe(mockFormFields[0]);
      expect(result[0]!.Conditions).not.toBe(mockFormFields[0]!.Conditions);
    });
  });
});
