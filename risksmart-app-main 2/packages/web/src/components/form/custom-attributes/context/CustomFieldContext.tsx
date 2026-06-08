import type { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type { FormFieldOption } from '@risksmart-app/form-configuration/src/types';
import { createContext } from 'react';

export type CurrentField = {
  Label: string;
  AltLabel?: string;
  Type: CustomAttributeFieldType;
  ShowAltValues: boolean;
  Options?: FormFieldOption[];
  Required: boolean;
  ReadOnly: boolean;
  Hidden: boolean;
  Description?: string;
};

export type CustomFieldState = {
  currentField: CurrentField;
  fieldPath: string;
};

export const CustomFieldContext = createContext<CustomFieldState | null>(null);
