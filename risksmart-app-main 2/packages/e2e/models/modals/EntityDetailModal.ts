import type { Page } from '@playwright/test';

import { EntityForm } from '../forms/EntityForm';

export class EntityDetailModal {
  readonly entityForm: EntityForm;

  constructor(page: Page) {
    this.entityForm = new EntityForm(page);
  }
}
