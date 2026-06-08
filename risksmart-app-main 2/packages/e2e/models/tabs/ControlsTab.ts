import type { Locator, Page } from '@playwright/test';

import { TableComponent } from '../components/TableComponent';
import { ControlModal } from '../modals/ControlModal';
import { LinkItemsModal } from '../modals/LinkItemsModal';
import { Tab } from './Tab';

export class ControlsTab extends Tab {
  readonly table: TableComponent;
  readonly addControlOption: Locator;
  readonly linkControlOption: Locator;
  readonly actionsMenuButton: Locator;
  readonly deleteButton: Locator;
  readonly addControlModal: ControlModal;
  readonly linkControlModal: LinkItemsModal;

  constructor(page: Page) {
    super(page, 'controls');
    this.table = new TableComponent(page);

    this.actionsMenuButton = this.header.getByTestId('control-actions');
    this.addControlOption = this.header.getByRole('menuitem', {
      name: 'Add Control',
    });
    this.linkControlOption = this.header.getByRole('menuitem', {
      name: 'Link Control',
    });
    this.deleteButton = this.header.getByRole('button', { name: 'Delete' });
    this.addControlModal = new ControlModal(page);
    this.linkControlModal = new LinkItemsModal(page);
  }
}
