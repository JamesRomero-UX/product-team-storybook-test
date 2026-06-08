import SpaceBetween from '@risk-smart/themed-cloudscape-components/space-between';
import type { PropsWithChildren } from 'react';
import FormErrors from 'src/components/form-errors';

/**
 * Form wrapper to show react hook form errors at the top of the form
 * @returns
 */
export const FormInner = ({ children }: PropsWithChildren) => (
  <SpaceBetween direction={'vertical'} size={'l'}>
    <FormErrors />
    <div>{children}</div>
  </SpaceBetween>
);
