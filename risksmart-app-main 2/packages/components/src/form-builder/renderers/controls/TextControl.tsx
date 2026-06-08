import { withJsonFormsControlProps } from '@jsonforms/react';
import type { InputProps } from '@risk-smart/themed-cloudscape-components/input';
import Input from '@risk-smart/themed-cloudscape-components/input';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExtendedControlProps, FieldOptionType } from '../../types';
import Attachments from '../helpers/Attachments';
import { CustomisableControl } from './CustomisableControl';

type TextFieldTypes = Extract<
  FieldOptionType,
  FieldOptionType.Number | FieldOptionType.Text | FieldOptionType.Url
>;

const TextControlUnwrapped: FC<ExtendedControlProps> = ({
  schema,
  uischema,
  errors,
  handleChange,
  enabled,
  data,
  id,
  path,
  config,
  visible,
  required,
}) => {
  const fieldType: TextFieldTypes = uischema?.options?.fieldType || 'text';

  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.placeholders',
  });

  const appliedUiSchemaOptions = {
    ...config,
    ...uischema.options,
  };

  const defaultPlaceholders = {
    text: t('text'),
    number: t('number'),
    url: t('url'),
  };

  const inputMode: Record<TextFieldTypes, InputProps.InputMode> = {
    text: 'text',
    number: 'numeric',
    url: 'url',
  };

  return (
    <CustomisableControl
      uischema={uischema}
      errors={errors}
      schema={schema}
      id={path}
      required={required}
      visible={visible}
    >
      <Input
        {...{ className: 'grow' }}
        type={fieldType || 'text'}
        inputMode={inputMode[fieldType] || 'text'}
        value={data || ''}
        onChange={(event) => {
          handleChange(path, event.detail.value);
        }}
        name={id}
        disabled={!enabled}
        autoFocus={appliedUiSchemaOptions.focus}
        placeholder={
          appliedUiSchemaOptions?.placeholder ||
          (fieldType && defaultPlaceholders[fieldType]) ||
          defaultPlaceholders['text']
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

export const TextControl = withJsonFormsControlProps(
  // For more info on why this is ignored, see `Known Issues` in `@risksmart-app/docs/form-builder.md`
  // @ts-ignore
  TextControlUnwrapped
);
