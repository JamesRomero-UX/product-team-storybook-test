import type { Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { FindingForm } from './forms/FindingForm';

export class FindingPage extends BasePage {
  readonly findingForm: FindingForm;

  constructor(page: Page) {
    super(page);
    this.findingForm = new FindingForm(page);
  }
}
