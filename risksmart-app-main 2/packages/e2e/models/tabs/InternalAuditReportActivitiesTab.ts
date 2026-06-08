import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { AssessmentActivityForm } from '../forms/AssessmentActivityForm';
import { Tab } from './Tab';

export class InternalAuditReportActivitiesTab extends Tab {
  readonly addButton: Locator;
  readonly table: TableComponent;
  readonly assessmentActivityForm: AssessmentActivityForm;

  constructor(page: Page) {
    super(page, 'activities');
    this.addButton = this.header.getByRole('button', {
      name: 'Add Activity',
    });
    this.table = new TableComponent(page);
    this.assessmentActivityForm = new AssessmentActivityForm(page);
  }
}
