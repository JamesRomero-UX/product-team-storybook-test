import type { Page } from '@playwright/test';

import { IssueAssessmentForm } from '../forms/IssueAssessmentForm';
import { Tab } from './Tab';

export class IssueAssessmentTab extends Tab {
  readonly issueAssessmentForm: IssueAssessmentForm;

  constructor(page: Page) {
    super(page, 'assessment');
    this.issueAssessmentForm = new IssueAssessmentForm(page);
  }
}
