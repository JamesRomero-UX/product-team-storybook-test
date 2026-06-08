import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class IssueReportedPage extends BasePage {
  readonly title: Locator;
  readonly subtitle: Locator;
  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 2 });
    this.subtitle = page.getByRole('heading', { level: 3 });
  }

  async navigateTo() {
    await this.navigation.click('Report an issue');
  }
}
