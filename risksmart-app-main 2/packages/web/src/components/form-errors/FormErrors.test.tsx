import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HasuraErrorCodes } from '@/utils/graphqlUtils';

import { FormErrors } from './FormErrors';

describe('FormErrors', () => {
  it('should display nothing if there are no errors', () => {
    const { container } = render(<FormErrors errors={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should display a generic "This form has errors" for validation errors', () => {
    const { getByText } = render(
      <FormErrors
        errors={{
          field1: {
            type: 'min',
            message: 'too small',
          },
        }}
      />
    );
    expect(getByText('This form has errors')).toBeInTheDocument();
  });

  it('should display a generic "Permission denied" for permission graphql errors', () => {
    const { getByText } = render(
      <FormErrors
        errors={{
          global: {
            type: HasuraErrorCodes.PermissionError,
            message: 'Error',
          },
        }}
      />
    );
    expect(getByText('Permission denied')).toBeInTheDocument();
  });

  it('should display a generic "Unexpected error" message for unexpected graphql errors', () => {
    const { getByText } = render(
      <FormErrors
        errors={{
          global: {
            type: HasuraErrorCodes.UnexpectedError,
            message: 'Error',
          },
        }}
      />
    );
    expect(getByText('Unexpected error')).toBeInTheDocument();
  });

  it('should display a generic "Unexpected error" message for constraint errors', () => {
    const { getByText } = render(
      <FormErrors
        errors={{
          global: {
            type: HasuraErrorCodes.ConstraintError,
            message: 'Error',
          },
        }}
      />
    );
    expect(getByText('Unexpected error')).toBeInTheDocument();
  });

  it('should display a generic "Validation failed" message for validation failed graphql errors', () => {
    const { getByText } = render(
      <FormErrors
        errors={{
          global: {
            type: HasuraErrorCodes.ValidationFailed,
            message: 'Error',
          },
        }}
      />
    );
    expect(getByText('Validation failed')).toBeInTheDocument();
  });
});
