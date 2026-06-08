import { CustomAttributeFieldType } from '@risksmart-app/form-configuration/src/field-types/types';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { findFormContext } from 'src/testing/formHelpers';
import { mockedDepartmentsResponse } from 'src/testing/mock-data/mockedDepartmentTypeResponses';
import { mockedFormConfigurationByParentTypeResponse } from 'src/testing/mock-data/mockedFormConfigurationByParentTypeResponses';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { mockedUsersResponse } from 'src/testing/mock-data/mockedUserResponses';
import { TestFormProvider } from 'src/testing/TestFormProvider';
import {
  defaultFormProvidersWithFeatures,
  getWrapper,
} from 'src/testing/wrapper';
import { vi, vitest } from 'vitest';

import { EditFieldModal } from './EditFieldModal';
import type { EditFieldModalProps } from './EditFieldModalProps';
import { EditMode } from './types';

vitest.mock('@/hooks/useIsFeatureFlagEnabled', () => ({
  useIsFeatureFlagEnabled: vi.fn().mockReturnValue(false),
  useIsFeatureFlagEnabledLazy: vi.fn().mockReturnValue(() => false),
}));

describe('EditFieldModal', () => {
  beforeEach(() => {
    vitest.resetAllMocks();
  });

  const getAddOptionButton = () =>
    screen.getByRole('button', {
      name: 'Add option',
    });

  const getDefaultValueInput = () =>
    screen.queryByLabelText<HTMLInputElement>('Default value');

  const getSetDefaultValueToggle = () =>
    screen.queryByLabelText<HTMLInputElement>('Set default value');

  const getLabelInput = () =>
    screen.queryByLabelText<HTMLInputElement>('Label');

  const getCustomLabelToggle = () => screen.queryByLabelText('Custom label');

  const defaultProps: EditFieldModalProps = {
    onDismiss: vi.fn(),
    parentType: Parent_Type_Enum.Risk,
    editMode: EditMode.Update,
    fieldId: '1705065468748_text',
    fieldPath: 'myCustomField',
    values: {
      Hidden: false,
      CustomFieldLabel: 'A label',
      ReadOnly: false,
      Required: false,
      CustomFieldShowAltValues: false,
      CustomFieldType: CustomAttributeFieldType.Text,
      IsCustomField: true,
      EnableCustomLabel: false,
    },
    defaultValueOptions: [],
  };

  const defaultMocks = [
    mockedGetOrganisation(),
    mockedRoleAccessResponse(),
    mockedGetOrganisationModuleResponse(),
    mockedGetAggregationResponse(),
    mockedDepartmentsResponse,
    mockedUsersResponse(),
  ];

  it('should allow editing label when field is custom', async () => {
    render(
      <TestFormProvider parentType={Parent_Type_Enum.Risk}>
        <EditFieldModal {...defaultProps} />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedFormConfigurationByParentTypeResponse(
              [Parent_Type_Enum.Risk],
              {
                form_configuration: [
                  {
                    __typename: 'form_configuration',
                    fields_config: [],
                    ParentType: Parent_Type_Enum.Risk,
                    createdByUser: {
                      __typename: 'user',
                      FriendlyName: 'marcell',
                    },
                    customAttributeSchema: {
                      __typename: 'custom_attribute_schema',
                      UiSchema: {
                        type: 'VerticalLayout',
                        elements: [
                          {
                            type: 'Control',
                            label: 'Hello',
                            scope: '#/properties/1705065468748_text',
                          },
                        ],
                      },
                      Schema: {
                        properties: {
                          '1705065468748_text': {
                            type: 'string',
                            description: 'uischema defined text input',
                          },
                        },
                      },
                      Id: '542f111e-b540-414d-bce7-26b622cdd181',
                    },
                  },
                ],
              }
            ),
          ],
          ...defaultFormProvidersWithFeatures
        ),
      }
    );
    await findFormContext();
    const label = await getLabelInput();
    expect(label).toBeEnabled();
  });

  it('should allow editing label when field is standard', async () => {
    render(
      <TestFormProvider parentType={Parent_Type_Enum.Risk}>
        <EditFieldModal
          {...defaultProps}
          values={{
            ...defaultProps.values!,
            Label: 'A label',
            IsCustomField: false,
          }}
        />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedFormConfigurationByParentTypeResponse([
              Parent_Type_Enum.Risk,
            ]),
          ],
          ...defaultFormProvidersWithFeatures
        ),
      }
    );

    const customLabelToggle = await getCustomLabelToggle();
    expect(customLabelToggle).toBeDefined();
  });

  it('should NOT allow editing label when field is standard on risk rating form', async () => {
    render(
      <TestFormProvider parentType={'risk_controlled_internal_audit_result'}>
        <EditFieldModal
          {...defaultProps}
          parentType={'risk_controlled_internal_audit_result'}
          values={{
            ...defaultProps.values!,
            Label: 'A label',
            IsCustomField: false,
          }}
        />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedFormConfigurationByParentTypeResponse([
              'risk_controlled_internal_audit_result' as Parent_Type_Enum,
            ]),
          ],
          ...defaultFormProvidersWithFeatures
        ),
      }
    );
    await findFormContext();

    const customLabelToggle = getCustomLabelToggle();
    expect(customLabelToggle).not.toBeInTheDocument();

    const label = await getLabelInput();
    expect(label).toBeDisabled();
  });

  it.each([
    { type: CustomAttributeFieldType.Select },
    { type: CustomAttributeFieldType.MultiSelect },
  ])(
    'should render dropdown options when type is $type and "Add option" is clicked',
    async ({ type }) => {
      render(
        <TestFormProvider parentType={Parent_Type_Enum.Risk}>
          <EditFieldModal
            {...defaultProps}
            values={{
              ReadOnly: false,
              Required: false,
              Hidden: false,
              CustomFieldLabel: 'A label',
              IsCustomField: true,
              CustomFieldType: type,
              CustomFieldShowAltValues: false,
              EnableCustomLabel: false,
              CustomFieldOptions: [
                { Value: 'Option A', GeneratedId: '1' },
                { Value: 'Option B', GeneratedId: '2' },
                { Value: 'Option C', GeneratedId: '3' },
              ],
            }}
          />
        </TestFormProvider>,
        {
          wrapper: getWrapper(
            [
              ...defaultMocks,
              mockedFormConfigurationByParentTypeResponse([
                Parent_Type_Enum.Risk,
              ]),
            ],
            ...defaultFormProvidersWithFeatures
          ),
        }
      );

      const option1 =
        await screen.findByLabelText<HTMLInputElement>('Option 1');
      expect(option1).toBeDefined();
      expect(option1.value).toEqual('Option A');

      const option2 =
        await screen.findByLabelText<HTMLInputElement>('Option 2');
      expect(option2).toBeDefined();
      expect(option2.value).toEqual('Option B');

      const option3 =
        await screen.findByLabelText<HTMLInputElement>('Option 3');
      expect(option3).toBeDefined();
      expect(option3.value).toEqual('Option C');
    }
  );

  it.each([
    { type: CustomAttributeFieldType.Select },
    { type: CustomAttributeFieldType.MultiSelect },
  ])('should add an empty option when type is $type', async ({ type }) => {
    render(
      <TestFormProvider parentType={Parent_Type_Enum.Risk}>
        <EditFieldModal
          {...defaultProps}
          values={{
            EnableCustomLabel: false,
            Hidden: false,
            IsCustomField: true,
            CustomFieldLabel: 'A label',
            CustomFieldOptions: [{ Value: 'Option A', GeneratedId: '1' }],
            ReadOnly: false,
            Required: false,
            CustomFieldShowAltValues: false,
            CustomFieldType: type,
          }}
        />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedFormConfigurationByParentTypeResponse([
              Parent_Type_Enum.Risk,
            ]),
          ],
          ...defaultFormProvidersWithFeatures
        ),
      }
    );

    const option1 = await screen.findByLabelText<HTMLInputElement>('Option 1');
    expect(option1).toBeInTheDocument();
    expect(option1.value).toEqual('Option A');

    let option2 = await screen.queryByLabelText<HTMLInputElement>('Option 2');
    expect(option2).not.toBeInTheDocument();

    await userEvent.click(getAddOptionButton());

    option2 = await screen.findByLabelText<HTMLInputElement>('Option 2');
    expect(option2).toBeInTheDocument();
    expect(option2.value).toEqual('');
  });

  it('should show "Set default value" when allowDefaultValue=true', async () => {
    render(
      <TestFormProvider parentType={Parent_Type_Enum.Risk}>
        <EditFieldModal
          {...defaultProps}
          editMode={EditMode.Update}
          allowDefaultValue={true}
          values={{
            EnableCustomLabel: false,
            IsCustomField: true,
            Hidden: false,
            CustomFieldLabel: 'A label',
            CustomFieldOptions: [{ Value: 'Option A', GeneratedId: '1' }],
            ReadOnly: false,
            Required: false,
            CustomFieldShowAltValues: false,
            CustomFieldType: CustomAttributeFieldType.Text,
          }}
        />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedFormConfigurationByParentTypeResponse([
              Parent_Type_Enum.Risk,
            ]),
          ],
          ...defaultFormProvidersWithFeatures
        ),
      }
    );

    await screen.findByText('Edit');

    const setDefaultValue = await getSetDefaultValueToggle();
    expect(setDefaultValue).toBeInTheDocument();
  });

  it('should show "Default" when "Set default value" is clicked', async () => {
    render(
      <TestFormProvider parentType={Parent_Type_Enum.Risk}>
        <EditFieldModal
          {...defaultProps}
          editMode={EditMode.Update}
          allowDefaultValue={true}
          values={{
            EnableCustomLabel: false,
            ReadOnly: false,
            Required: false,
            CustomFieldShowAltValues: false,
            IsCustomField: true,
            Hidden: false,
            CustomFieldLabel: 'A label',
            CustomFieldType: CustomAttributeFieldType.Text,
            CustomFieldOptions: [{ Value: 'Option A', GeneratedId: '1' }],
          }}
        />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedFormConfigurationByParentTypeResponse([
              Parent_Type_Enum.Risk,
            ]),
          ],
          ...defaultFormProvidersWithFeatures
        ),
      }
    );

    await screen.findByText('Edit');

    let defaultValue = await getDefaultValueInput();
    expect(defaultValue).not.toBeInTheDocument();

    const setDefaultValue = await getSetDefaultValueToggle();
    expect(setDefaultValue).toBeInTheDocument();
    await userEvent.click(setDefaultValue!);

    defaultValue = await getDefaultValueInput();
    expect(defaultValue).toBeInTheDocument();
  });

  it('should clear DefaultValue when "Set default value" unchecked', async () => {
    render(
      <TestFormProvider parentType={Parent_Type_Enum.Risk}>
        <EditFieldModal
          {...defaultProps}
          editMode={EditMode.Update}
          allowDefaultValue={true}
          values={{
            EnableCustomLabel: false,
            IsCustomField: true,
            Hidden: false,
            CustomFieldLabel: 'A label',
            CustomFieldOptions: [{ Value: 'Option A', GeneratedId: '1' }],
            ReadOnly: false,
            Required: false,
            CustomFieldShowAltValues: false,
            CustomFieldType: CustomAttributeFieldType.Text,
          }}
        />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedFormConfigurationByParentTypeResponse([
              Parent_Type_Enum.Risk,
            ]),
          ],
          ...defaultFormProvidersWithFeatures
        ),
      }
    );

    await screen.findByText('Edit');

    let defaultValue = await getDefaultValueInput();
    expect(defaultValue).not.toBeInTheDocument();

    const setDefaultValue = await getSetDefaultValueToggle();
    expect(setDefaultValue).toBeInTheDocument();
    await userEvent.click(setDefaultValue!);

    defaultValue = await getDefaultValueInput();
    expect(defaultValue).toBeInTheDocument();
    fireEvent.change(defaultValue!, { target: { value: 'Some default' } });

    expect(defaultValue?.value).toEqual('Some default');
    // toggle off
    await userEvent.click(setDefaultValue!);

    // toggle back on to get value
    await userEvent.click(setDefaultValue!);

    defaultValue = await getDefaultValueInput();
    expect(defaultValue?.value).toEqual('');
  });

  it('should hide "Set default value" when allowDefaultValue=false', async () => {
    render(
      <TestFormProvider parentType={Parent_Type_Enum.Risk}>
        <EditFieldModal
          {...defaultProps}
          editMode={EditMode.Update}
          allowDefaultValue={false}
          values={{
            EnableCustomLabel: false,
            ReadOnly: false,
            Required: false,
            IsCustomField: true,
            Hidden: false,
            CustomFieldLabel: 'A label',
            CustomFieldOptions: [{ Value: 'Option A', GeneratedId: '1' }],
            CustomFieldShowAltValues: false,
            CustomFieldType: CustomAttributeFieldType.Text,
          }}
        />
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            ...defaultMocks,
            mockedFormConfigurationByParentTypeResponse([
              Parent_Type_Enum.Risk,
            ]),
          ],
          ...defaultFormProvidersWithFeatures
        ),
      }
    );
    await screen.findByText('Edit');

    const setDefaultValue = await getSetDefaultValueToggle();
    expect(setDefaultValue).not.toBeInTheDocument();
  });
});
