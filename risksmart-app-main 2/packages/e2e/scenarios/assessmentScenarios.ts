import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { AddAssessmentPage } from '../models/AddAssessmentPage';
import { AssessmentDetailsPage } from '../models/AssessmentDetailsPage';
import { AssessmentRegisterPage } from '../models/AssessmentRegisterPage';
import type { AssessmentFormValues } from '../models/forms/AssessmentForm';

export class AssessmentScenarios {
  readonly page: Page;
  readonly assessmentsRegisterPage: AssessmentRegisterPage;
  readonly addAssessmentPage: AddAssessmentPage;
  readonly assessmentDetailsPage: AssessmentDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.assessmentsRegisterPage = new AssessmentRegisterPage(page);
    this.addAssessmentPage = new AddAssessmentPage(page);
    this.assessmentDetailsPage = new AssessmentDetailsPage(page);
  }

  /**
   * Creates an assessment
   *
   * @param assessment
   */
  async createAssessment(
    assessment: Partial<AssessmentFormValues> &
      Required<Pick<AssessmentFormValues, 'title'>>
  ) {
    await this.navigateToAddAssessmentPage();
    await this.addAssessmentPage.assessmentForm.fillFormAndClickSave(
      assessment
    );
    await this.addAssessmentPage.notificationBanner.expectNotification(
      'Assessment added successfully'
    );
    await expect(this.assessmentDetailsPage.header.title).toHaveText(
      assessment.title
    );
    await expect(this.assessmentDetailsPage.detailsTab.title).toHaveText(
      'Details'
    );
  }

  async navigateToAddAssessmentPage() {
    await this.assessmentsRegisterPage.navigateToAndAssertTitle();
    await this.assessmentsRegisterPage.addButton.click();
    await expect(this.addAssessmentPage.header.title).toHaveText(
      `Add Assessment`
    );
  }
}
