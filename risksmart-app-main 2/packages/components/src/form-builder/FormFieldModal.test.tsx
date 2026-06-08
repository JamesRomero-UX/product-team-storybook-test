import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  getFormField,
  getFormFieldTestId,
  selectOptionByLabel,
  testIdSelector,
} from '../testing/formHelpers';
import { getWrapper } from '../testing/wrapper';
import { FormFieldModal } from './FormFieldModal';
import { useFormBuilderFieldStore } from './store/useFormBuilderFieldStore';
import { useFormBuilderSectionStore } from './store/useFormBuilderSectionStore';
import { useFormBuilderStore } from './store/useFormBuilderStore';
import type { CustomSchema, CustomUISchema } from './types';
import { FieldOptionType } from './types';

// TEST UTILS
const initialFormBuilderStoreState = useFormBuilderStore.getInitialState();
const initialFormBuilderSectionStoreState =
  useFormBuilderSectionStore.getInitialState();
const initialFormBuilderFieldStoreState =
  useFormBuilderFieldStore.getInitialState();

const resetStores = () => {
  useFormBuilderStore.setState(initialFormBuilderStoreState, true);
  useFormBuilderSectionStore.setState(
    initialFormBuilderSectionStoreState,
    true
  );
  useFormBuilderFieldStore.setState(initialFormBuilderFieldStoreState, true);
};

const getFormBuilderStores = () => {
  const { result: formBuilderField } = renderHook(() =>
    useFormBuilderFieldStore()
  );
  const { result: formBuilderStore } = renderHook(() => useFormBuilderStore());

  return {
    formBuilderField,
    formBuilderStore,
  };
};

const formWithYesOrNoDropdownUiSchema: CustomUISchema = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'Group',
      label: 'Testing',
      id: 'section_2664ccb9-0b7c-4bb6-afae-8a72c344bd82',
      elements: [
        {
          type: 'Control',
          id: 'field_bbdf01bf-9b5c-43d8-98d8-f7b1c46aaa42',
          parentId: 'section_2664ccb9-0b7c-4bb6-afae-8a72c344bd82',
          scope: '#/properties/field_bbdf01bf-9b5c-43d8-98d8-f7b1c46aaa42',
          label: 'Yes or no',
          options: {
            fieldType: 'dropdown',
            placeholder: '',
            description: '',
          },
        },
      ],
    },
  ],
};

const formWithYesOrNoDropdownSchema: CustomSchema = {
  type: 'object',
  required: ['field_bbdf01bf-9b5c-43d8-98d8-f7b1c46aaa42'],
  properties: {
    'field_bbdf01bf-9b5c-43d8-98d8-f7b1c46aaa42': {
      parentId: 'section_2664ccb9-0b7c-4bb6-afae-8a72c344bd82',
      type: 'string',
      minLength: 1,
      isCustomisable: true,
      isConditional: false,
      allowAttachments: false,
      conditionalOptions: {
        operation: 'and',
        tokens: [],
      },
      oneOf: [
        {
          const: '81752e32-4593-41b5-a839-cb59da969c0c',
          title: 'Yes',
        },
        {
          const: '83b4977f-a823-4480-a7e5-5c66c7ead71f',
          title: 'No',
        },
      ],
    },
  },
};

const getFieldTitle = () => getFormField('#/properties/fieldTitle');
const getFieldType = () => getFormField('#/properties/fieldType');
const getSelectOptions = () => getFormField('#/properties/selectOptions');
const getIsPropertyRequired = () =>
  createWrapper().findToggle(testIdSelector('#/properties/isPropertyRequired'));
const getIsConditional = () =>
  createWrapper().findToggle(testIdSelector('#/properties/isConditional'));

const getConditionals = () => getFormField('#/properties/conditionalOptions');

const clickSave = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
};

const clickAddOption = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Add option' }));
};

const toggleIsRequired = async () => {
  const { formBuilderField } = getFormBuilderStores();
  const before = formBuilderField.current.fieldConfigData.isPropertyRequired;

  getIsPropertyRequired()!.findNativeInput().click();
  await waitFor(() => {
    expect(formBuilderField.current.fieldConfigData.isPropertyRequired).toEqual(
      !before
    );
  });
};

