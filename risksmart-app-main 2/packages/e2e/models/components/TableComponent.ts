import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type {
  ElementWrapper,
  PropertyFilterWrapper,
  TableWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/selectors';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/selectors';

export class TableComponent {
  readonly page: Page;
  readonly tableWrapper: TableWrapper;
  readonly cloudScapeWrapper: ElementWrapper;
  readonly propertyFilterWrapper: PropertyFilterWrapper;
  readonly filterInput: Locator;
  readonly clearFiltersButton: Locator;
  readonly preferencesConfirmButton: Locator;

  constructor(page: Page, tableSelector: string | undefined = undefined) {
    this.page = page;
    this.cloudScapeWrapper = createWrapper();
    this.tableWrapper = this.cloudScapeWrapper.findTable(tableSelector);
    this.propertyFilterWrapper = this.tableWrapper.findPropertyFilter();
    this.filterInput = page.locator(
      this.propertyFilterWrapper.findNativeInput().toSelector()
    );
    this.clearFiltersButton = page.getByText('Clear filters');
    this.preferencesConfirmButton = this.page.locator(
      this.tableWrapper
        .findCollectionPreferences()
        ?.findModal()
        ?.findConfirmButton()
        .toSelector()
    );
  }

  /**
   * Sets the filter input value and submits the filter.
   * @param filterText - The text to filter the table by.
   */
  async setFilterInput(filterText: string) {
    await this.filterInput.fill(filterText);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Sets the filter input using a name-value pair (e.g., "name=value").
   * @param name - The filter field name.
   * @param value - The filter value.
   */
  async setFilterInputByNameAndValue(name: string, value: string) {
    await this.setFilterInput(`${name}=${value}`);
  }

  /**
   * Sorts the table by the specified column header.
   * @param columnHeader - The column header to sort by.
   */
  async sortColumn(columnHeader: string) {
    const columnIndex = await this.getColumnIndex(columnHeader);

    const columnSortArea = this.page.locator(
      this.tableWrapper.findColumnSortingArea(columnIndex + 1).toSelector()
    );
    await columnSortArea.click();
  }

  /**
   * Returns a locator for the currently ascending sorted column.
   */
  async getAscSortedColumn() {
    return this.page.locator(
      this.tableWrapper.findAscSortedColumn().toSelector()
    );
  }

  /**
   * Returns a locator for the currently descending sorted column.
   */
  async getDescSortedColumn() {
    return this.page.locator(
      this.tableWrapper.findDescSortedColumn().toSelector()
    );
  }

  /**
   * Opens the table preferences modal.
   */
  openPreferencesModals = async () => {
    const preferences = this.tableWrapper?.findCollectionPreferences();
    await this.page
      .locator(preferences?.findTriggerButton().toSelector())
      .click();
  };

  /**
   * Gets the display option labels from the preferences modal.
   * @returns An array of display option labels.
   */
  getDisplayOptionsText = async () => {
    const optionsSelector = this.page.locator(
      this.tableWrapper
        ?.findCollectionPreferences()
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions()
        .toSelector()
    );
    const options = await optionsSelector.all();
    if (options.length === 0) {
      throw new Error('Display options not found');
    }
    const labels: (string | null)[] = [];
    for (const option of options) {
      labels.push(await option.textContent());
    }

    return labels;
  };

  /**
   * Gets the list of currently visible columns.
   * @returns An array of visible column labels.
   */
  getVisibleColumns = async (): Promise<string[]> => {
    await this.openPreferencesModals();
    const displayOptionLabels = await this.getDisplayOptionsText();
    const visibleColumns: string[] = [];
    for (const column of displayOptionLabels) {
      if (!column) {
        continue;
      }
      const input = this.page.locator(
        this.tableWrapper
          .findCollectionPreferences()
          ?.findModal()
          ?.findContentDisplayPreference()
          ?.findOptions()
          .get(displayOptionLabels.indexOf(column) + 1)
          .findVisibilityToggle()
          .find('input')
          .toSelector()
      );
      const isChecked = await input.isChecked();
      if (isChecked) {
        visibleColumns.push(column);
      }
    }

    return visibleColumns;
  };

  /**
   * Toggles the visibility of a column in the preferences modal.
   * @param columnLabel - The label of the column to toggle.
   * @param visible - Whether the column should be visible (true), hidden (false), or toggled (null).
   * @param displayOptionLabels - Optional pre-fetched display option labels to avoid re-querying the DOM.
   */
  private toggleColumnVisibility = async (
    columnLabel: string,
    visible: boolean | null = null,
    displayOptionLabels?: (string | null)[]
  ) => {
    const labels = displayOptionLabels ?? (await this.getDisplayOptionsText());
    const labelIndex = labels.indexOf(columnLabel);
    if (labelIndex == -1) {
      throw new Error(`${columnLabel} not found`);
    }
    const input = this.page.locator(
      this.tableWrapper
        .findCollectionPreferences()
        ?.findModal()
        ?.findContentDisplayPreference()
        ?.findOptions()
        .get(labelIndex + 1)
        .findVisibilityToggle()
        .find('input')
        .toSelector()
    );
    const isChecked = await input.isChecked();
    if (visible === null || visible !== isChecked) {
      await input.scrollIntoViewIfNeeded();
      await input.click({ force: true });
    }
  };

  /**
   * Toggles the visibility of all columns based on the provided list.
   * @param visibleColumns - Array of column labels to be visible.
   */
  toggleVisibleColumns = async (visibleColumns: string[]) => {
    await this.openPreferencesModals();

    const displayOptionLabels = await this.getDisplayOptionsText();
    const missingColumns = visibleColumns.filter(
      (vc) => !displayOptionLabels.includes(vc)
    );
    if (missingColumns.length > 0) {
      throw new Error(
        `Missing the following columns: ${missingColumns.join(', ')}`
      );
    }

    for (const columnLabel of displayOptionLabels) {
      if (columnLabel) {
        await this.toggleColumnVisibility(
          columnLabel,
          visibleColumns.includes(columnLabel),
          displayOptionLabels
        );
      }
    }
    await this.preferencesConfirmButton.click();
  };

  /**
   * Makes all columns visible in the table.
   */
  toggleAllColumnsToBeVisible = async () => {
    await this.openPreferencesModals();
    const displayOptionLabels = await this.getDisplayOptionsText();

    for (const columnLabel of displayOptionLabels) {
      if (columnLabel) {
        await this.toggleColumnVisibility(
          columnLabel,
          true,
          displayOptionLabels
        );
      }
    }
    await this.preferencesConfirmButton.click();
  };

  /**
   * Toggles the visibility of a column from the table preferences modal.
   * @param columnLabel - The label of the column to toggle.
   * @param visible - Whether the column should be visible (true), hidden (false), or toggled (null).
   */
  toggleColumnVisibilityFromTable = async (
    columnLabel: string,
    visible?: boolean | null
  ) => {
    await this.openPreferencesModals();
    await this.toggleColumnVisibility(columnLabel, visible);
    await this.preferencesConfirmButton.click();
  };

  /**
   * Gets the index of a column by its header text.
   * @param columnHeader - The header text of the column.
   * @returns The index of the column.
   * @throws If the column is not found.
   */
  private async getColumnIndex(columnHeader: string) {
    const headers = await this.getHeadersText();

    const index = headers.indexOf(columnHeader);
    if (index === -1) {
      throw new Error(`Column not found ${columnHeader}`);
    }

    return index;
  }

  /**
   * Gets the text content of all column headers.
   * @returns An array of header texts.
   */
  async getHeadersText(): Promise<string[]> {
    const selector = this.tableWrapper?.findColumnHeaders().toSelector();
    const headersLocator = this.page.locator(selector);

    await headersLocator.first().waitFor({ state: 'visible', timeout: 10000 });

    const headersText = await this.page.$$eval(selector, (elements) =>
      elements.map((el) => el.textContent ?? '')
    );

    return headersText;
  }

  /**
   * Gets the number of rows in the table.
   * @returns The row count.
   */
  async getRowCount() {
    const rowsLocator = this.page.locator(
      this.tableWrapper.findRows().toSelector()
    );

    return await rowsLocator.count();
  }

  /**
   * Asserts that the table has the expected number of rows.
   * @param count - The expected row count.
   */
  async expectRowCount(count: number) {
    await expect
      .poll(
        async () => {
          return await this.getRowCount();
        },
        { timeout: 10000 }
      )
      .toEqual(count);
  }

  /**
   * Gets the contents of a row as an object mapping header to cell value.
   * @param row - The row number (1-based).
   * @returns An object mapping header to cell value.
   */
  async getRowAsObject(row: number) {
    const headers = await this.getHeadersText();
    const rowObject: { [header: string]: string | string[] | null } = {};
    for (const header of headers) {
      const bodyCell = await this.getBodyCell(header, row);
      const isBadgeList = await bodyCell.getByTestId('badgeList').isVisible();
      if (isBadgeList) {
        rowObject[header] = await bodyCell
          .getByTestId('badge')
          .allTextContents();
      } else {
        rowObject[header] = await bodyCell.textContent();
      }
    }

    return rowObject;
  }

  /**
   * Asserts that a row contains the expected values.
   * @param rowNumber - The row number (1-based).
   * @param expectedValues - The expected values as a key-value object.
   */
  async expectRowToContain(
    rowNumber: number,
    expectedValues: Record<string, unknown>
  ) {
    const row = await this.getRowAsObject(rowNumber);

    await expect(row).toEqual(expect.objectContaining(expectedValues));
  }

  /**
   * Asserts that the table contains a row with the expected values.
   * @param expectedValues - The expected values as a key-value object.
   * @throws If no row contains the expected values.
   */
  async expectTableToContain(expectedValues: Record<string, unknown>) {
    const rows = await this.getRowCount();
    for (let i = 1; i <= rows; i++) {
      const row = await this.getRowAsObject(i);
      try {
        expect(row).toEqual(expect.objectContaining(expectedValues));

        return;
      } catch {
        continue;
      }
    }
    throw new Error('Table does not contain expected values');
  }

  /**
   * Checks the checkbox in the first cell of the specified row.
   * @param row - The row number (1-based).
   */
  async checkRow(row: number) {
    await this.page
      .locator(this.tableWrapper.findBodyCell(row, 1).toSelector())
      .getByRole('checkbox')
      .check();
  }

  /**
   * Checks the radio button in the first cell of the specified row.
   * @param row - The row number (1-based).
   */
  async checkRowSingle(row: number) {
    await this.page
      .locator(this.tableWrapper.findBodyCell(row, 1).toSelector())
      .getByRole('radio')
      .check();
  }

  /**
   * Gets the locator for a body cell by column header and row number.
   * @param columnHeader - The column header text.
   * @param row - The row number (1-based).
   * @returns The locator for the cell.
   */
  async getBodyCell(columnHeader: string, row: number) {
    const columnIndex = await this.getColumnIndex(columnHeader);

    return this.page.locator(
      this.tableWrapper.findBodyCell(row, columnIndex + 1).toSelector()
    );
  }

  /**
   * Clicks a cell containing the specified text in the given column and row.
   * @param columnHeader - The column header text.
   * @param row - The row number (1-based).
   * @param text - The text to click within the cell.
   */
  async clickCellText(columnHeader: string, row: number, text: string) {
    return (await this.getBodyCell(columnHeader, row)).getByText(text).click();
  }

  /**
   * Clicks the link in the specified cell.
   * @param columnHeader - The column header text.
   * @param row - The row number (1-based).
   */
  async clickCellLink(columnHeader: string, row: number) {
    return (await this.getBodyCell(columnHeader, row))
      .getByRole('link')
      .click();
  }
}
