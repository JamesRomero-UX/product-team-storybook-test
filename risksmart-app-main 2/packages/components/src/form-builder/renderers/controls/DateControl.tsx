import { withJsonFormsControlProps } from '@jsonforms/react';
import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import SimpleDateInput from '../../../form/simple-date-input/SimpleDateInput';
import type { ExtendedControlProps } from '../../types';
import Attachments from '../helpers/Attachments';
import { CustomisableControl } from './CustomisableControl';
import styles from './style.module.scss';

const DateControlUnwrapped: FC<ExtendedControlProps> = ({
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
      <div className={'flex gap-x-4 items-center'}>
        <SimpleDateInput
          value={data}
          onChange={(val) => {
            handleChange(path, val);
          }}
          disabled={!enabled}
        />
        <DatePicker
          {...{ className: styles.dateInput }}
          value={dayjs(data || Date.now()).format('YYYY-MM-DD')}
          onChange={(event) => {
            handleChange(path, event.detail.value);
          }}
          name={id}
          disabled={!enabled}
          autoFocus={appliedUiSchemaOptions.focus}
          placeholder={appliedUiSchemaOptions?.placeholder || t('date')}
        />
        <Attachments
          path={path}
          handleChange={handleChange}
          allowAttachments={schema.allowAttachments}
          disabled={!enabled}
        />
      </div>
    </CustomisableControl>
  );
};

export const DateControl = withJsonFormsControlProps(
  // For more info on why this is ignored, see `Known Issues` in `@risksmart-app/docs/form-builder.md`
  // @ts-ignore
  DateControlUnwrapped
);
