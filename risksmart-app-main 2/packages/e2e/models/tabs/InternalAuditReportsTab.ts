import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { ReportModal } from '../modals/ReportModal';
import { Tab } from './Tab';

export class InternalAuditReportsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly reportModal: ReportModal;
  constructor(page: Page) {
    super(page, 'reports');
    this.table = new TableComponent(page);
    this.addButton = page.getByText('Add Report');
    this.reportModal = new ReportModal(page);
  }
}
