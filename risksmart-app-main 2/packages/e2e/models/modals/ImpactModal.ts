import { type Page } from '@playwright/test';

import { ImpactForm } from '../forms/ImpactForm';

export class ImpactModal {
  readonly impactForm: ImpactForm;

  constructor(page: Page) {
    this.impactForm = new ImpactForm(page);
  }
}
