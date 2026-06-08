import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import type { FC, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type AllowedScope,
  type CreateClientResponse,
  ExternalApiProvider,
  useExternalApi,
} from './ExternalApiProvider';

// Mock dependencies
vi.mock('@risksmart-app/components/src/hooks/useRisksmartUser');
vi.mock('@risksmart-app/components/src/utils/environment');

// Import mocked modules
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { getEnv } from '@risksmart-app/components/src/utils/environment';

const mockUseRisksmartUser = vi.mocked(useRisksmartUser);
const mockGetEnv = vi.mocked(getEnv);

// ============================================================================
// Common Mock Data
// ============================================================================

const MOCK_BASE_URL = 'https://api.example.com';
const MOCK_TOKEN = 'test-token-123';

const mockAuthenticatedUser = {
  getAccessTokenSilently: vi.fn().mockResolvedValue(MOCK_TOKEN),
  isLoading: false,
  isAuthenticated: true,
} as unknown as ReturnType<typeof useRisksmartUser>;

const mockLoadingUser = {
  getAccessTokenSilently: vi.fn().mockResolvedValue(MOCK_TOKEN),
  isLoading: true,
  isAuthenticated: false,
} as unknown as ReturnType<typeof useRisksmartUser>;

const mockUnauthenticatedUser = {
  getAccessTokenSilently: vi.fn().mockResolvedValue(MOCK_TOKEN),
  isLoading: false,
  isAuthenticated: false,
} as unknown as ReturnType<typeof useRisksmartUser>;

// Raw API response format (as returned from the API)
const createMockRawApiClient = (
  overrides: Partial<{
    clientKey: string;
    name: string;
    createdAt: string;
    createdBy: string;
    scopes: string[];
    status: string;
    compatVersion: string;
  }> = {}
) => ({
  clientKey: 'client-key-123',
  name: 'Test Client',
  createdAt: '2024-01-15T10:00:00.000Z',
  createdBy: 'user-123',
  scopes: ['risks:read', 'controls:write'],
  status: 'active',
  compatVersion: 'v1',
  ...overrides,
});

const createMockAllowedScope = (
  overrides: Partial<AllowedScope> = {}
): AllowedScope => ({
  name: 'risks:read',
  desc: 'Read risks',
  ...overrides,
});

const createMockFetchClientsResponse = (
  overrides: {
    data?: ReturnType<typeof createMockRawApiClient>[];
    metadata?: {
      allowedScopes?: AllowedScope[];
      orgMaxClients?: number;
      documentationPath?: string;
    };
  } = {}
) => ({
  data: overrides.data ?? [createMockRawApiClient()],
  metadata: {
    allowedScopes: overrides.metadata?.allowedScopes ?? [
      createMockAllowedScope(),
    ],
    orgMaxClients: overrides.metadata?.orgMaxClients ?? 5,
    documentationPath: overrides.metadata?.documentationPath,
  },
});

const createMockCreateClientResponse = (
  overrides: Partial<CreateClientResponse> = {}
): CreateClientResponse => ({
  clientName: 'New Client',
  clientKey: 'new-client-key',
  clientSecret: 'secret-123',
  ...overrides,
});

// ============================================================================
// Test Helpers
// ============================================================================

const createMockFetch = (response: unknown, ok = true, statusText = 'OK') => {
  return vi.fn().mockResolvedValue({
    ok,
    statusText,
    json: vi.fn().mockResolvedValue(response),
  });
};

// Wrapper component for testing the hook
const createWrapper = (): FC<{ children: ReactNode }> => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ExternalApiProvider>{children}</ExternalApiProvider>;
  };
};

// Test consumer component
const TestConsumer: FC = () => {
  const context = useExternalApi();

  return (
    <div>
      <span data-testid={'loading'}>{context.loading.toString()}</span>
      <span data-testid={'client-count'}>{context.apiClients.length}</span>
      <span data-testid={'error'}>{context.error?.message ?? 'none'}</span>
      <span data-testid={'docs-url'}>{context.docsUrl ?? 'none'}</span>
      <span data-testid={'create-enabled'}>
        {(!context.isCreateDisabled).toString()}
      </span>
    </div>
  );
};

// ============================================================================
// Tests
// ============================================================================

