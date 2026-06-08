import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { RiskDetailsTab } from './tabs/RiskDetailsTab';

export abstract class RiskPage extends BasePage {
  readonly detailsTab: RiskDetailsTab;

  constructor(page: Page) {
    super(page);
    this.detailsTab = new RiskDetailsTab(page);
  }
}
