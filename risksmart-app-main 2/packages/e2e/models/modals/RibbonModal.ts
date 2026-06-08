import { type Page } from '@playwright/test';

import { RibbonForm } from '../forms/RibbonForm';

export class RibbonModal {
  readonly ribbonForm: RibbonForm;

  constructor(page: Page) {
    this.ribbonForm = new RibbonForm(page);
  }
}
