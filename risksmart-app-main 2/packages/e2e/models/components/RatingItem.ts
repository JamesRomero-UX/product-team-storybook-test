import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

export class RatingItem {
  readonly page: Page;
  readonly title: Locator;
  readonly resultDate: Locator;
  readonly rating: Locator;
  readonly container: Locator;
  constructor(page: Page, testId: string) {
    this.page = page;
    this.container = page.getByTestId(testId);
    this.title = this.container.getByRole('heading');
    this.resultDate = this.container.getByTestId('rating-date');
    this.rating = this.container.getByTestId('badge');
  }
}
