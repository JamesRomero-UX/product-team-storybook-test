import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { InternalAuditForm } from './forms/InternalAuditForm';

export abstract class InternalAuditPage extends BasePage {
  readonly internalAuditForm: InternalAuditForm;

  constructor(page: Page) {
    super(page);
    this.internalAuditForm = new InternalAuditForm(page);
  }
}
