import { type Page } from '@playwright/test';

import { InternalAuditPage } from './InternalAuditPage';

export class AddInternalAuditPage extends InternalAuditPage {
  constructor(page: Page) {
    super(page);
  }
}
