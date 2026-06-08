import type { ApolloClient } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import type { Sdk } from '../../../../generated/graphql2';

const setup = async () => {
  vi.resetModules();

  vi.doMock('src/session', () => {
    return {
      getSessionData: () => ({ userId: 'userId' }),
    };
  });

  vi.doMock('src/services/role-access/roleAccessService', () => {
    return {
      hasPermission: vi.fn().mockResolvedValue(true),
    };
  });

  vi.doMock('src/backendGraphqlClient', () => {
    return {
      getHasuraBackendClientForAction: () => stub<ApolloClient<unknown>>({}),
    };
  });

  const getFormConfiguration = vi.fn();
  const insertFormFieldConfiguration = vi.fn();

  const sdk = {
    getFormConfiguration,
    insertFormFieldConfiguration,
  } as unknown as Sdk;

  vi.doMock('src/repositories/getRisksmartApiClient', () => {
    return { getRisksmartApiClient: () => sdk };
  });

  const { handler } = await import('./put');

  return {
    handler,
    getFormConfiguration,
    insertFormFieldConfiguration,
  };
};

const baseEventBody = {
  session_variables: {
    'x-hasura-tenant-name': 'tenant',
    'x-hasura-org-id': 'org',
    'x-hasura-user-id': 'userId',
  },
};

describe('form field PUT handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('persists standard field updates (no custom schema required)', async () => {
    const { handler, getFormConfiguration, insertFormFieldConfiguration } =
      await setup();
    const getFormConfigurationMock = vi.mocked(getFormConfiguration);
    const insertFormFieldConfigurationMock = vi.mocked(
      insertFormFieldConfiguration
    );

    getFormConfigurationMock.mockResolvedValue({
      form_configuration: [
        {
          ParentType: ParentTypeEnum.Action,
          customAttributeSchema: null,
          fields_config: [],
        },
      ],
    });
    insertFormFieldConfigurationMock.mockResolvedValue({
      insert_custom_attribute_schema_one: null,
      insert_form_configuration_one: null,
      delete_form_field_configuration: null,
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        body: JSON.stringify({
          ...baseEventBody,
          input: {
            object: {
              ParentType: ParentTypeEnum.Action,
              FieldId: 'StandardFieldId',
              IsCustomField: false,
              Label: 'Updated standard label',
              Required: true,
              Hidden: false,
              ReadOnly: true,
              DefaultValue: 'abc',
              Description: '<div onclick="steal()">Hello</div>',
              Conditions: null,
            },
          },
        }),
      }),
      stub<Context>({})
    );

    expect(result.statusCode).toBe(200);
    expect(insertFormFieldConfigurationMock).toHaveBeenCalledTimes(1);

    const [variables] = insertFormFieldConfigurationMock.mock.calls[0] ?? [];
    expect(variables).toMatchObject({
      ParentType: ParentTypeEnum.Action,
      FieldsToDelete: [],
      FormFieldConfigurations: {
        FieldId: 'StandardFieldId',
        Label: 'Updated standard label',
        Description: '<div>Hello</div>',
        Required: true,
        Hidden: false,
        ReadOnly: true,
        DefaultValue: 'abc',
        Conditions: null,
      },
    });
  });

  it('updates schema + persists when updating a custom field', async () => {
    const { handler, getFormConfiguration, insertFormFieldConfiguration } =
      await setup();
    const getFormConfigurationMock = vi.mocked(getFormConfiguration);
    const insertFormFieldConfigurationMock = vi.mocked(
      insertFormFieldConfiguration
    );

    getFormConfigurationMock.mockResolvedValueOnce({
      form_configuration: [
        {
          ParentType: ParentTypeEnum.Action,
          customAttributeSchema: {
            Id: 'schema-id',
            Schema: {
              properties: {
                '123_text': { description: '', type: 'string' },
              },
            },
            UiSchema: {
              type: 'VerticalLayout',
              elements: [
                {
                  type: 'Control',
                  scope: '#/properties/123_text',
                  label: 'Old label',
                },
              ],
            },
          },
          fields_config: [],
        },
      ],
    });
    insertFormFieldConfigurationMock.mockResolvedValue({
      insert_custom_attribute_schema_one: null,
      insert_form_configuration_one: null,
      delete_form_field_configuration: null,
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        body: JSON.stringify({
          ...baseEventBody,
          input: {
            object: {
              ParentType: ParentTypeEnum.Action,
              FieldId: 'CustomAttributeData.123_text',
              IsCustomField: true,
              Label: 'New label',
              AltLabel: 'Alt',
              Options: [],
              Required: true,
              Hidden: false,
              ReadOnly: true,
              DefaultValue: 'abc',
              Description: '<div onclick="steal()">Hello</div>',
              Conditions: null,
            },
          },
        }),
      }),
      stub<Context>({})
    );

    expect(result.statusCode).toBe(200);
    expect(insertFormFieldConfigurationMock).toHaveBeenCalledTimes(1);

    const [variables] = insertFormFieldConfigurationMock.mock.calls[0] ?? [];
    expect(variables).toMatchObject({
      SchemaId: 'schema-id',
      ParentType: ParentTypeEnum.Action,
      FormFieldConfigurations: {
        FieldId: 'CustomAttributeData.123_text',
        Label: 'New label',
        Description: '<div>Hello</div>',
      },
    });

    expect(variables.Schema.properties['123_text'].description).toBe(
      '<div>Hello</div>'
    );
  });

  it('returns 400 when updating a custom field without a schema', async () => {
    const { handler, getFormConfiguration } = await setup();
    const getFormConfigurationMock = vi.mocked(getFormConfiguration);

    getFormConfigurationMock.mockResolvedValueOnce({
      form_configuration: [
        {
          ParentType: ParentTypeEnum.Action,
          customAttributeSchema: null,
          fields_config: [],
        },
      ],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        body: JSON.stringify({
          ...baseEventBody,
          input: {
            object: {
              ParentType: ParentTypeEnum.Action,
              FieldId: 'CustomAttributeData.123_text',
              IsCustomField: true,
              Label: 'New label',
              AltLabel: 'Alt',
              Options: [],
              Required: true,
              Hidden: false,
              ReadOnly: true,
              DefaultValue: null,
              Description: null,
              Conditions: null,
            },
          },
        }),
      }),
      stub<Context>({})
    );

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toMatchObject({
      message: 'Custom attribute schema not found',
    });
  });

  it('returns 400 when custom field type is invalid', async () => {
    const { handler, getFormConfiguration } = await setup();
    const getFormConfigurationMock = vi.mocked(getFormConfiguration);

    getFormConfigurationMock.mockResolvedValueOnce({
      form_configuration: [
        {
          ParentType: ParentTypeEnum.Action,
          customAttributeSchema: {
            Id: 'schema-id',
            Schema: {
              properties: {
                '123_invalid': { description: '', type: 'string' },
              },
            },
            UiSchema: {
              type: 'VerticalLayout',
              elements: [],
            },
          },
          fields_config: [],
        },
      ],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        body: JSON.stringify({
          ...baseEventBody,
          input: {
            object: {
              ParentType: ParentTypeEnum.Action,
              FieldId: 'CustomAttributeData.123_invalid',
              IsCustomField: true,
              Label: 'New label',
              AltLabel: 'Alt',
              Options: [],
              Required: true,
              Hidden: false,
              ReadOnly: true,
              DefaultValue: null,
              Description: null,
              Conditions: null,
            },
          },
        }),
      }),
      stub<Context>({})
    );

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body ?? '')).toMatchObject({
      message: expect.stringContaining('Field type is invalid'),
    });
  });
});
