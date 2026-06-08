import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { AssessmentForm } from './forms/AssessmentForm';

export abstract class AssessmentPage extends BasePage {
  readonly assessmentForm: AssessmentForm;

  constructor(page: Page) {
    super(page);
    this.assessmentForm = new AssessmentForm(page);
  }
}
