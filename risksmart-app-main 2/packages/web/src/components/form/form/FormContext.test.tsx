import type { ToolsContent } from '@risksmart-app/components/src/tools/useTools';
import { useTools } from '@risksmart-app/components/src/tools/useTools';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { mockedGetAggregationResponse } from 'src/testing/mock-data/mockedGetAggregationResponses';
import { mockedGetChangeRequestByParentIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByParentIdSubscription';
import { mockedGetFormCustomisationResponse } from 'src/testing/mock-data/mockedGetFormCustomisationResponse';
import { mockedGetLivePendingChangeRequestsSubscription } from 'src/testing/mock-data/mockedGetLivePendingChangeRequestsSubscription';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequests';
import { mockedUserSearchPreferencesResponses } from 'src/testing/mock-data/mockedUserSearchPreferencesResponses';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';
import { z } from 'zod';

import { defaultMocks } from '../../../testing/mock-data';
import { CustomisableForm } from './CustomisableForm';
import { PageWrapper } from './PageWrapper';

vi.mock('@risksmart-app/components/src/tools/useTools');

const useToolsMock = vi.mocked(useTools);

const providerWithoutRouter: Providers[] = [
  'trpc',
  'graphql',
  'permission',
  'notification',
  'i18n',
  'features',
];
const providers: Providers[] = [...providerWithoutRouter, 'router'];

describe('FormContext', () => {
  const saveMock = vi.fn();
  const mockSchema = z.object({
    foo: z.string(),
  });
  const setToolsContentMock = vi.fn();
  const locationChangedMock = vi.fn();
  const id = 'parent-id';

  const testMocks = [
    ...defaultMocks,
    mockedGetOrganisation(),
    mockedGetPendingChangeRequests(),
    mockedGetLivePendingChangeRequestsSubscription(),
    mockedGetChangeRequestByParentIdSubscription(id),
    mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk]),
    mockedUserSearchPreferencesResponses(),
    mockedGetAggregationResponse(),
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    useToolsMock.mockReturnValue([
      '' as ToolsContent,
      setToolsContentMock,
      locationChangedMock,
    ]);
  });

  it('renders form actions', async () => {
    render(
      <CustomisableForm
        formId={'test'}
        defaultValues={{}}
        onSave={saveMock}
        schema={mockSchema}
        renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
        i18n={{
          entity_name: 'Test Entity',
        }}
        approvalConfig={{ object: { Id: id } }}
      >
        {'Hello world'}
      </CustomisableForm>,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );

    await waitFor(() => expect(screen.getByText('Save')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument());
  });

  it.each`
    type        | expected
    ${'update'} | ${'This Test Entity is read-only because it has pending changes'}
    ${'delete'} | ${'This Test Entity is pending deletion.'}
  `(
    'renders change request alert when theres a pending change request ($type)',
    async ({ type, expected }) => {
      render(
        <CustomisableForm
          formId={'test'}
          defaultValues={{}}
          onSave={saveMock}
          schema={mockSchema}
          renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
          i18n={{
            entity_name: 'Test Entity',
          }}
          approvalConfig={{ object: { Id: id } }}
        >
          {'Hello world'}
        </CustomisableForm>,
        {
          wrapper: getWrapper(
            [
              ...defaultMocks,
              mockedGetPendingChangeRequests(),
              mockedGetLivePendingChangeRequestsSubscription(type),
              mockedGetChangeRequestByParentIdSubscription(id),
              mockedGetFormCustomisationResponse([Parent_Type_Enum.Risk]),
              mockedUserSearchPreferencesResponses(),
              mockedGetAggregationResponse(),
            ],
            ...providers
          ),
        }
      );

      await waitFor(() =>
        expect(screen.getByText(expected)).toBeInTheDocument()
      );
    }
  );

  it('renders a warning when viewing a historical change request', async () => {
    const routes = [
      {
        path: '/',
        element: (
          <CustomisableForm
            formId={'test'}
            defaultValues={{}}
            onSave={saveMock}
            schema={mockSchema}
            renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
            i18n={{
              entity_name: 'Test Entity',
            }}
            approvalConfig={{ object: { Id: id } }}
          >
            {'Hello world'}
          </CustomisableForm>
        ),
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ['/?showRequest=true&requestId=parent-id-2'],
    });

    render(<RouterProvider router={router}></RouterProvider>, {
      wrapper: getWrapper(testMocks, ...providerWithoutRouter),
    });

    await waitFor(() =>
      expect(
        screen.getByText(
          /You are viewing a change request that's been resolved and can't be edited/
        )
      ).toBeInTheDocument()
    );
  });

  it('renders change request aside', async () => {
    render(
      <CustomisableForm
        formId={'test'}
        defaultValues={{}}
        onSave={saveMock}
        schema={mockSchema}
        renderTemplate={(renderProps) => <PageWrapper {...renderProps} />}
        i18n={{
          entity_name: 'Test Entity',
        }}
        approvalConfig={{ object: { Id: id } }}
      >
        {'Hello world'}
      </CustomisableForm>,
      {
        wrapper: getWrapper(testMocks, ...providers),
      }
    );

    await waitFor(() => screen.getByText('Show Pending Changes'));

    fireEvent.click(screen.getByText('Show Pending Changes'));

    await waitFor(() =>
      expect(setToolsContentMock).toHaveBeenCalledWith(
        'change-request:parent-id:change-request-id'
      )
    );
  });
});
