import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './BasePage';

export class AutomationsPage extends BasePage {
  readonly integrationCards: Locator;

  constructor(page: Page) {
    super(page);
    this.integrationCards = page.locator('.grid.grid-cols-3 > *');
  }

  private async navigateTo() {
    await this.navigation.click('Automations');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText('Automations');
  }

  async expectCardVisible(cardName: string) {
    await expect(this.page.getByText(cardName, { exact: true })).toBeVisible();
  }

  async expectCardCount(count: number) {
    await expect(this.integrationCards).toHaveCount(count);
  }

  async clickCard(cardName: string) {
    await this.page.getByText(cardName, { exact: true }).click();
  }

  async expectDialogVisible(title: string) {
    await expect(
      this.page.getByRole('dialog').getByText(title, { exact: true })
    ).toBeVisible();
  }

  async closeDialog() {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Close' })
      .click();
  }
}
