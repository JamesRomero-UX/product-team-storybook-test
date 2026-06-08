import _ from 'lodash';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useCustomDatasourceHelpers } from 'src/pages/custom-datasources/useCustomDatasourceHelpers';
import { useFeatures } from 'src/rbac/useFeatures';

import { useRiskSmartForm } from '../customisable-form/RiskSmartFormContext';
import { useCustomisableFormDataContext } from '../customisable-form-data/CustomisableFormDataContext';
import { ConditionalFieldsContext } from './ConditionalFieldsContext';
import { buildFieldConditionGraph, getHiddenFields } from './conditionsGraph';

/**
 * Keeps track of which fields are conditionally hidden.
 * Note, needs to be used with a react hook form FormProvider as it needs access to the forms values
 */
export const ConditionalFieldsProvider = ({ children }: PropsWithChildren) => {
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
  const customisableData = useCustomisableFormDataContext();
  const { formFieldConfigurations } = customisableData;
  // TODO: possibly get parent type by other means to remove dependency on useRiskSmartForm
  const { parentType } = useRiskSmartForm();
  const fieldConditionGraph = useMemo(
    () => buildFieldConditionGraph(formFieldConfigurations ?? []),
    [formFieldConfigurations]
  );
  const { watch } = useFormContext();
  const enabledFeatures = useFeatures();
  const currentValues = watch();

  const helpers = useCustomDatasourceHelpers();

  useEffect(() => {
    const hiddenBySelfOrAncestors = parentType
      ? getHiddenFields({
          formId: parentType,
          customisableData,
          fieldConditionGraph,
          currentValues,
          helpers,
          enabledFeatures,
        })
      : new Set<string>();

    if (!_.isEqual(hiddenFields, hiddenBySelfOrAncestors)) {
      setHiddenFields(hiddenBySelfOrAncestors);
    }
  }, [
    hiddenFields,
    fieldConditionGraph,
    customisableData,
    parentType,
    helpers,
    enabledFeatures,
    currentValues,
  ]);

  return (
    <ConditionalFieldsContext.Provider value={hiddenFields}>
      {children}
    </ConditionalFieldsContext.Provider>
  );
};
