import { renderHook, waitFor } from '@testing-library/react';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { getWrapper } from 'src/testing/wrapper';

import { useCustomDatasourceExporterMapper } from './customDatasourceExporter';

describe('customDatasourceExporter', () => {
  it('returns just comma separated headers when there are no results', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [
              { fieldId: 'title', dataSourceIndex: 0 },
              { fieldId: 'tier', dataSourceIndex: 0 },
            ],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([]);
      expect(formattedCsvValues.length).toEqual(1);
      expect(formattedCsvValues[0]).toEqual(['Risk name', 'Risk tier']);
    });
  });

  it('throws error if missing custom attribute schema lookup', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: null,
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [
              { fieldId: 'title', dataSourceIndex: 0 },
              { fieldId: 'tier', dataSourceIndex: 0 },
            ],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      expect(() => result.current([])).toThrow(
        'Missing custom attribute schema'
      );
    });
  });
  it('throws error if missing custom datasource', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: null,
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      expect(() => result.current([])).toThrow('Missing custom data source');
    });
  });

  it('renders url for link detail columns', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'detailsLink', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([
        [{ value: 'a510456a-d8cc-40d3-83f9-93b5e2a4ad07' }],
      ]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual([
        '/risks/a510456a-d8cc-40d3-83f9-93b5e2a4ad07',
      ]);
    });
  });

  it('displays formatted date for date columns', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'createdAtTimestamp', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([
        [{ value: '2025-02-07T08:06:02.385Z' }],
      ]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['7 Feb 2025']);
    });
  });

  it('displays friendly id', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'sequentialId', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([[{ value: 4 }]]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['R-4']);
    });
  });

  it('displays array columns', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'owners', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([
        [{ value: ['Bill', 'Bob', 'Brian'] }],
      ]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['Bill,Bob,Brian']);
    });
  });

  it('displays common lookup columns', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'status', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([[{ value: 'active' }]]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['Active']);
    });
  });

  it('displays rating columns', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'inherentRating', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([[{ value: 1 }]]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['Minimal']);
    });
  });

  it('displays rating fields as empty when theres no value', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'inherentRating', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([[{ value: null }]]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['']);
    });
  });

  it('displays text columns', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'details', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([[{ value: 'Hello world' }]]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['Hello world']);
    });
  });

  it('displays empty field when text value is missing', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [{ fieldId: 'details', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([[{ value: null }]]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['']);
    });
  });

  it('displays meta rating columns', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          customAttributeSchemaLookup: {},
          customDatasource: {
            Datasources: [{ type: 'riskAssessmentResults' }],
            Fields: [{ fieldId: 'rating', dataSourceIndex: 0 }],
          },
          formFieldConfigurations: null,
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([
        [{ value: 'Minimal', meta: { color: 'blue' } }],
      ]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[1]).toEqual(['Minimal']);
    });
  });

  it('displays option for custom attribute select options', async () => {
    const { result } = renderHook(
      () =>
        useCustomDatasourceExporterMapper({
          formFieldConfigurations: null,
          customAttributeSchemaLookup: {
            risk: {
              Schema: {
                properties: {
                  '1702983795778_select': {
                    enum: ['b', 'c', 'd', 'e', 'f'],
                    type: 'string',
                  },
                },
              },
              UiSchema: {
                type: 'VerticalLayout',
                elements: [
                  {
                    type: 'Control',
                    label: 'Select Label',
                    scope: '#/properties/1702983795778_select',
                  },
                ],
              },
            },
          },
          customDatasource: {
            Datasources: [{ type: 'risks' }],
            Fields: [
              { fieldId: 'custom/1702983795778_select', dataSourceIndex: 0 },
            ],
          },
        }),
      {
        wrapper: getWrapper(
          [mockedGetOrganisationModuleResponse(), mockedGetOrganisation()],
          'graphql',
          'features'
        ),
      }
    );
    await waitFor(() => {
      const formattedCsvValues = result.current([[{ value: 'c' }]]);
      expect(formattedCsvValues.length).toEqual(2);
      expect(formattedCsvValues[0]).toEqual(['Select Label']);
      expect(formattedCsvValues[1]).toEqual(['c']);
    });
  });
});
