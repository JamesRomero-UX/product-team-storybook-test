import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from '../BasePage';
import { CSVDownload } from '../components/CSVDownload';
import { TableComponent } from '../components/TableComponent';
import { IssueModal } from '../modals/IssueModal';

export class IssueRegisterPage extends BasePage {
  readonly addButton: Locator;
  readonly issueModal: IssueModal;
  readonly table: TableComponent;
  readonly exportButton: CSVDownload;

  constructor(page: Page) {
    super(page);
    this.issueModal = new IssueModal(page);
    this.addButton = this.header.headerSection.getByRole('button', {
      name: 'Add Issue',
    });
    this.table = new TableComponent(page);
    this.exportButton = new CSVDownload(page);
  }

  private async navigateTo() {
    await this.navigation.navigateToChild('Issues', 'Register');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Issue Register`);
  }
}
