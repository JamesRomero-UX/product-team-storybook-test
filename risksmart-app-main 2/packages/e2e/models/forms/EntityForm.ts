import type { Page } from '@playwright/test';

import { BaseForm } from './BaseForm';
import { Input } from './fields/Input';
import { MultiSelect } from './fields/MultiSelect';
import { Select } from './fields/Select';

export type EntityFormValues = {
  name: string;
  description: string;
  parentName: string;
  weight: string;
  owners: string[];
};

export class EntityForm extends BaseForm<EntityFormValues> {
  constructor(page: Page) {
    super(page);
    this.fields = {
      name: new Input(page, 'name'),
      description: new Input(page, 'description'),
      parentName: new Select(page, 'parent-entity'),
      weight: new Input(page, 'weight'),
      owners: new MultiSelect(page, 'default-owners'),
    };
  }
}
