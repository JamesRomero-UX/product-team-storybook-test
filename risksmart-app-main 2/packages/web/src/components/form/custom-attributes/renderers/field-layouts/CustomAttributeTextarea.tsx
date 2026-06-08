import type { FC } from 'react';
import { TextareaInput } from 'src/components/form/controlled-textarea/ControlledTextarea';

import type { CustomAttributeProps } from './CustomAttributeProps';

export const CustomAttributeTextarea: FC<CustomAttributeProps> = ({
  label,
  onChange,
  value,
  error,
  disabled,
  description,
}) => (
  <TextareaInput
    testId={label}
    guidance={description}
    label={label}
    onChange={onChange}
    value={value}
    errorMessage={error}
    disabled={disabled}
  />
);
