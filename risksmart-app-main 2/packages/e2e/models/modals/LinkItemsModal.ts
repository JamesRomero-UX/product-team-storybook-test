import { type Page } from '@playwright/test';

import { LinkedItemForm } from '../forms/LinkedItemForm';

export class LinkItemsModal {
  readonly linkedItemForm: LinkedItemForm;

  constructor(page: Page) {
    this.linkedItemForm = new LinkedItemForm(page);
  }
}
