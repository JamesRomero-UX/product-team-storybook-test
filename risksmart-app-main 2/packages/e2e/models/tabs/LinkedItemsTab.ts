import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { LinkItemsModal } from '../modals/LinkItemsModal';
import { RemoveLinkModal } from '../modals/RemoveLinkModal';
import { Tab } from './Tab';

export class LinkedItemsTab extends Tab {
  readonly table: TableComponent;
  readonly linkItemsButton: Locator;
  readonly unlinkButton: Locator;
  readonly linkItemsModal: LinkItemsModal;
  readonly removeLinkModal: RemoveLinkModal;

  constructor(page: Page) {
    super(page, 'linkedItems');
    this.table = new TableComponent(page);
    this.linkItemsButton = this.header.getByRole('button', {
      name: 'Link items',
    });
    this.unlinkButton = this.header.getByRole('button', {
      name: 'Unlink',
    });
    this.linkItemsModal = new LinkItemsModal(page);
    this.removeLinkModal = new RemoveLinkModal(page);
  }
}
