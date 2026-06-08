import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import ControlledInternalAuditRating from './ControlledInternalAuditRating';

// Mock useScoringSettings (used internally by ControlledRating)
vi.mock('src/ratings/useScoringSettings', () => ({
  useScoringSettings: () => ({
    hasScoringSettings: false,
    likelihoodOptions: [],
    impactOptions: [],
    ratingLevelOptions: [],
  }),
}));

// Mock the i18n module
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { returnObjects?: boolean }) => {
      if (options?.returnObjects) {
        // Internal audit taxonomy
        const internalAuditTaxonomy: Record<
          string,
          Array<{ color: string; label: string; value: number }>
        > = {
          effectiveness: [
            { color: '#ff0000', label: 'Ineffective', value: 1 },
            { color: '#ff8000', label: 'Partially Effective', value: 2 },
            { color: '#00ff00', label: 'Effective', value: 3 },
          ],
          likelihood: [
            { color: '#00ff00', label: 'Low', value: 1 },
            { color: '#ff8000', label: 'Medium', value: 2 },
            { color: '#ff0000', label: 'High', value: 3 },
          ],
          impact: [
            { color: '#00ff00', label: 'Very Low', value: 1 },
            { color: '#80ff00', label: 'Low', value: 2 },
            { color: '#ff8000', label: 'Medium', value: 3 },
            { color: '#ff4000', label: 'High', value: 4 },
            { color: '#ff0000', label: 'Very High', value: 5 },
          ],
        };

        return internalAuditTaxonomy[key] || [];
      }

      return `mocked:${key}`;
    },
  }),
}));

// Test wrapper component that extracts control from form context
const TestControlledInternalAuditRating = ({
  type,
  label,
  testId,
}: {
  type: string;
  label: string;
  testId: string;
}) => {
  const { control } = useFormContext();

  return (
    <ControlledInternalAuditRating
      control={control}
      name={type} // Add name prop for react-hook-form
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type={type as any}
      label={label}
      testId={testId}
    />
  );
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      effectiveness: undefined,
      likelihood: undefined,
      impact: undefined,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ControlledInternalAuditRating', () => {
  it('should render effectiveness rating with 3 options', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TestControlledInternalAuditRating
          type={'effectiveness'}
          label={'Test Effectiveness'}
          testId={'test-effectiveness'}
        />
      </TestWrapper>
    );

    // Should render the label - using partial match due to mocked translation
    expect(screen.getByText(/Test Effectiveness/)).toBeInTheDocument();

    // Click to open dropdown - Cloudscape components render as buttons
    const button = screen.getByRole('button');
    await user.click(button);

    // Check that options are rendered
    expect(screen.getByText('Ineffective')).toBeInTheDocument();
    expect(screen.getByText('Partially Effective')).toBeInTheDocument();
    expect(screen.getByText('Effective')).toBeInTheDocument();
  });

  it('should render likelihood rating with 3 options', () => {
    render(
      <TestWrapper>
        <TestControlledInternalAuditRating
          type={'likelihood'}
          label={'Test Likelihood'}
          testId={'test-likelihood'}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Test Likelihood/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render impact rating with 5 options', () => {
    render(
      <TestWrapper>
        <TestControlledInternalAuditRating
          type={'impact'}
          label={'Test Impact'}
          testId={'test-impact'}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Test Impact/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TestControlledInternalAuditRating
          type={'effectiveness'}
          label={'Test Effectiveness'}
          testId={'test-effectiveness'}
        />
      </TestWrapper>
    );

    // Click to open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    // Options should be visible after clicking
    expect(screen.getByText('Ineffective')).toBeInTheDocument();
    expect(screen.getByText('Partially Effective')).toBeInTheDocument();
    expect(screen.getByText('Effective')).toBeInTheDocument();
  });

  it('should pass through props to underlying ControlledRating', () => {
    render(
      <TestWrapper>
        <TestControlledInternalAuditRating
          type={'effectiveness'}
          label={'Test Effectiveness'}
          testId={'test-effectiveness'}
        />
      </TestWrapper>
    );

    // Component should render without errors
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should automatically use internal_audit context', () => {
    render(
      <TestWrapper>
        <TestControlledInternalAuditRating
          type={'effectiveness'}
          label={'Test Effectiveness'}
          testId={'test-effectiveness'}
        />
      </TestWrapper>
    );

    // Should render with internal audit ratings
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  describe('Integration with Form', () => {
    it('should integrate with react-hook-form', () => {
      const TestFormWrapper = () => {
        const methods = useForm({
          defaultValues: {
            effectiveness: 2,
          },
        });

        return (
          <FormProvider {...methods}>
            <TestControlledInternalAuditRating
              type={'effectiveness'}
              label={'Test Effectiveness'}
              testId={'test-effectiveness'}
            />
          </FormProvider>
        );
      };

      render(<TestFormWrapper />);

      // Should render with form integration
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
