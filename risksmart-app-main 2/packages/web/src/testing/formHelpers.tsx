import type {
  MultiselectWrapper,
  SelectWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

export const getAlertMessage = (container: HTMLElement) =>
  createWrapper(container).findAlert()?.findHeader()?.getElement().innerText;

export const getSaveButton = () => screen.getByRole('button', { name: 'Save' });

export const getFormFieldTestId = (testId: string) => `form-field-${testId}`;

export const getFormField = (container: HTMLElement, testId: string) =>
  createWrapper(container).findFormField(
    testIdSelector(getFormFieldTestId(testId))
  );

const getSelectOptionIndex = (
  select: MultiselectWrapper | SelectWrapper,
  label: string
) => {
  const optionLabels = select
    .findDropdown()
    .findOptions()
    .map((o) => o.getElement().textContent);

  return optionLabels.indexOf(label);
};

export const selectOptionByLabel = (
  select: MultiselectWrapper | SelectWrapper,
  label: string
) => {
  select.openDropdown();
  const index = getSelectOptionIndex(select, label);
  // 1 based index
  select.selectOption(index + 1);
};

export const selectOptionsByLabel = (
  select: MultiselectWrapper,
  labels: string[]
) => {
  select.openDropdown();
  labels.forEach((label) => {
    const index = getSelectOptionIndex(select, label);
    // 1 based index
    select.selectOption(index + 1);
  });
};

export const testIdSelector = (testId: string) => `[data-testid="${testId}"]`;

export const getRadioButtonLabel = (
  container: HTMLElement,
  testId: string,
  index: number
) =>
  getRadioButtonAt(container, testId, index)?.findLabel().getElement()
    .textContent;

const getRadioButtonAt = (
  container: HTMLElement,
  testId: string,
  index: number
) =>
  getFormField(container, testId)
    ?.findControl()
    ?.findRadioGroup()
    ?.findButtons()
    .at(index);

export const getRadioButtonInputElement = (
  container: HTMLElement,
  testId: string,
  index: number
) =>
  getRadioButtonAt(container, testId, index)
    ?.find('[type=radio]')
    ?.getElement() as HTMLInputElement;

export const getValidationMessage = (container: HTMLElement, testId: string) =>
  getFormField(container, testId)?.findError()?.getElement().innerText;

/**
 * @deprecated wait for required elements instead e.g. findFormContext
 */
export const waitUntilLoaded = () => {
  try {
    const loader = screen.getByTestId('loading');

    return waitForElementToBeRemoved(loader);
  } catch {
    return Promise.resolve();
  }
};
export const waitUntilLoadedDoesNotExist = () =>
  waitFor(async () => !(await screen.findByTestId('loading')), {
    timeout: 5000,
  });

/**
 * Ensures form content has loaded
 * @returns
 */
export const findCustomisableFormContent = () =>
  screen.findByTestId('customisable-form-content');

export const findFormContext = () => screen.findByTestId('form-context');
