import type { Page } from '@playwright/test';

import { ComplianceAssessmentDetailsPage } from '../models/ComplianceAssessmentDetailsPage';
import { FindingPage } from '../models/FindingPage';
import type { FindingFormFields } from '../models/forms/FindingForm';

export class ComplianceAssessmentFindingScenarios {
  readonly page: Page;
  readonly complianceAssessmentDetailsPage: ComplianceAssessmentDetailsPage;
  readonly findingPage: FindingPage;

  constructor(page: Page) {
    this.page = page;

    this.complianceAssessmentDetailsPage = new ComplianceAssessmentDetailsPage(
      page
    );
    this.findingPage = new FindingPage(page);
  }

  async createFindingFromComplianceAssessmentPage(
    finding: Partial<FindingFormFields>
  ) {
    await this.complianceAssessmentDetailsPage.findingsTab.selectTab();
    await this.complianceAssessmentDetailsPage.findingsTab.addButton.click();
    await this.findingPage.findingForm.fillFormAndClickSave(finding);
    await this.findingPage.notificationBanner.expectNotification(
      'Finding added successfully'
    );
  }
}
