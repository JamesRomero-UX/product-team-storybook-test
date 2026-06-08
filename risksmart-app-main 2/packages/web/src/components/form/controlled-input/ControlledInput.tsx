import type { InputProps } from '@risk-smart/themed-cloudscape-components/input';
import _ from 'lodash';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';

import { Controller } from '../field-controller/Controller';
import { useIsFieldReadOnly } from '../form/customisable-form/hooks/useIsFieldReadOnly';
import type { ControlledBaseProps } from '../types';
import { TextInputWithFormField } from './TextInputWithFormField';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  stretch?: boolean;
  adornment?: ReactNode;
  type?: InputProps.Type;
  disabled?: boolean;
  testId?: string;
  disableBottomPadding?: boolean;
}

export const ControlledInput = <T extends FieldValues>({
  name,
  label,
  control,
  type,
  stretch = true,
  adornment,
  defaultRequired,
  forceRequired,
  allowDefaultValue,
  testId,
  description,
  disableBottomPadding,
  ...props
}: Props<T>) => {
  const { error } = control.getFieldState(name);
  const readOnly = useIsFieldReadOnly(name);

  return (
    <Controller
      name={name}
      control={control}
      defaultRequired={defaultRequired}
      forceRequired={forceRequired}
      allowDefaultValue={allowDefaultValue}
      render={({ field: { ref, onChange, onBlur, value } }) => (
        <TextInputWithFormField
          label={label}
          errorMessage={error?.message}
          stretch={stretch}
          value={value}
          type={type}
          disableBottomPadding={disableBottomPadding}
          onBlur={onBlur}
          onChange={onChange}
          innerRef={ref}
          adornment={adornment}
          testId={testId}
          guidance={description}
          {...props}
          disabled={readOnly || props.disabled}
        />
      )}
    />
  );
};
