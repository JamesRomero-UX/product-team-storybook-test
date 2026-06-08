import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { Tab } from './Tab';

export class ThirdPartyQuestionnairesTab extends Tab {
  table: TableComponent;
  planButton: Locator;

  constructor(page: Page, id: string) {
    super(page, id);
    this.table = new TableComponent(page);
    this.planButton = page.getByRole('button', {
      name: 'Plan Questionnaire',
    });
  }
}
