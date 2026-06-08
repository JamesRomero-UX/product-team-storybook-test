import _ from 'lodash';
import type { ReactNode } from 'react';
import { FormField } from 'src/components/form/form/FormField';
import type { Content } from 'src/components/help-panel/useHelpStore';

import { TextInput, type TextInputProps } from './TextInput';

export interface TextInputWithFormFieldProps extends TextInputProps {
  label: string;
  info?: ReactNode;
  stretch?: boolean;
  testId?: string;
  description?: string;
  disableBottomPadding?: boolean;
  guidance?: Content | undefined;
}

export const TextInputWithFormField = ({
  label,
  stretch,
  errorMessage,
  testId,
  info,
  disableBottomPadding,
  guidance,
  ...props
}: TextInputWithFormFieldProps) => {
  return (
    <FormField
      label={label}
      errorText={errorMessage}
      stretch={stretch}
      disableBottomPadding={disableBottomPadding}
      testId={testId}
      info={info}
      guidance={guidance}
    >
      <TextInput {...props} />
    </FormField>
  );
};
