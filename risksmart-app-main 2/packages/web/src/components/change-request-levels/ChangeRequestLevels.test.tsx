import createWrapper from '@risk-smart/themed-cloudscape-components/test-utils/dom';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import {
  getByTestId,
  getByText,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import { mockedGetApprovalLevels } from 'src/testing/mock-data/mockedGetApprovalLevels';
import { mockedGetChangeRequestByIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByIdSubscription';
import { mockedGetChangeRequestByParentIdSubscription } from 'src/testing/mock-data/mockedGetChangeRequestByParentIdSubscription';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetPendingChangeRequests } from 'src/testing/mock-data/mockedGetPendingChangeRequests';
import { buildAuth0User } from 'src/testing/testUser';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { defaultMocks } from '../../testing/mock-data';
import { ChangeRequestLevels } from './ChangeRequestLevels';

vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
const userMock = vi.mocked(useRisksmartUser);

describe('ChangeRequestLevels', () => {
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
    mockedGetChangeRequestByIdSubscription(),
    mockedGetApprovalLevels(),
    mockedGetPendingChangeRequests(),
    mockedGetChangeRequestByIdSubscription(),
    mockedGetChangeRequestByParentIdSubscription(),
  ];

  const defaultMocksWithOverride = [
    ...testMocks,
    mockedGetChangeRequestByParentIdSubscription(undefined, {
      userId: 'user-id',
      timestamp: '2021-08-03T14:00:00Z',
    }),
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    userMock.mockReturnValue(
      buildAuth0User({
        userId: 'user-id',
        orgRole: 'Public',
        orgKey: 'org-key',
        features: [],
        allowedRoles: [],
        isCustomerSupport: false,
      })
    );
  });

  it.each`
    changeRequestId          | expected
    ${'change-request-id-1'} | ${'(CR-1)'}
    ${'change-request-id-2'} | ${'(CR-2)'}
    ${'change-request-id-3'} | ${'(CR-3)'}
  `(
    'displays friendly Id ($expected) of change request selected ($changeRequestId)',
    async ({ changeRequestId, expected }) => {
      const routes = [
        {
          path: '/',
          element: (
            <ChangeRequestLevels
              parentId={'parent-id'}
              changeRequestId={changeRequestId}
            />
          ),
        },
      ];

      const router = createMemoryRouter(routes);

      const { container } = render(
        <RouterProvider router={router}></RouterProvider>,
        {
          wrapper: getWrapper(testMocks, ...providerWithoutRouter),
        }
      );

      await waitUntilLoaded();
      await waitUntilLoaded();

      expect(
        container.querySelector('span[data-testid="change-request-id"]')
          ?.textContent
      ).toContain(expected);
    }
  );

  it('renders a dropdown with all change requests associated with the parent', async () => {
    const routes = [
      {
        path: '/',
        element: <ChangeRequestLevels parentId={'parent-id'} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitFor(() =>
      expect(
        getByTestId(container, 'change-request-select')
      ).toBeInTheDocument()
    );

    const select = createWrapper(container).findSelect();
    select?.openDropdown();

    expect(
      select
        ?.findDropdown()
        .findOptionByValue('change-request-id-1')
        ?.findLabel()
        .getElement().textContent
    ).toMatch(/CR-1 - 2 Aug 2021 - Failed/);
    expect(
      select
        ?.findDropdown()
        .findOptionByValue('change-request-id-2')
        ?.findLabel()
        .getElement().textContent
    ).toMatch(/CR-2 - 2 Aug 2021 - Rejected/);
    expect(
      select
        ?.findDropdown()
        .findOptionByValue('change-request-id-3')
        ?.findLabel()
        .getElement().textContent
    ).toMatch(/CR-3 - 2 Aug 2021 - Pending/);
  });

  it('selects any pending change requests by default when theres no change request ID provided', async () => {
    const routes = [
      {
        path: '/',
        element: <ChangeRequestLevels parentId={'parent-id'} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitFor(() =>
      expect(
        getByTestId(container, 'change-request-select')
      ).toBeInTheDocument()
    );

    const select = createWrapper(container).findSelect();
    select?.openDropdown();

    expect(
      select?.findDropdown().findSelectedOptions()[0]?.findLabel().getElement()
        .textContent
    ).toMatch(/CR-3 - 2 Aug 2021 - Pending/);
  });

  it('displays user requesting the change request', async () => {
    const routes = [
      {
        path: '/',
        element: <ChangeRequestLevels parentId={'parent-id'} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitUntilLoaded();
    await waitUntilLoaded();

    await waitFor(() =>
      expect(
        getByText(container, 'Requesters').nextElementSibling?.querySelector(
          'h4'
        )?.textContent
      ).toEqual('User1')
    );
  });

  it('displays override details when present', async () => {
    const routes = [
      {
        path: '/',

        element: (
          <ChangeRequestLevels
            parentId={'parent-id'}
            changeRequestId={'change-request-id-2'}
          />
        ),
      },
    ];

    const router = createMemoryRouter(routes);

    render(<RouterProvider router={router}></RouterProvider>, {
      wrapper: getWrapper(defaultMocksWithOverride, ...providerWithoutRouter),
    });

    await waitFor(() =>
      expect(screen.findByTestId('override-alert')).toBeTruthy()
    );
  });

  it('does not display override details when not present', async () => {
    const routes = [
      {
        path: '/',

        element: (
          <ChangeRequestLevels
            parentId={'parent-id'}
            changeRequestId={'change-request-id-2'}
          />
        ),
      },
    ];

    const router = createMemoryRouter(routes);

    render(<RouterProvider router={router}></RouterProvider>, {
      wrapper: getWrapper(testMocks, ...providerWithoutRouter),
    });

    await waitFor(() =>
      expect(screen.queryByTestId('override-alert')).toBeFalsy()
    );
  });

  it('displays a level for each approval step', async () => {
    const routes = [
      {
        path: '/',
        element: <ChangeRequestLevels parentId={'parent-id'} />,
      },
    ];

    const router = createMemoryRouter(routes);

    const { container } = render(
      <RouterProvider router={router}></RouterProvider>,
      {
        wrapper: getWrapper(testMocks, ...providerWithoutRouter),
      }
    );

    await waitUntilLoaded();

    await waitFor(() =>
      expect(getByText(container, 'Level 1')).toBeInTheDocument()
    );
  });
});
