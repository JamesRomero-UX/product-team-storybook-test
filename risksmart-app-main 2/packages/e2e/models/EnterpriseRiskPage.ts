import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { EnterpriseRiskDetailsTab } from './tabs/EnterpriseRiskDetailsTab';

export abstract class EnterpriseRiskPage extends BasePage {
  readonly detailsTab: EnterpriseRiskDetailsTab;

  constructor(page: Page) {
    super(page);
    this.detailsTab = new EnterpriseRiskDetailsTab(page);
  }
}
