import { type Page } from '@playwright/test';

import { DepartmentForm } from '../forms/DepartmentForm';

export class AddDepartmentModal {
  readonly departmentForm: DepartmentForm;

  constructor(page: Page) {
    this.departmentForm = new DepartmentForm(page);
  }
}
