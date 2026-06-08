import type { Page } from '@playwright/test';

import { IssueForm } from '../forms/IssueForm';
import { Tab } from './Tab';

export class IssueDetailsTab extends Tab {
  readonly issueForm: IssueForm;

  constructor(page: Page) {
    super(page, 'details');
    this.issueForm = new IssueForm(page);
  }
}
