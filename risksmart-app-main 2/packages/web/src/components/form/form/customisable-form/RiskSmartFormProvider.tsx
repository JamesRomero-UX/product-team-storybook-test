import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { useState } from 'react';
import type { ZodSchema } from 'zod';

import { RiskSmartFormContext } from './RiskSmartFormContext';

type Props = {
  onSave?: () => Promise<void>;
  parentType?: FormId;
  setOnSave: Dispatch<SetStateAction<(() => Promise<void>) | undefined>>;
  setCustomFormValidation: Dispatch<
    SetStateAction<(schema: ZodSchema) => ZodSchema>
  >;
  previewChanges: null | Record<string, { from: unknown; to: unknown }>;
  readOnly?: boolean;
  defaultOnSave: () => Promise<void>;
  beforeSaveHooks: (() => Promise<boolean>)[];
  setBeforeSaveHooks: Dispatch<SetStateAction<(() => Promise<boolean>)[]>>;
};

export const RiskSmartFormProvider = ({
  onSave,
  setOnSave,
  setCustomFormValidation,
  parentType,
  previewChanges,
  readOnly,
  children,
  beforeSaveHooks,
  setBeforeSaveHooks,
  defaultOnSave,
}: PropsWithChildren<Props>) => {
  const [editMode, setEditMode] = useState(false);
  const [allFieldIds, setAllFieldIds] = useState<string[]>([]);
  const [defaultRequiredFields, setDefaultRequiredFields] = useState<string[]>(
    []
  );
  const [forcedRequiredFields, setForcedRequiredFields] = useState<string[]>(
    []
  );

  const [allowDefaultValueFields, setAllowDefaultValueFields] = useState<
    string[]
  >([]);

  const addFieldId = (name: string) =>
    setAllFieldIds((fields) => Array.from(new Set([...fields, name])));

  const removeFieldId = (name: string) =>
    setAllFieldIds((allFields) => allFields.filter((f) => f !== name));

  const toggleEditMode = () => setEditMode((prev) => !prev);

  const addDefaultRequiredField = (fieldId: string) => {
    setDefaultRequiredFields((prev) => Array.from(new Set([...prev, fieldId])));
  };

  const removeDefaultRequiredField = (fieldId: string) => {
    setDefaultRequiredFields((prev) =>
      prev.filter((requiredField) => requiredField !== fieldId)
    );
  };

  const addForcedRequiredField = (fieldId: string) => {
    setForcedRequiredFields((prev) => Array.from(new Set([...prev, fieldId])));
  };

  const removeForcedRequiredField = (fieldId: string) => {
    setForcedRequiredFields((prev) =>
      prev.filter((requiredField) => requiredField !== fieldId)
    );
  };

  const addAllowDefaultValueField = (fieldId: string) => {
    setAllowDefaultValueFields((prev) =>
      Array.from(new Set([...prev, fieldId]))
    );
  };

  const removeAllowDefaultValueField = (fieldId: string) => {
    setAllowDefaultValueFields((prev) =>
      prev.filter((requiredField) => requiredField !== fieldId)
    );
  };

  return (
    <RiskSmartFormContext.Provider
      value={{
        allowDefaultValueFields,
        addAllowDefaultValueField,
        removeAllowDefaultValueField,
        parentType: parentType ?? null,
        editMode,
        onSave,
        toggleEditMode,
        setOnSave,
        setCustomFormValidation,
        defaultRequiredFields,
        forcedRequiredFields,
        addForcedRequiredField,
        removeForcedRequiredField,
        addDefaultRequiredField,
        removeDefaultRequiredField,
        allFieldIds,
        addFieldId,
        removeFieldId,
        previewChanges,
        readOnly,
        beforeSaveHooks,
        setBeforeSaveHooks,
        defaultOnSave,
      }}
    >
      {children}
    </RiskSmartFormContext.Provider>
  );
};
