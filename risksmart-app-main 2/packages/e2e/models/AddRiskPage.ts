import { type Page } from '@playwright/test';

import { RiskPage } from './RiskPage';

export class AddRiskPage extends RiskPage {
  constructor(page: Page) {
    super(page);
  }
}
