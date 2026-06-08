import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import { getEnv } from '@risksmart-app/components/src/utils/environment';
import type { FC, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Loading from '@/components/loading';

// API Client type definition
export interface ApiClient {
  name: string;
  clientId: string;
  createdAt: string;
  createdBy: string;
  scopes: string[];
  status: 'active' | 'inactive';
  apiVersion: string;
}

// Create client response type
export interface CreateClientResponse {
  clientName: string;
  clientKey: string;
  clientSecret: string;
}

// Allowed Scope type definition
export interface AllowedScope {
  name: string;
  desc: string;
}

// Context type definition
interface ExternalApiContextType {
  apiClients: ApiClient[];
  allowedScopes: AllowedScope[];
  loading: boolean;
  error: Error | null;
  createClient: (
    name: string,
    scopes: string[]
  ) => Promise<CreateClientResponse>;
  deleteClient: (clientId: string) => Promise<void>;
  refreshClients: () => Promise<void>;
  docsUrl: string | null;
  isCreateDisabled: boolean;
}

const ExternalApiContext = createContext<ExternalApiContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const ExternalApiProvider: FC<Props> = ({ children }) => {
  const {
    getAccessTokenSilently,
    isLoading: authLoading,
    isAuthenticated,
  } = useRisksmartUser();
  const [apiClients, setApiClients] = useState<ApiClient[]>([]);
  const [allowedScopes, setAllowedScopes] = useState<AllowedScope[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [docsUrl, setDocsUrl] = useState<string | null>(null);
  const [isCreateDisabled, setIsCreateDisabled] = useState<boolean>(true);

  const baseUrl = useMemo(() => {
    return getEnv('REACT_APP_EXTERNAL_API_URL');
  }, []);

  // Function to get auth headers
  const getAuthHeaders = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    const token = await getAccessTokenSilently();

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [getAccessTokenSilently, isAuthenticated]);

  // Fetch API clients
  const fetchApiClients = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const response = await fetch(`${baseUrl}/api/v1/auth/clients`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API clients: ${response.statusText}`);
      }

      const rawData = await response.json();
      const mappedData = (rawData?.data || [])
        .map(
          ({
            clientKey,
            name,
            createdAt,
            createdBy,
            scopes,
            status,
            compatVersion,
          }: {
            clientKey: string;
            name: string;
            createdAt: string;
            createdBy: string;
            scopes: string[];
            status: string;
            compatVersion: string;
          }) => ({
            clientId: clientKey,
            name,
            createdAt: new Date(createdAt).toISOString(),
            createdBy,
            scopes: scopes || [],
            status,
            apiVersion: compatVersion,
          })
        )
        .filter(({ status }: ApiClient) => status === 'active');
      setApiClients(mappedData || []);
      setAllowedScopes(rawData.metadata?.allowedScopes || []);

      const clientLimit = rawData.metadata?.orgMaxClients ?? 5;
      setIsCreateDisabled(mappedData.length >= clientLimit);

      if (rawData.metadata?.documentationPath) {
        setDocsUrl(`${baseUrl}${rawData.metadata?.documentationPath}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [baseUrl, getAuthHeaders, isAuthenticated, authLoading]);

  // Create API client
  const createClient = useCallback(
    async (name: string, scopes: string[]): Promise<CreateClientResponse> => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${baseUrl}/api/v1/auth/clients`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, scopes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create API client: ${response.statusText}`);
      }

      const data = await response.json();

      // Refresh the client list to get the complete data for the table
      await fetchApiClients();

      // Return the create response which includes the secret.
      return {
        clientName: data.clientName || name,
        clientKey: data.clientKey,
        clientSecret: data.clientSecret,
      };
    },
    [baseUrl, getAuthHeaders, fetchApiClients]
  );

  // Delete API client
  const deleteClient = useCallback(
    async (clientId: string): Promise<void> => {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${baseUrl}/api/v1/auth/clients/${clientId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete API client: ${response.statusText}`);
      }

      setApiClients((prev) =>
        prev.filter((client) => client.clientId !== clientId)
      );
    },
    [baseUrl, getAuthHeaders]
  );

  // Refresh API clients
  const refreshClients = useCallback(async () => {
    await fetchApiClients();
  }, [fetchApiClients]);

  // Fetch clients on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchApiClients();
    }
  }, [authLoading, isAuthenticated, fetchApiClients]);

  const contextValue = useMemo(
    () => ({
      apiClients,
      allowedScopes,
      loading,
      error,
      createClient,
      deleteClient,
      refreshClients,
      docsUrl,
      isCreateDisabled,
    }),
    [
      apiClients,
      allowedScopes,
      loading,
      error,
      createClient,
      deleteClient,
      refreshClients,
      docsUrl,
      isCreateDisabled,
    ]
  );

  // Show loading spinner while auth is loading
  if (authLoading) {
    return <Loading data-loading-reason={'external-api-auth'} />;
  }

  return (
    <ExternalApiContext.Provider value={contextValue}>
      {children}
    </ExternalApiContext.Provider>
  );
};

// Hook to use the External API context
// eslint-disable-next-line react-refresh/only-export-components
export const useExternalApi = (): ExternalApiContextType => {
  const context = useContext(ExternalApiContext);
  if (!context) {
    throw new Error(
      'useExternalApi must be used within an ExternalApiProvider'
    );
  }

  return context;
};
