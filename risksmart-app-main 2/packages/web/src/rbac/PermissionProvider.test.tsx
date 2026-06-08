import { MockedProvider } from '@apollo/client/testing';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { waitUntilLoaded } from 'src/testing/formHelpers';
import {
  mockedRoleAccessErrorResponse,
  mockedRoleAccessResponse,
} from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import { testAuth0User } from 'src/testing/testUser';
import { vitest } from 'vitest';

import { PermissionsProvider } from './PermissionProvider';
vitest.mock('@risksmart-app/components/src/hooks/useRisksmartUser');

const useRisksmartUserMock = vitest.mocked(useRisksmartUser);

describe('PermissionProvider', () => {
  beforeEach(() => {
    useRisksmartUserMock.mockReturnValue(testAuth0User);
  });

  it('should displaying loader when requesting permissions', () => {
    render(
      <MockedProvider mocks={[mockedRoleAccessResponse({ role_access: [] })]}>
        <PermissionsProvider>
          <div>{'Content'}</div>
        </PermissionsProvider>
      </MockedProvider>
    );
    expect(screen.getByTestId('loading')).toBeDefined();
  });

  it('should displaying error when request for permissions has failed', async () => {
    render(
      <MemoryRouter>
        <MockedProvider mocks={[mockedRoleAccessErrorResponse]}>
          <PermissionsProvider>
            <div>{'Content'}</div>
          </PermissionsProvider>
        </MockedProvider>
      </MemoryRouter>
    );
    await waitUntilLoaded();
    expect(screen.getByText('Please try again later')).toBeDefined();
  });

  it('should display children after successfully getting permissions', async () => {
    render(
      <MockedProvider mocks={[mockedRoleAccessResponse({ role_access: [] })]}>
        <PermissionsProvider>
          <div>{'Content'}</div>
        </PermissionsProvider>
      </MockedProvider>
    );
    await waitUntilLoaded();
    expect(screen.getByText('Content')).toBeDefined();
  });
});
