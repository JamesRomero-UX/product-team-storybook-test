import type { Page } from '@playwright/test';

import { RiskForm } from '../forms/RiskForm';
import { Tab } from './Tab';

export class EnterpriseRiskDetailsTab extends Tab {
  readonly riskForm: RiskForm;

  constructor(page: Page) {
    super(page, 'details');
    this.riskForm = new RiskForm(page);
  }
}
