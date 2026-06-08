import type { FieldEditorValues, SectionEditorValues } from './config';

export interface FormEditorFieldData {
  name: string;
  type: string;
  required: boolean;
  readOnly?: boolean;
  config?: FieldEditorValues;
}

export interface FormEditorSectionData {
  id: string;
  name: string;
  fieldIds: string[];
  config?: SectionEditorValues;
}

export interface FormEditorInitialData {
  sections: FormEditorSectionData[];
  fields: Record<string, FormEditorFieldData>;
}

export interface FormEditorOutput {
  sections: FormEditorSectionData[];
  fields: Record<string, FormEditorFieldData>;
}

export interface ConditionalLogicOption {
  value: string;
  label: string;
}

export interface FormEditorDialogLang {
  formEditor?: {
    title?: string;
    description?: string;
    save?: string;
    cancel?: string;
    addFields?: string;
    addSection?: string;
  };
  sectionBuilder?: {
    title?: string;
    addSave?: string;
    editSave?: string;
    cancel?: string;
  };
  fieldEditor?: {
    title?: string;
    addSave?: string;
    editSave?: string;
    cancel?: string;
  };
}

export interface FormEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FormEditorInitialData;
  getValueOptions?: (fieldValue: string) => ConditionalLogicOption[];
  onSave: (data: FormEditorOutput) => void;
  lang?: FormEditorDialogLang;
}
