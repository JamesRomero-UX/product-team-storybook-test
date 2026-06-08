import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { DocumentRatingModal } from '../modals/DocumentRatingModal';
import { Tab } from './Tab';

export class DocumentRatingsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly ratingModal: DocumentRatingModal;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page, 'ratings');
    this.table = new TableComponent(page);
    this.deleteButton = page.getByRole('button', {
      name: 'Delete',
      exact: true,
    });

    this.addButton = this.header.getByRole('button', { name: 'Add rating' });
    this.ratingModal = new DocumentRatingModal(page);
  }
}
