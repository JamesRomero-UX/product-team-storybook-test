import { type Page } from '@playwright/test';

import { RatingForm } from '../forms/RatingForm';
import { BaseModal } from './BaseModal';

export class RatingModal extends BaseModal {
  readonly ratingForm: RatingForm;

  constructor(page: Page) {
    super(page, 'assessmentResultModal');
    this.ratingForm = new RatingForm(this.modalLocator);
  }
}
