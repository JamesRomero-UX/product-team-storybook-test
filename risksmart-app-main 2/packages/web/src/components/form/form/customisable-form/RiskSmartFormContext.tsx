import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext } from 'react';
import type { ZodSchema } from 'zod';

type RiskSmartFormContextState = {
  parentType: null | FormId;
  editMode: boolean;
  toggleEditMode: () => void;
  onSave?: () => Promise<void>;
  setOnSave: Dispatch<SetStateAction<(() => Promise<void>) | undefined>>;
  setCustomFormValidation: Dispatch<
    SetStateAction<(schema: ZodSchema) => ZodSchema>
  >;
  defaultRequiredFields: string[];
  addDefaultRequiredField: (fieldId: string) => void;
  removeDefaultRequiredField: (fieldId: string) => void;
  forcedRequiredFields: string[];
  addForcedRequiredField: (fieldId: string) => void;
  removeForcedRequiredField: (fieldId: string) => void;
  allowDefaultValueFields: string[];
  addAllowDefaultValueField: (fieldId: string) => void;
  removeAllowDefaultValueField: (fieldId: string) => void;
  allFieldIds: string[];
  addFieldId: (name: string) => void;
  removeFieldId: (name: string) => void;
  previewChanges: null | Record<string, { from: unknown; to: unknown }>;
  readOnly?: boolean;
  beforeSaveHooks: (() => Promise<boolean>)[];
  setBeforeSaveHooks: Dispatch<SetStateAction<(() => Promise<boolean>)[]>>;
  defaultOnSave: () => Promise<void>;
};

export const RiskSmartFormContext = createContext<RiskSmartFormContextState>({
  parentType: null,
  editMode: false,
  toggleEditMode: () => null,
  setOnSave: () => null,
  setCustomFormValidation: () => null,
  defaultRequiredFields: [],
  addDefaultRequiredField: () => null,
  removeDefaultRequiredField: () => null,
  forcedRequiredFields: [],
  addForcedRequiredField: () => null,
  removeForcedRequiredField: () => null,
  allowDefaultValueFields: [],
  addAllowDefaultValueField: () => null,
  removeAllowDefaultValueField: () => null,
  allFieldIds: [],
  addFieldId: () => null,
  removeFieldId: () => null,
  previewChanges: null,
  readOnly: false,
  beforeSaveHooks: [],
  setBeforeSaveHooks: () => null,
  defaultOnSave: async () => void 0,
});

export const useRiskSmartForm = () => {
  const context = useContext(RiskSmartFormContext);
  if (!context) {
    throw new Error(
      'useRiskSmartForm must be used within a RiskSmartFormProvider'
    );
  }

  return context;
};
