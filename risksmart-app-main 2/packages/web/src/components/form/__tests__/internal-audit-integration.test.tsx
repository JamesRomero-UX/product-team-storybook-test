import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import type { RatingKeys } from 'src/ratings/ratings';
import { describe, expect, it, vi } from 'vitest';

import ControlledInternalAuditRating from '../controlled-internal-audit-rating';
import ControlledRating from '../controlled-rating';

// Mock useScoringSettings (used internally by ControlledRating)
vi.mock('src/ratings/useScoringSettings', () => ({
  useScoringSettings: () => ({
    hasScoringSettings: false,
    likelihoodOptions: [],
    impactOptions: [],
    ratingLevelOptions: [],
  }),
}));

// Mock the i18n module to provide both standard and internal audit taxonomies
vi.mock('react-i18next', () => ({
  useTranslation: (namespace?: string) => ({
    t: (key: string, options?: { returnObjects?: boolean }) => {
      if (options?.returnObjects) {
        // Standard taxonomy
        const standardTaxonomy: Record<
          string,
          Array<{ color: string; label: string; value: number }>
        > = {
          priority: [
            { color: 'dark-green', label: 'Low', value: 1 },
            { color: 'orange', label: 'Medium', value: 2 },
            { color: 'dark-red', label: 'High', value: 3 },
          ],
          likelihood: [
            { color: 'green', label: 'Unlikely', value: 1 },
            { color: 'yellow', label: 'Possible', value: 2 },
            { color: 'red', label: 'Likely', value: 3 },
          ],
          impact: [
            { color: 'green', label: 'Low Impact', value: 1 },
            { color: 'yellow', label: 'Medium Impact', value: 2 },
            { color: 'red', label: 'High Impact', value: 3 },
          ],
        };

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

        // Check which namespace we're in
        if (namespace === 'internal_audit_ratings') {
          return internalAuditTaxonomy[key] || [];
        }

        // Default to standard ratings namespace
        return standardTaxonomy[key] || [];
      }

      return `mocked:${key}`;
    },
  }),
}));

// Test wrapper components
const TestControlledRating = ({
  name,
  type,
  label,
}: {
  name: string;
  type: RatingKeys;
  label: string;
}) => {
  const { control } = useFormContext();

  return (
    <ControlledRating
      control={control}
      name={name}
      type={type}
      label={label}
      testId={name}
    />
  );
};

