import { type Page } from '@playwright/test';

import { RatingItem } from './RatingItem';

export class RiskRatingPreview {
  readonly page: Page;
  readonly inherentRating: RatingItem;
  readonly residualRating: RatingItem;
  constructor(page: Page) {
    this.page = page;
    this.inherentRating = new RatingItem(page, 'inherentRatingItem');
    this.residualRating = new RatingItem(page, 'residualRatingItem');
  }
}
