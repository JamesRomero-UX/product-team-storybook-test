import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { NewFieldForm } from '../forms/NewFieldForm';
import { BaseModal } from './BaseModal';

export class EditFieldModal extends BaseModal {
  readonly editFieldForm: NewFieldForm;
  readonly container: Locator;
  constructor(page: Page) {
    super(page, 'editFieldModal');
    this.container = page.locator("[data-testid='editFieldModal']");
    this.editFieldForm = new NewFieldForm(this.container);
  }
}
