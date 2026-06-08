import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useGetSsoConfigurations } from 'src/hooks/queries/sso-configuration/useGetSsoConfigurations';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { mockedGetOrganisationModuleResponse } from 'src/testing/mock-data/mockedGetOrganisationModule';
import { mockedRoleAccessResponse } from 'src/testing/mock-data/mockedGetRoleAccessResponse';
import type { Providers } from 'src/testing/wrapper';
import { getWrapper } from 'src/testing/wrapper';
import { vitest } from 'vitest';

import { useSaveSsoConfiguration } from '@/hooks/mutations/sso-configuration/useSaveSsoConfiguration';

import Tab from './Tab';

vitest.mock(
  'src/hooks/queries/sso-configuration/useGetSsoConfigurations',
  () => ({
    useGetSsoConfigurations: vitest.fn().mockReturnValue({
      data: undefined,
      loading: false,
      refetch: vitest.fn(),
      error: undefined,
    }),
  })
);

vitest.mock(
  '@/hooks/mutations/sso-configuration/useSaveSsoConfiguration',
  () => ({
    useSaveSsoConfiguration: vitest.fn().mockReturnValue({
      saveSsoConfiguration: vitest.fn(),
      loading: false,
    }),
  })
);

const useGetSsoConfigurationsMock = vitest.mocked(useGetSsoConfigurations);
const useSaveSsoConfigurationMock = vitest.mocked(useSaveSsoConfiguration);

const providers: Providers[] = [
  'trpc',
  'graphql',
  'permission',
  'notification',
  'router',
  'i18n',
  'features',
];

const mockedResponses = [
  mockedGetOrganisation(),
  mockedGetOrganisationModuleResponse(),
  mockedRoleAccessResponse(),
];

const renderTab = async () => {
  render(<Tab />, {
    wrapper: getWrapper([...mockedResponses], ...providers),
  });
  await screen.findByText('Identity Provider');
};

const mockExistingConfig = {
  Id: '123',
  Name: 'test-connection',
  Strategy: 'waad',
  ClientId: 'test-client-id',
  ConnectionId: 'con_abc123',
  Domain: 'test.onmicrosoft.com',
  IsActive: true,
  IsRestApiEnabled: true,
  IsOrganizationConnected: false,
  CreatedAtTimestamp: '2024-01-01T00:00:00Z',
  CreatedByUser: 'user-1',
  ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
  ModifiedByUser: 'user-1',
};

