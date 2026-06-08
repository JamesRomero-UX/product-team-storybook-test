import type { Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { BaseForm } from './BaseForm';

export type InstantiateEnterpriseRiskFormValues = {
  entities: number[];
};

export class InstantiateEnterpriseRiskForm extends BaseForm<InstantiateEnterpriseRiskFormValues> {
  readonly entities: TableComponent;

  constructor(page: Page) {
    super(page);
    this.entities = new TableComponent(
      page,
      '[data-testid="insantiate-entity-table"]'
    );
  }

  async fillForm({ entities }: InstantiateEnterpriseRiskFormValues) {
    await Promise.all(
      entities.map(async (entity) => {
        await this.entities.checkRow(entity);
      })
    );
  }
}
