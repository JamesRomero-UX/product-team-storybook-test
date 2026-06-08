import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import FormField from '@risk-smart/themed-cloudscape-components/form-field';
import Button from '@risksmart-app/components/src/button';
import { DraggableItem } from '@risksmart-app/components/src/dragable-item/DraggableItem';
import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import type { FormId } from '@risksmart-app/shared/forms/formConfigRegistry';
import { Reorder } from 'framer-motion';
import { type FC, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Editor as TinyEditor } from 'tinymce';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useIsModuleEnabledLazy } from '@/hooks/useIsModuleEnabled';

import ControlledInput from '../../controlled-input';
import { TextInputWithFormField } from '../../controlled-input/TextInputWithFormField';
import ControlledSelect from '../../controlled-select';
import { ControlledSwitch } from '../../controlled-switch/ControlledSwitch';
import { ConditionsPropertyFilter } from '../../edit-field-modal/ConditionsPropertyFilter';
import { EditMode } from '../../edit-field-modal/types';
import Editor from '../../editor';
import { fieldTypesConfig } from '../field-types';
import type { FieldFormFields } from './fieldSchema';

interface Props {
  defaultLabel: string;
  disableTypeField?: boolean;
  disableLabelField?: boolean;
  showTypeField?: boolean;
  showDescriptionField?: boolean;
  editMode: EditMode;
  labelRequired?: boolean;
  fieldTypeRequired?: boolean;
  showConditionalField?: boolean;
  showStandardFieldLabel?: boolean;
  showCustomLabelToggle?: boolean;
  formId: FormId;
  fieldId?: string;
}

/**
 * Form for adding a new custom field to a custom attribute set.
 * @returns
 */
