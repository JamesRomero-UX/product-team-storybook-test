import { useRiskSmartForm } from 'src/components/form/form/customisable-form/RiskSmartFormContext';

import { useFieldConfig } from './useFieldConfig';

export const useIsFieldReadOnly = (fieldName: string) => {
  const { readOnly } = useRiskSmartForm();
  const fieldConfig = useFieldConfig(fieldName);

  if (readOnly) {
    return true;
  }

  return fieldConfig ? fieldConfig.ReadOnly : false;
};
