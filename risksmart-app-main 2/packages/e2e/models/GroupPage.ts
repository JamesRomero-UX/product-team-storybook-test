import { type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { GroupMembersTab } from './tabs/GroupMembersTab';

export class GroupPage extends BasePage {
  readonly groupMembersTab: GroupMembersTab;
  constructor(page: Page) {
    super(page);
    this.groupMembersTab = new GroupMembersTab(page);
  }
}
