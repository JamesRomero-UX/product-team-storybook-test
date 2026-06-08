import type { FieldValues } from 'react-hook-form';

import { CustomisableForm } from './CustomisableForm';
import type { ModalProps } from './ModalWrapper';
import { ModalWrapper } from './ModalWrapper';
import type { CommonProps } from './types';

export const ModalForm = <TFieldValues extends FieldValues>(
  props: CommonProps<TFieldValues> & ModalProps
) => (
  <CustomisableForm
    {...props}
    renderTemplate={(renderProps) => (
      <ModalWrapper
        {...renderProps}
        visible={props.visible}
        testId={props.testId}
      />
    )}
  />
);
