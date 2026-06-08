import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { QuestionnaireFieldFormForm } from '../forms/QuestionnaireFieldForm';
import { BaseModal } from './BaseModal';

export class QuestionnaireFieldModal extends BaseModal {
  readonly fieldForm: QuestionnaireFieldFormForm;

  constructor(page: Page | Locator) {
    super(page, 'form-field-modal');
    this.fieldForm = new QuestionnaireFieldFormForm(this.modalLocator);
  }
}
