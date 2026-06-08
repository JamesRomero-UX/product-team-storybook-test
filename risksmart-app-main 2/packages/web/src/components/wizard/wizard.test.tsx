import { fireEvent, render, screen } from '@testing-library/react';
import { act, useEffect } from 'react';

import { getWrapper } from '../../testing/wrapper';
import { useWizardStore } from './store/useWizardStore';
import { type Step, StepStatus } from './types';
import { Wizard } from './Wizard';

const MockedWizard = ({
  mockOptions,
}: {
  mockOptions?: { steps?: Step[]; currentStep?: number };
}) => {
  const { steps, setSteps, currentStep, setCurrentStep } = useWizardStore();

  useEffect(() => {
    setSteps(mockOptions?.steps ?? steps);
    setCurrentStep(mockOptions?.currentStep ?? currentStep);
    //   eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockOptions?.steps]);

  return <Wizard />;
};

const DEFAULT_STEPS: Step[] = [
  {
    title: 'Review Risk Details',
    description:
      'Please review the risk and make any necessary revisions as appropriate.',
    tab: '',
  },
  {
    title: 'Inherent Risk Rating',
    description:
      'Please review past risk ratings and add a new inherent risk rating.',
    tab: 'ratings',
  },
  {
    title: 'Rate Controls',
    description:
      'Please review past controls and their tests. Add, delete and rate controls as appropriate.',
    tab: 'controls',
  },
  {
    title: 'Residual Risk Rating',
    description:
      'Please review past risk ratings and add a new residual risk rating.',
    tab: 'ratings',
  },
];

describe('Wizard', () => {
  it.each([...DEFAULT_STEPS.map(({ title }) => title)])(
    'should correctly render %s step',
    (title) => {
      const step = () => screen.queryByText(title);

      act(() => {
        render(<MockedWizard mockOptions={{ steps: DEFAULT_STEPS }} />, {
          wrapper: getWrapper([], 'router', 'graphql'),
        });
      });

      expect(step()).toBeInTheDocument();
    }
  );

  describe('Guides', () => {
    it('should correctly toggle guide', () => {
      act(() => {
        render(<MockedWizard mockOptions={{ steps: DEFAULT_STEPS }} />, {
          wrapper: getWrapper([], 'router', 'graphql'),
        });
      });

      let guideDescription = screen.getByText(DEFAULT_STEPS[0].description);

      expect(guideDescription).toBeInTheDocument();
      const closeGuide = screen.getByTestId('close-guide');
      fireEvent.click(closeGuide);
      expect(guideDescription).not.toBeInTheDocument();
      const openGuide = screen.getByTestId('open-guide');
      fireEvent.click(openGuide);
      guideDescription = screen.getByText(DEFAULT_STEPS[0].description);
      expect(guideDescription).toBeInTheDocument();
    });

    it.each([0, 1, 2, 3])(
      `should correctly render guide content for step %i`,
      (step) => {
        const guideContent = () =>
          screen.queryByText(DEFAULT_STEPS[step].description);

        act(() => {
          render(
            <MockedWizard
              mockOptions={{ steps: DEFAULT_STEPS, currentStep: step }}
            />,
            {
              wrapper: getWrapper([], 'router', 'graphql'),
            }
          );
        });

        expect(guideContent()).toBeInTheDocument();
      }
    );
  });
  describe('Navigation buttons', () => {
    it('should correctly render wizard navigation buttons', () => {
      act(() => {
        render(<MockedWizard mockOptions={{ steps: DEFAULT_STEPS }} />, {
          wrapper: getWrapper([], 'router', 'graphql'),
        });
      });

      expect(screen.queryByText('Save for later')).toBeInTheDocument();
      expect(screen.queryByText('Next')).toBeInTheDocument();
    });

    it('should correctly render finish button for last step', () => {
      const steps = DEFAULT_STEPS;
      steps[3].status = StepStatus.InProgress;

      act(() => {
        render(
          <MockedWizard
            mockOptions={{ steps: DEFAULT_STEPS, currentStep: 3 }}
          />,
          {
            wrapper: getWrapper([], 'router', 'graphql'),
          }
        );
      });

      expect(screen.queryByText('Finish')).toBeInTheDocument();
    });
  });
});