const toggleIsConditional = async () => {
  const { formBuilderField } = getFormBuilderStores();
  const before = formBuilderField.current.fieldConfigData.isConditional;

  getIsConditional()!.findNativeInput().click();
  await waitFor(() => {
    expect(formBuilderField.current.fieldConfigData.isConditional).toEqual(
      !before
    );
  });
};

const getSelectOptionsOption = (index: number) =>
  getSelectOptions()!
    .findControl()!
    .findFormField(testIdSelector(getFormFieldTestId(`option-${index}`)));

const setFieldTitle = async (fieldTitle: string) => {
  const { formBuilderField } = getFormBuilderStores();
  getFieldTitle()?.findControl()?.findInput()?.setInputValue(fieldTitle);
  await waitFor(() => {
    expect(formBuilderField.current.fieldConfigData.fieldTitle).toEqual(
      fieldTitle
    );
  });
};

const setSelectOption = async (index: number, value: string) => {
  const { formBuilderField } = getFormBuilderStores();
  getSelectOptionsOption(index)
    ?.findControl()
    ?.findInput()
    ?.setInputValue(value);
  await waitFor(() => {
    expect(
      formBuilderField.current.fieldConfigData.selectOptions?.[index]?.value
    ).toEqual(value);
  });
};

const setFieldType = async (
  fieldTypeLabel: string,
  fieldTypeValue: FieldOptionType
) => {
  const { formBuilderField } = getFormBuilderStores();
  const fieldTypeSelect = getFieldType()?.findControl()?.findSelect();
  await selectOptionByLabel(fieldTypeSelect!, fieldTypeLabel);

  await waitFor(() => {
    expect(formBuilderField.current.fieldConfigData.fieldType).toEqual(
      fieldTypeValue
    );
  });
};

const addCondition = (label: string, value: string) => {
  const propertyFilter = getConditionals()!
    .findControl()!
    .findPropertyFilter()!;
  propertyFilter.setInputValue(`${label}=${value}`);
  const navigateInput = propertyFilter.findNativeInput();
  navigateInput.keydown(13);
  navigateInput.keyup(13);
};

/**
 * Note for these tests, we need to wait for the onChange event to fire after each action by checking the value of formBuilderField.current.fieldConfigData
 */
