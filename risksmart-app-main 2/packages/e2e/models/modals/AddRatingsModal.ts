import { type Page } from '@playwright/test';

import { ImpactRatingsForm } from '../forms/ImpactRatingsForm';

export class AddRatingsModal {
  readonly impactRatingsForm: ImpactRatingsForm;

  constructor(page: Page) {
    this.impactRatingsForm = new ImpactRatingsForm(page);
  }
}
