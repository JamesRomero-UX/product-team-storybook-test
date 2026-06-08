import { withJsonFormsControlProps } from '@jsonforms/react';
import Textarea from '@risk-smart/themed-cloudscape-components/textarea';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExtendedControlProps } from '../../types';
import Attachments from '../helpers/Attachments';
import { CustomisableControl } from './CustomisableControl';
import styleOverrides from './style.module.scss';

const TextAreaControlUnwrapped: FC<ExtendedControlProps> = ({
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
  const appliedUiSchemaOptions = {
    ...config,
    ...uischema.options,
  };

  const { t } = useTranslation(['common'], {
    keyPrefix: 'formBuilder.placeholders',
  });

  return (
    <CustomisableControl
      id={path}
      uischema={uischema}
      errors={errors}
      schema={schema}
      required={required}
      visible={visible}
    >
      <Textarea
        {...{
          className: `grow w-max-content ${styleOverrides.textArea}`,
        }}
        value={data || ''}
        onChange={(event) => {
          handleChange(path, event.detail.value);
        }}
        name={id}
        disabled={!enabled}
        autoFocus={appliedUiSchemaOptions.focus}
        placeholder={appliedUiSchemaOptions?.placeholder || t('textArea')}
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

export const TextAreaControl = withJsonFormsControlProps(
  // For more info on why this is ignored, see `Known Issues` in `@risksmart-app/docs/form-builder.md`
  // @ts-ignore
  TextAreaControlUnwrapped
);
