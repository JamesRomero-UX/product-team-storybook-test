import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { AddInternalAuditPage } from '../models/AddInternalAuditPage';
import type { InternalAuditFormFields } from '../models/forms/InternalAuditForm';
import { InternalAuditDetailsPage } from '../models/InternalAuditDetailsPage';
import { InternalAuditRegisterPage } from '../models/InternalAuditRegisterPage';
import { InternalAuditReportRegisterPage } from '../models/InternalAuditReportRegisterPage';

export class InternalAuditScenarios {
  readonly page: Page;

  readonly internalAuditsRegisterPage: InternalAuditRegisterPage;
  readonly addInternalAuditPage: AddInternalAuditPage;
  readonly internalAuditDetailsPage: InternalAuditDetailsPage;
  readonly internalAuditReportRegisterPage: InternalAuditReportRegisterPage;
  readonly addInternalAuditReportPage: AddInternalAuditPage;

  constructor(page: Page) {
    this.page = page;
    this.internalAuditsRegisterPage = new InternalAuditRegisterPage(page);
    this.addInternalAuditPage = new AddInternalAuditPage(page);
    this.internalAuditDetailsPage = new InternalAuditDetailsPage(page);
    this.internalAuditReportRegisterPage = new InternalAuditReportRegisterPage(
      page
    );
    this.addInternalAuditReportPage = new AddInternalAuditPage(page);
  }

  /**
   * Create an internal audit
   *
   * @param internal audit
   */
  async createInternalAudit(internalAudit: Partial<InternalAuditFormFields>) {
    await this.navigateToAddInternalAuditPage();
    await this.addInternalAuditPage.internalAuditForm.fillFormAndClickSave(
      internalAudit
    );

    await this.addInternalAuditPage.notificationBanner.expectNotification(
      'Internal audit added successfully'
    );

    await expect(this.internalAuditDetailsPage.header.title).toHaveText(
      internalAudit.title ?? ''
    );
  }

  async navigateToAddReportPage() {
    await this.internalAuditReportRegisterPage.navigateToAndAssertTitle();
    await this.internalAuditReportRegisterPage.addButton.click();

    await expect(this.addInternalAuditReportPage.header.title).toHaveText(
      `Add Report`
    );
  }

  async navigateToAddInternalAuditPage() {
    await this.internalAuditsRegisterPage.navigateToAndAssertTitle();
    await this.internalAuditsRegisterPage.addButton.click();
    await expect(this.addInternalAuditPage.header.title).toHaveText(
      'Add Internal audit'
    );
  }
}
