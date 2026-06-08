import type { Page } from '@playwright/test';

import { ColoursForm } from '../forms/ColoursForm';
import { Tab } from './Tab';

export class ColoursTab extends Tab {
  readonly coloursForm: ColoursForm;

  constructor(page: Page) {
    super(page, 'colours');
    this.coloursForm = new ColoursForm(page);
  }
}
