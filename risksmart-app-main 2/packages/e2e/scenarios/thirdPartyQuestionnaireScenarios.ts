import type { Page } from '@playwright/test';

import type { QuestionnaireFormValues } from '../models/forms/QuestionnaireForm';
import { QuestionnaireDetailsPage } from '../models/QuestionnaireDetailsPage';
import { QuestionnaireRegister } from '../models/QuestionnaireRegister';

export class ThirdPartyQuestionnaireScenarios {
  readonly page: Page;
  readonly questionnaireRegister: QuestionnaireRegister;
  readonly questionnaireDetailsPage: QuestionnaireDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.questionnaireRegister = new QuestionnaireRegister(page);
    this.questionnaireDetailsPage = new QuestionnaireDetailsPage(page);
  }

  /**
   * Creates a third party questionnaire
   *
   * @param questionFormValues
   */
  async createThirdPartyQuestionnaire(
    questionFormValues: QuestionnaireFormValues
  ) {
    await this.questionnaireRegister.navigateToAndAssertTitle();
    await this.questionnaireRegister.addButton.click();

    await this.questionnaireDetailsPage.detailsTab.questionnaireForm.fillFormAndClickSave(
      questionFormValues
    );
    await this.questionnaireDetailsPage.notificationBanner.expectNotification(
      'Questionnaire added successfully'
    );
  }
}