describe('ExternalApiProvider', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    mockGetEnv.mockReturnValue(MOCK_BASE_URL);
    mockUseRisksmartUser.mockReturnValue(mockAuthenticatedUser);
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Initial Loading State', () => {
    it('should show loading spinner while auth is loading', () => {
      mockUseRisksmartUser.mockReturnValue(mockLoadingUser);

      render(
        <ExternalApiProvider>
          <div data-testid={'children'}>{'Content'}</div>
        </ExternalApiProvider>
      );

      expect(screen.getByTestId('loading')).toBeDefined();
      expect(screen.queryByTestId('children')).toBeNull();
    });

    it('should render children when auth is not loading', async () => {
      global.fetch = createMockFetch(createMockFetchClientsResponse());

      render(
        <ExternalApiProvider>
          <div data-testid={'children'}>{'Content'}</div>
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('children')).toBeDefined();
      });
    });
  });

  describe('Fetching API Clients', () => {
    it('should fetch API clients on mount when authenticated', async () => {
      const mockResponse = createMockFetchClientsResponse();
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/api/v1/auth/clients`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${MOCK_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      expect(screen.getByTestId('client-count').textContent).toBe('1');
    });

    it('should not fetch API clients when not authenticated', async () => {
      mockUseRisksmartUser.mockReturnValue(mockUnauthenticatedUser);
      global.fetch = createMockFetch(createMockFetchClientsResponse());

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('true');
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should filter out inactive clients', async () => {
      const mockResponse = createMockFetchClientsResponse({
        data: [
          createMockRawApiClient({ clientKey: 'active-1', status: 'active' }),
          createMockRawApiClient({
            clientKey: 'inactive-1',
            status: 'inactive',
          }),
          createMockRawApiClient({ clientKey: 'active-2', status: 'active' }),
        ],
      });
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('client-count').textContent).toBe('2');
    });

    it('should set docsUrl when documentationPath is provided', async () => {
      const mockResponse = createMockFetchClientsResponse({
        metadata: {
          allowedScopes: [createMockAllowedScope()],
          orgMaxClients: 5,
          documentationPath: '/docs/api',
        },
      });
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('docs-url').textContent).toBe(
          `${MOCK_BASE_URL}/docs/api`
        );
      });
    });

    it('should not set docsUrl when documentationPath is not provided', async () => {
      const mockResponse = createMockFetchClientsResponse({
        metadata: {
          allowedScopes: [createMockAllowedScope()],
          orgMaxClients: 5,
          documentationPath: undefined,
        },
      });
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('docs-url').textContent).toBe('none');
    });

    it('should enable create when under client limit', async () => {
      const mockResponse = createMockFetchClientsResponse({
        data: [
          createMockRawApiClient(),
          createMockRawApiClient({ clientKey: 'client-2' }),
        ],
        metadata: {
          allowedScopes: [createMockAllowedScope()],
          orgMaxClients: 5,
        },
      });
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('create-enabled').textContent).toBe('true');
      });
    });

    it('should disable create when at client limit', async () => {
      const mockResponse = createMockFetchClientsResponse({
        data: [
          createMockRawApiClient({ clientKey: 'client-1' }),
          createMockRawApiClient({ clientKey: 'client-2' }),
          createMockRawApiClient({ clientKey: 'client-3' }),
        ],
        metadata: {
          allowedScopes: [createMockAllowedScope()],
          orgMaxClients: 3,
        },
      });
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('create-enabled').textContent).toBe('false');
      });
    });

    it('should use default client limit of 5 when not provided', async () => {
      const mockResponse = {
        data: [
          createMockRawApiClient({ clientKey: 'client-1' }),
          createMockRawApiClient({ clientKey: 'client-2' }),
          createMockRawApiClient({ clientKey: 'client-3' }),
          createMockRawApiClient({ clientKey: 'client-4' }),
        ],
        metadata: {
          allowedScopes: [createMockAllowedScope()],
        },
      };
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('create-enabled').textContent).toBe('true');
      });
    });

    it('should handle empty data array', async () => {
      const mockResponse = createMockFetchClientsResponse({
        data: [],
      });
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('client-count').textContent).toBe('0');
      expect(screen.getByTestId('create-enabled').textContent).toBe('true');
    });

    it('should handle missing data property', async () => {
      const mockResponse = {
        metadata: {
          allowedScopes: [createMockAllowedScope()],
          orgMaxClients: 5,
        },
      };
      global.fetch = createMockFetch(mockResponse);

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('client-count').textContent).toBe('0');
    });

    it('should handle fetch error', async () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      global.fetch = createMockFetch({}, false, 'Internal Server Error');

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe(
          'Failed to fetch API clients: Internal Server Error'
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle network error', async () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Network error');
      });

      consoleSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      global.fetch = vi.fn().mockRejectedValue('String error');

      render(
        <ExternalApiProvider>
          <TestConsumer />
        </ExternalApiProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Unknown error');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Creating API Client', () => {
    it('should create a client and refresh the list', async () => {
      const fetchClientsResponse = createMockFetchClientsResponse();
      const createResponse = createMockCreateClientResponse();

      let fetchCallCount = 0;
      global.fetch = vi
        .fn()
        .mockImplementation((url: string, options: RequestInit) => {
          if (options.method === 'POST') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(createResponse),
            });
          }
          fetchCallCount++;

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(fetchClientsResponse),
          });
        });

      const { result } = renderHook(() => useExternalApi(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let response: CreateClientResponse | undefined;
      await act(async () => {
        response = await result.current.createClient('New Client', [
          'risks:read',
        ]);
      });

      expect(response).toEqual(createResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/api/v1/auth/clients`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${MOCK_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'New Client', scopes: ['risks:read'] }),
        }
      );
      // Initial fetch + refresh after create
      expect(fetchCallCount).toBe(2);
    });

    it('should use provided name when clientName not in response', async () => {
      const fetchClientsResponse = createMockFetchClientsResponse();
      const createResponse = {
        clientKey: 'new-key',
        clientSecret: 'secret',
      };

      global.fetch = vi
        .fn()
        .mockImplementation((url: string, options: RequestInit) => {
          if (options.method === 'POST') {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(createResponse),
            });
          }

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(fetchClientsResponse),
          });
        });

      const { result } = renderHook(() => useExternalApi(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let response: CreateClientResponse | undefined;
      await act(async () => {
        response = await result.current.createClient('Fallback Name', [
          'risks:read',
        ]);
      });

      expect(response?.clientName).toBe('Fallback Name');
    });

    it('should throw error when create fails', async () => {
      const fetchClientsResponse = createMockFetchClientsResponse();

      global.fetch = vi
        .fn()
        .mockImplementation((url: string, options: RequestInit) => {
          if (options.method === 'POST') {
            return Promise.resolve({
              ok: false,
              statusText: 'Bad Request',
            });
          }

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(fetchClientsResponse),
          });
        });

      const { result } = renderHook(() => useExternalApi(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.createClient('New Client', ['risks:read']);
        })
      ).rejects.toThrow('Failed to create API client: Bad Request');
    });
  });

  describe('Deleting API Client', () => {
    it('should delete a client and update local state', async () => {
      const mockClients = [
        createMockRawApiClient({ clientKey: 'client-1' }),
        createMockRawApiClient({ clientKey: 'client-2' }),
      ];
      const fetchClientsResponse = createMockFetchClientsResponse({
        data: mockClients,
      });

      global.fetch = vi
        .fn()
        .mockImplementation((url: string, options: RequestInit) => {
          if (options.method === 'DELETE') {
            return Promise.resolve({ ok: true });
          }

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(fetchClientsResponse),
          });
        });

      const { result } = renderHook(() => useExternalApi(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.apiClients.length).toBe(2);
      });

      await act(async () => {
        await result.current.deleteClient('client-1');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${MOCK_BASE_URL}/api/v1/auth/clients/client-1`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${MOCK_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result.current.apiClients.length).toBe(1);
      expect(result.current.apiClients[0].clientId).toBe('client-2');
    });

    it('should throw error when delete fails', async () => {
      const fetchClientsResponse = createMockFetchClientsResponse();

      global.fetch = vi
        .fn()
        .mockImplementation((url: string, options: RequestInit) => {
          if (options.method === 'DELETE') {
            return Promise.resolve({
              ok: false,
              statusText: 'Not Found',
            });
          }

          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(fetchClientsResponse),
          });
        });

      const { result } = renderHook(() => useExternalApi(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.deleteClient('non-existent');
        })
      ).rejects.toThrow('Failed to delete API client: Not Found');
    });
  });

  describe('Refresh Clients', () => {
    it('should refresh the client list', async () => {
      let callCount = 0;
      const responses = [
        createMockFetchClientsResponse({ data: [createMockRawApiClient()] }),
        createMockFetchClientsResponse({
          data: [
            createMockRawApiClient(),
            createMockRawApiClient({ clientKey: 'client-2' }),
          ],
        }),
      ];

      global.fetch = vi.fn().mockImplementation(() => {
        const response =
          responses[callCount] ?? responses[responses.length - 1];
        callCount++;

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        });
      });

      const { result } = renderHook(() => useExternalApi(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.apiClients.length).toBe(1);
      });

      await act(async () => {
        await result.current.refreshClients();
      });

      expect(result.current.apiClients.length).toBe(2);
    });
  });

  describe('Authentication Errors', () => {
    it('should throw error when getting headers while unauthenticated', async () => {
      const fetchClientsResponse = createMockFetchClientsResponse();
      global.fetch = createMockFetch(fetchClientsResponse);

      const { result } = renderHook(() => useExternalApi(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Now make the user unauthenticated
      mockUseRisksmartUser.mockReturnValue(mockUnauthenticatedUser);

      // Re-render to pick up the new mock value - create a new hook instance
      const { result: result2 } = renderHook(() => useExternalApi(), {
        wrapper: createWrapper(),
      });

      // The createClient should fail because user is not authenticated
      await expect(
        act(async () => {
          await result2.current.createClient('Test', ['scope']);
        })
      ).rejects.toThrow('User not authenticated');
    });
  });
});

describe('useExternalApi Hook', () => {
  beforeEach(() => {
    mockGetEnv.mockReturnValue(MOCK_BASE_URL);
    vi.clearAllMocks();
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useExternalApi());
    }).toThrow('useExternalApi must be used within an ExternalApiProvider');
  });
});
