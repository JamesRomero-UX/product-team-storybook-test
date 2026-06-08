import { type Page } from '@playwright/test';

import { ControlForm } from '../forms/ControlForm';

export class ControlModal {
  readonly controlForm: ControlForm;

  constructor(page: Page) {
    this.controlForm = new ControlForm(page);
  }
}
