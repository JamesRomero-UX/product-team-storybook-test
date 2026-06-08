import type { ApolloClient } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';

import type { Sdk } from '../../../../generated/graphql2';

const baseEventBody = {
  session_variables: {
    'x-hasura-tenant-name': 'tenant',
    'x-hasura-org-id': 'org',
    'x-hasura-user-id': 'userId',
  },
};

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

  const { handler } = await import('./post');

  return {
    handler,
    getFormConfiguration,
    insertFormFieldConfiguration,
  };
};

describe('form field POST handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a custom attribute field, sanitizes description, and persists schema + config', async () => {
    const { handler, getFormConfiguration, insertFormFieldConfiguration } =
      await setup();

    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);

    vi.mocked(getFormConfiguration).mockResolvedValueOnce({
      form_configuration: [
        {
          ParentType: ParentTypeEnum.Action,
          customAttributeSchema: null,
          fields_config: [],
        },
      ],
    });

    vi.mocked(insertFormFieldConfiguration).mockResolvedValue({
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
              IsCustomField: true,
              Label: 'New field 1',
              AltLabel: undefined,
              Description: '<div onclick="stealBankDetails()">Hello</div>',
              Type: 'text',
              Options: [],
              Required: true,
              Hidden: false,
              ReadOnly: true,
              DefaultValue: 'default value',
              Conditions: null,
            },
          },
        }),
      }),
      stub<Context>({})
    );

    expect(result.statusCode).toBe(200);

    expect(insertFormFieldConfiguration).toHaveBeenCalledTimes(1);
    const [variables] =
      vi.mocked(insertFormFieldConfiguration).mock.calls[0] ?? [];

    expect(variables).toMatchObject({
      ParentType: ParentTypeEnum.Action,
      FieldsToDelete: [],
      FormFieldConfigurations: {
        FieldId: 'CustomAttributeData.1700000000000_text',
        Label: 'New field 1',
        Description: '<div>Hello</div>',
        Required: true,
        Hidden: false,
        ReadOnly: true,
        DefaultValue: 'default value',
        Conditions: null,
      },
    });

    const typed = variables as {
      Schema: { properties?: Record<string, { description?: string }> };
      UiSchema: { type: string; elements: unknown[] };
    };

    expect(typed.Schema.properties).toEqual({
      '1700000000000_text': { description: '<div>Hello</div>', type: 'string' },
    });

    expect(typed.UiSchema).toMatchObject({
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/1700000000000_text',
          label: 'New field 1',
        },
      ],
    });
  });
});
