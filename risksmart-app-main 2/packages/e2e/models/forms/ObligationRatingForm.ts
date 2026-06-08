import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { DateInput } from './fields/DateInput';
import { Select } from './fields/Select';
import { TextArea } from './fields/TextArea';

export type ObligationRatingFormValues = {
  rating: string;
  resultDate: string;
  rationale: string;
};

export class ObligationRatingForm extends BaseForm<ObligationRatingFormValues> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      rating: new Select(page, 'rating'),
      resultDate: new DateInput(page, 'testDate'),
      rationale: new TextArea(page, 'rationale'),
    };
  }
}
