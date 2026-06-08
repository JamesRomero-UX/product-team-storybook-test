import { type Page } from '@playwright/test';

import { EnterpriseRiskPage } from './EnterpriseRiskPage';

export class AddEnterpriseRiskPage extends EnterpriseRiskPage {
  constructor(page: Page) {
    super(page);
  }
}
