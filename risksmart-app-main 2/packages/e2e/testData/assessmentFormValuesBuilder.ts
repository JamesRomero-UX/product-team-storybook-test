import type { AssessmentFormValues } from '../models/forms/AssessmentForm';

const defaultFormValues: Partial<AssessmentFormValues> &
  Required<Pick<AssessmentFormValues, 'title'>> = {
  title: 'Assessment 1',
  summary: 'Assessment 1 summary',
};

export const buildAssessmentFormValues = (
  overrides: Partial<AssessmentFormValues> = {}
): Partial<AssessmentFormValues> &
  Required<Pick<AssessmentFormValues, 'title'>> => ({
  ...defaultFormValues,
  ...overrides,
});
