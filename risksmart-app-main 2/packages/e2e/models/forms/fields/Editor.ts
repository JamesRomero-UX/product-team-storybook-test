import type { Locator } from '@playwright/test';
import { type Page } from '@playwright/test';

import type { FormFieldValue } from '../BaseForm';
import { CustomisableField } from './CustomisableField';

export class Editor extends CustomisableField {
  readonly page: Page | Locator;

  constructor(page: Page | Locator, testId: string, parentSelector?: string) {
    super(page, testId, parentSelector);
    this.page = page;
  }
  async isDisabled(): Promise<boolean> {
    const page = 'page' in this.page ? this.page.page() : this.page;

    await this.waitForTinyMce();
    // eslint-disable-next-line
    return page.evaluate(() => {
      // @ts-ignore
      // eslint-disable-next-line
      return window.tinymce.activeEditor.readonly;
    });
  }

  async setValue(value: string | string[]): Promise<void> {
    await this.waitForTinyMce();
    const page = 'page' in this.page ? this.page.page() : this.page;

    // eslint-disable-next-line
    return page.evaluate((content) => {
      // @ts-ignore
      // eslint-disable-next-line
      return window.tinymce.activeEditor.setContent(content);
    }, value);
  }

  /**
   * Wait for TinyMce to have loaded before performing actions on it
   */
  private async waitForTinyMce() {
    const page = 'page' in this.page ? this.page.page() : this.page;

    await page.waitForFunction(
      // eslint-disable-next-line
      () => !!(window as any).tinymce?.activeEditor?.initialized
    );
  }

  async getValue(): Promise<FormFieldValue> {
    await this.waitForTinyMce();
    const page = 'page' in this.page ? this.page.page() : this.page;
    // eslint-disable-next-line
    return page.evaluate(() =>
      // @ts-ignore
      // eslint-disable-next-line
      window.tinymce.activeEditor.getContent()
    );
  }
}
