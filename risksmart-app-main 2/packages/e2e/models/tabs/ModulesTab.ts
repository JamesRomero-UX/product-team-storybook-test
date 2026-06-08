import type { Locator, Page } from '@playwright/test';

import { Tab } from './Tab';

export class ModulesTab extends Tab {
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page, 'modules');
    this.saveButton = this.header.getByRole('button', { name: 'Save' });
  }
}
