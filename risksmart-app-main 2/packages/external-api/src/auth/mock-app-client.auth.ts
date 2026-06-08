import { randomUUID } from 'crypto';

import type {
  ClientAccessTokenResult,
  IAuthClient,
  OrgClientItem,
} from '../clients/client.interface';
import { ClientLimitError } from '../errors/app-client.errors';
import type { AppClientCreate } from '../schemas/app-clients/app-client.schema';
import type { AppAuthClientConfig } from '../schemas/app-config/app-config.schema';

interface MockClientDetails {
  clientName: string;
  clientKey: string;
  clientSecret: string;
}

// Mock client to simulate app provider.
export class MockAppClient implements IAuthClient {
  client: MockClientDetails | null = null;

  constructor(private props: AppAuthClientConfig) {}

  getOrgClients(): Promise<OrgClientItem[]> {
    return Promise.resolve([]);
  }

  getActiveClient() {
    return Promise.resolve(null);
  }

  async createClientAccessToken(): Promise<ClientAccessTokenResult> {
    return Promise.resolve({
      accessToken: 'abc123',
      expiresIn: 3600,
      tokenType: 'Bearer',
    });
  }

  async createNewClient(newClientData: AppClientCreate) {
    const mockExistingCount = process.env.MOCK_EXISTING_CLIENT_COUNT || '0';
    if (parseInt(mockExistingCount) >= this.props.orgClientLimit) {
      throw new ClientLimitError();
    }

    const { orgId, name } = newClientData;
    const clientName = `${orgId}-${name}`;
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    this.client = {
      clientName: clientName,
      clientKey: `mock_client_${timestamp}_${random}`,
      clientSecret: `mock_secret_${randomUUID()}`,
    };

    return await Promise.resolve(this.client);
  }

  async disableAndRemoveClient(): Promise<void> {
    // Mock implementation - just reset the client
    this.client = null;

    return Promise.resolve();
  }
}
