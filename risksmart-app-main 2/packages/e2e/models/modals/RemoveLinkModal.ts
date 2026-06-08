import { type Locator, type Page } from '@playwright/test';

export class RemoveLinkModal {
  readonly page: Page;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmButton = page.getByRole('button', { name: 'Yes, remove' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }
}
