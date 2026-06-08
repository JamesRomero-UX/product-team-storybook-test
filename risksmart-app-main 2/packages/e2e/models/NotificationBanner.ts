import { expect, type Locator, type Page } from '@playwright/test';

export class NotificationBanner {
  readonly root: Locator;
  readonly page: Page;
  private readonly latest: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator(`[data-testid="notification-banner"]`);
    this.latest = this.root.first();
  }

  async expectNotification(message: string) {
    await expect(this.latest).toHaveText(message, { timeout: 30000 });
  }
}
