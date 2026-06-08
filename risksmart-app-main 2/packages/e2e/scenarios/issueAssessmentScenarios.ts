import type { Page } from '@playwright/test';

import type { IssueAssessmentFormFields } from '../models/forms/IssueAssessmentForm';
import { IssueDetailsPage } from '../models/pages/IssueDetailsPage';

export class IssueAssessmentScenarios {
  readonly page: Page;
  readonly issueDetailsPage: IssueDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.issueDetailsPage = new IssueDetailsPage(page);
  }

  /**
   * Creates an issue assessment
   *
   * @param issueAssessment
   */
  async createIssueAssessmentFromIssueDetails(
    issueAssessment: Partial<IssueAssessmentFormFields>
  ) {
    const issueAssessmentTab = this.issueDetailsPage.issueAssessmentTab;
    await issueAssessmentTab.selectTabAndAssertTitle('Assessment');
    await issueAssessmentTab.issueAssessmentForm.fillFormAndClickSave(
      issueAssessment
    );

    await this.issueDetailsPage.notificationBanner.expectNotification(
      'Assessment updated successfully'
    );
  }
}
