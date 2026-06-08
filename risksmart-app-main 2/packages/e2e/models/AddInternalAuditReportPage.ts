import { type Page } from '@playwright/test';

import { InternalAuditReportPage } from './InternalAuditReportPage';

export class AddInternalAuditReportPage extends InternalAuditReportPage {
  constructor(page: Page) {
    super(page);
  }
}
