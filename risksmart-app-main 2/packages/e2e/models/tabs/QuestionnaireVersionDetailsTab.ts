import type { Page } from '@playwright/test';

import { QuestionnaireVersionForm } from '../forms/QuestionnaireVersionForm';
import { Tab } from './Tab';

export class QuestionnaireVersionDetailsTab extends Tab {
  questionnaireVersionForm: QuestionnaireVersionForm;

  constructor(page: Page, id: string) {
    super(page, id);
    this.questionnaireVersionForm = new QuestionnaireVersionForm(page);
  }
}
