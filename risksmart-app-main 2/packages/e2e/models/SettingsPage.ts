import { expect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { ApproversTab } from './tabs/ApproversTab';
import { ColoursTab } from './tabs/ColoursTab';
import { DataImportTab } from './tabs/DataImportTab';
import { DepartmentsTab } from './tabs/DepartmentsTab';
import { EntitiesTab } from './tabs/EntitiesTab';
import { GroupsTab } from './tabs/GroupsTab';
import { ModulesTab } from './tabs/ModulesTab';
import { SsoConfigurationTab } from './tabs/SsoConfigurationTab';
import { TagsTab } from './tabs/TagsTab';
import { TaxonomyTab } from './tabs/TaxonomyTab';

export class SettingsPage extends BasePage {
  readonly tabs: Locator;
  readonly taxonomyTab: TaxonomyTab;
  readonly dataImportTab: DataImportTab;
  readonly groupsTab: GroupsTab;
  readonly approvalsTab: ApproversTab;
  readonly entitiesTab: EntitiesTab;
  readonly departmentsTab: DepartmentsTab;
  readonly tagsTab: TagsTab;
  readonly modulesTab: ModulesTab;
  readonly coloursTab: ColoursTab;
  readonly ssoConfigurationTab: SsoConfigurationTab;

  constructor(page: Page) {
    super(page);

    this.groupsTab = new GroupsTab(page);
    this.taxonomyTab = new TaxonomyTab(page);
    this.dataImportTab = new DataImportTab(page);
    this.approvalsTab = new ApproversTab(page);
    this.entitiesTab = new EntitiesTab(page);
    this.departmentsTab = new DepartmentsTab(page);
    this.tagsTab = new TagsTab(page);
    this.modulesTab = new ModulesTab(page);
    this.coloursTab = new ColoursTab(page);
    this.ssoConfigurationTab = new SsoConfigurationTab(page);
    this.tabs = page.locator(
      this.cloudScapeWrapper.findTabs().findTabLinks().toSelector()
    );
  }

  private async navigateTo() {
    await this.navigation.click('Settings');
  }

  async navigateToAndAssertTitle() {
    await this.navigateTo();
    await expect(this.header.title).toHaveText(`Settings`);
  }
}
