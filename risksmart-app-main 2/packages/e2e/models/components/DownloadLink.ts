import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';
import fs from 'fs';

export class DownloadLink {
  readonly downloadTemplateLink: Locator;
  readonly page: Page;
  constructor(page: Page, linkText: string) {
    this.page = page;

    this.downloadTemplateLink = page.getByText(linkText);
  }

  async downloadAndReturnContent() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadTemplateLink.click();
    const download = await downloadPromise;
    const path = `downloads/${download.suggestedFilename()}`;
    await download.saveAs(path);

    // no-dd-sa
    return fs.readFileSync(path, 'utf8');
  }
}
