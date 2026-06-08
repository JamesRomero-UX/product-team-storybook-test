import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand/index';

import { handleError } from '../../utils/errorUtils';
import { defaultSectionData } from '../form-configs/section';
import type {
  CustomSchemaProperty,
  CustomUISchemaElement,
  FormBuilderAction,
  SectionConfigData,
} from '../types';
import { LayoutType } from '../types';
import { useFormBuilderFieldStore } from './useFormBuilderFieldStore';
import { useFormBuilderStore } from './useFormBuilderStore';

interface FormBuilderSectionState {
  currentSectionId: string;
  setCurrentSectionId: (currentSectionId: string) => void;
  isEditingSection: boolean;
  setIsEditingSection: (isEditingSection: boolean) => void;
  formSectionModalAction: FormBuilderAction | null;
  setFormSectionModalAction: (action: FormBuilderAction | null) => void;
  sectionData: SectionConfigData;
  setSectionData: (sectionData: SectionConfigData) => void;
  addNewSection: (sectionData: SectionConfigData) => void;
  updateSection: (
    sectionData: SectionConfigData,
    currentSectionId: string
  ) => void;
  deleteSection: (currentSectionId: string) => void;
}

export const useFormBuilderSectionStore = create<FormBuilderSectionState>(
  (set) => ({
    currentSectionId: '',
    setCurrentSectionId: (currentSectionId) => set({ currentSectionId }),

    isEditingSection: false,
    setIsEditingSection: (isEditingSection) => set({ isEditingSection }),

    formSectionModalAction: null,
    setFormSectionModalAction: (formSectionModalAction) =>
      set({ formSectionModalAction }),

    sectionData: defaultSectionData,
    setSectionData: (sectionData) => set({ sectionData }),

    addNewSection: (sectionData) => {
      const uuid = `section_${uuidv4()}`;
      const { uiSchema, setUISchema } = useFormBuilderStore.getState();

      // Add new section to the UI Schema
      setUISchema({
        ...uiSchema,
        elements: [
          ...uiSchema.elements,
          {
            type: LayoutType.Group,
            label: sectionData.sectionTitle,
            id: uuid,
            elements: [],
          },
        ],
      });
    },

    updateSection: (sectionData, currentSectionId) => {
      const { uiSchema, setUISchema } = useFormBuilderStore.getState();

      // Iterate through all the sections (found in the elements array of the UI Schema)
      // and update the label of the section that matches the section being edited
      const modifiedElementsCopy = uiSchema.elements.map(
        (element: CustomUISchemaElement) => {
          if (element.id === currentSectionId) {
            return {
              ...element,
              label: sectionData.sectionTitle,
            };
          }

          return element;
        }
      );

      // Update the UI Schema with the list of modified sections
      setUISchema({
        ...uiSchema,
        elements: modifiedElementsCopy,
      });
    },

    deleteSection: (currentSectionId) => {
      const { schema, setSchema, uiSchema, setUISchema } =
        useFormBuilderStore.getState();
      const { deleteField } = useFormBuilderFieldStore.getState();

      if (!currentSectionId) {
        handleError(
          new Error('useFormBuilderSectionStore: No id found in uiSchema')
        );

        return;
      }

      if (!schema?.properties) {
        handleError(
          new Error('useFormBuilderSectionStore: No properties found in schema')
        );

        return;
      }

      // Iterate through all the sections (found in the elements array of the UI Schema)
      // and delete the section that matches the section being deleted
      const modifiedUISchemaElementsCopy = uiSchema.elements.filter(
        (element: CustomUISchemaElement) => element.id !== currentSectionId
      );

      // Update the UI Schema with the list of sections (excluding the deleted section)
      setUISchema({
        ...uiSchema,
        elements: modifiedUISchemaElementsCopy,
      });

      //   Get list of fields where this section is the parentId and call the deleteField function on each
      Object.keys(schema.properties).forEach((key) => {
        const property = schema?.properties?.[key] as CustomSchemaProperty;

        if (!property || !property?.parentId) {
          return;
        }

        if (property.parentId === currentSectionId) {
          deleteField(key, property.parentId);
        }

        // This is a safety check to ensure that any invalid field ids that are left in the required array are...
        // ...removed if the section being deleted has no fields (as this check is normally only completed when a field is deleted)
        const modifiedRequiredList = schema.required?.filter((fieldId) => {
          return Object.keys(schema?.properties || {})?.includes(fieldId);
        });

        if (modifiedRequiredList?.length !== schema.required?.length) {
          setSchema({
            ...schema,
            required: modifiedRequiredList,
          });
        }
      });
    },
  })
);
