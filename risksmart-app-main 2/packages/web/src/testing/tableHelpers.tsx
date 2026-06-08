import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { waitFor } from '@testing-library/react';
import { indexOf } from 'lodash';

export const getHeadersText = (container: HTMLElement): (null | string)[] => {
  const headers = createWrapper(container).findTable()?.findColumnHeaders();
  if (!headers) {
    throw new Error('headers not found');
  }
  const headersText: (null | string)[] = [];
  for (const header of headers) {
    headersText.push(header.getElement().textContent);
  }

  return headersText;
};

export const waitForTableHeaders = async (container: HTMLElement) => {
  await waitFor(() => {
    expect(
      createWrapper(container).findTable()?.findColumnHeaders()
    ).toBeDefined();
  });
};

export const getDisplayOptionsText = (container: HTMLElement) => {
  const options = createWrapper(container)
    .findTable()
    ?.findCollectionPreferences()
    ?.findModal()
    ?.findContentDisplayPreference()
    ?.findOptions();
  if (!options) {
    throw new Error('Display options not found');
  }
  const labels: (null | string)[] = [];
  for (const option of options) {
    labels.push(option.getElement().textContent);
  }

  return labels;
};

export const openPreferencesModals = (container: HTMLElement) => {
  const preferences = createWrapper(container)
    .findTable()
    ?.findCollectionPreferences();
  preferences?.findTriggerButton().click();
};

/**
 * @param container
 * @param column Column header label
 * @param row 1 based index
 * @returns
 */
export const getCellText = (
  container: HTMLElement,
  column: string,
  row = 1
) => {
  return getCellContent(container, column, row)?.getElement().textContent;
};

export const getRowCount = (container: HTMLElement) =>
  createWrapper(container).findTable()?.findRows().length;
export const getRowAsObject = (container: HTMLElement, row = 1) => {
  const headersText = getHeadersText(container);
  const rowObject: { [header: string]: null | string | undefined } = {};
  for (const header of headersText) {
    if (header) {
      rowObject[header] = getCellText(container, header, row);
    }
  }

  return rowObject;
};

/**
 * @param container
 * @param column Column header label
 * @param row 1 based index
 * @returns
 */
export const getCellContent = (
  container: HTMLElement,
  column: string,
  row = 1
) => {
  const headersText = getHeadersText(container);
  expect(headersText).toContain(column);

  return createWrapper(container)
    .findTable()
    ?.findBodyCell(row, headersText.indexOf(column) + 1);
};

export const getEmptyCollectionSlotText = (
  container: HTMLElement,
  elementIndex: number
) => {
  const emptyTableSlotItems = createWrapper(container)
    .findTable()
    ?.findEmptySlot()
    ?.getElement().children[0].children;

  return emptyTableSlotItems?.item(elementIndex)?.textContent;
};

/**
 * Toggle visible columns (starting from a closed preferences dialog)
 *
 * @param container
 * @param columnLabel
 */
export const toggleColumnVisibilityFromTable = (
  container: HTMLElement,
  columnLabel: string
) => {
  openPreferencesModals(container);
  toggleColumnVisibility(container, columnLabel);

  createWrapper(container)
    .findTable()
    ?.findCollectionPreferences()
    ?.findModal()
    ?.findConfirmButton()
    ?.click();
};

/**
 * Toggle visible columns from within the preferences dialog
 *
 * @param container
 * @param columnLabel
 */
const toggleColumnVisibility = (
  container: HTMLElement,
  columnLabel: string
) => {
  const displayOptionLabels = getDisplayOptionsText(container);
  const labelIndex = indexOf(displayOptionLabels, columnLabel);
  if (labelIndex == -1) {
    throw new Error(`${columnLabel} not found`);
  }
  createWrapper(container)
    .findTable()
    ?.findCollectionPreferences()
    ?.findModal()
    ?.findContentDisplayPreference()
    ?.findOptions()
    // eslint-disable-next-line no-unexpected-multiline
    [labelIndex].findVisibilityToggle()
    .find('input')
    ?.click();
};
