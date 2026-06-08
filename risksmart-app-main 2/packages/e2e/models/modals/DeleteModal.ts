import { type Locator, type Page } from '@playwright/test';

import { BaseModal } from './BaseModal';

export class DeleteModal extends BaseModal {
  readonly page: Page;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page, 'deleteModal');
    this.page = page;
    this.confirmButton = page.getByRole('button', { name: 'Yes, delete' });
  }
}
