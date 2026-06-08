import { MockedProvider } from '@apollo/client/testing';
import type { GetFormCustomisationQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, screen } from '@testing-library/react';
import { useFeatures } from 'src/rbac/useFeatures';
import { findCustomisableFormContent } from 'src/testing/formHelpers';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { TestFormProvider } from 'src/testing/TestFormProvider';
import { defaultFormProviders, getWrapper } from 'src/testing/wrapper';
import { vi, vitest } from 'vitest';

import CustomisableFieldWrapper from './CustomisableFieldWrapper';

vitest.mock('@/utils/featureFlags');
vitest.mock('src/rbac/useFeatures');

describe('CustomisableFieldWrapper', () => {
  const fieldContent = 'Hello world';
  const label = 'Field1';
  const fieldId = '1704446582108_text';
  const customAttributeResponse: Pick<
    GetFormCustomisationQuery,
    'form_configuration'
  > = {
    form_configuration: [
      {
        fields_config: [],
        ParentType: Parent_Type_Enum.Action,
        createdByUser: {
          FriendlyName: 'RiskManager1',
          __typename: 'user',
        },
        customAttributeSchema: {
          UiSchema: {
            type: 'VerticalLayout',
            elements: [
              {
                type: 'Control',
                label,
                scope: `#/properties/${fieldId}`,
              },
            ],
          },
          Schema: {
            properties: {
              [fieldId]: {
                type: 'string',
                description: 'uischema defined text input',
              },
            },
          },
          Id: 'a5c35621-a0d3-4bdf-a349-4bd751170cf1',
          __typename: 'custom_attribute_schema',
        },
        modifiedByUser: {
          FriendlyName: 'RiskManager1',
          __typename: 'user',
        },
        __typename: 'form_configuration',
      },
    ],
  };

  beforeEach(() => {
    vi.mocked(useFeatures).mockReturnValue([]);
  });

  it('should throw an error if the parentType is not set in the CustomisableFormContext', async () => {
    expect(() =>
      render(
        <MockedProvider>
          <TestFormProvider>
            <CustomisableFieldWrapper>{fieldContent}</CustomisableFieldWrapper>
          </TestFormProvider>
        </MockedProvider>
      )
    ).toThrowError('CustomisableForm must have a parentType');
  });

  it('should show a loading spinner whilst loading data', () => {
    render(
      <MockedProvider
        mocks={[
          mockedGetOrganisationModuleResponse(),
          mockedGetFormCustomisationResponse([Parent_Type_Enum.Action]),
          mockedGetAggregationResponse(),
        ]}
      >
        <TestFormProvider
          parentType={Parent_Type_Enum.Action}
          includeCustomisableFormData={true}
        >
          <CustomisableFieldWrapper>
            <div key={'field1'}>{fieldContent}</div>
          </CustomisableFieldWrapper>
        </TestFormProvider>
      </MockedProvider>
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should throw an error if child elements do not have a key prop', () => {
    expect(() =>
      render(
        <MockedProvider
          mocks={[
            mockedGetOrganisationModuleResponse(),
            mockedGetFormCustomisationResponse([Parent_Type_Enum.Action]),
            mockedGetAggregationResponse(),
          ]}
        >
          <TestFormProvider
            parentType={Parent_Type_Enum.Action}
            includeCustomisableFormData={false}
          >
            <CustomisableFieldWrapper>
              <div>{fieldContent}</div>
            </CustomisableFieldWrapper>
          </TestFormProvider>
        </MockedProvider>
      )
    ).toThrowError(
      "All children of a CustomisableForm must have a unique 'key' prop, a child does not have one."
    );
  });

  it('should render child elements', async () => {
    render(
      <TestFormProvider
        parentType={Parent_Type_Enum.Action}
        includeCustomisableFormData={true}
      >
        <CustomisableFieldWrapper>
          <div key={'field1'}>{fieldContent}</div>
        </CustomisableFieldWrapper>
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            mockedGetOrganisationModuleResponse(),
            mockedRoleAccessResponse(),
            mockedGetFormCustomisationResponse([Parent_Type_Enum.Action]),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await findCustomisableFormContent();
    expect(screen.getByText(fieldContent)).toBeInTheDocument();
  });

  it('should render custom attribute input', async () => {
    render(
      <TestFormProvider
        parentType={Parent_Type_Enum.Action}
        includeCustomisableFormData={true}
      >
        <CustomisableFieldWrapper>
          <div key={'field1'}>{fieldContent}</div>
        </CustomisableFieldWrapper>
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetFormCustomisationResponse([Parent_Type_Enum.Action], {
              ...customAttributeResponse,
              form_field_configuration: [],
              form_field_ordering: [],
            }),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await findCustomisableFormContent();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it.each([
    {
      readOnly: true,
      expectedDisabled: true,
    },
    {
      readOnly: false,
      expectedDisabled: false,
    },
  ])(
    'should set custom attribute disabled field to $expectedDisabled when CustomisableForm readonly is set to $readOnly',
    async ({ readOnly, expectedDisabled }) => {
      render(
        <TestFormProvider
          parentType={Parent_Type_Enum.Action}
          includeCustomisableFormData={true}
        >
          <CustomisableFieldWrapper readOnly={readOnly}>
            <div key={'field1'}>{fieldContent}</div>
          </CustomisableFieldWrapper>
        </TestFormProvider>,
        {
          wrapper: getWrapper(
            [
              mockedRoleAccessResponse(),
              mockedGetOrganisationModuleResponse(),
              mockedGetFormCustomisationResponse([Parent_Type_Enum.Action], {
                ...customAttributeResponse,
                form_field_configuration: [],
                form_field_ordering: [],
              }),
              mockedGetAggregationResponse(),
            ],
            ...defaultFormProviders
          ),
        }
      );
      await findCustomisableFormContent();
      expect(screen.getByRole('textbox').hasAttribute('disabled')).toEqual(
        expectedDisabled
      );
    }
  );

  it.each([
    {
      readOnly: true,
      expectedDisabled: true,
    },
    {
      readOnly: false,
      expectedDisabled: false,
    },
  ])(
    'should set custom attribute disabled field to $expectedDisabled when form_field_configuration readonly is set to $readOnly',
    async ({ readOnly, expectedDisabled }) => {
      const formFieldConfiguration: Pick<
        GetFormCustomisationQuery,
        'form_field_configuration'
      > = {
        form_field_configuration: [
          {
            FieldId: `CustomAttributeData.${fieldId}`,
            Hidden: false,
            Required: false,
            ReadOnly: readOnly,
            DefaultValue: null,
            Label: null,
            Description: null,
            FormConfigurationParentType: Parent_Type_Enum.Action,
            Conditions: null,
          },
        ],
      };
      render(
        <TestFormProvider
          parentType={Parent_Type_Enum.Action}
          includeCustomisableFormData={true}
        >
          <CustomisableFieldWrapper>
            <div key={'field1'}>{fieldContent}</div>
          </CustomisableFieldWrapper>
        </TestFormProvider>,
        {
          wrapper: getWrapper(
            [
              mockedRoleAccessResponse(),
              mockedGetOrganisationModuleResponse(),

              mockedGetFormCustomisationResponse([Parent_Type_Enum.Action], {
                ...formFieldConfiguration,
                ...customAttributeResponse,
                form_field_ordering: [],
              }),
              mockedGetAggregationResponse(),
            ],
            ...defaultFormProviders
          ),
        }
      );
      await findCustomisableFormContent();
      expect(screen.getByRole('textbox').hasAttribute('disabled')).toEqual(
        expectedDisabled
      );
    }
  );

  it.each([
    {
      hidden: true,
      expectedHidden: true,
    },
    {
      hidden: false,
      expectedHidden: false,
    },
  ])(
    'should set custom attribute hidden state to $expectedHidden when form_field_configuration hidden is set to $hidden',
    async ({ hidden, expectedHidden }) => {
      const formFieldConfiguration: Pick<
        GetFormCustomisationQuery,
        'form_field_configuration'
      > = {
        form_field_configuration: [
          {
            FieldId: `CustomAttributeData.${fieldId}`,
            Hidden: hidden,
            Required: false,
            ReadOnly: false,
            DefaultValue: null,
            Label: null,
            Description: null,
            FormConfigurationParentType: Parent_Type_Enum.Action,
            Conditions: null,
          },
        ],
      };
      render(
        <TestFormProvider
          parentType={Parent_Type_Enum.Action}
          includeCustomisableFormData={true}
        >
          <CustomisableFieldWrapper>
            <div key={'field1'}>{fieldContent}</div>
          </CustomisableFieldWrapper>
        </TestFormProvider>,

        {
          wrapper: getWrapper(
            [
              mockedRoleAccessResponse(),
              mockedGetOrganisationModuleResponse(),
              mockedGetFormCustomisationResponse([Parent_Type_Enum.Action], {
                ...formFieldConfiguration,
                ...customAttributeResponse,
                form_field_ordering: [],
              }),
              mockedGetAggregationResponse(),
            ],
            ...defaultFormProviders
          ),
        }
      );
      await findCustomisableFormContent();
      expect(!screen.queryByRole('textbox')).toEqual(expectedHidden);
    }
  );

  it('should show "(optional)" when a field has not been set as required', async () => {
    render(
      <TestFormProvider
        parentType={Parent_Type_Enum.Action}
        includeCustomisableFormData={true}
      >
        <CustomisableFieldWrapper>
          <div key={'field1'}>{fieldContent}</div>
        </CustomisableFieldWrapper>
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetFormCustomisationResponse([Parent_Type_Enum.Action], {
              ...customAttributeResponse,
              form_field_configuration: [
                {
                  FieldId: `CustomAttributeData.${fieldId}`,
                  Hidden: false,
                  Required: false,
                  ReadOnly: false,
                  DefaultValue: null,
                  Label: null,
                  Description: null,
                  FormConfigurationParentType: Parent_Type_Enum.Action,
                  Conditions: null,
                },
              ],
              form_field_ordering: [],
            }),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await findCustomisableFormContent();
    expect(screen.getByText('Field1 (optional)')).toBeInTheDocument();
  });

  it('should NOT show "(optional)" when a field has been set as required', async () => {
    const formFieldConfig: Pick<
      GetFormCustomisationQuery,
      'form_field_configuration'
    > = {
      form_field_configuration: [
        {
          FieldId: `CustomAttributeData.${fieldId}`,
          Hidden: false,
          Required: true,
          ReadOnly: false,
          DefaultValue: null,
          Label: null,
          Description: null,
          FormConfigurationParentType: Parent_Type_Enum.Action,
          Conditions: null,
        },
      ],
    };
    render(
      <TestFormProvider
        parentType={Parent_Type_Enum.Action}
        includeCustomisableFormData={true}
      >
        <CustomisableFieldWrapper>
          <div key={'field1'}>{fieldContent}</div>
        </CustomisableFieldWrapper>
      </TestFormProvider>,
      {
        wrapper: getWrapper(
          [
            mockedRoleAccessResponse(),
            mockedGetOrganisationModuleResponse(),
            mockedGetFormCustomisationResponse([Parent_Type_Enum.Action], {
              ...customAttributeResponse,
              ...formFieldConfig,
              form_field_ordering: [],
            }),
            mockedGetAggregationResponse(),
          ],
          ...defaultFormProviders
        ),
      }
    );
    await findCustomisableFormContent();
    expect(screen.queryByText('Field1 (optional)')).not.toBeInTheDocument();
  });
});
