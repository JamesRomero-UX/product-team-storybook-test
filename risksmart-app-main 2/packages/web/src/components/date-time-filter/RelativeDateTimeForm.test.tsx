import type {
  PropertyFilterOperator,
  PropertyFilterOperatorFormProps,
} from '@cloudscape-design/collection-hooks';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { RelativeDateTimeForm } from '@/components/date-time-filter/RelativeDateTimeForm';

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

  return render(<RelativeDateTimeForm {...props} />);
};

describe('RelativeDateTimeForm', () => {
  const relativeDateTimeForm = () =>
    screen.queryByTestId('relative-date-time-form')!;

  describe('when the form is rendered with no value', () => {
    beforeEach(async () => {
      createRender({});
    });

    it('should render the form', () => {
      expect(relativeDateTimeForm()).toBeInTheDocument();
    });
  });
});
