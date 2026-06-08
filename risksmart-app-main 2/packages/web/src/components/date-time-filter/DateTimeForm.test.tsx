import type {
  PropertyFilterOperator,
  PropertyFilterOperatorFormProps,
} from '@cloudscape-design/collection-hooks';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { DateTimeForm } from '@/components/date-time-filter/DateTimeForm';

const defaultProps: PropertyFilterOperatorFormProps<null | string> = {
  onChange: vi.fn(),
  value: null,
  operator: '=',
};

interface OverrideProps {
  onChange?: () => void;
  value?: null | string;
  operator?: PropertyFilterOperator;
  filter?: string;
}

interface CreateRenderProps {
  overrideProps?: OverrideProps;
}

const createRender = ({ overrideProps }: CreateRenderProps) => {
  const props = { ...defaultProps, ...overrideProps };

  return render(<DateTimeForm {...props} />, {});
};

describe('DateTimeForm', () => {
  const dateTimeForm = () => screen.queryByTestId('date-time-form')!;

  describe('when the form is rendered with no value and filter set', () => {
    beforeEach(async () => {
      createRender({ overrideProps: { filter: 'xyz' } });
    });

    it('should render the form', () => {
      expect(dateTimeForm()).toBeInTheDocument();
    });
  });

  describe('when the form is rendered with no value and filter not set', () => {
    beforeEach(async () => {
      createRender({ overrideProps: { filter: undefined } });
    });

    it('should not render the form', () => {
      expect(dateTimeForm()).not.toBeInTheDocument();
    });
  });

  describe('when the form is rendered with an invalid value', () => {
    beforeEach(async () => {
      createRender({
        overrideProps: { value: 'test', filter: 'xyz' },
      });
    });

    it('should not error', () => {
      expect(dateTimeForm()).toBeInTheDocument();
    });
  });
});
