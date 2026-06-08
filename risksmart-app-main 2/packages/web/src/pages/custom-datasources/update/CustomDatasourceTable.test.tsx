import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import { render, waitFor } from '@testing-library/react';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { getCellContent, getRowAsObject } from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { TypedCustomDatasource } from '../types';
import type { Props } from './CustomDatasourceTable';
import CustomDatasourceTable from './CustomDatasourceTable';

describe('custom datasource table', () => {
  const defaultDefinition: Pick<
    TypedCustomDatasource,
    'Datasources' | 'Fields'
  > = {
    Datasources: [],
    Fields: [],
  };

  const defaultProps: Props = {
    customDatasource: defaultDefinition,
    items: [],
    onPageChangeClick: vi.fn(),
    currentPageIndex: 0,
    pageSize: 10,
    loading: false,
    customAttributeSchemaLookup: {},
    columnsAlwaysVisible: false,
    onSetPreferences: vi.fn(),
    formFieldConfigurations: null,
  };
  const providers: Providers[] = ['router', 'features', 'graphql'];

  it('displays No records found when items is empty', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        customDatasource={{
          ...defaultDefinition,
          Datasources: [{ type: 'risks' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(
        createWrapper(container).findTable()?.findEmptySlot()?.getElement()
      ).toHaveTextContent('No records found');
    });
  });

  it('does NOT display empty slot when items exist', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        items={[[{ value: '2025-02-07T08:06:02.385Z' }]]}
        customDatasource={{
          ...defaultDefinition,
          Datasources: [{ type: 'risks' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(
        createWrapper(container).findTable()?.findEmptySlot()?.getElement()
      ).not.toBeDefined();
    });
  });

  it('can render a date column', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        items={[[{ value: '2025-02-07T08:06:02.385Z' }]]}
        customDatasource={{
          ...defaultDefinition,
          Fields: [
            {
              dataSourceIndex: 0,
              fieldId: 'createdAtTimestamp',
            },
          ],
          Datasources: [{ type: 'risks' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(getRowAsObject(container, 1)).toEqual({
        'Created on': '7 Feb 2025',
      });
    });
  });

  it('can render a "common" translated field', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        items={[[{ value: 1 }]]}
        customDatasource={{
          ...defaultDefinition,
          Fields: [
            {
              dataSourceIndex: 0,
              fieldId: 'tier',
            },
          ],
          Datasources: [{ type: 'risks' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(getRowAsObject(container, 1)).toEqual({
        'Risk tier': 'Tier 1',
      });
    });
  });

  it('can render a text field', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        items={[[{ value: 'Risk title 1' }]]}
        customDatasource={{
          ...defaultDefinition,
          Fields: [
            {
              dataSourceIndex: 0,
              fieldId: 'title',
            },
          ],
          Datasources: [{ type: 'risks' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(getRowAsObject(container, 1)).toEqual({
        'Risk name': 'Risk title 1',
      });
    });
  });

  it('can render a rating field', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        items={[[{ value: 1 }]]}
        customDatasource={{
          ...defaultDefinition,
          Fields: [
            {
              dataSourceIndex: 0,
              fieldId: 'priority',
            },
          ],
          Datasources: [{ type: 'actions' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(getRowAsObject(container, 1)).toEqual({
        Priority: 'Low',
      });
    });
  });

  it('can render a meta rating field', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        items={[[{ value: 'High' }]]}
        customDatasource={{
          ...defaultDefinition,
          Fields: [
            {
              dataSourceIndex: 0,
              fieldId: 'rating',
            },
          ],
          Datasources: [{ type: 'riskAssessmentResults' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(getRowAsObject(container, 1)).toEqual({
        Rating: 'High',
      });
    });
  });

  it('can render a number field with prefix', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        items={[[{ value: 1 }]]}
        customDatasource={{
          ...defaultDefinition,
          Fields: [
            {
              dataSourceIndex: 0,
              fieldId: 'sequentialId',
            },
          ],
          Datasources: [{ type: 'risks' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(getRowAsObject(container, 1)).toEqual({
        ID: 'R-1',
      });
    });
  });

  it('can render a details link column', async () => {
    const { container } = render(
      <CustomDatasourceTable
        {...defaultProps}
        items={[[{ value: 1 }]]}
        customDatasource={{
          ...defaultDefinition,
          Fields: [
            {
              dataSourceIndex: 0,
              fieldId: 'detailsLink',
            },
          ],
          Datasources: [{ type: 'risks' }],
        }}
      />,
      {
        wrapper: getWrapper(
          [mockedGetOrganisation(), mockedGetOrganisationModuleResponse()],
          ...providers
        ),
      }
    );
    await waitFor(() => {
      expect(getRowAsObject(container, 1)).toEqual({
        'Risk link': 'View risk details',
      });
      expect(
        getCellContent(container, 'Risk link', 1)
          ?.findLink()
          ?.getElement()
          .getAttribute('href')
      ).toEqual('/risks/1');
    });
  });
});
