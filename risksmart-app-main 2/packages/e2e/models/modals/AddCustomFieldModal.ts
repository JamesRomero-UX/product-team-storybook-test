import { type Page } from '@playwright/test';

import { AddCustomFieldForm } from '../forms/AddCustomFieldForm';
import { BaseModal } from './BaseModal';

export class AddCustomFieldModal extends BaseModal {
  readonly addCustomFieldForm: AddCustomFieldForm;

  constructor(page: Page) {
    super(page, 'editFieldModal');
    this.addCustomFieldForm = new AddCustomFieldForm(this.modalLocator);
  }
}
