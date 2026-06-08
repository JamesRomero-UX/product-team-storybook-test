import { act, renderHook } from '@testing-library/react';
import { expect } from 'vitest';

import type {
  CustomSchemaProperties,
  CustomSchemaProperty,
  CustomUISchemaElement,
  FieldConfigData,
  SchemaProperty,
} from '../types';
import { emptyPropertyFilterQuery } from '../types';
import { FieldOptionType } from '../types';
import { usesItemsOneOf, usesOneOf } from '../utils';
import { schemaFixture, uiSchemaFixture } from './testingFixtures';
import { useFormBuilderFieldStore } from './useFormBuilderFieldStore';
import { useFormBuilderSectionStore } from './useFormBuilderSectionStore';
import { useFormBuilderStore } from './useFormBuilderStore';

const initialFormBuilderStoreState = useFormBuilderStore.getState();
const initialFormBuilderSectionStoreState =
  useFormBuilderSectionStore.getState();
const initialFormBuilderFieldStoreState = useFormBuilderFieldStore.getState();

const resetStores = () => {
  useFormBuilderStore.setState(initialFormBuilderStoreState, true);
  useFormBuilderSectionStore.setState(
    initialFormBuilderSectionStoreState,
    true
  );
  useFormBuilderFieldStore.setState(initialFormBuilderFieldStoreState, true);
};

