import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { DateInput } from '../forms/fields/DateInput';
import { NumberInput } from '../forms/fields/NumberInput';
import { Select } from '../forms/fields/Select';

export type Frequency =
  | '-'
  | 'Ad Hoc'
  | 'Daily'
  | 'Weekly'
  | 'Fortnightly'
  | 'Four Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Yearly';

export type TestScheduleValues = {
  nextTestOverdue: string | undefined;
  nextTestDue: string | undefined;
  testFrequency: Frequency;
  timeToCompleteValue: number;
  timeToCompleteUnit: string;
  testScheduleStartDate: string;
};

export const getTestScheduleFormFields = (page: Page | Locator) => ({
  nextTestDue: new DateInput(page, 'nextTestDue'),
  nextTestOverdue: new DateInput(page, 'nextTestOverdue'),
  timeToCompleteValue: new NumberInput(page, 'timeToCompleteValue'),
  timeToCompleteUnit: new Select(page, 'timeToCompleteUnit'),
  testFrequency: new Select(page, 'testFrequency'),
  testScheduleStartDate: new DateInput(page, 'testScheduleStartDate'),
});
