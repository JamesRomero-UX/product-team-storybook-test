import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { CSVDownload } from './components/CSVDownload';
import { Ribbon } from './components/Ribbon.ts';
import { TableComponent } from './components/TableComponent';

export class RiskRegisterPage extends BasePage {
  readonly addButton: Locator;
  readonly exportButton: CSVDownload;

  readonly table: TableComponent;
  readonly ribbon: Ribbon;

  constructor(page: Page) {
    super(page);

    this.addButton = this.header.headerSection.getByRole('link', {
      name: 'Add Risk',
    });
    this.exportButton = new CSVDownload(page);

    this.table = new TableComponent(page);
    this.ribbon = new Ribbon(page);
  }

  private async navigateTo(exact?: boolean) {
    await this.navigation.navigateToChild('Risks', 'Register', false, exact);
  }

  async navigateToAndAssertTitle(exact?: boolean) {
    await this.navigateTo(exact);
    await expect(this.header.title).toHaveText(`Risk Register`);
  }
}
