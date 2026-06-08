import { type Page } from '@playwright/test';

import { InternalAuditReportForm } from '../forms/InternalAuditReportForm';

export class ReportModal {
  readonly reportForm: InternalAuditReportForm;

  constructor(page: Page) {
    this.reportForm = new InternalAuditReportForm(page);
  }
}
