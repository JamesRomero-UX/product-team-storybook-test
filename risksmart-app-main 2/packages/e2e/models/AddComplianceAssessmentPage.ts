import { type Page } from '@playwright/test';

import { ComplianceAssessmentPage } from './ComplianceAssessmentPage';

export class AddComplianceAssessmentPage extends ComplianceAssessmentPage {
  constructor(page: Page) {
    super(page);
  }
}
