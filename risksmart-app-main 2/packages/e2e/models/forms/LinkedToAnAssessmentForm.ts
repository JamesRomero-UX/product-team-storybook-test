import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Select } from './fields/Select';

export type LinkedToAnAssessmentFormFields = {
  assessment: string;
};

export class LinkedToAnAssessmentForm extends BaseForm<LinkedToAnAssessmentFormFields> {
  constructor(page: Page | Locator) {
    super(page);
    this.fields = {
      assessment: new Select(page, 'assessment'),
    };
  }
}
