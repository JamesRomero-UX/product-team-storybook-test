import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { MultiSelect } from './fields/MultiSelect';

export type Status = 'pending' | 'closed' | 'open';

export type AddUsersFields = {
  users: string[];
};

export class AddUsersForm extends BaseForm<AddUsersFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      users: new MultiSelect(page, 'users'),
    };
  }
}
