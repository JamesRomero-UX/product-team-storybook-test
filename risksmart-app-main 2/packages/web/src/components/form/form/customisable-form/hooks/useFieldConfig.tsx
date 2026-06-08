import type {
  GetFormFieldOptionsByParentTypeQuery,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import { useCustomisableFormDataContext } from '../../customisable-form-data/CustomisableFormDataContext';
import { useRiskSmartForm } from '../RiskSmartFormContext';

type FieldConfig =
  NonNullable<GetFormFieldOptionsByParentTypeQuery>['form_field_configuration'][number];

const DEFAULT_FIELD_CONFIG: FieldConfig = {
  Required: false,
  ReadOnly: false,
  Hidden: false,
  FieldId: '',
  Label: '',
  FormConfigurationParentType: null as unknown as Parent_Type_Enum,
};

type UseFieldConfigOptions = {
  defaultRequired?: boolean;
};

/**
 * Returns the field configuration for a given field ID.
 * Note, this does NOT currently return custom attribute labels or options.
 * @param fieldId
 * @param options
 * @returns
 */
export const useFieldConfig = (
  fieldId?: string,
  options?: UseFieldConfigOptions
) => {
  const { parentType } = useRiskSmartForm();

  const { formFieldConfigurations } = useCustomisableFormDataContext();

  if (!parentType) {
    return null;
  }

  const fieldOptionsData = formFieldConfigurations?.find(
    (field) => field.FieldId === fieldId
  );

  return (
    fieldOptionsData ?? {
      ...DEFAULT_FIELD_CONFIG,
      Required: options?.defaultRequired ?? false,
    }
  );
};
