import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';
import { ImpactModal } from './modals/ImpactModal';

export class ImpactsRegisterPage extends BasePage {
  readonly addImpactButton: Locator;
  readonly addImpactModal: ImpactModal;
  readonly table: TableComponent;
  constructor(page: Page) {
    super(page);
    this.addImpactButton = page.getByText('Add Impact');
    this.addImpactModal = new ImpactModal(page);
    this.table = new TableComponent(page);
  }

  private async navigateTo() {
    await this.navigation.navigateToChild('Impacts', 'Register');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Impact register`);
  }
}
