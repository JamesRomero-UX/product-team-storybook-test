import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { ComplianceAssessmentForm } from './forms/ComplianceAssessmentForm';

export abstract class ComplianceAssessmentPage extends BasePage {
  readonly complianceAssessmentForm: ComplianceAssessmentForm;

  constructor(page: Page) {
    super(page);
    this.complianceAssessmentForm = new ComplianceAssessmentForm(page);
  }
}