export const FieldForm: FC<Props> = ({
  disableTypeField = false,
  showTypeField,
  showDescriptionField,
  disableLabelField,
  editMode,
  fieldTypeRequired,
  labelRequired,
  showConditionalField,
  defaultLabel,
  showStandardFieldLabel,
  showCustomLabelToggle,
  formId,
  fieldId,
}) => {
  const editorRef = useRef<null | TinyEditor>(null);
  const { t } = useTranslation(['common'], {
    keyPrefix: 'customAttributes.fields',
  });
  const altValuesEnabled = useIsFeatureFlagEnabled('alt_values');
  const isModuleEnabled = useIsModuleEnabledLazy();
  const { t: tt } = useTranslation(['common']);
  const { control, watch, setValue } = useFormContext<FieldFormFields>();
  const fieldType = watch('CustomFieldType') || CustomAttributeFieldType.Text;
  const fieldConfig = fieldTypesConfig[fieldType];

  const fieldOptions = watch('CustomFieldOptions') ?? [];
  const showAltValues = watch('CustomFieldShowAltValues') ?? false;
  const enableCustomLabel = watch('EnableCustomLabel');

  const setOptions = (
    options: { Value: string; AltValue?: string; GeneratedId: string }[]
  ) => {
    setValue('CustomFieldOptions', options);
  };

  const onAddOptionField = () => {
    const newOptions = [
      ...fieldOptions,
      { Value: '', AltValue: '', GeneratedId: crypto.randomUUID() },
    ];
    setOptions(newOptions);
  };

  const updateOption = (generatedId: string, value: null | number | string) => {
    const options = [...fieldOptions];
    const option = options.find((o) => o.GeneratedId === generatedId);
    if (option) {
      option.Value = `${value}`;
      setOptions(options);
    }
  };

  const updateOptionAltValue = (
    generatedId: string,
    altValue: null | number | string
  ) => {
    const options = [...fieldOptions];
    const option = options.find((o) => o.GeneratedId === generatedId);
    if (option) {
      option.AltValue = altValue?.toString() ?? '';
      setOptions(options);
    }
  };

  const deleteOption = (generatedId: string) => {
    const options = [...fieldOptions];
    const optionIndex = options.findIndex((o) => o.GeneratedId === generatedId);

    if (optionIndex > -1) {
      options.splice(optionIndex, 1);
      setOptions(options);
    }
  };

  const fieldTypeOptions: SelectProps.Options = Object.entries(fieldTypesConfig)
    .filter(
      ([, config]) =>
        !config.hasPermission || config.hasPermission?.(isModuleEnabled)
    )
    .map(([type, config]) => ({
      label: config.i18nKey ? (tt(config.i18nKey) as string) : '',
      value: type,
    }));

  return (
    <div>
      {showStandardFieldLabel && (
        <div className={'mb-4'}>
          <FormField label={t('originalLabel')}>{defaultLabel}</FormField>
        </div>
      )}

      {showTypeField && (
        <ControlledSelect
          control={control}
          disabled={disableTypeField}
          forceRequired={fieldTypeRequired}
          name={'CustomFieldType'}
          testId={'fieldType'}
          label={t('type')}
          placeholder={t('type_placeholder')}
          options={fieldTypeOptions}
        />
      )}
      {showCustomLabelToggle && (
        <div className={'mb-4'}>
          <ControlledSwitch
            control={control}
            label={t('customLabel')}
            name={'EnableCustomLabel'}
            testId={'enableCustomLabel'}
            onChange={(e) => {
              if (!e.detail.checked) {
                setValue('Label', defaultLabel);
              }
            }}
          />
        </div>
      )}
      {(!showCustomLabelToggle || enableCustomLabel) && (
        <ControlledInput
          name={fieldTypeRequired ? 'CustomFieldLabel' : 'Label'}
          label={t('label')}
          testId={'label'}
          disabled={disableLabelField}
          forceRequired={true}
          control={control}
          placeholder={t('label_placeholder')}
        />
      )}
      {fieldConfig.hasOptions && altValuesEnabled && (
        <ControlledSwitch
          control={control}
          label={t('show_alt_values')}
          name={'CustomFieldShowAltValues'}
          testId={'showAltValues'}
          allowDefaultValue={false}
          description={t('show_alt_values_description')}
          disabled={editMode !== EditMode.Create}
        />
      )}
      {showAltValues && !!fieldConfig.hasAlternateLabel && (
        <ControlledInput
          name={'CustomFieldAltLabel'}
          label={t('label_alt')}
          forceRequired={labelRequired}
          testId={'altLabel'}
          control={control}
          placeholder={t('label_alt_placeholder')}
          description={t('label_alt_description')}
          disabled={editMode !== EditMode.Create}
          disableBottomPadding={true}
        />
      )}
      {!!fieldConfig.hasOptions && (
        <div className={'pb-6'}>
          <Reorder.Group
            axis={'y'}
            className={'p-0'}
            values={fieldOptions}
            onReorder={setOptions}
          >
            {fieldOptions.map((fieldOption, index) => (
              <DraggableItem
                value={fieldOption}
                key={fieldOption.GeneratedId}
                deleteOption={() => deleteOption(fieldOption.GeneratedId)}
                variant={showAltValues ? 'bordered' : 'normal'}
              >
                <TextInputWithFormField
                  key={`${fieldOption.GeneratedId}_value`}
                  testId={'Option'}
                  label={`${t('option')} ${index + 1}`}
                  value={fieldOption.Value}
                  placeholder={t('option_placeholder')}
                  onChange={(val) => updateOption(fieldOption.GeneratedId, val)}
                />
                {showAltValues && (
                  <TextInputWithFormField
                    key={`${fieldOption.GeneratedId}_altValue`}
                    testId={'AltValue'}
                    label={`${t('option_alt', { index: index + 1 })}`}
                    value={fieldOption.AltValue}
                    placeholder={t('option_alt_placeholder')}
                    onChange={(val) =>
                      updateOptionAltValue(fieldOption.GeneratedId, val)
                    }
                    description={t('option_alt_description')}
                    name={`Option ${index + 1} Value`}
                    disabled={fieldOption.Persisted}
                  />
                )}
              </DraggableItem>
            ))}
          </Reorder.Group>

          <Button
            onClick={(e) => {
              e.preventDefault();
              onAddOptionField();
            }}
          >
            {t('add_dropdown_option')}
          </Button>
        </div>
      )}
      {showDescriptionField && (
        <Editor
          testId={'description'}
          label={t('description')}
          name={'Description'}
          control={control}
          height={300}
          initOverrides={{
            toolbar:
              'undo redo | blocks | ' +
              'bold italic backcolor forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat',
            /**
             * Prevent images being uploaded (dragged on page)
             */
            images_file_types: '',
            /**
             * Prevent images being pasted
             */
            paste_data_images: false,
            // Only show h4-h6 in format dropdown
            block_formats:
              'Paragraph=p; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
            menubar: '',
            auto_focus: 'other',
          }}
          editorRef={editorRef}
          disabled={false}
          enableComments={false}
        />
      )}
      {showConditionalField && (
        <ConditionsPropertyFilter
          label={t('conditions')}
          name={'Conditions'}
          control={control}
          formId={formId}
          fieldId={fieldId}
        />
      )}
    </div>
  );
};
