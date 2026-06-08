import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';
import { InstantiateEnterpriseRiskModal } from './modals/InstantiateEnterpriseRiskModal';

export class EnterpriseRiskRegisterPage extends BasePage {
  readonly addButton: Locator;
  readonly addRiskToEntitiesButton: Locator;
  readonly instantiateEnterpriseRiskModal: InstantiateEnterpriseRiskModal;
  readonly table: TableComponent;

  constructor(page: Page) {
    super(page);

    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Enterprise Risk',
    });
    this.addRiskToEntitiesButton = this.header.headerSection.getByText(
      'Add Risk to Entities'
    );
    this.instantiateEnterpriseRiskModal = new InstantiateEnterpriseRiskModal(
      page
    );
    this.table = new TableComponent(
      page,
      '[data-testid="enterprise-risk-table"]'
    );
  }

  private async navigateTo() {
    await this.navigation.navigateToChild(
      'Enterprise risks',
      'Register',
      false,
      true
    );
  }
  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Enterprise Risk Register`);
  }
}
