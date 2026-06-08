import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';

export class ComplianceAssessmentRegisterPage extends BasePage {
  readonly addButton: Locator;

  readonly table: TableComponent;

  constructor(page: Page) {
    super(page);

    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Monitoring Assessment',
    });
    this.table = new TableComponent(page);
  }

  async navigateTo() {
    await this.navigation.navigateToChild('Compliance', 'Monitoring');
  }

  async clickExpandableParentNavigation() {
    await this.navigation.click('Compliance');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(
      'Monitoring Assessments Register'
    );
  }
}
