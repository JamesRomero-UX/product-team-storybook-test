import { type Locator, type Page } from '@playwright/test';

export class ConfirmModal {
  readonly page: Page;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
  }
}
