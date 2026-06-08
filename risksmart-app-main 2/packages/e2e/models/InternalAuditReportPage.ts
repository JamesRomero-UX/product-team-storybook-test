import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { InternalAuditReportForm } from './forms/InternalAuditReportForm';

export abstract class InternalAuditReportPage extends BasePage {
  readonly internalAuditReportForm: InternalAuditReportForm;

  constructor(page: Page) {
    super(page);
    this.internalAuditReportForm = new InternalAuditReportForm(page);
  }
}
