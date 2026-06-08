import type { Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { AssessmentActivityForm } from '../forms/AssessmentActivityForm';
import { DropdownButton } from '../forms/DropdownButton';
import { Tab } from './Tab';

export class AssessmentActivitiesTab extends Tab {
  readonly actionMenu: DropdownButton;

  readonly table: TableComponent;
  readonly assessmentActivityForm: AssessmentActivityForm;

  constructor(page: Page) {
    super(page, 'activities');
    this.actionMenu = new DropdownButton(page, 'actionsMenu');
    this.table = new TableComponent(page);
    this.assessmentActivityForm = new AssessmentActivityForm(page);
  }
}
