import { type Page } from '@playwright/test';

import { IndicatorResultForm } from '../forms/IndicatorResultForm';

export class IndicatorResultModal {
  readonly indicatorResultForm: IndicatorResultForm;

  constructor(page: Page) {
    this.indicatorResultForm = new IndicatorResultForm(page);
  }
}
