/* eslint-disable @typescript-eslint/no-explicit-any */
import type { OrgFeature } from '@risksmart-app/modules/src/index';
import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { Helpers } from 'src/pages/custom-datasources/update/display-types/types';
import { describe, expect, it, vi } from 'vitest';

import type { TypedFormFieldConfiguration } from '../customisable-form-data/CustomisableFormDataContext';
import { buildFieldConditionGraph, getHiddenFields } from './conditionsGraph';

// Mock the external dependencies
vi.mock('@risksmart-app/shared/forms/formConfigRegistry', () => ({
  getFormConfigRegistry: vi.fn(() => ({
    'test-form': {
      field1: { fieldId: 'field1', formLabel: 'Field 1' },
      field2: {
        fieldId: 'field2',
        formLabel: 'Field 2',
      },
      field3: {
        fieldId: 'field3',
        formLabel: 'Field 3',
      },
      field4: { fieldId: 'field4', formLabel: 'Field 4' },
      sectionController: {
        fieldId: 'sectionController',
        formLabel: 'Section Controller',
      },
      fieldWithSectionControl: {
        fieldId: 'fieldWithSectionControl',
        formLabel: 'Field With Section Control',
        visibilityControlledByFieldId: 'sectionController',
      },
    },
  })),
}));

vi.mock('../../edit-field-modal/formRegistryService', () => ({
  getConditionalPropertyFilterProps: vi.fn(() => ({
    filteringProperties: [
      {
        key: 'field1',
        propertyLabel: 'Field 1',
        operators: ['=', '!='],
        groupValuesLabel: 'Standard fields',
      },
      {
        key: 'field2',
        propertyLabel: 'Field 2',
        operators: ['=', '!='],
        groupValuesLabel: 'Standard fields',
      },
      {
        key: 'field3',
        propertyLabel: 'Field 3',
        operators: ['=', '!='],
        groupValuesLabel: 'Standard fields',
      },
      {
        key: 'field4',
        propertyLabel: 'Field 4',
        operators: ['=', '!='],
        groupValuesLabel: 'Standard fields',
      },
    ],
  })),
}));

type TestField = Pick<TypedFormFieldConfiguration, 'FieldId' | 'Conditions'>;

describe('buildFieldConditionGraph', () => {
  it('should create an empty graph when no fields are provided', () => {
    const graph = buildFieldConditionGraph([]);
    expect(Object.keys(graph.toDict()).length).toEqual(0);
    expect(graph.hasCycles()).toEqual(false);
  });

  it('should create vertices for all fields without conditions', () => {
    const fields: TestField[] = [
      { FieldId: 'field1', Conditions: undefined },
      { FieldId: 'field2', Conditions: null },
      {
        FieldId: 'field3',
        Conditions: { operation: 'and', tokens: [], tokenGroups: [] },
      },
    ];

    const graph = buildFieldConditionGraph(fields);

    expect(Object.keys(graph.toDict()).length).toEqual(3);
    expect(Object.keys(graph.toDict())).toEqual(['field1', 'field2', 'field3']);
    expect(graph.hasCycles()).toEqual(false);
  });

  it('should detect circular dependencies when two fields reference each other', () => {
    const fields: TestField[] = [
      {
        FieldId: 'sourceField',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'targetField',
              operator: '=',
              value: ['value1'],
            },
          ],
        },
      },
      {
        FieldId: 'targetField',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'sourceField',
              operator: '=',
              value: ['value1'],
            },
          ],
        },
      },
    ];

    const graph = buildFieldConditionGraph(fields);

    expect(graph.hasCycles()).toEqual(true);
  });

  it('should detect circular dependencies when three fields reference each other', () => {
    const fields: TestField[] = [
      {
        FieldId: 'field1',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['value1'],
            },
          ],
        },
      },
      {
        FieldId: 'field2',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field3',
              operator: '=',
              value: ['value1'],
            },
          ],
        },
      },
      {
        FieldId: 'field3',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field1',
              operator: '=',
              value: ['value1'],
            },
          ],
        },
      },
    ];

    const graph = buildFieldConditionGraph(fields);

    expect(graph.hasCycles()).toEqual(true);
  });

  it('should NOT detect circular dependencies when fields do NOT reference each other in a loop', () => {
    const fields: TestField[] = [
      {
        FieldId: 'field1',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['value1'],
            },
          ],
        },
      },
      {
        FieldId: 'field2',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field3',
              operator: '=',
              value: ['value1'],
            },
          ],
        },
      },
      {
        FieldId: 'field3',
        Conditions: null,
      },
    ];

    const graph = buildFieldConditionGraph(fields);

    expect(graph.hasCycles()).toEqual(false);
  });
});

