import type { FieldValues } from 'react-hook-form';

import { CustomisableForm } from './CustomisableForm';
import { PageWrapper } from './PageWrapper';
import type { CommonProps } from './types';

export const PageForm = <TFieldValues extends FieldValues>(
  props: CommonProps<TFieldValues>
) => {
  return (
    <CustomisableForm
      {...props}
      renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
    />
  );
};
