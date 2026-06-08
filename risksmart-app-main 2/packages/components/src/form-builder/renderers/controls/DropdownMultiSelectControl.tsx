import { withJsonFormsControlProps } from '@jsonforms/react';
import type { MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';
import Multiselect from '@risk-smart/themed-cloudscape-components/multiselect';

type OptionDefinition = MultiselectProps.Option;
import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExtendedControlProps } from '../../types';
import Attachments from '../helpers/Attachments';
import { CustomisableControl } from './CustomisableControl';

const DropdownMultiselectControlUnwrapped: FC<ExtendedControlProps> = ({
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
  const modifiedSchemaOptions: OptionDefinition[] =
    (schema?.items?.oneOf || []).map((option) => ({
      value: option.const,
      label: option.title,
    })) ?? [];

  const [selectedOptions, setSelectedOptions] = useState<OptionDefinition[]>(
    data
      ? modifiedSchemaOptions.filter((item) => {
          return data.includes(item.value);
        })
      : []
  );

  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.placeholders',
  });

  const appliedUiSchemaOptions = {
    ...config,
    ...uischema.options,
  };

  return (
    <CustomisableControl
      id={path}
      uischema={uischema}
      errors={errors}
      schema={schema}
      required={required}
      visible={visible}
    >
      <Multiselect
        {...{ className: 'grow' }}
        selectedOptions={selectedOptions}
        onChange={({ detail }) => {
          setSelectedOptions(detail.selectedOptions as OptionDefinition[]);
          handleChange(
            path,
            detail.selectedOptions.map((option) => option.value)
          );
        }}
        options={modifiedSchemaOptions}
        disabled={!enabled}
        autoFocus={appliedUiSchemaOptions.focus}
        placeholder={
          appliedUiSchemaOptions?.placeholder || t('optionMultiselect')
        }
      />
      <Attachments
        path={path}
        handleChange={handleChange}
        allowAttachments={schema.allowAttachments}
        disabled={!enabled}
      />
    </CustomisableControl>
  );
};

export const DropdownMultiselectControl = withJsonFormsControlProps(
  // For more info on why this is ignored, see `Known Issues` in `@risksmart-app/docs/form-builder.md`
  // @ts-ignore
  DropdownMultiselectControlUnwrapped
);
