import { type Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';
import { RadioGroup } from './fields/RadioGroup';

export type GroupFormFields = {
  name: string;
  description: string;
  email: string;
  ownerContributor: 'Yes' | 'No';
};

export class GroupForm extends BaseForm<GroupFormFields> {
  constructor(page: Page) {
    super(page);

    this.fields = {
      name: new Input(page, 'name'),
      description: new Input(page, 'description'),
      email: new Input(page, 'email'),
      ownerContributor: new RadioGroup<'Yes' | 'No'>(page, 'ownerContributor'),
    };
  }
}
