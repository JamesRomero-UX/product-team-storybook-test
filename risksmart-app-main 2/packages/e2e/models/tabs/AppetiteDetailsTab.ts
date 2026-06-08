import type { Page } from '@playwright/test';

import { AppetiteForm } from '../forms/AppetiteForm';
import { Tab } from './Tab';

export class AppetiteDetailsTab extends Tab {
  readonly appetiteForm: AppetiteForm;

  constructor(page: Page) {
    super(page, 'details');
    this.appetiteForm = new AppetiteForm(page);
  }
}