const TestControlledInternalAuditRating = ({
  name,
  type,
  label,
}: {
  name: string;
  type: RatingKeys;
  label: string;
}) => {
  const { control } = useFormContext();

  return (
    <ControlledInternalAuditRating
      control={control}
      name={name}
      type={type}
      label={label}
      testId={`test-${name}`}
    />
  );
};

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      standardPriority: undefined,
      standardLikelihood: undefined,
      standardImpact: undefined,
      internalAuditEffectiveness: undefined,
      internalAuditLikelihood: undefined,
      internalAuditImpact: undefined,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Internal Audit Integration Tests', () => {
  describe('Standard vs Internal Audit Component Behavior', () => {
    it('should render different taxonomies for ControlledRating vs ControlledInternalAuditRating', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <TestControlledRating
            name={'standardLikelihood'}
            type={'likelihood'}
            label={'Standard Likelihood'}
          />
          <TestControlledInternalAuditRating
            name={'internalAuditLikelihood'}
            type={'likelihood'}
            label={'Internal Audit Likelihood'}
          />
        </FormWrapper>
      );

      // Both components should render
      expect(screen.getByText(/Standard Likelihood/)).toBeInTheDocument();
      expect(screen.getByText(/Internal Audit Likelihood/)).toBeInTheDocument();

      // Get buttons for both components
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // Click standard likelihood dropdown
      await user.click(buttons[0]);

      // Should show standard likelihood options
      expect(screen.getByText('Unlikely')).toBeInTheDocument();
      expect(screen.getByText('Possible')).toBeInTheDocument();
      expect(screen.getByText('Likely')).toBeInTheDocument();

      // Click away to close dropdown
      await user.click(document.body);

      // Click internal audit likelihood dropdown
      await user.click(buttons[1]);

      // Should show internal audit likelihood options (different labels)
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();

      // Standard options should not be visible
      expect(screen.queryByText('Unlikely')).not.toBeInTheDocument();
      expect(screen.queryByText('Possible')).not.toBeInTheDocument();
      expect(screen.queryByText('Likely')).not.toBeInTheDocument();
    });

    it('should handle impact ratings with different scales', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <TestControlledRating
            name={'standardImpact'}
            type={'impact'}
            label={'Standard Impact'}
          />
          <TestControlledInternalAuditRating
            name={'internalAuditImpact'}
            type={'impact'}
            label={'Internal Audit Impact'}
          />
        </FormWrapper>
      );

      const buttons = screen.getAllByRole('button');

      // Click standard impact dropdown
      await user.click(buttons[0]);

      // Standard impact should have 3 options
      expect(screen.getByText('Low Impact')).toBeInTheDocument();
      expect(screen.getByText('Medium Impact')).toBeInTheDocument();
      expect(screen.getByText('High Impact')).toBeInTheDocument();

      // Click away to close
      await user.click(document.body);

      // Click internal audit impact dropdown
      await user.click(buttons[1]);

      // Internal audit impact should have 5 options
      expect(screen.getByText('Very Low')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Very High')).toBeInTheDocument();
    });
  });

  describe('Fallback behavior integration', () => {
    it('should use standard taxonomy when internal audit rating type is not available', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <TestControlledInternalAuditRating
            name={'fallbackTest'}
            type={'priority'} // priority doesn't exist in internal audit taxonomy
            label={'Fallback Priority'}
          />
        </FormWrapper>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should fallback to standard priority taxonomy
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  describe('Internal audit specific types', () => {
    it('should render effectiveness ratings only for internal audit components', async () => {
      const user = userEvent.setup();

      render(
        <FormWrapper>
          <TestControlledInternalAuditRating
            name={'effectiveness'}
            type={'effectiveness'}
            label={'Effectiveness Rating'}
          />
        </FormWrapper>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should show internal audit effectiveness options
      expect(screen.getByText('Ineffective')).toBeInTheDocument();
      expect(screen.getByText('Partially Effective')).toBeInTheDocument();
      expect(screen.getByText('Effective')).toBeInTheDocument();
    });
  });

  describe('Form integration and value selection', () => {
    it('should properly handle form value selection for different component types', async () => {
      const user = userEvent.setup();

      const TestForm = () => {
        const methods = useForm({
          defaultValues: {
            standard: undefined,
            internalAudit: undefined,
          },
        });

        const watchedValues = methods.watch();

        return (
          <FormProvider {...methods}>
            <TestControlledRating
              name={'standard'}
              type={'priority'}
              label={'Standard Priority'}
            />
            <TestControlledInternalAuditRating
              name={'internalAudit'}
              type={'effectiveness'}
              label={'Internal Audit Effectiveness'}
            />
            <div data-testid={'form-values'}>
              {JSON.stringify(watchedValues)}
            </div>
          </FormProvider>
        );
      };

      render(<TestForm />);

      const buttons = screen.getAllByRole('button');

      // Select value from standard rating
      await user.click(buttons[0]);
      await user.click(screen.getByText('Medium'));

      // Select value from internal audit rating
      await user.click(buttons[1]);
      await user.click(screen.getByText('Effective'));

      // Check form values are correctly set
      const formValues = screen.getByTestId('form-values');
      expect(formValues.textContent).toContain('"standard":2'); // Medium = value 2
      expect(formValues.textContent).toContain('"internalAudit":3'); // Effective = value 3
    });
  });

  describe('Error handling and edge cases', () => {
    it('should throw error when taxonomy is empty', () => {
      // Mock console.error to prevent test setup from failing
      const originalConsoleError = console.error;
      console.error = vi.fn();

      try {
        // Test that the component throws an error when no rating options are available
        // This aligns with the ControlledRating component's design that throws when ratings are missing
        expect(() => {
          render(
            <FormWrapper>
              <TestControlledInternalAuditRating
                name={'nonexistent'}
                type={'nonexistent' as RatingKeys}
                label={'Non-existent Rating'}
              />
            </FormWrapper>
          );
        }).toThrow('Rating options missing');
      } finally {
        // Restore original console.error
        console.error = originalConsoleError;
      }
    });
  });
});
