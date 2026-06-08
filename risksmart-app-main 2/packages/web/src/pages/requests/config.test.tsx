import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import Table from '@risksmart-app/components/src/table';
import type { GetChangeRequestsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { render, renderHook, waitFor } from '@testing-library/react';
import type { FC } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { generateChangeRequest } from 'src/testing/mock-data/mockedChangeRequest';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedGetUserTablePreferences } from 'src/testing/mock-data/mockedGetUserTablePreferences';
import {
  getCellText,
  getHeadersText,
  waitForTableHeaders,
} from 'src/testing/tableHelpers';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';

import { defaultMocks } from '../../testing/mock-data';
import { useGetCollectionTableProps } from './config';

describe('Change requests config', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const TestHarness: FC<{ records: GetChangeRequestsQuery }> = ({
    records,
  }) => {
    const tableProps = useGetCollectionTableProps(records);

    return <Table {...tableProps} />;
  };

  const providerWithoutRouter: Providers[] = [
    'trpc',
    'graphql',
    'permission',
    'notification',
    'i18n',
    'features',
  ];

  const testMocks = [
    ...defaultMocks,
    mockedGetOrganisation(),
    mockedGetOrganisationModuleResponse(),
    mockedGetAggregationResponse(),
    mockedGetUserTablePreferences('requestRegister'),
  ];
  const providers: Providers[] = [
    'permission',
    'graphql',
    'router',
    'features',
    'trpc',
  ];

  it('should render a table with the correct columns', async () => {
    const routes = [
      {
        path: '/',
        element: <TestHarness records={{ change_request: [] }} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findColumnHeaders()
    );
    const headers = createWrapper(container).findTable()?.findColumnHeaders();
    expect(headers?.length).toEqual(8);

    const headersText = getHeadersText(container);

    expect(headersText).toEqual([
      'ID',
      'Parent Name',
      'Parent Owner',
      'Status',
      'Workflow',
      'Date Request Raised',
      'Date Last Actioned',
      'Date Closed',
    ]);
  });

  it('should render the correct fields for delete-risk', async () => {
    const deleteRisk = generateChangeRequest('risk', 'delete-risk', 'Risk 1');
    const records: GetChangeRequestsQuery = {
      change_request: [deleteRisk],
    };

    const routes = [
      {
        path: '/',
        element: <TestHarness records={records} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitForTableHeaders(container);

    expect(getCellText(container, 'ID', 1)).toEqual(
      `CR-${deleteRisk.SequentialId}`
    );
    expect(getCellText(container, 'Parent Name', 1)).toEqual('Risk 1');
    expect(getCellText(container, 'Status', 1)).toEqual('Approved');
    expect(getCellText(container, 'Workflow', 1)).toEqual('Delete Risk');
    expect(getCellText(container, 'Date Request Raised', 1)).toEqual(
      '1 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Last Actioned', 1)).toEqual(
      '3 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Closed', 1)).toEqual(
      '2 Jan 2021, 00:00'
    );
  });

  it('should render the correct fields for publish-document-version', async () => {
    const publishDocumentVersion = generateChangeRequest(
      'document_file',
      'publish-document-version',
      'Document 1'
    );
    const records: GetChangeRequestsQuery = {
      change_request: [publishDocumentVersion],
    };

    const routes = [
      {
        path: '/',
        element: <TestHarness records={records} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitFor(() => createWrapper(container).findTable());
    await waitFor(() =>
      createWrapper(container).findTable()?.findColumnHeaders()
    );

    expect(getCellText(container, 'ID', 1)).toEqual(
      `CR-${publishDocumentVersion.SequentialId}`
    );
    expect(getCellText(container, 'Parent Name', 1)).toEqual(
      'Document 1 (1.0)'
    );
    expect(getCellText(container, 'Status', 1)).toEqual('Approved');
    expect(getCellText(container, 'Workflow', 1)).toEqual('Publish Version');
    expect(getCellText(container, 'Date Request Raised', 1)).toEqual(
      '1 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Last Actioned', 1)).toEqual(
      '3 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Closed', 1)).toEqual(
      '2 Jan 2021, 00:00'
    );
  });

  it('should render the correct fields for open-acceptance', async () => {
    const subject = generateChangeRequest(
      'acceptance',
      'open-acceptance',
      'Acceptance 1'
    );
    const records: GetChangeRequestsQuery = {
      change_request: [subject],
    };

    const routes = [
      {
        path: '/',
        element: <TestHarness records={records} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitForTableHeaders(container);

    expect(getCellText(container, 'ID', 1)).toEqual(
      `CR-${subject.SequentialId}`
    );
    expect(getCellText(container, 'Parent Name', 1)).toEqual('Acceptance 1');
    expect(getCellText(container, 'Status', 1)).toEqual('Approved');
    expect(getCellText(container, 'Workflow', 1)).toEqual('Open Acceptance');
    expect(getCellText(container, 'Date Request Raised', 1)).toEqual(
      '1 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Last Actioned', 1)).toEqual(
      '3 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Closed', 1)).toEqual(
      '2 Jan 2021, 00:00'
    );
  });

  it('should render the correct fields for delete-control', async () => {
    const subject = generateChangeRequest(
      'acceptance',
      'delete-control',
      'Control 1'
    );
    const records: GetChangeRequestsQuery = {
      change_request: [subject],
    };

    const routes = [
      {
        path: '/',
        element: <TestHarness records={records} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitForTableHeaders(container);

    expect(getCellText(container, 'ID', 1)).toEqual(
      `CR-${subject.SequentialId}`
    );
    expect(getCellText(container, 'Parent Name', 1)).toEqual('Control 1');
    expect(getCellText(container, 'Status', 1)).toEqual('Approved');
    expect(getCellText(container, 'Workflow', 1)).toEqual('Delete Control');
    expect(getCellText(container, 'Date Request Raised', 1)).toEqual(
      '1 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Last Actioned', 1)).toEqual(
      '3 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Closed', 1)).toEqual(
      '2 Jan 2021, 00:00'
    );
  });

  it('should render the correct fields for delete-issue', async () => {
    const subject = generateChangeRequest(
      'issue_assessment',
      'delete-issue',
      'Issue 1'
    );
    const records: GetChangeRequestsQuery = {
      change_request: [subject],
    };

    const routes = [
      {
        path: '/',
        element: <TestHarness records={records} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitForTableHeaders(container);

    expect(getCellText(container, 'ID', 1)).toEqual(
      `CR-${subject.SequentialId}`
    );
    expect(getCellText(container, 'Parent Name', 1)).toEqual('Issue 1');
    expect(getCellText(container, 'Status', 1)).toEqual('Approved');
    expect(getCellText(container, 'Workflow', 1)).toEqual('Delete Issue');
    expect(getCellText(container, 'Date Request Raised', 1)).toEqual(
      '1 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Last Actioned', 1)).toEqual(
      '3 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Closed', 1)).toEqual(
      '2 Jan 2021, 00:00'
    );
  });

  it('should render the correct fields for delete-action', async () => {
    const subject = generateChangeRequest(
      'action',
      'delete-action',
      'Action 1'
    );
    const records: GetChangeRequestsQuery = {
      change_request: [subject],
    };

    const routes = [
      {
        path: '/',
        element: <TestHarness records={records} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitForTableHeaders(container);

    expect(getCellText(container, 'ID', 1)).toEqual(
      `CR-${subject.SequentialId}`
    );
    expect(getCellText(container, 'Parent Name', 1)).toEqual('Action 1');
    expect(getCellText(container, 'Status', 1)).toEqual('Approved');
    expect(getCellText(container, 'Workflow', 1)).toEqual('Delete Action');
    expect(getCellText(container, 'Date Request Raised', 1)).toEqual(
      '1 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Last Actioned', 1)).toEqual(
      '3 Jan 2021, 00:00'
    );
    expect(getCellText(container, 'Date Closed', 1)).toEqual(
      '2 Jan 2021, 00:00'
    );
  });

  it('should support export in correct format', async () => {
    const subject = generateChangeRequest(
      'action',
      'delete-action',
      'Action 1'
    );
    const records: GetChangeRequestsQuery = {
      change_request: [subject],
    };
    const { result } = renderHook(() => useGetCollectionTableProps(records), {
      wrapper: getWrapper(testMocks, ...providers),
    });

    await waitFor(() => {
      expect(result.current.exportToCsvString).toBeDefined();
    });

    const csv = result.current.exportToCsvString();
    expect(csv).toMatch(
      /^"ID","Parent Name","Parent Owner","Status","Workflow","Date Request Raised","Date Last Actioned","Date Closed"\r\n"CR-20","Action 1","[^"]*","Approved","Delete Action","01\/01\/2021 00:00","03\/01\/2021 00:00","02\/01\/2021 00:00"$/
    );
  });
});
