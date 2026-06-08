import type { IndicatorFormValues } from '../models/forms/IndicatorForm';

const defaultIndicatorFormValues: Partial<IndicatorFormValues> = {
  name: 'Indicator 1',
  details: 'Indicator 1 details',
  indicatorType: 'Number',
  owners: ['CustomerSupport1'],
  testFrequency: 'Weekly',
  timeToCompleteUnit: 'days',
  timeToCompleteValue: 10,
  testScheduleStartDate: '2021-02-02',
  lowerTolerance: -10,
  lowerAppetite: -5,
  upperAppetite: 5,
  upperTolerance: 10,
  contributors: [],
  unit: 'days',
  tags: [],
  departments: [],
  attachFiles: [],
};

export const buildIndicatorFormValues = (
  overrides: Partial<IndicatorFormValues> = {}
): Partial<IndicatorFormValues> => ({
  ...defaultIndicatorFormValues,
  ...overrides,
});
