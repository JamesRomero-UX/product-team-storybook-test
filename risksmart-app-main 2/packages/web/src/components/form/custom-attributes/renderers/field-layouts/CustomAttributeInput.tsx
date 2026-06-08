import type { InputProps } from '@risk-smart/themed-cloudscape-components/input';
import type { FC } from 'react';
import { TextInputWithFormField } from 'src/components/form/controlled-input/TextInputWithFormField';

import type { CustomAttributeProps } from './CustomAttributeProps';

interface CustomAttributeInputProps extends CustomAttributeProps {
  type?: InputProps.Type;
}

export const CustomAttributeInput: FC<CustomAttributeInputProps> = ({
  value,
  onChange,
  label,
  type,
  disabled,
  error,
  description,
}) => (
  <TextInputWithFormField
    guidance={description}
    testId={label}
    label={label}
    disabled={disabled}
    type={type}
    value={value}
    errorMessage={error}
    onChange={(val) => onChange(`${val}`)}
  />
);
