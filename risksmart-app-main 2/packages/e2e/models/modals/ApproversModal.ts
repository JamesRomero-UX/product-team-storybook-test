import { type Page } from '@playwright/test';

import { ApprovalForm } from '../forms/ApprovalForm';

export class ApproversModal {
  readonly approvalForm: ApprovalForm;

  constructor(page: Page) {
    this.approvalForm = new ApprovalForm(page);
  }
}
