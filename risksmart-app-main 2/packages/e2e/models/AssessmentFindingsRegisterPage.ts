import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class AssessmentFindingsRegisterPage extends BasePage {
  readonly table: TableComponent;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
  }

  private async navigateTo() {
    await this.navigation.navigateToChild('Assessments', 'Findings');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Findings`);
  }
}
