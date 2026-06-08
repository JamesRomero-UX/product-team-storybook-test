import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { EntityDetailModal } from '../modals/EntityDetailModal';
import { Tab } from './Tab';

export class EntitiesTab extends Tab {
  readonly createButton: Locator;
  readonly table: TableComponent;
  readonly detailModal: EntityDetailModal;

  constructor(page: Page) {
    super(page, 'entities');
    this.createButton = this.header.getByRole('button', { name: 'Add Entity' });
    this.table = new TableComponent(page);
    this.detailModal = new EntityDetailModal(page);
  }
}
