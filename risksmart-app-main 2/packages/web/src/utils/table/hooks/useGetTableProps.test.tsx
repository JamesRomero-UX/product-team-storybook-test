import type { UISchemaElement } from '@jsonforms/core';
import type { FormConfigurationPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook, waitFor } from '@testing-library/react';
import { defaultMocks } from 'src/testing/mock-data';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { useGetTableProps } from './useGetTableProps';

describe('useGetTableProps', () => {
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];
  it('should convert field config into columnDefinitions', async () => {
    const { result } = renderHook(
      () =>
        useGetTableProps({
          customAttributeFormIds: [],
          entityLabel: 'assessment',
          fields: {
            field1: {
              header: 'Field 1',
            },
          },
        }),
      { wrapper: getWrapper(defaultMocks, ...providers) }
    );
    await waitFor(() => expect(result.current.columnDefinitions).toBeDefined());
    expect(result.current.columnDefinitions.length).toEqual(1);
    expect(result.current.columnDefinitions[0]).toEqual(
      expect.objectContaining({
        header: 'Field 1',
        id: 'field1',
        maxWidth: 180,
        sortingField: 'field1',
      })
    );
  });

  // eslint-disable-next-line vitest/no-disabled-tests
  describe.skip('Custom attributes', () => {
    const customAttributeSchema: FormConfigurationPartsFragment['customAttributeSchema'] =
      {
        Schema: {
          properties: {
            '1704213361924_text': {
              type: 'string',
              description: 'uischema defined text input',
            },
          },
        },
        UiSchema: {
          type: 'VerticalLayout',
          elements: [
            {
              type: 'Control',
              label: 'A',
              scope: '#/properties/1704213361924_text',
            } as UISchemaElement,
          ],
        },
        Id: 'Customer1',
      };
    const formConfiguration: FormConfigurationPartsFragment = {
      customAttributeSchema,
      fields_config: [],
      ParentType: Parent_Type_Enum.Issue,
    };
    it('should convert customAttributeSchema into columnDefinitions', async () => {
      const { result } = renderHook(
        () =>
          useGetTableProps({
            entityLabel: 'assessment',
            fields: {},
            customAttributeFormIds: [Parent_Type_Enum.Issue],
          }),
        {
          wrapper: getWrapper(
            [
              ...defaultMocks,
              mockedGetFormCustomisationResponse([Parent_Type_Enum.Issue], {
                form_configuration: [formConfiguration],
                form_field_configuration: [],
                form_field_ordering: [],
              }),
            ],
            ...providers
          ),
        }
      );
      await waitFor(() =>
        expect(result.current.columnDefinitions).toBeDefined()
      );
      expect(result.current.columnDefinitions.length).toEqual(1);
      expect(result.current.columnDefinitions[0]).toEqual(
        expect.objectContaining({
          custom: true,
          header: 'A',
          id: '1704213361924_text',
          maxWidth: 180,
          sortingField: '1704213361924_text',
        })
      );
    });

    it('should include CustomAttributeData as top level fields in the returned items', async () => {
      const { result } = renderHook(
        () =>
          useGetTableProps({
            entityLabel: 'assessment',
            fields: {},
            data: [
              {
                CustomAttributeData: {
                  '1704213361924_text': 'Test value',
                },
              },
            ],
            customAttributeFormIds: [Parent_Type_Enum.Issue],
          }),
        {
          wrapper: getWrapper(
            [
              ...defaultMocks,
              mockedGetFormCustomisationResponse([Parent_Type_Enum.Issue], {
                form_configuration: [formConfiguration],
                form_field_configuration: [],
                form_field_ordering: [],
              }),
            ],
            ...providers
          ),
        }
      );
      await waitFor(() =>
        expect(result.current.columnDefinitions).toBeDefined()
      );
      expect(result.current.items).toEqual([
        {
          '1704213361924_text': 'Test value',
          CustomAttributeData: {
            '1704213361924_text': 'Test value',
          },
        },
      ]);
    });
  });
});
