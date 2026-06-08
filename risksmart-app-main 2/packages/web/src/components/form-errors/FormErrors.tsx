import Alert from '@risk-smart/themed-cloudscape-components/alert';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import { type FC, useEffect } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { HasuraErrorCodes } from '@/utils/graphqlUtils';

type Props<T extends FieldValues> = {
  errors: FieldErrors<T>;
};

export function FormErrors<T extends FieldValues>({ errors }: Props<T>) {
  const hasErrors = Object.keys(errors).length > 0;
  let errorMessage = 'This form has errors';
  if (errors?.global?.message) {
    errorMessage = errors.global.message as string;
  }
  if (errors.global?.type) {
    switch (errors.global.type) {
      case HasuraErrorCodes.PermissionError:
        errorMessage = 'Permission denied';
        break;
      case HasuraErrorCodes.UnexpectedError:
      case HasuraErrorCodes.ConstraintError:
        errorMessage = 'Unexpected error';
        break;
      case HasuraErrorCodes.ValidationFailed:
        errorMessage = 'Validation failed';
        break;
      default:
        if (errors.global.message) {
          errorMessage = errors.global.message as string;
        }
    }
  }
  useEffect(() => {
    if (getEnv('REACT_APP_LOG_FORM_ERRORS', true) === 'true') {
      console.log('Form errors:', errors);
    }
  }, [errors]);

  return hasErrors ? (
    <Alert statusIconAriaLabel={'Error'} type={'error'} header={errorMessage} />
  ) : (
    <></>
  );
}

const WrappedFormErrors: FC = () => {
  const {
    formState: { errors },
  } = useFormContext();

  return <FormErrors errors={errors} />;
};

export default WrappedFormErrors;
