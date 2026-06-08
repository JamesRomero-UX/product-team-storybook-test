import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { IndicatorResultModal } from '../modals/IndicatorResultModal';
import { Tab } from './Tab';

export class IndicatorResultsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly deleteButton: Locator;
  readonly indicatorResultModal: IndicatorResultModal;

  constructor(page: Page) {
    super(page, 'results');
    this.table = new TableComponent(page);
    this.addButton = this.header.getByRole('button', { name: 'Add Result' });
    this.deleteButton = this.header.getByRole('button', {
      name: 'Delete Result',
    });
    this.indicatorResultModal = new IndicatorResultModal(page);
  }
}
