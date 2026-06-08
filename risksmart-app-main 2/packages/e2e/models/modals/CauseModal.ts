import { type Page } from '@playwright/test';

import { CauseForm } from '../forms/CauseForm';
import { BaseModal } from './BaseModal';

export class CauseModal extends BaseModal {
  readonly causeForm: CauseForm;

  constructor(page: Page) {
    super(page, 'causeModal');
    this.causeForm = new CauseForm(page);
  }
}
