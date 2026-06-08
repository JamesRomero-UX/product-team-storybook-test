import { act, renderHook } from '@testing-library/react';

import type { CustomSchemaProperties } from '../types';
import { schemaFixture, uiSchemaFixture } from './testingFixtures';
import { useFormBuilderSectionStore } from './useFormBuilderSectionStore';
import { useFormBuilderStore } from './useFormBuilderStore';

const initialFormBuilderStoreState = useFormBuilderStore.getState();
const initialFormBuilderSectionStoreState =
  useFormBuilderSectionStore.getState();

const resetStores = () => {
  useFormBuilderStore.setState(initialFormBuilderStoreState, true);
  useFormBuilderSectionStore.setState(
    initialFormBuilderSectionStoreState,
    true
  );
};

describe('useFormBuilderSectionStore', () => {
  beforeEach(() => {
    resetStores();
  });

  const getSchema = () => useFormBuilderStore.getState().schema;
  const getUISchema = () => useFormBuilderStore.getState().uiSchema;

  it('should successfully add a new section', () => {
    const { result } = renderHook(() => useFormBuilderSectionStore());

    act(() => {
      result.current.addNewSection({ sectionTitle: 'New Section' });
    });

    const uiSchema = getUISchema();
    expect(uiSchema.elements).toHaveLength(1);
    expect(uiSchema.elements[0].label).toBe('New Section');
  });

  it('should successfully update an existing section', () => {
    const { result } = renderHook(() => useFormBuilderSectionStore());

    act(() => {
      result.current.addNewSection({ sectionTitle: 'Old Section' });
    });

    expect(getUISchema().elements).toHaveLength(1);
    expect(getUISchema().elements[0].label).toBe('Old Section');

    const sectionId = getUISchema().elements[0].id;

    act(() => {
      result.current.updateSection(
        { sectionTitle: 'Updated Section' },
        sectionId
      );
    });

    expect(getUISchema().elements).toHaveLength(1);
    expect(getUISchema().elements[0].label).toBe('Updated Section');
  });

  it('should successfully delete an existing empty section', () => {
    const { result } = renderHook(() => useFormBuilderSectionStore());

    act(() => {
      result.current.addNewSection({ sectionTitle: 'Section to Keep' });
      result.current.addNewSection({ sectionTitle: 'Section to Delete' });
    });

    expect(getUISchema().elements).toHaveLength(2);

    const sectionToDeleteId = getUISchema().elements[1].id;

    act(() => {
      result.current.deleteSection(sectionToDeleteId);
    });

    expect(getUISchema().elements).toHaveLength(1);
    expect(getUISchema().elements[0].label).toBe('Section to Keep');
  });

  it("should successfully delete an existing section with fields, remove any required fields from the 'required' array and remove the fields for that section", () => {
    const { result: storeResult } = renderHook(() => useFormBuilderStore());
    const { result: sectionStoreResult } = renderHook(() =>
      useFormBuilderSectionStore()
    );

    // Set up the store with schema and uiSchema fixtures
    act(() => {
      storeResult.current.setSchema(schemaFixture);
      storeResult.current.setUISchema(uiSchemaFixture);
    });

    const requiredFieldIds = [
      'field_c40a977a-554a-4f81-8052-902e9157a357',
      'field_98e9a20f-efeb-4406-b8c4-39e490653989',
      'field_19394bc2-7f9f-40ff-a8d7-18b9ac245a2e',
    ];

    const getRequiredFields = () => {
      return Object.entries(getSchema().properties!).filter(
        (property) => property[1].minLength === 1
      );
    };

    // FIRST CHECK THAT:
    // The uiSchema has 4 sections
    expect(getUISchema().elements).toHaveLength(4);
    // The schema has 15 fields
    expect(
      Object.keys(getSchema()?.properties as CustomSchemaProperties).length
    ).toEqual(15);
    // The required array in the schema has only 3 required fields
    expect(getSchema().required).toHaveLength(3);
    // The required array in the schema have the correct field ids
    requiredFieldIds.map((id, index) => {
      expect(getSchema().required![index]).toBe(id);
    });
    // The schema properties include the fields with the ids from the required array and there are no other required fields
    getRequiredFields().map((field) => {
      expect(requiredFieldIds.includes(field[0])).toBe(true);
    });

    // Delete the last section
    act(() => {
      sectionStoreResult.current.deleteSection(getUISchema().elements[3].id);
    });

    // FINALLY CHECK THAT:
    // The uiSchema has 3 sections
    expect(getUISchema().elements).toHaveLength(3);
    // The schema has 12 fields
    expect(
      Object.keys(getSchema()?.properties as CustomSchemaProperties).length
    ).toEqual(12);
    // The required array in the schema has only 1 required field
    expect(getSchema().required).toHaveLength(1);
    // The required array in the schema has the correct field id
    expect(getSchema().required![0]).toBe(
      'field_c40a977a-554a-4f81-8052-902e9157a357'
    );
    // The schema properties include the fields with the ids from the required array and there are no other required fields
    getRequiredFields().map((field) => {
      expect(requiredFieldIds.includes(field[0])).toBe(true);
    });
  });

  it("should successfully delete an existing section and remove any required fields ids that don't exist in the schema", () => {
    const { result: storeResult } = renderHook(() => useFormBuilderStore());
    const { result: sectionStoreResult } = renderHook(() =>
      useFormBuilderSectionStore()
    );

    const bogusRequiredFieldId = 'field_bogus_id';
    const modifiedSchemaFixture = {
      ...schemaFixture,
      required: [...(schemaFixture?.required || []), bogusRequiredFieldId],
    };

    // Set up the store with schema and uiSchema fixtures
    act(() => {
      storeResult.current.setSchema(modifiedSchemaFixture);
      storeResult.current.setUISchema(uiSchemaFixture);
      sectionStoreResult.current.addNewSection({
        sectionTitle: 'Section to Delete',
      });
    });

    const bogusRequiredFieldIds = [
      'field_c40a977a-554a-4f81-8052-902e9157a357',
      'field_98e9a20f-efeb-4406-b8c4-39e490653989',
      'field_19394bc2-7f9f-40ff-a8d7-18b9ac245a2e',
      'field_bogus_id',
    ];

    const correctRequiredFieldIds = [
      'field_c40a977a-554a-4f81-8052-902e9157a357',
      'field_98e9a20f-efeb-4406-b8c4-39e490653989',
      'field_19394bc2-7f9f-40ff-a8d7-18b9ac245a2e',
    ];

    const getRequiredFields = () => {
      return Object.entries(getSchema().properties!).filter(
        (property) => property[1].minLength === 1 || property[1].minItems === 1
      );
    };

    // FIRST CHECK THAT:
    // The schema doesn't include a field with the bogus id
    expect(getSchema().properties).not.toHaveProperty(bogusRequiredFieldId);
    // The uiSchema has 5 sections
    expect(getUISchema().elements).toHaveLength(5);
    // The schema has 15 fields
    expect(
      Object.keys(getSchema()?.properties as CustomSchemaProperties).length
    ).toEqual(15);
    // The required array in the schema has only 4 required fields
    expect(getSchema().required).toHaveLength(4);
    // The required array in the schema have the correct field ids
    bogusRequiredFieldIds.map((id, index) => {
      expect(getSchema().required![index]).toBe(id);
    });
    // The schema properties include the fields with the ids from the required array and there are no other required fields
    getRequiredFields().map((field) => {
      expect(bogusRequiredFieldIds.includes(field[0])).toBe(true);
    });

    // Delete the last section
    act(() => {
      sectionStoreResult.current.deleteSection(getUISchema().elements[4].id);
    });

    // FINALLY CHECK THAT:
    // The uiSchema has 4 sections
    expect(getUISchema().elements).toHaveLength(4);
    // The schema has 15 fields
    expect(
      Object.keys(getSchema()?.properties as CustomSchemaProperties).length
    ).toEqual(15);
    // The required array in the schema has only 3 required fields
    expect(getSchema().required).toEqual(correctRequiredFieldIds);
    // The required array in the schema have the correct field ids
    correctRequiredFieldIds.map((id, index) => {
      expect(getSchema().required![index]).toBe(id);
    });
    // The schema properties include the fields with the ids from the required array and there are no other required fields
    getRequiredFields().map((field) => {
      expect(bogusRequiredFieldIds.includes(field[0])).toBe(true);
    });
  });
});
