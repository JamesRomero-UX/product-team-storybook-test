import { expect, type Locator, type Page } from '@playwright/test';
import type { CardsWrapper } from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

import { BasePage } from './BasePage';

export class RiskDashboardPage extends BasePage {
  readonly addButton: Locator;
  readonly tier1Cards: CardsWrapper;
  readonly tier2Cards: CardsWrapper;
  readonly tier3Cards: CardsWrapper;

  constructor(page: Page) {
    super(page);

    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Risk',
    });
    this.tier1Cards = this.cloudScapeWrapper.findCards(
      ` [data-testid="tier-1"] div`
    );
    this.tier2Cards = this.cloudScapeWrapper.findCards(
      ` [data-testid="tier-2"] div`
    );
    this.tier3Cards = this.cloudScapeWrapper.findCards(
      ` [data-testid="tier-3"] div`
    );
  }

  private async navigateTo() {
    await this.navigation.navigateToChild('Risks', 'Dashboard');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Risk Dashboard`);
  }
}
