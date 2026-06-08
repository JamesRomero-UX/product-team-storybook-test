import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { ObligationRatingModal } from '../modals/ObligationRatingModal';
import { Tab } from './Tab';

export class ObligationRatingsTab extends Tab {
  readonly table: TableComponent;
  readonly addButton: Locator;
  readonly ratingModal: ObligationRatingModal;

  constructor(page: Page) {
    super(page, 'ratings');
    this.table = new TableComponent(page);

    this.addButton = this.header.getByRole('button', { name: 'Add rating' });
    this.ratingModal = new ObligationRatingModal(page);
  }
}
