import { RuleEffect } from '@jsonforms/core';
import { act, renderHook } from '@testing-library/react';
import type { DiGraph, VertexBody, VertexDefinition } from 'digraph-js';

import { useFormBuilderFieldStore } from './store/useFormBuilderFieldStore';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import {
  complexSchema,
  complexSchemaExample1,
  complexUISchema,
  complexUISchemaExample1,
  emptySchema,
  SchemaId,
} from './testFixtures';
import type {
  CustomSchema,
  CustomUISchema,
  CustomUISchemaElement,
  FieldConfigData,
} from './types';
import { FieldOptionType, type SchemaCondition } from './types';
import {
  areAnyAncestorsHidden,
  buildConditionallyRequiredSchemaConditions,
  buildSchemaConditionGraph,
  generateConditions,
  getAllVisibleFieldIds,
  getErrorsForVisibleFields,
  getResponseDataExcludingDataForHiddenFields,
  isElementHidden,
  pruneRemovedSelectOptionsWithConditionalLogic,
  removedSelectOptionIds,
  validateConditionalList,
} from './utils';

/**
 * Helper to get nested elements from a CustomUISchema with proper typing.
 * This is needed because the intersection type with VerticalLayout causes
 * TypeScript to infer UISchemaElement[] instead of CustomUISchemaElement[].
 */
const getSectionElements = (
  schema: CustomUISchema,
  sectionIndex: number
): CustomUISchemaElement[] | undefined => {
  return schema.elements[sectionIndex]?.elements;
};

const initialFormBuilderStoreState = useFormBuilderStore.getState();
const initialFormBuilderFieldStoreState = useFormBuilderFieldStore.getState();

export const resetStores = () => {
  useFormBuilderStore.setState(initialFormBuilderStoreState, true);
  useFormBuilderFieldStore.setState(initialFormBuilderFieldStoreState, true);
};

