import type { Page } from '@playwright/test';

import { AssessmentDetailsPage } from '../models/AssessmentDetailsPage';
import { FindingPage } from '../models/FindingPage';
import type { FindingFormFields } from '../models/forms/FindingForm';

export class AssessmentFindingScenarios {
  readonly page: Page;
  readonly assessmentDetailsPage: AssessmentDetailsPage;
  readonly findingPage: FindingPage;

  constructor(page: Page) {
    this.page = page;

    this.assessmentDetailsPage = new AssessmentDetailsPage(page);
    this.findingPage = new FindingPage(page);
  }

  /**
   * Creates a finding from the assessment page
   *
   * @param finding
   */
  async createFindingFromAssessmentPage(finding: Partial<FindingFormFields>) {
    //Cannot assert tab header currently as multiple tab headers are present! need to refactor code
    await this.assessmentDetailsPage.findingsTab.selectTab();
    await this.assessmentDetailsPage.findingsTab.addButton.click();
    await this.findingPage.findingForm.fillFormAndClickSave(finding);
    await this.findingPage.notificationBanner.expectNotification(
      'Finding added successfully'
    );
  }
}