describe('useFormBuilderFieldStore', () => {
  beforeEach(() => {
    resetStores();
  });

  const getSchema = () => useFormBuilderStore.getState().schema;
  const getUISchema = () => useFormBuilderStore.getState().uiSchema;

  it.each([
    {
      fieldTitle: 'New Optional Text Field',
      fieldType: FieldOptionType.Text,
    },
    {
      fieldTitle: 'New Required Text Area Field',
      isPropertyRequired: true,
      fieldType: FieldOptionType.TextArea,
    },
    {
      fieldTitle: 'New Optional Date Field',
      fieldType: FieldOptionType.Date,
    },
    {
      fieldTitle: 'New Optional URL Field',
      fieldType: FieldOptionType.Url,
    },
    {
      fieldTitle: 'New Required Number Field',
      isPropertyRequired: true,
      fieldType: FieldOptionType.Number,
    },
    {
      fieldTitle: 'New Optional Radio Field',
      fieldType: FieldOptionType.Radio,
      selectOptions: [
        {
          generatedId: '63f2041a-0e38-4a34-8689-291f85ea5fe0',
          value: 'A',
        },
        {
          generatedId: '36ae0d1f-8ddb-47e4-9792-af95c7d548a5',
          value: 'B',
        },
        {
          generatedId: '537ea2f1-b8fc-45a6-a869-960379927ddd',
          value: 'C',
        },
      ],
    },
    {
      fieldTitle: 'New Required Dropdown Field',
      isPropertyRequired: true,
      fieldType: FieldOptionType.Dropdown,
      selectOptions: [
        {
          generatedId: '63f2041a-0e38-4a34-8689-291f85ea5fe0',
          value: 'A',
        },
        {
          generatedId: '36ae0d1f-8ddb-47e4-9792-af95c7d548a5',
          value: 'B',
        },
        {
          generatedId: '537ea2f1-b8fc-45a6-a869-960379927ddd',
          value: 'C',
        },
      ],
    },
    {
      fieldTitle: 'New Required Multiselect Field',
      isPropertyRequired: true,
      fieldType: FieldOptionType.Multiselect,
      selectOptions: [
        {
          generatedId: '63f2041a-0e38-4a34-8689-291f85ea5fe0',
          value: 'A',
        },
        {
          generatedId: '36ae0d1f-8ddb-47e4-9792-af95c7d548a5',
          value: 'B',
        },
        {
          generatedId: '537ea2f1-b8fc-45a6-a869-960379927ddd',
          value: 'C',
        },
      ],
    },
  ] as FieldConfigData[])(
    'should successfully add a new $fieldType field to a new section',
    ({
      fieldTitle = '',
      isPropertyRequired = false,
      allowAttachments = false,
      fieldType = FieldOptionType.Text,
      selectOptions = [],
      placeholder = '',
      description = '',
      isConditional = false,
      conditionalOptions = emptyPropertyFilterQuery,
    }) => {
      const { result: sectionStoreResult } = renderHook(() =>
        useFormBuilderSectionStore()
      );
      const { result: fieldStoreResult } = renderHook(() =>
        useFormBuilderFieldStore()
      );

      act(() => {
        sectionStoreResult.current.addNewSection({
          sectionTitle: 'New Section',
        });
      });

      const uiSchema = getUISchema();
      expect(uiSchema.elements).toHaveLength(1);
      expect(uiSchema.elements[0].label).toBe('New Section');

      const newSectionId = uiSchema.elements[0].id;

      const newFieldConfigData: FieldConfigData = {
        fieldTitle,
        isPropertyRequired,
        allowAttachments,
        fieldType,
        selectOptions,
        placeholder,
        description,
        isConditional,
        conditionalOptions,
      };

      act(() => {
        fieldStoreResult.current.addNewField(newFieldConfigData, newSectionId);
      });

      const newFieldId = Object.keys(
        getSchema().properties as CustomSchemaProperties
      )[0];
      const newFieldSchema: CustomSchemaProperty | SchemaProperty =
        getSchema().properties![newFieldId];
      const newFieldUISchema: CustomUISchemaElement =
        getUISchema().elements[0].elements![0];

      const schema = getSchema();

      expect(
        Object.keys(schema.properties as CustomSchemaProperties)
      ).toHaveLength(1);
      expect(schema.required?.length).toBe(isPropertyRequired ? 1 : 0);

      expect(newFieldUISchema).toEqual({
        type: 'Control',
        label: fieldTitle,
        id: newFieldId,
        parentId: newSectionId,
        scope: `#/properties/${newFieldId}`,
        options: {
          fieldType,
          placeholder,
          description,
        },
      });

      if (usesOneOf(fieldType)) {
        expect(newFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional,
          conditionalOptions,
          allowAttachments,
          type: 'string',
          ...(isPropertyRequired ? { minItems: 1 } : {}),
          oneOf:
            selectOptions &&
            selectOptions.map((option) => ({
              const: option.generatedId,
              title: option.value,
            })),
        });
      } else if (usesItemsOneOf(fieldType)) {
        expect(newFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional,
          conditionalOptions,
          allowAttachments,
          type: 'array',
          uniqueItems: true,
          ...(isPropertyRequired ? { minItems: 1 } : {}),
          items: {
            oneOf:
              selectOptions &&
              selectOptions.map((option) => ({
                const: option.generatedId,
                title: option.value,
              })),
          },
        });
      } else {
        expect(newFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional,
          conditionalOptions,
          allowAttachments,
          type: 'string',
          ...(isPropertyRequired ? { minLength: 1 } : {}),
        });
      }
    }
  );

  it.each([
    {
      initialField: {
        fieldTitle: 'Text Field',
        placeholder: '',
        description: '',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: true,
        allowAttachments: false,
        isConditional: false,
        conditionalOptions: emptyPropertyFilterQuery,
      },
      updatedField: {
        fieldTitle: 'Text Area Field',
        placeholder: '',
        description: '',
        fieldType: FieldOptionType.TextArea,
        isPropertyRequired: true,
        allowAttachments: false,
        isConditional: false,
        conditionalOptions: emptyPropertyFilterQuery,
      },
    },
    {
      initialField: {
        fieldTitle: 'Multiselect Field',
        placeholder: '',
        description: '',
        fieldType: FieldOptionType.Multiselect,
        isPropertyRequired: true,
        allowAttachments: false,
        isConditional: false,
        conditionalOptions: emptyPropertyFilterQuery,
        selectOptions: [
          {
            generatedId: '63f2041a-0e38-4a34-8689-291f85ea5fe0',
            value: 'A',
          },
          {
            generatedId: '36ae0d1f-8ddb-47e4-9792-af95c7d548a5',
            value: 'B',
          },
          {
            generatedId: '537ea2f1-b8fc-45a6-a869-960379927ddd',
            value: 'C',
          },
        ],
      },
      updatedField: {
        fieldTitle: 'Number Field',
        placeholder: 'Custom placeholder text',
        description: 'Some guidance about this field',
        fieldType: FieldOptionType.Number,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: false,
        conditionalOptions: emptyPropertyFilterQuery,
      },
    },
    {
      initialField: {
        fieldTitle: 'Dropdown Field',
        placeholder: 'Custom placeholder text',
        description: 'Some guidance about this field',
        fieldType: FieldOptionType.Dropdown,
        isPropertyRequired: false,
        allowAttachments: false,
        isConditional: false,
        conditionalOptions: emptyPropertyFilterQuery,
        selectOptions: [
          {
            generatedId: '63f2041a-0e38-4a34-8689-291f85ea5fe0',
            value: 'A',
          },
          {
            generatedId: '36ae0d1f-8ddb-47e4-9792-af95c7d548a5',
            value: 'B',
          },
          {
            generatedId: '537ea2f1-b8fc-45a6-a869-960379927ddd',
            value: 'C',
          },
        ],
      },
      updatedField: {
        fieldTitle: 'Text Field',
        placeholder: '',
        description: '',
        fieldType: FieldOptionType.Text,
        isPropertyRequired: true,
        allowAttachments: false,
        isConditional: false,
        conditionalOptions: emptyPropertyFilterQuery,
      },
    },
  ] as { initialField: FieldConfigData; updatedField: FieldConfigData }[])(
    'should successfully update an existing $initialField.fieldType field to a $updatedField.fieldType field',
    ({ initialField, updatedField }) => {
      const {
        fieldTitle: initialFieldTitle,
        isPropertyRequired: initialIsPropertyRequired,
        allowAttachments: initialAllowAttachments,
        isConditional: initialIsConditional,
        conditionalOptions: initialConditionalOptions,
        fieldType: initialFieldType,
        placeholder: initialPlaceholder,
        selectOptions: initialSelectOptions,
        description: initialDescription,
      } = initialField;

      const {
        fieldTitle: updatedFieldTitle,
        isPropertyRequired: updatedIsPropertyRequired,
        allowAttachments: updatedAllowAttachments,
        isConditional: updatedIsConditional,
        conditionalOptions: updatedConditionalOptions,
        fieldType: updatedFieldType,
        placeholder: updatedPlaceholder,
        selectOptions: updatedSelectOptions,
        description: updatedDescription,
      } = updatedField;

      const { result: sectionStoreResult } = renderHook(() =>
        useFormBuilderSectionStore()
      );
      const { result: fieldStoreResult } = renderHook(() =>
        useFormBuilderFieldStore()
      );

      act(() => {
        sectionStoreResult.current.addNewSection({
          sectionTitle: 'New Section',
        });
      });

      const uiSchema = getUISchema();
      const newSectionId = uiSchema.elements[0].id;

      const newFieldConfigData: FieldConfigData = {
        fieldTitle: initialFieldTitle,
        isPropertyRequired: initialIsPropertyRequired,
        allowAttachments: initialAllowAttachments,
        isConditional: initialIsConditional,
        conditionalOptions: initialConditionalOptions,
        fieldType: initialFieldType,
        placeholder: initialPlaceholder,
        ...(initialSelectOptions
          ? { selectOptions: initialSelectOptions }
          : {}),
        description: initialDescription,
      };

      act(() => {
        fieldStoreResult.current.addNewField(newFieldConfigData, newSectionId);
      });

      const newFieldId = Object.keys(
        getSchema().properties as CustomSchemaProperties
      )[0];
      const newFieldSchema: CustomSchemaProperty | SchemaProperty =
        getSchema().properties![newFieldId];
      const newFieldUISchema: CustomUISchemaElement =
        getUISchema().elements[0].elements![0];

      expect(newFieldUISchema).toEqual({
        type: 'Control',
        label: initialFieldTitle,
        id: newFieldId,
        parentId: newSectionId,
        scope: `#/properties/${newFieldId}`,
        options: {
          fieldType: initialFieldType,
          placeholder: initialPlaceholder,
          description: initialDescription,
        },
      });

      if (
        initialFieldType === FieldOptionType.Dropdown ||
        initialFieldType === FieldOptionType.Radio
      ) {
        expect(newFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional: initialIsConditional,
          conditionalOptions: initialConditionalOptions,
          allowAttachments: initialAllowAttachments,
          type: 'string',
          ...(initialIsPropertyRequired ? { minLength: 1 } : {}),
          oneOf:
            initialSelectOptions &&
            initialSelectOptions.map((option) => ({
              const: option.generatedId,
              title: option.value,
            })),
        });
      } else if (initialFieldType === FieldOptionType.Multiselect) {
        expect(newFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional: initialIsConditional,
          conditionalOptions: initialConditionalOptions,
          allowAttachments: initialAllowAttachments,
          type: 'array',
          uniqueItems: true,
          ...(initialIsPropertyRequired ? { minItems: 1 } : {}),
          items: {
            oneOf:
              initialSelectOptions &&
              initialSelectOptions.map((option) => ({
                const: option.generatedId,
                title: option.value,
              })),
          },
        });
      } else {
        expect(newFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional: initialIsConditional,
          conditionalOptions: initialConditionalOptions,
          allowAttachments: initialAllowAttachments,
          type: 'string',
          ...(initialIsPropertyRequired ? { minLength: 1 } : {}),
        });
      }

      act(() => {
        fieldStoreResult.current.updateField(
          {
            fieldTitle: updatedFieldTitle,
            isPropertyRequired: updatedIsPropertyRequired,
            allowAttachments: updatedAllowAttachments,
            isConditional: updatedIsConditional,
            conditionalOptions: updatedConditionalOptions,
            fieldType: updatedFieldType,
            placeholder: updatedPlaceholder,
            selectOptions: updatedSelectOptions,
            description: updatedDescription,
          },
          newFieldId,
          newSectionId
        );
      });

      const updatedFieldId = Object.keys(
        getSchema().properties as CustomSchemaProperties
      )[0];
      const updatedFieldSchema: CustomSchemaProperty | SchemaProperty =
        getSchema().properties![updatedFieldId];
      const updatedFieldUISchema: CustomUISchemaElement =
        getUISchema().elements[0].elements![0];

      expect(updatedFieldUISchema).toEqual({
        type: 'Control',
        label: updatedFieldTitle,
        id: updatedFieldId,
        parentId: newSectionId,
        scope: `#/properties/${updatedFieldId}`,
        options: {
          fieldType: updatedFieldType,
          placeholder: updatedPlaceholder,
          description: updatedDescription,
        },
      });

      if (updatedFieldType === FieldOptionType.Dropdown) {
        expect(updatedFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional: updatedIsConditional,
          conditionalOptions: updatedConditionalOptions,
          allowAttachments: updatedAllowAttachments,
          type: 'string',
          minLength: updatedIsPropertyRequired ? 1 : 0,
          oneOf:
            updatedSelectOptions &&
            updatedSelectOptions.map((option) => ({
              const: option.generatedId,
              title: option.value,
            })),
        });
      } else if (updatedFieldType === FieldOptionType.Multiselect) {
        expect(updatedFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional: updatedIsConditional,
          conditionalOptions: updatedConditionalOptions,
          allowAttachments: updatedAllowAttachments,
          type: 'array',
          uniqueItems: true,
          minItems: updatedIsPropertyRequired ? 1 : 0,
          items: {
            oneOf:
              updatedSelectOptions &&
              updatedSelectOptions.map((option) => ({
                const: option.generatedId,
                title: option.value,
              })),
          },
        });
      } else {
        expect(updatedFieldSchema).toEqual({
          parentId: newSectionId,
          isCustomisable: true,
          isConditional: updatedIsConditional,
          conditionalOptions: updatedConditionalOptions,
          allowAttachments: updatedAllowAttachments,
          type: 'string',
          ...(updatedIsPropertyRequired ? { minLength: 1 } : {}),
        });
      }
    }
  );

  it('should successfully delete an existing field', () => {
    const { result: storeResult } = renderHook(() => useFormBuilderStore());
    const { result: fieldStoreResult } = renderHook(() =>
      useFormBuilderFieldStore()
    );

    // Set up the store with schema and uiSchema fixtures
    act(() => {
      storeResult.current.setSchema(schemaFixture);
      storeResult.current.setUISchema(uiSchemaFixture);
    });

    const section = getUISchema().elements[0];
    // @ts-ignore
    const fieldToDeleteId = section.elements[0].id;

    // Expect field to exist
    expect(getSchema().properties![fieldToDeleteId]).toBeDefined();
    expect(getUISchema().elements[0].elements).toHaveLength(2);

    act(() => {
      fieldStoreResult.current.deleteField(fieldToDeleteId, section.id);
    });

    // Expect field to be deleted
    expect(getSchema().properties![fieldToDeleteId]).toBeUndefined();
    expect(getUISchema().elements[0].elements).toHaveLength(1);
  });
});
