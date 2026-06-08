import { expect, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { Select } from './forms/fields/Select';
import { IssueForm } from './forms/IssueForm';

export class ReportAnIssuePage extends BasePage {
  readonly issueForm: IssueForm;
  readonly issueType: Select;
  constructor(page: Page) {
    super(page);
    this.issueForm = new IssueForm(page);
    this.issueType = new Select(page, 'IssueType');
  }

  async navigateTo() {
    await this.navigation.click('Report an Issue');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Report an issue`);
  }

  async selectIssueType(type: string) {
    await this.issueType.selectOptionByText(type);
  }
}
