import { type Page } from '@playwright/test';

import { TagForm } from '../forms/TagForm';

export class AddTagModal {
  readonly tagForm: TagForm;

  constructor(page: Page) {
    this.tagForm = new TagForm(page);
  }
}
