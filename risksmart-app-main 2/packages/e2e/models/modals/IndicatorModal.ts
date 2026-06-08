import { type Page } from '@playwright/test';

import { IndicatorForm } from '../forms/IndicatorForm';
import { BaseModal } from './BaseModal';

export class IndicatorModal extends BaseModal {
  readonly indicatorForm: IndicatorForm;

  constructor(page: Page) {
    super(page, 'indicator-modal');
    this.indicatorForm = new IndicatorForm(this.modalLocator);
  }
}
