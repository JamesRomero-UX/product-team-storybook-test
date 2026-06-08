import type { Page } from '@playwright/test';

import { InstantiateEnterpriseRiskForm } from '../forms/InstantiateEnterpriseRiskForm';

export class InstantiateEnterpriseRiskModal {
  readonly instantiateEnterpriseRiskForm: InstantiateEnterpriseRiskForm;

  constructor(page: Page) {
    this.instantiateEnterpriseRiskForm = new InstantiateEnterpriseRiskForm(
      page
    );
  }
}
