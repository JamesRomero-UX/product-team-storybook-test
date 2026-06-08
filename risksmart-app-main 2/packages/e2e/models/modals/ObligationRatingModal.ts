import { type Page } from '@playwright/test';

import { ObligationRatingForm } from '../forms/ObligationRatingForm';

export class ObligationRatingModal {
  readonly ratingForm: ObligationRatingForm;

  constructor(page: Page) {
    this.ratingForm = new ObligationRatingForm(page);
  }
}
