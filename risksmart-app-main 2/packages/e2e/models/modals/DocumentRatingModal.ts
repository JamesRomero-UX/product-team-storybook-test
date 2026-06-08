import { type Page } from '@playwright/test';

import { DocumentRatingForm } from '../forms/DocumentRatingForm';

export class DocumentRatingModal {
  readonly ratingForm: DocumentRatingForm;

  constructor(page: Page) {
    this.ratingForm = new DocumentRatingForm(page);
  }
}
