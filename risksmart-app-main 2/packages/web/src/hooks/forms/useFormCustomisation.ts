import { useQuery } from '@apollo/client';
import type {
  FormId,
  FormRegistry,
} from '@risksmart-app/shared/forms/formConfigRegistry';
import type { FormFieldConfig } from '@risksmart-app/shared/forms/types';
import { GetFormCustomisationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback } from 'react';
import { useFormConfigRegistry } from 'src/utils/table/hooks/form/useFormConfigRegistry';

export type GetStandardFormFieldLabel = <TFormId extends FormId>(
  formId: TFormId,
  fieldId: keyof FormRegistry[TFormId]
) => string;

/**
 * Retrieve form customisation data for the specified form IDs
 * @param option
 */
export const useFormCustomisation = (
  formIds: FormId[]
): { loading: boolean; getStandardFieldLabel: GetStandardFormFieldLabel } => {
  const formRegistry = useFormConfigRegistry();

  const { data, loading } = useQuery(GetFormCustomisationDocument, {
    variables: {
      parentTypes: formIds,
    },
  });

  const getStandardFieldLabel = useCallback<
    <TFormId extends FormId>(
      formId: TFormId,
      fieldId: keyof FormRegistry[TFormId]
    ) => string
  >(
    (formId, fieldId) => {
      const formFieldConfiguration = data?.form_field_configuration.find(
        (ffc) =>
          ffc.FormConfigurationParentType === formId && ffc.FieldId === fieldId
      );
      const customLabel = formFieldConfiguration?.Label;
      if (customLabel) {
        return customLabel;
      }

      const form = formRegistry[formId];
      const field = form[fieldId] as FormFieldConfig | undefined;

      return field?.formLabel ?? '';
    },
    [data, formRegistry]
  );

  return {
    loading,

    /**
     * Returns the form label for a standard field.
     * Offers better type safety than using getFieldLabel with a string fieldId
     * @param formId
     * @param fieldId
     * @returns
     */
    getStandardFieldLabel,
  };
};
