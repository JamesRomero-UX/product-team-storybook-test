import type { PropertyFilterProps } from '@risk-smart/themed-cloudscape-components/property-filter';

export const defaultPropertyFilterI18nStrings: PropertyFilterProps.I18nStrings =
  {
    filteringAriaLabel: 'your choice',
    dismissAriaLabel: 'Dismiss',
    clearAriaLabel: 'Clear',

    filteringPlaceholder: 'Filter by free text, property or value',
    groupValuesText: 'Values',
    groupPropertiesText: 'Properties',
    operatorsText: 'Operators',

    operationAndText: 'and',
    operationOrText: 'or',

    operatorLessText: 'Less than',
    operatorLessOrEqualText: 'Less than or equal',
    operatorGreaterText: 'Greater than',
    operatorGreaterOrEqualText: 'Greater than or equal',
    operatorContainsText: 'Contains',
    operatorDoesNotContainText: 'Does not contain',
    operatorEqualsText: 'Equals',
    operatorDoesNotEqualText: 'Does not equal',

    editTokenHeader: 'Edit filter',
    propertyText: 'Property',
    operatorText: 'Operator',
    valueText: 'Value',
    cancelActionText: 'Cancel',
    applyActionText: 'Apply',
    allPropertiesLabel: 'All properties',

    tokenLimitShowMore: 'Show more',
    tokenLimitShowFewer: 'Show fewer',
    clearFiltersText: 'Clear filters',
    removeTokenButtonAriaLabel: (token) =>
      `Remove token ${token.propertyKey} ${token.operator} ${token.value}`,
    enteredTextLabel: (text) => `Use: "${text}"`,

    tokenEditorTokenRemoveLabel: 'Remove filter',
    tokenEditorTokenRemoveFromGroupLabel: 'Remove filter from group',
    operatorStartsWithText: 'Starts with',
    operatorDoesNotStartWithText: 'Does not start with',
    tokenEditorAddTokenActionsAriaLabel: 'Add filter actions',
    tokenEditorAddNewTokenLabel: 'Add new filter',
    tokenEditorAddExistingTokenLabel: (
      token: PropertyFilterProps.FormattedToken
    ) =>
      `Add filter ${token.propertyLabel} ${token.operator} ${token.value} to group`,
  };
