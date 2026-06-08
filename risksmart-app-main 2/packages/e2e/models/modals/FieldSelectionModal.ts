import { type Page } from '@playwright/test';

import { FieldSelectionForm } from '../forms/FieldSelectionForm';
import { BaseModal } from './BaseModal';

export class FieldSelectionModal extends BaseModal {
  readonly fieldSelectionForm: FieldSelectionForm;

  constructor(page: Page) {
    super(page, 'fieldSelectionModal');

    this.fieldSelectionForm = new FieldSelectionForm(this.modalLocator);
  }
}
