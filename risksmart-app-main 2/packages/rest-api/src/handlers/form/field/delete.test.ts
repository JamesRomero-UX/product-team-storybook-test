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

  const { handler } = await import('./delete');

  return {
    handler,
    getFormConfiguration,
    insertFormFieldConfiguration,
  };
};

describe('form field DELETE handler', () => {
  it('removes the field from schema/uiSchema and updates other field conditions', async () => {
    const { handler, getFormConfiguration, insertFormFieldConfiguration } =
      await setup();

    const deletedFieldId = 'CustomAttributeData.123_text';

    vi.mocked(getFormConfiguration).mockResolvedValueOnce({
      form_configuration: [
        {
          ParentType: ParentTypeEnum.Action,
          customAttributeSchema: {
            Id: 'schema-id',
            Schema: {
              properties: {
                '123_text': { description: '', type: 'string' },
              },
              required: [],
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
          fields_config: [
            {
              __typename: 'form_field_configuration',
              FieldId: 'OtherFieldId',
              Label: 'Other field',
              Description: null,
              Required: true,
              Hidden: false,
              ReadOnly: false,
              DefaultValue: null,
              FormConfigurationParentType: ParentTypeEnum.Action,
              Conditions: {
                operation: 'and',
                tokens: [],
                tokenGroups: [
                  {
                    propertyKey: deletedFieldId,
                    operator: '=',
                    value: 'x',
                  },
                ],
              },
            },
          ],
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
              FieldId: deletedFieldId,
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
      SchemaId: 'schema-id',
      ParentType: ParentTypeEnum.Action,
      FieldsToDelete: [deletedFieldId],
    });

    // Schema property removed
    expect(
      (variables as { Schema: { properties?: Record<string, unknown> } }).Schema
        .properties
    ).toEqual({});

    // UI control removed
    expect(
      (variables as { UiSchema: { elements: unknown[] } }).UiSchema.elements
    ).toEqual([]);

    // Conditions referencing deleted field removed => Conditions becomes null
    expect(
      (
        variables as {
          FormFieldConfigurations: {
            FieldId: string;
            Conditions?: unknown;
          }[];
        }
      ).FormFieldConfigurations
    ).toEqual([
      expect.objectContaining({
        FieldId: 'OtherFieldId',
        Conditions: null,
      }),
    ]);
  });

  it('returns 400 when custom attribute schema not found', async () => {
    const { handler, getFormConfiguration } = await setup();

    vi.mocked(getFormConfiguration).mockResolvedValueOnce({
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
});
