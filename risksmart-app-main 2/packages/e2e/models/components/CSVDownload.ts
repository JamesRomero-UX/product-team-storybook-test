import { type Page } from '@playwright/test';
import fs from 'fs';

export class CSVDownload {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async downloadAndReturnContent() {
    const downloadPromise = this.page.waitForEvent('download');
    const link = this.page.getByRole('button', { name: 'Export', exact: true });
    await link.click();
    const downloadTemplateLink = this.page.getByTestId('csv');
    await downloadTemplateLink.click();

    const download = await downloadPromise;
    const path = `downloads/${download.suggestedFilename()}`;
    await download.saveAs(path);

    // no-dd-sa
    return fs.readFileSync(path, 'utf8');
  }
}
