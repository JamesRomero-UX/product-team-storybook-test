import type { FieldEditorValues, SectionEditorValues } from './config';

export type UniqueIdentifier = string | number;

export interface FieldSummary {
  name: string;
  type: string;
  required: boolean;
  readOnly: boolean;
}

export const DEFAULT_LANG = {
  formEditor: {
    title: 'Form editor',
    description: 'Drag and drop to reorder sections and fields',
    save: 'Save',
    cancel: 'Cancel',
    addFields: 'Add fields',
    addSection: 'Add section',
  },
  sectionBuilder: {
    title: 'Section editor',
    addSave: 'Add section',
    editSave: 'Edit section',
    cancel: 'Cancel',
  },
  fieldEditor: {
    title: 'Field editor',
    addSave: 'Add field',
    editSave: 'Edit field',
    cancel: 'Cancel',
  },
};

export const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'textArea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'url', label: 'Link' },
  { value: 'date', label: 'Date' },
  { value: 'radio', label: 'Radio' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multiselect' },
];

export const getFieldTypeLabel = (type: string) =>
  FIELD_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;

export const buildSectionDefaults = (
  sectionId: string | null,
  sectionNames: Record<string, string>,
  sectionConfigs: Record<string, SectionEditorValues>
): SectionEditorValues => {
  if (!sectionId) {
    return {
      name: '',
      description: '',
      conditionalLogicEnabled: false,
      conditionalLogicRules: [],
      guidanceEnabled: false,
      guidance: '',
    };
  }
  const config = sectionConfigs[sectionId];
  if (config) {
    return config;
  }

  return {
    name: sectionNames[sectionId] ?? '',
    description: '',
    conditionalLogicEnabled: false,
    conditionalLogicRules: [],
    guidanceEnabled: false,
    guidance: '',
  };
};

export const buildFieldDefaults = (
  fieldId: string | null,
  fields: Record<string, FieldSummary>,
  fieldConfigs: Record<string, FieldEditorValues>
): FieldEditorValues => {
  if (!fieldId) {
    return {
      fieldType: 'text',
      fieldName: '',
      required: false,
      readOnly: false,
      options: [],
      conditionalLogicEnabled: false,
      conditionalLogicRules: [],
      guidanceEnabled: false,
      guidance: '',
    };
  }
  const config = fieldConfigs[fieldId];
  if (config) {
    return config;
  }

  const field = fields[fieldId];

  return {
    fieldType: field?.type ?? '',
    fieldName: field?.name ?? '',
    required: field?.required ?? false,
    readOnly: false,
    options: [],
    conditionalLogicEnabled: false,
    conditionalLogicRules: [],
    guidanceEnabled: false,
    guidance: '',
  };
};
