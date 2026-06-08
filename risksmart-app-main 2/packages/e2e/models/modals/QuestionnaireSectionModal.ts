import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { QuestionnaireSectionForm } from '../forms/QuestionnaireSectionForm';

export class QuestionnaireSectionModal {
  readonly sectionForm: QuestionnaireSectionForm;
  readonly container: Locator;

  constructor(page: Page | Locator) {
    this.container = page.getByTestId('form-section-modal');
    this.sectionForm = new QuestionnaireSectionForm(this.container);
  }
}
