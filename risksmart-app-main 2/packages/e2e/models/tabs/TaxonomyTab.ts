import type { Locator, Page } from '@playwright/test';

import { Tab } from './Tab';

export class TaxonomyTab extends Tab {
  readonly addButton: Locator;
  readonly saveButton: Locator;
  readonly textArea: Locator;
  constructor(page: Page) {
    super(page, 'taxonomy');
    this.addButton = page.getByRole('button', { name: 'Add Translations' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.textArea = page.locator(
      this.cloudScapeWrapper.findCodeEditor().findNativeTextArea().toSelector()
    );
  }
}
