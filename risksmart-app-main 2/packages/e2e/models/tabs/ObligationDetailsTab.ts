import type { Page } from '@playwright/test';

import { ObligationForm } from '../forms/ObligationForm';
import { Tab } from './Tab';

export class ObligationDetailsTab extends Tab {
  readonly obligationForm: ObligationForm;

  constructor(page: Page) {
    super(page, 'details');
    this.obligationForm = new ObligationForm(page);
  }
}
