import type { Locator, Page } from '@playwright/test';
import _ from 'lodash';

import { BasePage } from './BasePage';
import { TableComponent } from './components/TableComponent';
import { IssueModal } from './modals/IssueModal';

export class IssueVariantRegisterPage extends BasePage {
  readonly addButton: Locator;
  readonly issueModal: IssueModal;
  readonly table: TableComponent;

  constructor(page: Page, variant: string) {
    super(page);
    this.issueModal = new IssueModal(page);
    this.addButton = this.header.headerSection.getByRole('button', {
      name: `Add ${_.startCase(variant)}`,
    });
    this.table = new TableComponent(page);
  }

  async navigateTo(variant: string) {
    await this.navigation.navigateToChild('Issues', variant, true);
  }
}
