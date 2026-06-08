import type { Page } from '@playwright/test';

import type { QuestionnaireFieldFormValues } from '../models/forms/QuestionnaireFieldForm';
import type { QuestionnaireSectionFormValues } from '../models/forms/QuestionnaireSectionForm';
import type { QuestionnaireVersionFormValues } from '../models/forms/QuestionnaireVersionForm';
import { QuestionnaireDetailsPage } from '../models/QuestionnaireDetailsPage';
import { QuestionnaireRegister } from '../models/QuestionnaireRegister';
import { QuestionnaireVersionDetailsPage } from '../models/QuestionnaireVersionDetailsPage';

export class ThirdPartyQuestionnaireVersionScenarios {
  readonly page: Page;
  readonly questionnaireRegister: QuestionnaireRegister;
  readonly questionnaireDetailsPage: QuestionnaireDetailsPage;
  readonly questionnaireVersionDetailsPage: QuestionnaireVersionDetailsPage;

  constructor(page: Page) {
    this.page = page;
    this.questionnaireRegister = new QuestionnaireRegister(page);
    this.questionnaireDetailsPage = new QuestionnaireDetailsPage(page);
    this.questionnaireVersionDetailsPage = new QuestionnaireVersionDetailsPage(
      page
    );
  }

  private async fillQuestionnaire(
    questionnaireVersionFormValues: Partial<QuestionnaireVersionFormValues>,
    sectionsFormValues: Partial<{
      section: Partial<QuestionnaireSectionFormValues>;
      fields: Partial<QuestionnaireFieldFormValues>[];
    }>[]
  ) {
    const form =
      this.questionnaireVersionDetailsPage.detailsTab.questionnaireVersionForm;
    await form.fillForm(questionnaireVersionFormValues);

    // Add sections
    for (const sectionsFormValue of sectionsFormValues) {
      await form.addSectionButton.click();
      if (sectionsFormValue.section?.title) {
        await form.sectionModal.sectionForm.fillFormAndClickSave({
          title: sectionsFormValue.section.title,
        });
      }
      const sections = await form.getSections();
      for (const field of sectionsFormValue.fields ?? []) {
        const index = sectionsFormValues.indexOf(sectionsFormValue);

        await sections[index].addFieldButton.click();
        if (field) {
          await sections[index].formFieldModal.fieldForm.fillForm(field);
        }
        await sections[index].formFieldModal.fieldForm.saveButton.click();
      }
    }
  }

  /**
   * Creates a third party questionnaire version
   *
   * @param questionFormValues
   */
  async createThirdPartyQuestionnaireVersionFromDetailsPage(
    questionnaireVersionFormValues: QuestionnaireVersionFormValues,
    sectionsFormValues: {
      section: Partial<QuestionnaireSectionFormValues>;
      fields: Partial<QuestionnaireFieldFormValues>[];
    }[]
  ) {
    await this.fillQuestionnaire(
      questionnaireVersionFormValues,
      sectionsFormValues
    );

    const form =
      this.questionnaireVersionDetailsPage.detailsTab.questionnaireVersionForm;
    await form.saveButton.click();
    await this.questionnaireDetailsPage.notificationBanner.expectNotification(
      'Version added successfully'
    );
  }

  async previewThirdPartyQuestionnaireVersionFromDetailsPage(
    questionnaireVersionFormValues: Partial<QuestionnaireVersionFormValues>,
    sectionsFormValues: Partial<{
      section: Partial<QuestionnaireSectionFormValues>;
      fields: Partial<QuestionnaireFieldFormValues>[];
    }>[]
  ) {
    await this.fillQuestionnaire(
      questionnaireVersionFormValues,
      sectionsFormValues
    );

    await this.questionnaireVersionDetailsPage.previewButton.click();
  }
}
