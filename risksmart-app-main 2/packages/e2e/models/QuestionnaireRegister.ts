import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class QuestionnaireRegister extends BasePage {
  readonly table: TableComponent;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Questionnaire',
    });
  }

  private async navigateTo() {
    await this.navigation.navigateToChild('Third party', 'Questionnaires');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await this.assertHeaderTitle();
  }

  async assertHeaderTitle() {
    // TODO: confirm this is the correct title?
    await expect(this.header.title).toHaveText(`Questionnaire`);
  }
}