describe('getHiddenFields', () => {
  const mockHelpers = {} as Helpers;
  const mockEnabledFeatures: OrgFeature[] = [];

  /**
   * Builder function to create getHiddenFields parameters with sensible defaults
   */
  const buildGetHiddenFieldsParams = (options: {
    fields: TestField[];
    currentValues: Record<string, any>;
    fieldConditionGraph?: ReturnType<typeof buildFieldConditionGraph>;
  }) => {
    const graph =
      options.fieldConditionGraph ?? buildFieldConditionGraph(options.fields);

    return {
      formId: 'test-form' as FormId,
      customisableData: {
        formFieldConfigurations: options.fields,
        customAttributeSchema: undefined,
      } as any,
      fieldConditionGraph: graph,
      currentValues: options.currentValues,
      helpers: mockHelpers,
      enabledFeatures: mockEnabledFeatures,
    };
  };

  it('should return empty set when no fields have conditions', () => {
    const fields: TestField[] = [
      { FieldId: 'field1', Conditions: undefined },
      { FieldId: 'field2', Conditions: null },
    ];

    const hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'value1', field2: 'value2' },
      })
    );

    expect(hiddenFields.size).toBe(0);
  });

  it('should hide field when its condition is not met', () => {
    const fields: TestField[] = [
      { FieldId: 'field1', Conditions: undefined },
      {
        FieldId: 'field2',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field1',
              operator: '=',
              value: ['expectedValue'],
            },
          ],
        },
      },
    ];

    const hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'differentValue' },
      })
    );

    expect(hiddenFields.has('field2')).toBe(true);
    expect(hiddenFields.size).toBe(1);
  });

  it('should show field when its condition is met', () => {
    const fields: TestField[] = [
      { FieldId: 'field1', Conditions: undefined },
      {
        FieldId: 'field2',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field1',
              operator: '=',
              value: ['expectedValue'],
            },
          ],
        },
      },
    ];

    const hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'expectedValue' },
      })
    );

    expect(hiddenFields.has('field2')).toBe(false);
    expect(hiddenFields.size).toBe(0);
  });

  it('should hide fields controlled by section visibility', () => {
    const fields: TestField[] = [
      { FieldId: 'sectionController', Conditions: undefined },
      { FieldId: 'fieldWithSectionControl', Conditions: undefined },
    ];

    const hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: {
          sectionController: false,
          fieldWithSectionControl: 'value',
        },
      })
    );

    // fieldWithSectionControl is filtered from evaluation but not added to hidden set
    expect(hiddenFields.size).toBe(0);
  });

  it('should exclude hidden section fields from condition evaluation', () => {
    const fields: TestField[] = [
      { FieldId: 'sectionController', Conditions: undefined },
      { FieldId: 'fieldWithSectionControl', Conditions: undefined }, // In hidden section
      {
        FieldId: 'field4',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'fieldWithSectionControl',
              operator: '=',
              value: ['matchingValue'],
            },
          ],
        },
      },
    ];

    const hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: {
          sectionController: false,
          fieldWithSectionControl: 'matchingValue', // This field is in a hidden section
          field4: 'value',
        },
      })
    );

    // field4 should be hidden because fieldWithSectionControl (which it depends on) is in a hidden section
    expect(hiddenFields.has('field4')).toBe(true);
  });

  it('should hide descendant fields when ancestor field is hidden', () => {
    const fields: TestField[] = [
      { FieldId: 'field1', Conditions: undefined },
      {
        FieldId: 'field2',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field1',
              operator: '=',
              value: ['expectedValue'],
            },
          ],
        },
      },
      {
        FieldId: 'field3',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['someValue'],
            },
          ],
        },
      },
    ];

    const hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: {
          field1: 'wrongValue', // This causes field2 to be hidden
          field2: 'someValue', // Even though this matches field3's condition
        },
      })
    );

    // Both field2 and field3 should be hidden (cascading)
    expect(hiddenFields.has('field2')).toBe(true);
    expect(hiddenFields.has('field3')).toBe(true);
    expect(hiddenFields.size).toBe(2);
  });

  it('should handle OR conditions correctly', () => {
    const fields: TestField[] = [
      { FieldId: 'field1', Conditions: undefined },
      { FieldId: 'field2', Conditions: undefined },
      {
        FieldId: 'field3',
        Conditions: {
          operation: 'or',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field1',
              operator: '=',
              value: ['value1'],
            },
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['value2'],
            },
          ],
        },
      },
    ];

    const graph = buildFieldConditionGraph(fields);

    // Test when first condition matches
    let hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'value1', field2: 'wrongValue' },
        fieldConditionGraph: graph,
      })
    );

    expect(hiddenFields.has('field3')).toBe(false);

    // Test when second condition matches
    hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'wrongValue', field2: 'value2' },
        fieldConditionGraph: graph,
      })
    );

    expect(hiddenFields.has('field3')).toBe(false);

    // Test when neither condition matches
    hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'wrongValue', field2: 'wrongValue' },
        fieldConditionGraph: graph,
      })
    );

    expect(hiddenFields.has('field3')).toBe(true);
  });

  it('should handle AND conditions correctly', () => {
    const fields: TestField[] = [
      { FieldId: 'field1', Conditions: undefined },
      { FieldId: 'field2', Conditions: undefined },
      {
        FieldId: 'field3',
        Conditions: {
          operation: 'and',
          tokens: [],
          tokenGroups: [
            {
              propertyKey: 'field1',
              operator: '=',
              value: ['value1'],
            },
            {
              propertyKey: 'field2',
              operator: '=',
              value: ['value2'],
            },
          ],
        },
      },
    ];

    const graph = buildFieldConditionGraph(fields);

    // Test when both conditions match
    let hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'value1', field2: 'value2' },
        fieldConditionGraph: graph,
      })
    );

    expect(hiddenFields.has('field3')).toBe(false);

    // Test when only first condition matches
    hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'value1', field2: 'wrongValue' },
        fieldConditionGraph: graph,
      })
    );

    expect(hiddenFields.has('field3')).toBe(true);

    // Test when neither condition matches
    hiddenFields = getHiddenFields(
      buildGetHiddenFieldsParams({
        fields,
        currentValues: { field1: 'wrongValue', field2: 'wrongValue' },
        fieldConditionGraph: graph,
      })
    );

    expect(hiddenFields.has('field3')).toBe(true);
  });
});
