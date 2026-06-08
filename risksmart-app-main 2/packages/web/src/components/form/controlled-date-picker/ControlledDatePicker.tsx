import DatePicker from '@risk-smart/themed-cloudscape-components/date-picker';
import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import SimpleDateInput from '@risksmart-app/components/src/form/simple-date-input/SimpleDateInput';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import type { FieldValues, Noop, RefCallBack } from 'react-hook-form';
import { FormField } from 'src/components/form/form/FormField';
import type { Content } from 'src/components/help-panel/useHelpStore';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';
import styles from './style.module.scss';

interface DatePickerInputWithFormFieldProps extends DatePickerInputProps {
  label: string;
  errorMessage?: string;
  testId?: string;
  info?: ReactNode;
  disableBottomPadding?: boolean;
  guidance?: Content | undefined;
}

interface DatePickerInputProps {
  onChange?: (value: string) => void;
  value?: string;
  onBlur?: Noop;
  locale?: string;

  disabled?: boolean;
  innerRef?: RefCallBack;
  placeholder?: string;
}

export const DatePickerInput = ({
  value = '',
  onChange,
  disabled,
  onBlur,
  innerRef,
  placeholder,
  ...rest
}: DatePickerInputProps) => {
  const valueToIso = (val: string) => (val ? new Date(val).toISOString() : '');

  return (
    <SpaceBetween direction={'horizontal'} size={'xs'} alignItems={'center'}>
      <SimpleDateInput
        value={value}
        onChange={(val) => {
          onChange?.(valueToIso(val));
        }}
        onBlur={onBlur}
        disabled={disabled}
      />
      <DatePicker
        {...{ className: styles.hideDateInput }}
        ref={innerRef}
        onBlur={onBlur}
        onChange={(e) => {
          onChange?.(valueToIso(e.detail.value));
        }}
        value={dayjs(value || Date.now()).format('YYYY-MM-DD')}
        nextMonthAriaLabel={'Next month'}
        placeholder={placeholder || 'DD/MM/YYYY'}
        previousMonthAriaLabel={'Previous month'}
        todayAriaLabel={'Today'}
        disabled={disabled}
        {...rest}
      />
    </SpaceBetween>
  );
};

export const DatePickerInputWithFormField = ({
  label,
  value = '',
  onChange,
  errorMessage,
  disabled,
  onBlur,
  innerRef,
  placeholder,
  testId,
  info,
  disableBottomPadding,
  ...rest
}: DatePickerInputWithFormFieldProps) => {
  const valueToIso = (val: string) => (val ? new Date(val).toISOString() : '');

  return (
    <FormField
      info={info}
      label={label}
      errorText={errorMessage}
      stretch
      testId={testId}
      disableBottomPadding={disableBottomPadding}
    >
      <SpaceBetween direction={'horizontal'} size={'xs'} alignItems={'center'}>
        <SimpleDateInput
          value={value}
          testId={testId}
          onChange={(val) => {
            onChange?.(valueToIso(val));
          }}
          onBlur={onBlur}
          disabled={disabled}
        />
        <DatePicker
          {...{ className: styles.hideDateInput }}
          ref={innerRef}
          onBlur={onBlur}
          onChange={(e) => {
            onChange?.(valueToIso(e.detail.value));
          }}
          value={dayjs(value || Date.now()).format('YYYY-MM-DD')}
          nextMonthAriaLabel={'Next month'}
          placeholder={placeholder || 'DD/MM/YYYY'}
          previousMonthAriaLabel={'Previous month'}
          todayAriaLabel={'Today'}
          disabled={disabled}
          {...rest}
        />
      </SpaceBetween>
    </FormField>
  );
};

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  locale?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  testId: string;
}

export const ControlledDatePicker = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  onChange,
  forceRequired,
  defaultRequired,
  allowDefaultValue,
  testId,
  description,
  ...rest
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  return (
    <Controller
      forceRequired={forceRequired}
      defaultRequired={defaultRequired}
      allowDefaultValue={allowDefaultValue}
      name={name}
      control={control}
      render={({ field: { ref, onChange: formOnChange, onBlur, value } }) => (
        <DatePickerInputWithFormField
          guidance={description}
          label={label}
          onChange={(val: string) => {
            formOnChange(val);
            onChange?.(val);
          }}
          testId={testId}
          onBlur={onBlur}
          disabled={disabled || readOnly}
          value={value}
          innerRef={ref}
          placeholder={placeholder}
          errorMessage={error?.message}
          {...rest}
        />
      )}
    />
  );
};
