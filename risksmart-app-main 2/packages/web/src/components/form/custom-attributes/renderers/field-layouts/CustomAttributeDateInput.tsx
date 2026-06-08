import type { FC } from 'react';
import { DatePickerInputWithFormField } from 'src/components/form/controlled-date-picker/ControlledDatePicker';

import type { CustomAttributeProps } from './CustomAttributeProps';

export const CustomAttributeDateInput: FC<CustomAttributeProps> = ({
  value,
  onChange,
  label,
  error,
  disabled,
  description,
}) => (
  <DatePickerInputWithFormField
    testId={label}
    guidance={description}
    label={label}
    value={value}
    onChange={onChange}
    disabled={disabled}
    errorMessage={error}
  />
);
