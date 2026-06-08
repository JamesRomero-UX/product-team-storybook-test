import { type Page } from '@playwright/test';

import { AddUsersForm } from '../forms/AddUsersForm';

export class AddUsersModal {
  readonly addUsersForm: AddUsersForm;

  constructor(page: Page) {
    this.addUsersForm = new AddUsersForm(page);
  }
}
