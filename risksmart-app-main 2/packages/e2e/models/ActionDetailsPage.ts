import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { ActionDetailsTab } from './tabs/ActionDetailsTab';
import { ActionUpdateTab } from './tabs/ActionUpdateTab';

export class ActionDetailsPage extends BasePage {
  readonly detailsTab: ActionDetailsTab;
  readonly actionUpdatesTab: ActionUpdateTab;

  constructor(page: Page) {
    super(page);
    this.detailsTab = new ActionDetailsTab(page);
    this.actionUpdatesTab = new ActionUpdateTab(page);
  }
}
