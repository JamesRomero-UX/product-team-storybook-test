import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { RadioBar } from './RadioBar';

export type ImpactRatingValues = {
  likelihood: string;
  // TODO: Will be nice to do this by impact name in the future
  ratings: string[];
  ratingDate: string;
};

export class ImpactRatingsForm extends BaseForm<ImpactRatingValues> {
  readonly likelihood: RadioBar<string>;
  readonly ratingDate: Locator;

  constructor(page: Page) {
    super(page);
    this.likelihood = new RadioBar<string>(page, 'likelihood');
    this.ratingDate = page.getByRole('textbox', { name: 'Rating date' });
  }

  getRatingRowByIndex(index: number) {
    return new RadioBar(this.page, `Ratings-${index}`);
  }

  async fillForm({
    likelihood,
    ratings,
    ratingDate,
  }: Partial<ImpactRatingValues>) {
    if (ratingDate) {
      await this.ratingDate.fill(ratingDate);
    }
    if (likelihood !== undefined) {
      await this.likelihood.getInput(likelihood);
    }
    if (ratings) {
      for (let i = 0; i < ratings.length; i++) {
        await this.getRatingRowByIndex(i).getInput(ratings[i]).click();
      }
    }
  }
}
