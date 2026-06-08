import type { Page } from '@playwright/test';

import type { IssueFormFields } from '../models/forms/IssueForm';
import { IssueRegisterPage } from '../models/pages/IssueRegisterPage';

export class IssueScenarios {
  readonly page: Page;
  readonly issueRegister: IssueRegisterPage;

  constructor(page: Page) {
    this.page = page;
    this.issueRegister = new IssueRegisterPage(page);
  }

  /**
   * Creates an issue
   *
   * @param issue
   */
  async createIssue(issue: Partial<IssueFormFields>) {
    await this.issueRegister.navigateToAndAssertTitle();
    const rows = await this.issueRegister.table.getRowCount();
    await this.issueRegister.addButton.click();

    await this.issueRegister.issueModal.issueForm.fillFormAndClickSave(issue);

    await this.issueRegister.notificationBanner.expectNotification(
      'Issue added successfully'
    );
    await this.issueRegister.table.expectRowCount(rows + 1);
  }

  /**
   * Updates an existing issue
   *
   * @param rowIndex - The index of the issue row to update (1-based)
   * @param updatedIssueData
   */
  async updateIssue(
    rowIndex: number,
    updatedIssueData: Partial<IssueFormFields>
  ) {
    await this.issueRegister.navigateToAndAssertTitle();

    await this.issueRegister.table.clickCellLink('Title', rowIndex);

    await this.issueRegister.issueModal.issueForm.fillFormAndClickSave(
      updatedIssueData
    );

    await this.issueRegister.notificationBanner.expectNotification(
      'Issue updated successfully'
    );
  }
}
