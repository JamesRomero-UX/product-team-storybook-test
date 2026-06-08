import { type Page } from '@playwright/test';

import { IssueForm } from '../forms/IssueForm';

export class IssueModal {
  readonly issueForm: IssueForm;

  constructor(page: Page) {
    this.issueForm = new IssueForm(page);
  }
}
