import type { ReactNode } from 'react';
import { FormField } from 'src/components/form/form/FormField';
import type { Content } from 'src/components/help-panel/useHelpStore';

import {
  SelectWithNumberSupport,
  type SelectWithNumberSupportProps,
} from './SelectWithNumberSupport';

interface SelectWithFormFieldProps extends SelectWithNumberSupportProps {
  label: string;
  disableBottomPadding?: boolean;
  constraintText?: ReactNode;
  errorMessage?: string;
  testId?: string;
  description?: Content;
  stretch?: boolean;
}

export const SelectWithFormField = ({
  label,
  constraintText,
  errorMessage,
  testId,
  disableBottomPadding,
  description,
  stretch,
  ...props
}: SelectWithFormFieldProps) => {
  return (
    <FormField
      disableBottomPadding={disableBottomPadding}
      constraintText={constraintText}
      label={label}
      errorText={errorMessage}
      stretch={stretch}
      testId={testId}
      guidance={description}
    >
      <SelectWithNumberSupport {...props} />
    </FormField>
  );
};
