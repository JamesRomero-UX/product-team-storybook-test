import type { Step } from './types';

export const scrollStepIntoView = (stepNumber: number) => {
  const stepsContainer = document.getElementById('steps-container');
  const stepElement = document.getElementById(`step-${stepNumber}`);

  if (stepsContainer) {
    stepElement?.scrollIntoView({
      behavior: 'instant',
      block: 'center',
      inline: 'start',
    });
  }
};

export const isDefaultTaxonomySteps = (steps: Step[]): boolean => {
  const defaultTaxonomyStep: Step = {
    controlType: '',
    description: '',
    showModal: '',
    tab: '',
    title: '',
  };

  return steps.every(
    (step) => JSON.stringify(step) === JSON.stringify(defaultTaxonomyStep)
  );
};
