import type { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { DownloadLink } from './components/DownloadLink';
import { DataImportForm } from './forms/DataImportForm';
import { DeleteModal } from './modals/DeleteModal';
import { DataImportResultsTab } from './tabs/DataImportResultsTab';

export class DataImportDetailsPage extends BasePage {
  readonly deleteButton: Locator;
  readonly dataImportForm: DataImportForm;
  readonly dataImportResultsTab: DataImportResultsTab;
  readonly deleteModal: DeleteModal;

  constructor(page: Page) {
    super(page);
    this.deleteButton = page.getByText('Delete', { exact: true });
    this.deleteModal = new DeleteModal(page);
    this.dataImportResultsTab = new DataImportResultsTab(page);
    this.dataImportForm = new DataImportForm(page);
  }

  getDownloadLink(file: 'risks' | 'controls' | 'users' | 'contributors') {
    return new DownloadLink(this.page, `Download ${file}.csv template`);
  }
}
