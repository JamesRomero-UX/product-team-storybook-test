import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import type {
  FieldRegistryLookup,
  FormId,
} from '@risksmart-app/shared/forms/formConfigRegistry';
import type { FormFieldConfig } from '@risksmart-app/shared/forms/types';
import { type FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFeatures } from 'src/rbac/useFeatures';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import { FieldForm } from '../custom-attributes/edit-fields/FieldForm';
import type { FieldFormFields } from '../custom-attributes/edit-fields/fieldSchema';
import CustomisableFieldOptions from './CustomisableFieldOptions';
import { getFormFieldConfig } from './formRegistryService';
import { EditMode } from './types';

type Props = {
  editMode: EditMode;
  isCustomField: boolean;
  forceRequired: boolean;
  allowDefaultValue: boolean;
  defaultValueOptions: SelectProps.Options;
  formId: FormId;
  fieldId?: string;
};

const riskRatingFormIds: FormId[] = [
  'controlled_risk_assessment_result',
  'uncontrolled_risk_assessment_result',
  'risk_controlled_internal_audit_result',
  'risk_uncontrolled_internal_audit_result',
  'risk_controlled_second_line_result',
  'risk_uncontrolled_second_line_result',
];

export const EditFieldFields: FC<Props> = ({
  editMode,
  isCustomField,
  allowDefaultValue,
  forceRequired,
  defaultValueOptions,
  formId,
  fieldId,
}) => {
  const isRiskRatingForm = riskRatingFormIds.includes(formId);
  const isTestScheduleField = fieldId?.includes('schedule.');
  const enabledFeatures = useFeatures();
  // TODO: convert to be a hook
  const field: FormFieldConfig | undefined = fieldId
    ? getFormFieldConfig(
        { formId, fieldId } as FieldRegistryLookup,
        enabledFeatures
      )
    : undefined;
  const { watch } = useFormContext<FieldFormFields>();
  const type = watch('CustomFieldType');
  const options = watch('CustomFieldOptions');

  /*
    TODO: Currently not allowing the edit of standard field labels on risk rating forms until a decision is made
     as to whether uncontrolled/controlled are to be merged into a single form (share same customisation), or be separate (different customisation).

    TODO: Customisation of test schedule fields are also currently disabled until further notice. Once test schedules are lifted up
     out of forms into their own 'global' context this check will become redundant
  */
  const canEditStandardFieldLabels = !isRiskRatingForm && !isTestScheduleField;

  const canEditConditionalFields =
    useIsFeatureFlagEnabled('conditional_fields');

  return (
    <>
      <FieldForm
        defaultLabel={field?.formLabel || ''}
        formId={formId}
        fieldId={fieldId}
        disableTypeField={editMode === EditMode.Update}
        showTypeField={isCustomField}
        showDescriptionField={true}
        disableLabelField={!isCustomField && !canEditStandardFieldLabels}
        editMode={editMode}
        fieldTypeRequired={isCustomField}
        labelRequired={isCustomField}
        showStandardFieldLabel={!isCustomField && canEditStandardFieldLabels}
        showCustomLabelToggle={!isCustomField && canEditStandardFieldLabels}
        showConditionalField={
          canEditConditionalFields &&
          (field?.allowTargetConditions || isCustomField)
        }
      />

      <CustomisableFieldOptions
        options={options}
        type={type}
        defaultValueOptions={defaultValueOptions}
        forceRequired={!!forceRequired}
        allowDefaultValue={!!allowDefaultValue}
      />
    </>
  );
};
