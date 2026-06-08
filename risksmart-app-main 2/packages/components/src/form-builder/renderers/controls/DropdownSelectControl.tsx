import { withJsonFormsControlProps } from '@jsonforms/react';
import type { RadioGroupProps } from '@risk-smart/themed-cloudscape-components/radio-group';
import RadioGroup from '@risk-smart/themed-cloudscape-components/radio-group';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components/select';
import Select from '@risk-smart/themed-cloudscape-components/select';

type OptionDefinition = SelectProps.Option;
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExtendedControlProps } from '../../types';
import { FieldOptionType } from '../../types';
import { supportsConditionalLogic } from '../../utils';
import Attachments from '../helpers/Attachments';
import { CustomisableControl } from './CustomisableControl';

const DropdownSelectControlUnwrapped: FC<ExtendedControlProps> = ({
  schema,
  uischema,
  errors,
  handleChange,
  enabled,
  data,
  path,
  config,
  visible,
  required,
}) => {
  const fieldType = uischema?.options?.fieldType;

  const modifiedSchemaOptions = (schema?.oneOf || []).map((option) => ({
    value: option.const,
    label: option.title,
  }));

  const [selectedOption, setSelectedOption] = useState<null | OptionDefinition>(
    data
      ? (modifiedSchemaOptions?.find((option) => option.value === data) ?? null)
      : null
  );

  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.placeholders',
  });

  const appliedUiSchemaOptions = {
    ...config,
    ...uischema.options,
  };

  const dropDownOptions: OptionDefinition[] = [
    {
      value: '',
      label: '-',
    },
    ...(schema?.oneOf || []).map((option) => ({
      label: option.title,
      value: option.const,
    })),
  ];

  const onDropdownChange = (detail: SelectProps.ChangeDetail) => {
    if (detail.selectedOption.value === '') {
      setSelectedOption(null);
      handleChange(path, undefined);

      return;
    }

    setSelectedOption(detail.selectedOption);
    handleChange(path, detail.selectedOption.value);
  };

  const radioGroupItems = (schema?.oneOf || []).map((option) => ({
    label: option.title,
    value: option.const,
    disabled: !enabled,
  }));

  const onRadioGroupChange = (detail: RadioGroupProps.ChangeDetail) => {
    const selectedOption =
      radioGroupItems.find((item) => item.value === detail.value) || null;

    setSelectedOption(selectedOption);
    handleChange(path, selectedOption?.value || undefined);
  };

  if (!supportsConditionalLogic(fieldType)) {
    return (
      <p className={'m-0 pb-4 text-red'}>
        {'The configuration for this field type is incorrect'}
      </p>
    );
  }

  return (
    <CustomisableControl
      id={path}
      uischema={uischema}
      errors={errors}
      schema={schema}
      required={required}
      visible={visible}
    >
      {fieldType === FieldOptionType.Dropdown ? (
        <Select
          {...{ className: 'grow' }}
          selectedOption={selectedOption}
          onChange={({ detail }) => onDropdownChange(detail)}
          options={dropDownOptions}
          disabled={!enabled}
          autoFocus={appliedUiSchemaOptions.focus}
          placeholder={appliedUiSchemaOptions?.placeholder || t('optionSelect')}
        />
      ) : null}

      {fieldType === FieldOptionType.Radio ? (
        <RadioGroup
          {...{ className: 'grow' }}
          value={selectedOption?.value || null}
          items={radioGroupItems}
          onChange={({ detail }) => onRadioGroupChange(detail)}
        />
      ) : null}

      <Attachments
        path={path}
        handleChange={handleChange}
        allowAttachments={schema.allowAttachments}
        disabled={!enabled}
      />
    </CustomisableControl>
  );
};

export const DropdownSelectControl = withJsonFormsControlProps(
  // For more info on why this is ignored, see `Known Issues` in `@risksmart-app/docs/form-builder.md`
  // @ts-ignore
  DropdownSelectControlUnwrapped
);
