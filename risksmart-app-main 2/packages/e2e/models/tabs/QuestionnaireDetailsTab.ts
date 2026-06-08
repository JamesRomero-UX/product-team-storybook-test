import type { Page } from '@playwright/test';

import { QuestionnaireForm } from '../forms/QuestionnaireForm';
import { Tab } from './Tab';

export class QuestionnaireDetailsTab extends Tab {
  questionnaireForm: QuestionnaireForm;

  constructor(page: Page, id: string) {
    super(page, id);
    this.questionnaireForm = new QuestionnaireForm(page);
  }
}
