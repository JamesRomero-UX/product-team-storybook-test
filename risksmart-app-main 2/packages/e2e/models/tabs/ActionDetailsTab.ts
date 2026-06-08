import type { Page } from '@playwright/test';

import { ActionForm } from '../forms/ActionForm';
import { Tab } from './Tab';

export class ActionDetailsTab extends Tab {
  readonly actionForm: ActionForm;

  constructor(page: Page) {
    super(page, 'details');
    this.actionForm = new ActionForm(page);
  }
}