describe('FormFieldModal', () => {
  beforeEach(() => {
    resetStores();
    const { formBuilderField, formBuilderStore } = getFormBuilderStores();

    act(() => {
      formBuilderField.current.setIsEditingField(true);
      formBuilderStore.current.setIsFormCustomisable(true);
    });

    render(<FormFieldModal />, { wrapper: getWrapper('router') });
  });

  it('shows render a title field', () => {
    expect(getFieldTitle()?.getElement()).toBeInTheDocument();
  });

  it('validates title after clicking save', async () => {
    await clickSave();

    expect(getFieldTitle()!.findError()?.getElement().textContent).toEqual(
      'This field is required'
    );
  });

  it('updates fieldConfigData when form is valid', async () => {
    await setFieldTitle('My Title');
    await clickSave();

    const titleFormField = createWrapper().findFormField();
    expect(
      titleFormField?.findError()?.getElement().textContent
    ).toBeUndefined();
  });

  it('dropdown options are required', async () => {
    await setFieldTitle('My Title');
    await setFieldType('Dropdown', FieldOptionType.Dropdown);

    await clickSave();

    expect(getSelectOptions()?.findError()?.getElement().textContent).toEqual(
      'This field is required'
    );
  });

  it('cannot add empty dropdown options', async () => {
    const { formBuilderField } = getFormBuilderStores();
    await setFieldTitle('My Title');
    await setFieldType('Dropdown', FieldOptionType.Dropdown);
    await clickAddOption();

    await waitFor(() => {
      expect(
        formBuilderField.current.fieldConfigData.selectOptions?.[0]?.value
      ).toEqual('');
    });

    await clickSave();

    expect(
      getSelectOptionsOption(0)!.findError()?.getElement().textContent
    ).toEqual('Option must have a value');
  });

  it('setting drop down option value removed validation error', async () => {
    await setFieldTitle('My Title');
    await setFieldType('Dropdown', FieldOptionType.Dropdown);
    await clickAddOption();
    await setSelectOption(0, 'Option A');

    await clickSave();

    expect(
      getSelectOptionsOption(0)!.findError()?.getElement().textContent
    ).toBeUndefined();
  });

  it('"Show when" required when setting "Add conditional logic" to true', async () => {
    expect(getConditionals()).toBeNull();

    await toggleIsRequired(); // Currently cannot be required and conditional...
    await toggleIsConditional();

    expect(getConditionals()).not.toBeNull();

    expect(
      screen.queryByText(
        'No valid sources for conditional logic. Create a dropdown or radio field first.'
      )
    ).toBeInTheDocument();
  });

  describe('when the existing form has a dropdown field', () => {
    beforeEach(async () => {
      const { formBuilderStore } = getFormBuilderStores();

      await waitFor(() => {
        formBuilderStore.current.setUISchema(formWithYesOrNoDropdownUiSchema);
        formBuilderStore.current.setSchema(formWithYesOrNoDropdownSchema);
      });
    });

    it('No valid sources for conditional rendering not displayed when there is a dropdown field in the form', async () => {
      expect(getConditionals()).toBeNull();

      await toggleIsRequired();
      await toggleIsConditional();

      expect(getConditionals()).not.toBeNull();

      expect(
        screen.queryByText('No valid sources for conditional rendering')
      ).not.toBeInTheDocument();
    });

    it('Conditionals required when "Is Conditional" is true', async () => {
      expect(getConditionals()).toBeNull();

      await toggleIsRequired();
      await toggleIsConditional();

      await clickSave();

      expect(getConditionals()?.findError()?.getElement().textContent).toEqual(
        'This field is required'
      );
    });

    it('Cannot have two conditionals for the same field', async () => {
      const { formBuilderField } = getFormBuilderStores();

      expect(getConditionals()).toBeNull();

      await toggleIsRequired(); // Currently cannot be required and conditional...
      await toggleIsConditional();

      addCondition('Yes or no', 'Yes');

      await waitFor(() => {
        expect(
          formBuilderField.current.fieldConfigData.conditionalOptions
        ).toEqual({
          operation: 'and',
          tokens: [
            {
              operator: '=',
              propertyKey: 'field_bbdf01bf-9b5c-43d8-98d8-f7b1c46aaa42',
              value: ['81752e32-4593-41b5-a839-cb59da969c0c'],
            },
          ],
        });
      });

      addCondition('Yes or no', 'Yes');

      await waitFor(() => {
        expect(
          formBuilderField.current.fieldConfigData.conditionalOptions
        ).toEqual({
          operation: 'and',
          tokens: [
            {
              operator: '=',
              propertyKey: 'field_bbdf01bf-9b5c-43d8-98d8-f7b1c46aaa42',
              value: ['81752e32-4593-41b5-a839-cb59da969c0c'],
            },
            {
              operator: '=',
              propertyKey: 'field_bbdf01bf-9b5c-43d8-98d8-f7b1c46aaa42',
              value: ['81752e32-4593-41b5-a839-cb59da969c0c'],
            },
          ],
        });
      });

      await clickSave();

      expect(getConditionals()?.findError()?.getElement().textContent).toEqual(
        'One or more options have been added multiple times. Remove any duplicates and try again.'
      );
    });

    it('Conditions valid with a single entered condition', async () => {
      const { formBuilderField } = getFormBuilderStores();
      expect(getConditionals()).toBeNull();

      await toggleIsRequired();
      await toggleIsConditional();

      addCondition('Yes or no', 'Yes');

      await waitFor(() => {
        expect(
          formBuilderField.current.fieldConfigData.conditionalOptions
        ).toEqual({
          operation: 'and',
          tokens: [
            {
              operator: '=',
              propertyKey: 'field_bbdf01bf-9b5c-43d8-98d8-f7b1c46aaa42',
              value: ['81752e32-4593-41b5-a839-cb59da969c0c'],
            },
          ],
        });
      });

      await clickSave();

      expect(
        getConditionals()?.findError()?.getElement().textContent
      ).toBeUndefined();
    });
  });
});
