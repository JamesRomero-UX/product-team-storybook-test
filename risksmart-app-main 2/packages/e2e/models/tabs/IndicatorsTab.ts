import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { IndicatorModal } from '../modals/IndicatorModal';
import { Tab } from './Tab';

export class IndicatorsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly indicatorModal: IndicatorModal;

  constructor(page: Page) {
    super(page, 'indicators');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', { name: 'Add Indicator' });
    this.deleteButton = this.header.getByRole('button', {
      name: 'Delete Indicator',
    });
    this.indicatorModal = new IndicatorModal(page);
  }
}
