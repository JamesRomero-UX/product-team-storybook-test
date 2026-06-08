import type {
  MultiselectWrapper,
  SelectWrapper,
} from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';

export const testIdSelector = (testId: string) => `[data-testid="${testId}"]`;
export const getFormFieldTestId = (testId: string) => `form-field-${testId}`;

export const getFormField = (testId: string, rootElement?: HTMLElement) =>
  createWrapper(rootElement).findFormField(
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
