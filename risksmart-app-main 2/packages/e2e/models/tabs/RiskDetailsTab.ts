import type { Page } from '@playwright/test';

import { RiskRatingPreview } from '../components/RiskRatingPreview';
import { RiskForm } from '../forms/RiskForm';
import { Tab } from './Tab';

export class RiskDetailsTab extends Tab {
  readonly riskForm: RiskForm;
  readonly riskRatings: RiskRatingPreview;

  constructor(page: Page) {
    super(page, 'details');
    this.riskForm = new RiskForm(page);
    this.riskRatings = new RiskRatingPreview(page);
  }
}