describe('SSO Tab', () => {
  beforeEach(() => {
    useGetSsoConfigurationsMock.mockReturnValue({
      data: undefined,
      loading: false,
      refetch: vitest.fn(),
      error: undefined,
    });
    useSaveSsoConfigurationMock.mockReturnValue({
      saveSsoConfiguration: vitest.fn(),
      loading: false,
    });
  });

  it('renders the SSO Configuration header', async () => {
    await renderTab();

    expect(screen.getByTestId('tab-title')).toBeInTheDocument();
  });

  it('renders the warning alert', async () => {
    await renderTab();

    expect(
      screen.getByText('Important: Test before enabling')
    ).toBeInTheDocument();
  });

  it('renders all three provider options', async () => {
    await renderTab();

    expect(screen.getByText('Azure AD')).toBeInTheDocument();
    expect(screen.getByText('Okta')).toBeInTheDocument();
    expect(screen.getAllByText('Google Workspace').length).toBeGreaterThan(0);
  });

  it('renders the Configuration section', async () => {
    await renderTab();

    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('renders Enable SSO toggle', async () => {
    await renderTab();

    expect(screen.getByText('Enable SSO')).toBeInTheDocument();
  });

  describe('Azure AD provider (default)', () => {
    it('renders Azure AD form fields by default', async () => {
      await renderTab();

      expect(screen.getByText('Microsoft Azure AD Domain')).toBeInTheDocument();
      expect(screen.getByText('Client ID')).toBeInTheDocument();
      expect(screen.getByText('Client Secret')).toBeInTheDocument();
    });

    it('shows the Azure AD configuration description', async () => {
      await renderTab();

      expect(
        screen.getByText('Enter your Microsoft Azure AD configuration details')
      ).toBeInTheDocument();
    });

    it('renders Identity Provider section', async () => {
      await renderTab();

      expect(screen.getByText('Identity Provider')).toBeInTheDocument();
    });
  });

  describe('Okta provider', () => {
    it('renders Okta form fields when Okta is selected', async () => {
      await renderTab();

      fireEvent.click(screen.getByText('Okta'));

      await waitFor(() => {
        expect(screen.getByText('Okta Domain')).toBeInTheDocument();
      });
      expect(screen.getByText('Client ID')).toBeInTheDocument();
      expect(screen.getByText('Client Secret')).toBeInTheDocument();
    });

    it('shows the Okta configuration description', async () => {
      await renderTab();

      fireEvent.click(screen.getByText('Okta'));

      await waitFor(() => {
        expect(
          screen.getByText('Enter your Okta configuration details')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Google Workspace provider', () => {
    it('renders Google Workspace form fields when selected', async () => {
      await renderTab();

      fireEvent.click(screen.getAllByText('Google Workspace')[0]);

      await waitFor(() => {
        expect(screen.getByText('Google Workspace Domain')).toBeInTheDocument();
      });
      expect(screen.getByText('Client ID')).toBeInTheDocument();
      expect(screen.getByText('Client Secret')).toBeInTheDocument();
    });

    it('shows the Google Workspace configuration description', async () => {
      await renderTab();

      fireEvent.click(screen.getAllByText('Google Workspace')[0]);

      await waitFor(() => {
        expect(
          screen.getByText('Enter your Google Workspace configuration details')
        ).toBeInTheDocument();
      });
    });
  });

  describe('existing config loading', () => {
    it('selects the provider from existing config', async () => {
      useGetSsoConfigurationsMock.mockReturnValue({
        data: {
          sso_configuration: [{ ...mockExistingConfig, Strategy: 'okta' }],
        },
        loading: false,
        refetch: vitest.fn(),
        error: undefined,
      });

      await renderTab();

      await waitFor(() => {
        expect(screen.getByText('Okta Domain')).toBeInTheDocument();
      });
    });

    it('sets SSO toggle from existing config IsOrganizationConnected', async () => {
      useGetSsoConfigurationsMock.mockReturnValue({
        data: {
          sso_configuration: [
            { ...mockExistingConfig, IsOrganizationConnected: true },
          ],
        },
        loading: false,
        refetch: vitest.fn(),
        error: undefined,
      });

      await renderTab();

      const toggle = screen.getByLabelText('Enable SSO');
      await waitFor(() => {
        expect(toggle).toBeChecked();
      });
    });

    it('toggle is unchecked when IsOrganizationConnected is false', async () => {
      useGetSsoConfigurationsMock.mockReturnValue({
        data: {
          sso_configuration: [
            { ...mockExistingConfig, IsOrganizationConnected: false },
          ],
        },
        loading: false,
        refetch: vitest.fn(),
        error: undefined,
      });

      await renderTab();

      const toggle = screen.getByLabelText('Enable SSO');
      await waitFor(() => {
        expect(toggle).not.toBeChecked();
      });
    });
  });

  describe('enable SSO validation', () => {
    it('shows error when enabling SSO without client secret', async () => {
      const mockSave = vitest.fn();
      useSaveSsoConfigurationMock.mockReturnValue({
        saveSsoConfiguration: mockSave,
        loading: false,
      });
      useGetSsoConfigurationsMock.mockReturnValue({
        data: {
          sso_configuration: [
            { ...mockExistingConfig, IsOrganizationConnected: false },
          ],
        },
        loading: false,
        refetch: vitest.fn(),
        error: undefined,
      });

      await renderTab();

      const toggle = screen.getByLabelText('Enable SSO');
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(
          screen.getByText('Please input the client secret to enable SSO.')
        ).toBeInTheDocument();
      });

      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('disables toggle when configs are loading', async () => {
      useGetSsoConfigurationsMock.mockReturnValue({
        data: undefined,
        loading: true,
        refetch: vitest.fn(),
        error: undefined,
      });

      await renderTab();

      const toggle = screen.getByLabelText('Enable SSO');
      expect(toggle).toBeDisabled();
    });

    it('passes loading state to save configuration hook', async () => {
      useSaveSsoConfigurationMock.mockReturnValue({
        saveSsoConfiguration: vitest.fn(),
        loading: true,
      });

      await renderTab();

      expect(useSaveSsoConfigurationMock).toHaveBeenCalled();
    });
  });
});
