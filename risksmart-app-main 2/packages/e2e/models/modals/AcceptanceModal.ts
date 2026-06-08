import { type Page } from '@playwright/test';

import { AcceptanceForm } from '../forms/AcceptanceForm';

export class AcceptanceModal {
  readonly acceptanceForm: AcceptanceForm;

  constructor(page: Page) {
    this.acceptanceForm = new AcceptanceForm(page);
  }
}
