import { type Page } from '@playwright/test';

import { GroupForm } from '../forms/GroupForm';

export class AddGroupModal {
  readonly groupForm: GroupForm;

  constructor(page: Page) {
    this.groupForm = new GroupForm(page);
  }
}
