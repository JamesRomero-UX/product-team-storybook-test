import type {
  FormId,
  FormRegistry,
} from '@risksmart-app/shared/forms/formConfigRegistry';

import { useFormConfigRegistry } from './useFormConfigRegistry';

/**
 * Returns the form configuration for a specific form ID.
 * @param formId The ID of the form to retrieve the configuration for.
 * @returns The form configuration for the specified form ID.
 */
export const useFormConfig = <TFormId extends FormId>(
  formId: TFormId
): FormRegistry[TFormId] => {
  const formConfig = useFormConfigRegistry();

  return formConfig[formId];
};