describe('FormBuilder Utils', () => {
  describe('buildSchemaConditionGraph', () => {
    const getVertices = (graph: DiGraph<VertexDefinition<VertexBody>>) => {
      return graph.traverseEager({ traversal: 'dfs' });
    };

    it('should build an empty graph for a schema with no properties', () => {
      const graph = buildSchemaConditionGraph(emptySchema);
      expect(getVertices(graph).length).toBe(0);
    });

    it('should build a graph with vertices for each property in the schema', () => {
      const schema: CustomSchema = {
        type: 'object',
        properties: {
          field1: {
            type: 'string',
            parentId: 'section1',
            isCustomisable: true,
          },
          field2: {
            type: 'string',
            parentId: 'section1',
            isCustomisable: true,
          },
          field3: {
            type: 'string',
            parentId: 'section1',
            isCustomisable: true,
          },
        },
      };
      const graph = buildSchemaConditionGraph(schema);
      expect(getVertices(graph).length).toBe(3);
      expect(graph.hasVertex('field1')).toBe(true);
      expect(graph.hasVertex('field2')).toBe(true);
      expect(graph.hasVertex('field3')).toBe(true);
    });

    it('should build a graph with edges representing conditional dependencies', () => {
      const schema: CustomSchema = {
        type: 'object',
        properties: {
          field1: {
            type: 'string',
            parentId: 'section1',
            isCustomisable: true,
            oneOf: [
              { const: 'opt1', title: 'Option 1' },
              { const: 'opt2', title: 'Option 2' },
            ],
          },
          field2: {
            type: 'string',
            parentId: 'section1',
            isCustomisable: true,
            conditionalOptions: {
              operation: 'and',
              tokens: [
                { propertyKey: 'field1', value: ['opt1'], operator: '=' },
              ],
            },
          },
          field3: {
            type: 'string',
            parentId: 'section1',
            isCustomisable: true,
            conditionalOptions: {
              operation: 'and',
              tokens: [
                {
                  propertyKey: 'field1',
                  value: ['opt1', 'opt2'],
                  operator: '=',
                },
                { propertyKey: 'field2', value: ['value2'], operator: '=' },
              ],
            },
          },
        },
      };
      const graph = buildSchemaConditionGraph(schema);
      expect(graph.getChildren('field1').length).toBe(2);
      expect(graph.getChildren('field2').length).toBe(1);
      expect(graph.getChildren('field3').length).toBe(0);
    });
  });

  describe('areAnyAncestorsHidden', () => {
    const parentFieldId = 'field_14bef601-8f09-448c-8271-1943afabb108';
    const parentFieldOptionYesId = '7e58a96d-bd6c-4172-ad33-181e97d1f80a';
    const parentFieldOptionNoId = 'b90b09dd-859c-41da-8205-13efa8adbcf5';

    const childFieldId = 'field_421108a8-c346-4419-b57b-f838a00805d2';
    const childFieldOptionYesId = '8a7c6081-4b17-4340-a203-dffe383b8e28';
    const childFieldOptionNoId = 'd10d352c-6dff-47a3-bb02-3592db71d6ab';

    const grandChildFieldId = 'field_d6e8a7d8-4ed5-49d5-98a8-26c369200d03';
    const grandChildFieldOptionYesId = 'd1d1193a-95fd-4496-b8b2-5b9bb595fe79';
    const grandChildFieldOptionNoId = 'b3dfaa8f-e510-4948-8b58-eed155f10bf5';

    const schema: CustomSchema = {
      type: 'object',
      required: [parentFieldId],
      properties: {
        [parentFieldId]: {
          parentId: 'section_4fd6effa-83b4-48e7-ac5c-d02a5aaaf803',
          oneOf: [
            {
              const: parentFieldOptionYesId,
              title: 'Yes',
            },
            {
              const: parentFieldOptionNoId,
              title: 'No',
            },
          ],
          minItems: 1,
          type: 'string',
          isCustomisable: true,
          isConditional: false,
          allowAttachments: false,
          conditionalOptions: {
            operation: 'and',
            tokens: [],
          },
        },
        [childFieldId]: {
          parentId: 'section_4fd6effa-83b4-48e7-ac5c-d02a5aaaf803',
          oneOf: [
            {
              const: childFieldOptionYesId,
              title: 'Yes',
            },
            {
              const: childFieldOptionNoId,
              title: 'No',
            },
          ],
          type: 'string',
          isCustomisable: true,
          isConditional: true,
          allowAttachments: false,
          conditionalOptions: {
            tokens: [
              {
                value: [parentFieldOptionYesId],
                operator: '=',
                propertyKey: parentFieldId,
              },
            ],
            operation: 'and',
          },
        },
        [grandChildFieldId]: {
          parentId: 'section_4fd6effa-83b4-48e7-ac5c-d02a5aaaf803',
          oneOf: [
            {
              const: grandChildFieldOptionYesId,
              title: 'Yes',
            },
            {
              const: grandChildFieldOptionNoId,
              title: 'No',
            },
          ],
          type: 'string',
          isCustomisable: true,
          isConditional: true,
          allowAttachments: false,
          conditionalOptions: {
            tokens: [
              {
                value: [childFieldOptionYesId],
                operator: '=',
                propertyKey: childFieldId,
              },
            ],
            operation: 'and',
          },
        },
      },
      allOf: [
        {
          if: {
            properties: {
              [parentFieldId]: {
                enum: [parentFieldOptionYesId],
              },
            },
            required: [parentFieldId],
          },
          then: {
            properties: {
              [childFieldId]: {
                minItems: 1,
              },
            },
            required: [childFieldId],
          },
        },
        {
          if: {
            properties: {
              [childFieldId]: {
                enum: [childFieldOptionYesId],
              },
            },
            required: [childFieldId],
          },
          then: {
            properties: {
              [grandChildFieldId]: {
                minItems: 1,
              },
            },
            required: [grandChildFieldId],
          },
        },
      ],
    };

    const uiSchema: CustomUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          id: 'section_4fd6effa-83b4-48e7-ac5c-d02a5aaaf803',
          label: 'Section 1',
          type: 'Group',
          elements: [
            {
              id: parentFieldId,
              type: 'Control',
              parentId: 'section_4fd6effa-83b4-48e7-ac5c-d02a5aaaf803',
              scope: '#/properties/field_14bef601-8f09-448c-8271-1943afabb108',
              label: 'Parent',
              options: {
                fieldType: 'dropdown',
                placeholder: '',
                description: '',
              },
            },
            {
              id: childFieldId,
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  scope: '#',
                  schema: {
                    required: [parentFieldId],
                    properties: {
                      [parentFieldId]: {
                        enum: [parentFieldOptionYesId],
                      },
                    },
                  },
                  failWhenUndefined: true,
                },
              },
              type: 'Control',
              label: 'Child',
              scope: '#/properties/field_421108a8-c346-4419-b57b-f838a00805d2',
              options: {
                fieldType: 'dropdown',
                description: '',
                placeholder: '',
              },
              parentId: 'section_4fd6effa-83b4-48e7-ac5c-d02a5aaaf803',
            },
            {
              id: grandChildFieldId,
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  scope: '#',
                  schema: {
                    required: [childFieldId],
                    properties: {
                      [childFieldId]: {
                        enum: [childFieldOptionYesId],
                      },
                    },
                  },
                  failWhenUndefined: true,
                },
              },
              type: 'Control',
              label: 'Grandchild',
              scope: '#/properties/field_d6e8a7d8-4ed5-49d5-98a8-26c369200d03',
              options: {
                fieldType: 'dropdown',
                description: '',
                placeholder: '',
              },
              parentId: 'section_4fd6effa-83b4-48e7-ac5c-d02a5aaaf803',
            },
          ],
        },
      ],
    };

    beforeEach(() => {
      resetStores();
      useFormBuilderStore.setState({
        schema,
        uiSchema,
      });

      useFormBuilderStore.getState().setFlattenedUISchemaElements(uiSchema);
    });

    it('returns false if there are no ancestors', () => {
      expect(areAnyAncestorsHidden(parentFieldId, {})).toBe(false);
    });

    it('returns false if all ancestors are visible', () => {
      const formData = { [parentFieldId]: parentFieldOptionYesId };

      expect(areAnyAncestorsHidden(childFieldId, formData)).toBe(false);
    });

    it('returns true if direct ancestor is hidden', () => {
      // parentField is set to "no", so childField should be hidden
      const formData = { [parentFieldId]: parentFieldOptionNoId };

      expect(areAnyAncestorsHidden(grandChildFieldId, formData)).toBe(true);
    });

    it('returns true if any ancestor in the chain is hidden', () => {
      // parentField is set to "no", so childField is hidden, so grandChildField should also be hidden
      const formData = {
        [parentFieldId]: parentFieldOptionNoId,
        [childFieldId]: childFieldOptionYesId,
      };
      expect(areAnyAncestorsHidden(grandChildFieldId, formData)).toBe(true);
    });

    it('returns false if all ancestors in the chain are visible', () => {
      // parentField is 'yes', childField is 'show', so grandChildField is visible
      const formData = {
        [parentFieldId]: parentFieldOptionYesId,
        [childFieldId]: childFieldOptionYesId,
      };

      expect(areAnyAncestorsHidden(grandChildFieldId, formData)).toBe(false);
    });

    it('returns false if field has no conditionalOptions and no rule', () => {
      const formData = {};

      expect(areAnyAncestorsHidden(parentFieldId, formData)).toBe(false);
    });
  });

  describe('isElementHidden', () => {
    beforeEach(() => {
      resetStores();
      useFormBuilderStore.setState({
        schema: complexSchemaExample1,
        uiSchema: complexUISchemaExample1,
      });

      useFormBuilderStore
        .getState()
        .setFlattenedUISchemaElements(complexUISchemaExample1);
    });

    it('should return false if the element is visible', () => {
      const formData = { [SchemaId.parentFieldId]: SchemaId.parentOptionYes };
      const childElement = getSectionElements(complexUISchemaExample1, 0)?.find(
        (el) => el.id === SchemaId.childFieldId
      );
      expect(childElement).toBeDefined();
      if (childElement) {
        expect(isElementHidden(childElement, formData)).toBe(false);
      }
    });

    it('should return true if the element is hidden due to rule', () => {
      const formData = { [SchemaId.parentFieldId]: SchemaId.parentOptionNo };
      const childElement = getSectionElements(complexUISchemaExample1, 0)?.find(
        (el) => el.id === SchemaId.childFieldId
      );
      expect(childElement).toBeDefined();
      if (childElement) {
        expect(isElementHidden(childElement, formData)).toBe(true);
      }
    });

    it('should return false if the element is in design mode', () => {
      const formData = { [SchemaId.parentFieldId]: SchemaId.parentOptionNo };
      const childElement = getSectionElements(complexUISchemaExample1, 0)?.find(
        (el) => el.id === SchemaId.childFieldId
      );
      expect(childElement).toBeDefined();
      if (childElement) {
        expect(
          isElementHidden(
            {
              ...childElement,
              options: { ...childElement.options, isDesignMode: true },
            },
            formData
          )
        ).toBe(false);
      }
    });

    it('should return true if any ancestor is hidden', () => {
      const formData = { [SchemaId.parentFieldId]: SchemaId.parentOptionNo };
      const grandChildElement = getSectionElements(
        complexUISchemaExample1,
        0
      )?.find((el) => el.id === SchemaId.grandChildFieldId);
      expect(grandChildElement).toBeDefined();
      if (grandChildElement) {
        expect(isElementHidden(grandChildElement, formData)).toBe(true);
      }
    });
  });

  describe('validateConditionalList', () => {
    const baseSchema: CustomSchema = {
      type: 'object',
      properties: {
        sourceField: {
          type: 'string',
          parentId: 'section1',
          isCustomisable: true,
          oneOf: [
            { const: 'opt1', title: 'option1' },
            { const: 'opt2', title: 'option2' },
          ],
        },
      },
    };

    it('should return empty array when no conditional options exist', () => {
      const fieldConfig: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: false,
      };

      expect(
        validateConditionalList(fieldConfig, baseSchema, 'field1')
      ).toEqual([]);
    });

    it('should return error when conditional options are invalid', () => {
      const fieldConfig: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: true,
        conditionalOptions: {
          operation: 'and',
          tokens: [
            {
              propertyKey: 'sourceField',
              operator: '=',
              value: [],
            },
          ],
        },
      };

      const errors = validateConditionalList(fieldConfig, baseSchema, 'field1');
      expect(errors).toHaveLength(1);
    });

    it('should return error when referenced field does not exist', () => {
      const fieldConfig: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: true,
        conditionalOptions: {
          operation: 'and',
          tokens: [
            {
              propertyKey: 'nonexistentField',
              operator: '=',
              value: ['option1'],
            },
          ],
        },
      };

      const errors = validateConditionalList(fieldConfig, baseSchema, 'field1');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('One or more conditions are invalid');
    });

    it('should return error when option value does not exist in source field', () => {
      const fieldConfig: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: true,
        conditionalOptions: {
          operation: 'and',
          tokens: [
            {
              propertyKey: 'sourceField',
              operator: '=',
              value: ['nonexistentOption'],
            },
          ],
        },
      };

      const errors = validateConditionalList(fieldConfig, baseSchema, 'field1');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('One or more conditions are invalid');
    });

    it('should handle multiselect source fields correctly', () => {
      const schema: CustomSchema = {
        type: 'object',
        properties: {
          multiField: {
            type: 'array',
            parentId: 'section1',
            isCustomisable: true,
            items: {
              oneOf: [
                { const: 'optA', title: 'Option A' },
                { const: 'optB', title: 'Option B' },
              ],
            },
          },
        },
      };

      const fieldConfig: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: true,
        conditionalOptions: {
          operation: 'and',
          tokens: [
            {
              propertyKey: 'multiField',
              operator: '=',
              value: ['optA'],
            },
          ],
        },
      };

      // Should be valid
      expect(validateConditionalList(fieldConfig, schema, 'field1')).toEqual(
        []
      );

      // Now use an invalid value
      const invalidConfig: FieldConfigData = {
        ...fieldConfig,
        conditionalOptions: {
          ...fieldConfig.conditionalOptions!,
          tokens: [
            {
              propertyKey: 'multiField',
              operator: '=',
              value: ['notPresent'],
            },
          ],
        },
      };

      const errors = validateConditionalList(invalidConfig, schema, 'field1');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('One or more conditions are invalid');
    });

    it('should return error for circular dependencies', () => {
      const schema: CustomSchema = {
        type: 'object',
        properties: {
          fieldA: {
            type: 'string',
            parentId: 'section1',
            isCustomisable: true,
            conditionalOptions: {
              operation: 'and',
              tokens: [
                { propertyKey: 'fieldB', value: ['opt1'], operator: '=' },
              ],
            },
            oneOf: [{ const: 'opt1', title: 'Option 1' }],
          },
          fieldB: {
            type: 'string',
            parentId: 'section1',
            isCustomisable: true,
            conditionalOptions: {
              operation: 'and',
              tokens: [
                { propertyKey: 'fieldA', value: ['opt1'], operator: '=' },
              ],
            },
            oneOf: [{ const: 'opt1', title: 'Option 1' }],
          },
        },
      };

      const fieldConfig: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: true,
        conditionalOptions: {
          operation: 'and',
          tokens: [
            {
              propertyKey: 'fieldB',
              operator: '=',
              value: ['opt1'],
            },
          ],
        },
      };

      const errors = validateConditionalList(fieldConfig, schema, 'fieldA');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Circular references detected');
    });
  });

  describe('buildSchemaConditions', () => {
    it('should return empty array for field without conditional options', () => {
      const fieldConfig: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: false,
      };

      expect(generateConditions(fieldConfig, 'field1')).toEqual([]);
    });

    it('should build correct schema conditions for field with conditional options', () => {
      const fieldConfig: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: true,
        conditionalOptions: {
          operation: 'and',
          tokens: [
            {
              propertyKey: 'sourceField',
              operator: '=',
              value: ['option1'],
            },
          ],
        },
      };

      const expected: SchemaCondition[] = [
        {
          if: {
            properties: {
              sourceField: { enum: ['option1'] },
            },
            required: ['sourceField'],
          },
          then: {
            properties: {
              field1: { minItems: 1 },
            },
            required: ['field1'],
          },
        },
      ];

      expect(generateConditions(fieldConfig, 'field1')).toEqual(expected);
    });
  });

  describe('removedSelectOptionIds', () => {
    const schemaForSelect: CustomSchema = {
      type: 'object',
      properties: {
        fieldA: {
          type: 'string',
          parentId: 'section1',
          isCustomisable: true,
          oneOf: [
            { const: 'opt1', title: 'Option 1' },
            { const: 'opt2', title: 'Option 2' },
            { const: 'opt3', title: 'Option 3' },
          ],
        },
        fieldB: {
          type: 'array',
          parentId: 'section1',
          isCustomisable: true,
          items: {
            oneOf: [
              { const: 'optA', title: 'Option A' },
              { const: 'optB', title: 'Option B' },
            ],
          },
        },
      },
    };

    beforeEach(() => {
      resetStores();
      useFormBuilderStore.getState().setSchema(schemaForSelect);
    });

    it('should return empty array when no options are removed', () => {
      const selectOptions = [
        { generatedId: 'opt1', value: 'Option 1' },
        { generatedId: 'opt2', value: 'Option 2' },
        { generatedId: 'opt3', value: 'Option 3' },
      ];

      const removed = removedSelectOptionIds({
        fieldType: FieldOptionType.Dropdown,
        currentFieldId: 'fieldA',
        selectOptions,
      });

      expect(removed).toEqual([]);
    });

    it('should return an empty array when the field type is not a select type', () => {
      const selectOptions = [
        { generatedId: 'opt1', value: 'Option 1' },
        { generatedId: 'opt2', value: 'Option 2' },
      ];

      const removed = removedSelectOptionIds({
        fieldType: FieldOptionType.Text,
        currentFieldId: 'fieldA',
        selectOptions,
      });

      expect(removed).toEqual([]);
    });

    it('should correctly identify removed select option IDs for oneOf fields', () => {
      const selectOptions = [
        { generatedId: 'opt2', value: 'Option 2' }, // opt1 and opt3 are removed
      ];

      const removed = removedSelectOptionIds({
        fieldType: FieldOptionType.Dropdown,
        currentFieldId: 'fieldA',
        selectOptions,
      });

      expect(removed.sort()).toEqual(['opt1', 'opt3'].sort());
    });

    it('should correctly identify removed select option IDs for multiselect fields', () => {
      const selectOptions = [
        { generatedId: 'optB', value: 'Option B' }, // optA is removed
      ];

      const removed = removedSelectOptionIds({
        fieldType: FieldOptionType.Multiselect,
        currentFieldId: 'fieldB',
        selectOptions,
      });

      expect(removed).toEqual(['optA']);
    });
  });

  describe('pruneRemovedSelectOptionsWithConditionalLogic', () => {
    beforeEach(() => {
      resetStores();
      useFormBuilderStore.setState({
        schema: complexSchema,
        uiSchema: complexUISchema,
      });
    });

    it('should do nothing if removedIds is empty', () => {
      pruneRemovedSelectOptionsWithConditionalLogic({
        currentFieldId: 'field2',
        removedIds: [],
      });

      expect(useFormBuilderStore.getState().schema).toEqual(complexSchema);
      expect(useFormBuilderStore.getState().uiSchema).toEqual(complexUISchema);
    });

    it('should remove token values that match removedIds', () => {
      pruneRemovedSelectOptionsWithConditionalLogic({
        currentFieldId: 'field2',
        removedIds: ['opt1'],
      });

      expect(
        useFormBuilderStore.getState().schema?.properties?.field1
          ?.conditionalOptions?.tokens[0].value
      ).toEqual(['opt2']);
    });

    it('should remove tokens and set isConditional to false if all values are removed', () => {
      // Removing all options from field2
      pruneRemovedSelectOptionsWithConditionalLogic({
        currentFieldId: 'field2',
        removedIds: ['opt1', 'opt2'],
      });

      const updatedField5 =
        useFormBuilderStore.getState().schema?.properties?.field5;
      // Field1 should no longer be conditional as its tokens for field2 have been removed.
      expect(updatedField5?.isConditional).toBe(false);

      const tokensForField2 = updatedField5?.conditionalOptions?.tokens.filter(
        (t) => t.propertyKey === 'field2'
      );

      expect(tokensForField2).toHaveLength(0);
    });

    it('should prune schema.allOf conditions that reference removedIds', () => {
      // Remove both options from field2 so that related allOf condition is removed.
      pruneRemovedSelectOptionsWithConditionalLogic({
        currentFieldId: 'field2',
        removedIds: ['opt1', 'opt2'],
      });

      const updatedAllOf = useFormBuilderStore.getState().schema.allOf;
      // The condition for field2 should be removed, but the condition for field3 remains.
      expect(updatedAllOf).toBeDefined();

      if (updatedAllOf) {
        const conditionSources = updatedAllOf.map(
          (c) => Object.keys(c.if.properties)[0]
        );

        expect(conditionSources).not.toContain('field2');
        expect(conditionSources).toContain('field3');
      }
    });

    it('should only remove enum values from a uiSchema rule and keep the rule if some values remain', () => {
      pruneRemovedSelectOptionsWithConditionalLogic({
        currentFieldId: 'field2',
        removedIds: ['opt1'],
      });
      const updatedRule = getSectionElements(
        useFormBuilderStore.getState().uiSchema,
        0
      )?.find((e) => e.id === 'field1')?.rule;
      expect(updatedRule?.condition?.schema?.properties?.field2.enum).toEqual([
        'opt2',
      ]);
    });

    it('should handle multiple tokens and rules', () => {
      pruneRemovedSelectOptionsWithConditionalLogic({
        currentFieldId: 'field2',
        removedIds: ['opt1'],
      });

      const updatedTokens =
        useFormBuilderStore.getState().schema?.properties?.field1
          ?.conditionalOptions?.tokens;
      expect((updatedTokens ?? [])[0].value).toEqual(['opt2']);
      expect((updatedTokens ?? [])[1].value).toEqual(['opt3']);
      const updatedRule = getSectionElements(
        useFormBuilderStore.getState().uiSchema,
        0
      )?.[0].rule;
      expect(updatedRule?.condition?.schema?.properties?.field2.enum).toEqual([
        'opt2',
      ]);
      expect(updatedRule?.condition?.schema?.properties?.field3.enum).toEqual([
        'opt3',
      ]);
    });

    it('should not modify schema or uiSchema if removedIds do not match anything', () => {
      pruneRemovedSelectOptionsWithConditionalLogic({
        currentFieldId: 'field2',
        removedIds: ['not-present'],
      });

      expect(useFormBuilderStore.getState().schema).toEqual(complexSchema);
      expect(useFormBuilderStore.getState().uiSchema).toEqual(complexUISchema);
    });
  });

  describe('getSchemaConditions', () => {
    beforeEach(() => {
      resetStores();
    });

    it('should return empty array when no conditions exist', () => {
      const fieldConfigData: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: false,
      };

      const { result } = renderHook(() => useFormBuilderStore());

      act(() => {
        result.current.setSchema(emptySchema);
      });

      expect(
        buildConditionallyRequiredSchemaConditions({
          fieldConfigData,
          fieldId: 'field1',
        })
      ).toEqual([]);
    });

    it('should remove existing conditions for the field and add new ones', () => {
      const fieldConfigData: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: true,
        allowAttachments: false,
        isConditional: true,
        conditionalOptions: {
          operation: 'and',
          tokens: [
            {
              propertyKey: 'sourceField',
              operator: '=',
              value: ['option1'],
            },
          ],
        },
      };

      const initialConditions: SchemaCondition[] = [
        {
          if: {
            properties: {
              sourceField: { enum: ['option1'] },
            },
            required: ['sourceField'],
          },
          then: {
            properties: {
              field1: { minItems: 1 },
            },
            required: ['field1'],
          },
        },
        {
          if: {
            properties: {
              otherField: { enum: ['foo'] },
            },
            required: ['otherField'],
          },
          then: {
            properties: {
              field2: { minItems: 1 },
            },
            required: ['field2'],
          },
        },
      ];

      const { result } = renderHook(() => useFormBuilderStore());
      act(() => {
        result.current.setSchema({
          ...emptySchema,
          allOf: initialConditions,
        });
      });

      const updatedConditions = buildConditionallyRequiredSchemaConditions({
        fieldConfigData,
        fieldId: 'field1',
      });

      // Should only contain the new condition for field1 and the unrelated condition for field2
      expect(updatedConditions).toHaveLength(2);
      expect(
        updatedConditions.some(
          (c) => Object.keys(c.then.properties)[0] === 'field1'
        )
      ).toBe(true);

      expect(
        updatedConditions.some(
          (c) => Object.keys(c.then.properties)[0] === 'field2'
        )
      ).toBe(true);
    });

    it('should remove all conditions for a field when it becomes unconditional', () => {
      const fieldConfigData: FieldConfigData = {
        fieldTitle: 'Test Field',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: false,
      };

      const initialConditions: SchemaCondition[] = [
        {
          if: {
            properties: {
              sourceField: { enum: ['option1'] },
            },
            required: ['sourceField'],
          },
          then: {
            properties: {
              field1: { minItems: 1 },
            },
            required: ['field1'],
          },
        },
        {
          if: {
            properties: {
              otherField: { enum: ['foo'] },
            },
            required: ['otherField'],
          },
          then: {
            properties: {
              field2: { minItems: 1 },
            },
            required: ['field2'],
          },
        },
      ];

      const { result } = renderHook(() => useFormBuilderStore());
      act(() => {
        result.current.setSchema({
          ...emptySchema,
          allOf: initialConditions,
        });
      });

      const updatedConditions = buildConditionallyRequiredSchemaConditions({
        fieldConfigData,
        fieldId: 'field1',
      });

      // Should only contain the unrelated condition for field2
      expect(updatedConditions).toHaveLength(1);
      expect(Object.keys(updatedConditions[0].then.properties)[0]).toBe(
        'field2'
      );
    });
  });

  describe('Field Visibility Checks', () => {
    const parentFieldId = 'parent';
    const childFieldId = 'child';
    const grandChildFieldId = 'grandchild';

    const parentOptionYes = 'yes';
    const parentOptionNo = 'no';
    const childOptionYes = 'child-yes';

    const schema: CustomSchema = {
      type: 'object',
      properties: {
        [parentFieldId]: {
          type: 'string',
          parentId: 'section',
          isCustomisable: true,
          oneOf: [
            { const: parentOptionYes, title: 'Yes' },
            { const: parentOptionNo, title: 'No' },
          ],
        },
        [childFieldId]: {
          type: 'string',
          parentId: 'section',
          isCustomisable: true,
          oneOf: [{ const: childOptionYes, title: 'Yes' }],
          conditionalOptions: {
            tokens: [
              {
                propertyKey: parentFieldId,
                value: [parentOptionYes],
                operator: '=',
              },
            ],
            operation: 'and',
          },
        },
        [grandChildFieldId]: {
          type: 'string',
          parentId: 'section',
          isCustomisable: true,
          conditionalOptions: {
            tokens: [
              {
                propertyKey: childFieldId,
                value: [childOptionYes],
                operator: '=',
              },
            ],
            operation: 'and',
          },
        },
      },
      allOf: [
        {
          if: {
            properties: {
              [parentFieldId]: { enum: [parentOptionYes] },
            },
            required: [parentFieldId],
          },
          then: {
            properties: {
              [childFieldId]: { minItems: 1 },
            },
            required: [childFieldId],
          },
        },
        {
          if: {
            properties: {
              [childFieldId]: { enum: [childOptionYes] },
            },
            required: [childFieldId],
          },
          then: {
            properties: {
              [grandChildFieldId]: { minItems: 1 },
            },
            required: [grandChildFieldId],
          },
        },
      ],
    };

    const uiSchema: CustomUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          id: 'section',
          type: 'Group',
          elements: [
            {
              id: parentFieldId,
              type: 'Control',
              label: 'Parent',
              options: { fieldType: 'dropdown' },
            },
            {
              id: childFieldId,
              type: 'Control',
              label: 'Child',
              options: { fieldType: 'dropdown' },
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  scope: '#',
                  schema: {
                    required: [parentFieldId],
                    properties: {
                      [parentFieldId]: { enum: [parentOptionYes] },
                    },
                  },
                  failWhenUndefined: true,
                },
              },
            },
            {
              id: grandChildFieldId,
              type: 'Control',
              label: 'Grandchild',
              options: { fieldType: 'dropdown' },
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  scope: '#',
                  schema: {
                    required: [childFieldId],
                    properties: {
                      [childFieldId]: { enum: [childOptionYes] },
                    },
                  },
                  failWhenUndefined: true,
                },
              },
            },
          ],
        },
      ],
    };

    describe('getAllVisibleFieldIds', () => {
      beforeEach(() => {
        useFormBuilderStore.getState().setSchema(schema);
        useFormBuilderStore.getState().setUISchema(uiSchema);
        useFormBuilderStore.getState().setFlattenedUISchemaElements(uiSchema);
      });

      it('returns all field ids when all are visible', () => {
        const formData = {
          [parentFieldId]: parentOptionYes,
          [childFieldId]: childOptionYes,
        };
        expect(getAllVisibleFieldIds(uiSchema, formData).sort()).toEqual(
          [parentFieldId, childFieldId, grandChildFieldId].sort()
        );
      });

      it('returns only parent when no data is set', () => {
        expect(getAllVisibleFieldIds(uiSchema, {})).toEqual([parentFieldId]);
      });

      it('returns parent and child when parent is set to yes', () => {
        const formData = { [parentFieldId]: parentOptionYes };
        expect(getAllVisibleFieldIds(uiSchema, formData).sort()).toEqual(
          [parentFieldId, childFieldId].sort()
        );
      });

      it('returns only parent when parent is set to no', () => {
        const formData = { [parentFieldId]: parentOptionNo };
        expect(getAllVisibleFieldIds(uiSchema, formData)).toEqual([
          parentFieldId,
        ]);
      });

      it('returns no fields if uiSchema has no elements', () => {
        expect(
          getAllVisibleFieldIds({ type: 'VerticalLayout', elements: [] }, {})
        ).toEqual([]);
      });
    });

    describe('getResponseDataExcludingDataForHiddenFields', () => {
      beforeEach(() => {
        useFormBuilderStore.getState().setSchema(schema);
        useFormBuilderStore.getState().setUISchema(uiSchema);
        useFormBuilderStore.getState().setFlattenedUISchemaElements(uiSchema);
      });

      it('returns all data when all fields are visible', () => {
        const formData = {
          [parentFieldId]: parentOptionYes,
          [childFieldId]: childOptionYes,
          [grandChildFieldId]: 'someValue',
        };
        expect(
          getResponseDataExcludingDataForHiddenFields(uiSchema, formData)
        ).toEqual(formData);
      });

      it('returns only parent when no data is set', () => {
        expect(
          getResponseDataExcludingDataForHiddenFields(uiSchema, {})
        ).toEqual({});
      });

      it('returns only parent and child data when parent is set to yes', () => {
        const formData = {
          [parentFieldId]: parentOptionYes,
          [childFieldId]: childOptionYes,
          [grandChildFieldId]: 'shouldBeHidden',
        };
        // grandChildFieldId is only visible if childFieldId is childOptionYes, which it is, so all fields are visible
        expect(
          getResponseDataExcludingDataForHiddenFields(uiSchema, formData)
        ).toEqual(formData);
      });

      it('returns only parent data when parent is set to no', () => {
        const formData = {
          [parentFieldId]: parentOptionNo,
          [childFieldId]: 'shouldBeHidden',
          [grandChildFieldId]: 'shouldBeHidden',
        };
        expect(
          getResponseDataExcludingDataForHiddenFields(uiSchema, formData)
        ).toEqual({ [parentFieldId]: parentOptionNo });
      });

      it('returns only visible fields when some are hidden', () => {
        const formData = {
          [parentFieldId]: parentOptionYes,
          [childFieldId]: 'not-child-yes',
          [grandChildFieldId]: 'shouldBeHidden',
        };
        // grandChildFieldId should be hidden because childFieldId !== childOptionYes
        expect(
          getResponseDataExcludingDataForHiddenFields(uiSchema, formData)
        ).toEqual({
          [parentFieldId]: parentOptionYes,
          [childFieldId]: 'not-child-yes',
        });
      });
    });
  });

  describe('getErrorsForVisibleFields', () => {
    const schema: CustomSchema = {
      type: 'object',
      properties: {
        fieldA: {
          type: 'string',
          parentId: 'section',
          isCustomisable: true,
          oneOf: [
            { const: 'yes', title: 'Yes' },
            { const: 'no', title: 'No' },
          ],
        },
        fieldB: {
          type: 'string',
          parentId: 'section',
          isCustomisable: true,
        },
        fieldC: {
          type: 'string',
          parentId: 'section',
          isCustomisable: true,
        },
      },
      required: ['fieldA'],
      allOf: [
        {
          if: {
            properties: { fieldA: { enum: ['yes'] } },
            required: ['fieldA'],
          },
          then: {
            properties: { fieldB: { minItems: 1 } },
            required: ['fieldB'],
          },
        },
        {
          if: {
            properties: { fieldB: { enum: ['foo'] } },
            required: ['fieldB'],
          },
          then: {
            properties: { fieldC: { minItems: 1 } },
            required: ['fieldC'],
          },
        },
      ],
    };

    const uiSchema: CustomUISchema = {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Group',
          id: 'section',
          elements: [
            {
              id: 'fieldA',
              type: 'Control',
              label: 'Field A',
              options: { fieldType: 'dropdown' },
            },
            {
              id: 'fieldB',
              type: 'Control',
              label: 'Field B',
              options: { fieldType: 'text' },
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  scope: '#',
                  schema: {
                    required: ['fieldA'],
                    properties: { fieldA: { enum: ['yes'] } },
                  },
                },
              },
            },
            {
              id: 'fieldC',
              type: 'Control',
              label: 'Field C',
              options: { fieldType: 'text' },
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  scope: '#',
                  schema: {
                    required: ['fieldB'],
                    properties: { fieldB: { enum: ['foo'] } },
                  },
                },
              },
            },
          ],
        },
      ],
    };

    beforeEach(() => {
      resetStores();
      useFormBuilderStore.getState().setSchema(schema);
    });

    it('should return no errors if all visible fields are valid and all conditions are met', () => {
      const formData = { fieldA: 'yes', fieldB: 'foo', fieldC: 'bar' };
      const errors = getErrorsForVisibleFields(uiSchema, formData);
      expect(errors).toEqual([]);
    });

    it('should return error if a required visible field is missing', () => {
      const formData = {};
      const errors = getErrorsForVisibleFields(uiSchema, formData);
      expect(errors).toEqual([
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'fieldA'",
          params: {
            missingProperty: 'fieldA',
          },
          schemaPath: '#/required',
        },
      ]);
    });

    it('should return error for conditionally required fieldB if fieldA is "yes" and fieldB is missing', () => {
      const formData = { fieldA: 'yes' };
      const errors = getErrorsForVisibleFields(uiSchema, formData);
      expect(errors).toEqual([
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'fieldB'",
          params: {
            missingProperty: 'fieldB',
          },
          schemaPath: '#/allOf/0/then/required',
        },
        {
          instancePath: '',
          keyword: 'if',
          message: `must match "then" schema`,
          params: {
            failingKeyword: 'then',
          },
          schemaPath: '#/allOf/0/if',
        },
      ]);
    });

    it('should not return error for fieldB if fieldA is "no"', () => {
      const formData = { fieldA: 'no' };
      const errors = getErrorsForVisibleFields(uiSchema, formData);
      expect(errors).toEqual([]);
    });

    it('should return error for conditionally required fieldC if fieldA is "yes", fieldB is "foo", and fieldC is missing', () => {
      const formData = { fieldA: 'yes', fieldB: 'foo' };
      const errors = getErrorsForVisibleFields(uiSchema, formData);
      expect(errors).toEqual([
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'fieldC'",
          params: {
            missingProperty: 'fieldC',
          },
          schemaPath: '#/allOf/1/then/required',
        },
        {
          instancePath: '',
          keyword: 'if',
          message: `must match "then" schema`,
          params: {
            failingKeyword: 'then',
          },
          schemaPath: '#/allOf/1/if',
        },
      ]);
    });

    it('should not return error for fieldC if fieldB is not "foo"', () => {
      const formData = { fieldA: 'yes', fieldB: 'bar' };
      const errors = getErrorsForVisibleFields(uiSchema, formData);
      expect(errors).toEqual([]);
    });

    it('should not return errors for hidden fields', () => {
      // fieldC is hidden unless fieldB === 'foo'
      const formData = { fieldA: 'yes', fieldB: 'bar' };
      const errors = getErrorsForVisibleFields(uiSchema, formData);
      expect(errors).toEqual([]);
    });
  });
});
