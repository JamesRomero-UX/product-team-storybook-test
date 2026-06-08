import { type Page } from '@playwright/test';

import { AssessmentPage } from './AssessmentPage';

export class AddAssessmentPage extends AssessmentPage {
  constructor(page: Page) {
    super(page);
  }
}
