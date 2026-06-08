import type { Page } from '@playwright/test';

import { FindingPage } from '../models/FindingPage';
import type { FindingFormFields } from '../models/forms/FindingForm';
import { InternalAuditReportDetailsPage } from '../models/InternalAuditReportDetailsPage';

export class InternalAuditFindingScenarios {
  readonly page: Page;
  readonly internalAuditReportDetailsPage: InternalAuditReportDetailsPage;
  readonly findingPage: FindingPage;

  constructor(page: Page) {
    this.page = page;

    this.internalAuditReportDetailsPage = new InternalAuditReportDetailsPage(
      page
    );
    this.findingPage = new FindingPage(page);
  }

  async createFindingFromInternalAuditReportPage(
    finding: Partial<FindingFormFields>
  ) {
    await this.internalAuditReportDetailsPage.findingsTab.selectTab();
    await this.internalAuditReportDetailsPage.findingsTab.addButton.click();
    await this.findingPage.findingForm.fillFormAndClickSave(finding);
    await this.findingPage.notificationBanner.expectNotification(
      'Finding added successfully'
    );
  }
}
