import type { ResourceScope, ResourceScopeKey } from 'src/auth/scopes';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppClientRequest } from '../../schemas/app-clients/app-client.schema';
import type { GetAppClientsResponse } from '../../services/app-clients/app-clients.service';
import type { Compat } from '../../types/versioning';
import {
  mapClientDataToCreateSchema,
  transformClientsListQueryResponse,
} from './app-client.transformer';

// Mock the utility functions to isolate transformer logic
vi.mock('../../utils/scopes', () => ({
  getResourceServerScopes: vi.fn(),
}));

vi.mock('../../schemas/app-clients/app-client.schema', async () => {
  const actual = await vi.importActual<
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    typeof import('../../schemas/app-clients/app-client.schema')
  >('../../schemas/app-clients/app-client.schema');

  return {
    ...actual,
    appClientCreateSchema: {
      parse: vi.fn(
        (data) => data as ReturnType<typeof actual.appClientCreateSchema.parse>
      ),
    },
    appClientListResponse: {
      parse: vi.fn(
        (data) => data as ReturnType<typeof actual.appClientListResponse.parse>
      ),
    },
  };
});

describe('app-client.transformer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up default mock implementations
    const { appClientCreateSchema } =
      await import('../../schemas/app-clients/app-client.schema');

    // Reset schema parse mock to default behavior
    vi.mocked(appClientCreateSchema.parse).mockImplementation(
      (data) => data as ReturnType<typeof appClientCreateSchema.parse>
    );
  });

  describe('mapClientDataToCreateSchema', () => {
    // Common mock objects
    const baseMockClientData: AppClientRequest = {
      name: 'Test Client App',
      scopes: ['risks:read', 'risks:write'],
    };

    const baseMockProps = {
      createdAt: 1704067200000, // 2024-01-01T00:00:00.000Z
      createdBy: 'user|123456789',
      role: 'rs-external' as const,
      compatVersion: '1.0.0' as Compat,
      orgId: 'org-123',
      tenantId: 'tenant-456',
      rateLimitProfile: 'chill' as const,
    };

    describe('happy path', () => {
      it('should transform client data to create schema with matching scopes', async () => {
        const { appClientCreateSchema } =
          await import('../../schemas/app-clients/app-client.schema');

        const result = mapClientDataToCreateSchema(
          baseMockClientData,
          baseMockProps
        );

        expect(result).toEqual({
          name: 'Test Client App',
          createdAt: 1704067200000,
          createdBy: 'user|123456789',
          role: 'rs-external',
          compatVersion: '1.0.0',
          orgId: 'org-123',
          tenantId: 'tenant-456',
          scopes: ['risks:read', 'risks:write'],
          updatedAt: 1704067200000,
          updatedBy: 'user|123456789',
          status: 'active',
          rateLimitProfile: 'chill',
        });

        expect(appClientCreateSchema.parse).toHaveBeenCalledWith(result);
      });

      it('should handle client with single scope', () => {
        const clientData: AppClientRequest = {
          name: 'Single Scope Client',
          scopes: ['risks:read'],
        };

        const result = mapClientDataToCreateSchema(clientData, baseMockProps);

        expect(result.scopes).toEqual(['risks:read']);
        expect(result.name).toBe('Single Scope Client');
      });

      it('should handle rs-internal role', () => {
        const props = {
          ...baseMockProps,
          role: 'rs-internal' as const,
        };

        const result = mapClientDataToCreateSchema(baseMockClientData, props);

        expect(result.role).toBe('rs-internal');
      });

      it('should set updatedAt and updatedBy to match createdAt and createdBy', () => {
        const props = {
          ...baseMockProps,
          createdAt: 1704153600000, // 2024-01-02T00:00:00.000Z
          createdBy: 'admin|987654321',
        };

        const result = mapClientDataToCreateSchema(baseMockClientData, props);

        expect(result.updatedAt).toBe(1704153600000);
        expect(result.updatedBy).toBe('admin|987654321');
      });

      it('should always set status to active', () => {
        const result = mapClientDataToCreateSchema(
          baseMockClientData,
          baseMockProps
        );

        expect(result.status).toBe('active');
      });
    });

    describe('schema validation', () => {
      it('should call appClientCreateSchema.parse with mapped data', async () => {
        const { appClientCreateSchema } =
          await import('../../schemas/app-clients/app-client.schema');

        mapClientDataToCreateSchema(baseMockClientData, baseMockProps);

        expect(appClientCreateSchema.parse).toHaveBeenCalledTimes(1);
      });

      it('should throw error when schema validation fails', async () => {
        const { appClientCreateSchema } =
          await import('../../schemas/app-clients/app-client.schema');

        const validationError = new Error('Schema validation failed');
        vi.mocked(appClientCreateSchema.parse).mockImplementation(() => {
          throw validationError;
        });

        expect(() =>
          mapClientDataToCreateSchema(baseMockClientData, baseMockProps)
        ).toThrow('Schema validation failed');
      });
    });

    describe('client name variations', () => {
      it('should handle client names with spaces', () => {
        const clientData: AppClientRequest = {
          name: 'My Test Client App',
          scopes: ['risks:read'],
        };

        const result = mapClientDataToCreateSchema(clientData, baseMockProps);

        expect(result.name).toBe('My Test Client App');
      });

      it('should handle client names with special characters', () => {
        const clientData: AppClientRequest = {
          name: 'Test-Client.App',
          scopes: ['risks:read'],
        };

        const result = mapClientDataToCreateSchema(clientData, baseMockProps);

        expect(result.name).toBe('Test-Client.App');
      });

      it('should handle maximum length client name', () => {
        const longName = 'A'.repeat(250);
        const clientData: AppClientRequest = {
          name: longName,
          scopes: ['risks:read'],
        };

        const result = mapClientDataToCreateSchema(clientData, baseMockProps);

        expect(result.name).toBe(longName);
      });
    });

    describe('different compat versions', () => {
      it('should handle different compat versions', () => {
        const props = {
          ...baseMockProps,
          compatVersion: '2.5.0' as Compat,
        };

        const result = mapClientDataToCreateSchema(baseMockClientData, props);

        expect(result.compatVersion).toBe('2.5.0');
      });
    });

    describe('different org and tenant IDs', () => {
      it('should handle different org and tenant IDs', () => {
        const props = {
          ...baseMockProps,
          orgId: 'org-999',
          tenantId: 'tenant-888',
        };

        const result = mapClientDataToCreateSchema(baseMockClientData, props);

        expect(result.orgId).toBe('org-999');
        expect(result.tenantId).toBe('tenant-888');
      });
    });
  });

  describe('transformClientsListQueryResponse', () => {
    // Common mock scopes
    const mockScopes = {
      risksRead: { name: 'risks:read', desc: 'Read risk data' },
      risksWrite: { name: 'risks:write', desc: 'Write risk data' },
      actionsRead: { name: 'actions:read', desc: 'Read action data' },
      controlsRead: { name: 'controls:read', desc: 'Read control data' },
      issuesRead: { name: 'issues:read', desc: 'Read issue data' },
      authClientRead: { name: 'auth-client:read', desc: 'Auth client read' },
      authClientWrite: { name: 'auth-client:write', desc: 'Auth client write' },
      documentationRead: {
        name: 'documentation:read',
        desc: 'Documentation read',
      },
      documentationWrite: {
        name: 'documentation:write',
        desc: 'Documentation write',
      },
      accountRead: { name: 'account:read', desc: 'Account read' },
      accountWrite: { name: 'account:write', desc: 'Account write' },
      authenticationRead: { name: 'authentication:read', desc: 'Auth read' },
      documentsRead: { name: 'documents:read', desc: 'Documents read' },
      accountingRead: { name: 'accounting:read', desc: 'Accounting read' },
    };

    // Common mock clients
    const mockClients = {
      activeClient1: {
        clientName: 'Test Client 1',
        scopes: 'risks:read,risks:write',
        createdAt: 1704067200000,
        updatedAt: 1704067200000,
        status: 'active' as const,
        clientId: 'client-123',
        compatVersion: '1.0.0',
        role: 'rs-external' as const,
        orgId: 'org-123',
        tenantId: 'tenant-456',
      },
      activeClient2: {
        clientName: 'Test Client 2',
        scopes: 'actions:read,controls:read',
        createdAt: 1704153600000,
        updatedAt: 1704153600000,
        status: 'active' as const,
        clientId: 'client-456',
        compatVersion: '1.0.0',
        role: 'rs-external' as const,
        orgId: 'org-123',
        tenantId: 'tenant-456',
      },
      pendingClient: {
        clientName: 'Inactive Client',
        scopes: 'risks:read',
        createdAt: 1704067200000,
        updatedAt: 1704067200000,
        status: 'pending' as const,
        clientId: 'client-789',
        compatVersion: '1.0.0',
        role: 'rs-external' as const,
        orgId: 'org-123',
        tenantId: 'tenant-456',
      },
      disabledClient: {
        clientName: 'Disabled Client',
        scopes: 'risks:read',
        createdAt: 1704067200000,
        updatedAt: 1704067200000,
        status: 'disabled' as const,
        clientId: 'client-999',
        compatVersion: '1.0.0',
        role: 'rs-external' as const,
        orgId: 'org-123',
        tenantId: 'tenant-456',
      },
    };

    // Base allowed scopes array
    const baseAllowedScopes = [
      mockScopes.risksRead,
      mockScopes.risksWrite,
      mockScopes.actionsRead,
      mockScopes.controlsRead,
      mockScopes.issuesRead,
    ] as ResourceScope[];

    // Base metadata
    const baseMetadata = {
      allowedScopes: baseAllowedScopes,
      clientLimit: 10,
      signedDocsPath: 'some-signed/path',
    };

    // Base mock result
    const baseMockResult: GetAppClientsResponse = {
      data: [mockClients.activeClient1, mockClients.activeClient2],
      metadata: baseMetadata,
    };

    // Expected transformed client objects
    const expectedTransformedClient1 = {
      compatVersion: '1.0.0',
      createdAt: 1704067200000,
      name: 'Test Client 1',
      clientKey: 'client-123',
      status: 'active' as const,
      scopes: ['risks:read', 'risks:write'],
    };

    const expectedTransformedClient2 = {
      compatVersion: '1.0.0',
      createdAt: 1704153600000,
      name: 'Test Client 2',
      clientKey: 'client-456',
      status: 'active' as const,
      scopes: ['actions:read', 'controls:read'],
    };

    beforeEach(async () => {
      const { appClientListResponse } =
        await import('../../schemas/app-clients/app-client.schema');

      // Reset schema parse mock to default behavior
      vi.mocked(appClientListResponse.parse).mockImplementation(
        (data) => data as ReturnType<typeof appClientListResponse.parse>
      );
    });

    describe('happy path', () => {
      it('should transform clients list query response successfully', async () => {
        const { appClientListResponse } =
          await import('../../schemas/app-clients/app-client.schema');

        const result = transformClientsListQueryResponse(baseMockResult);

        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual(expectedTransformedClient1);
        expect(result.data[1]).toEqual(expectedTransformedClient2);
        expect(result.metadata.orgMaxClients).toBe(10);
        expect(result.metadata.documentationPath).toBe(
          baseMetadata.signedDocsPath
        );
        expect(result.metadata.allowedScopes).toEqual(baseAllowedScopes);
        expect(appClientListResponse.parse).toHaveBeenCalledTimes(1);
      });

      it('should map clientName to name correctly', () => {
        const result = transformClientsListQueryResponse(baseMockResult);

        expect(result.data[0]!.name).toBe('Test Client 1');
        expect(result.data[1]!.name).toBe('Test Client 2');
      });

      it('should map clientId to clientKey correctly', () => {
        const result = transformClientsListQueryResponse(baseMockResult);

        expect(result.data[0]!.clientKey).toBe('client-123');
        expect(result.data[1]!.clientKey).toBe('client-456');
      });

      it('should parse comma-separated scopes into array', () => {
        const result = transformClientsListQueryResponse(baseMockResult);

        expect(result.data[0]!.scopes).toEqual(['risks:read', 'risks:write']);
        expect(result.data[1]!.scopes).toEqual([
          'actions:read',
          'controls:read',
        ]);
      });

      it('should preserve compatVersion and createdAt fields', () => {
        const result = transformClientsListQueryResponse(baseMockResult);

        expect(result.data[0]!.compatVersion).toBe('1.0.0');
        expect(result.data[0]!.createdAt).toBe(1704067200000);
        expect(result.data[1]!.compatVersion).toBe('1.0.0');
        expect(result.data[1]!.createdAt).toBe(1704153600000);
      });

      it('should filter out scopes matching EXCLUDED_SCOPE_RESOURCE_REGEX', () => {
        const resultWithExcludedScopes: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMetadata,
            allowedScopes: [
              ...baseAllowedScopes,
              mockScopes.authClientRead,
              mockScopes.documentationRead,
              mockScopes.accountRead,
            ] as ResourceScope[],
            clientLimit: 10,
          },
        };

        const result = transformClientsListQueryResponse(
          resultWithExcludedScopes
        );

        expect(result.metadata.allowedScopes).toHaveLength(5);
        expect(result.metadata.allowedScopes).toEqual(baseAllowedScopes);

        const scopeNames = result.metadata.allowedScopes.map(
          (scope) => scope.name
        );
        expect(scopeNames).not.toContain('auth-client:read');
        expect(scopeNames).not.toContain('documentation:read');
        expect(scopeNames).not.toContain('account:read');
      });

      it('should filter out inactive clients from data', () => {
        const resultWithInactiveClients: GetAppClientsResponse = {
          data: [
            ...baseMockResult.data,
            mockClients.pendingClient,
            mockClients.disabledClient,
          ],
          metadata: baseMockResult.metadata,
        };

        const result = transformClientsListQueryResponse(
          resultWithInactiveClients
        );

        expect(result.data).toHaveLength(2);
        expect(result.data.every((client) => client.status === 'active')).toBe(
          true
        );
        expect(
          result.data.some((client) => client.clientKey === 'client-789')
        ).toBe(false);
        expect(
          result.data.some((client) => client.clientKey === 'client-999')
        ).toBe(false);
      });

      it('should create documentation path correctly', () => {
        const result = transformClientsListQueryResponse(baseMockResult);

        expect(result.metadata.documentationPath).toBe(
          baseMetadata.signedDocsPath
        );
      });

      it('should pass orgMaxClients correctly from metadata clientLimit', () => {
        const resultWithDifferentLimit: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMockResult.metadata,
            clientLimit: 25,
          },
        };

        const result = transformClientsListQueryResponse(
          resultWithDifferentLimit
        );

        expect(result.metadata.orgMaxClients).toBe(25);
      });
    });

    describe('edge cases', () => {
      it('should handle empty data array', () => {
        const emptyDataResult: GetAppClientsResponse = {
          data: [],
          metadata: baseMockResult.metadata,
        };

        const result = transformClientsListQueryResponse(emptyDataResult);

        expect(result.data).toHaveLength(0);
        expect(result.data).toEqual([]);
      });

      it('should handle empty allowedScopes array', () => {
        const emptyAllowedScopesResult: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMetadata,
            allowedScopes: [],
            clientLimit: 10,
          },
        };

        const result = transformClientsListQueryResponse(
          emptyAllowedScopesResult
        );

        expect(result.metadata.allowedScopes).toHaveLength(0);
        expect(result.metadata.allowedScopes).toEqual([]);
      });

      it('should handle when all clients are inactive', () => {
        const allInactiveResult: GetAppClientsResponse = {
          data: [mockClients.pendingClient, mockClients.disabledClient],
          metadata: baseMockResult.metadata,
        };

        const result = transformClientsListQueryResponse(allInactiveResult);

        expect(result.data).toHaveLength(0);
        expect(result.data).toEqual([]);
      });

      it('should handle when all scopes are excluded by regex', () => {
        const allExcludedScopesResult: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMetadata,
            allowedScopes: [
              mockScopes.authClientRead,
              mockScopes.authClientWrite,
              mockScopes.documentationRead,
              mockScopes.documentationWrite,
              mockScopes.accountRead,
              mockScopes.accountWrite,
            ] as ResourceScope[],
            clientLimit: 10,
          },
        };

        const result = transformClientsListQueryResponse(
          allExcludedScopesResult
        );

        expect(result.metadata.allowedScopes).toHaveLength(0);
        expect(result.metadata.allowedScopes).toEqual([]);
      });

      it('should handle scopes with partial matches to excluded patterns', () => {
        const partialMatchScopesResult: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMetadata,
            allowedScopes: [
              mockScopes.authClientRead,
              mockScopes.authenticationRead,
              mockScopes.documentationRead,
              mockScopes.documentsRead,
              mockScopes.accountRead,
              mockScopes.accountingRead,
            ] as ResourceScope[],
            clientLimit: 10,
          },
        };

        const result = transformClientsListQueryResponse(
          partialMatchScopesResult
        );

        expect(result.metadata.allowedScopes).toHaveLength(2);
        const scopeNames = result.metadata.allowedScopes.map(
          (scope) => scope.name
        );
        expect(scopeNames).toContain('authentication:read');
        expect(scopeNames).toContain('documents:read');
        expect(scopeNames).not.toContain('accounting:read');
        expect(scopeNames).not.toContain('auth-client:read');
        expect(scopeNames).not.toContain('documentation:read');
        expect(scopeNames).not.toContain('account:read');
      });

      it('should handle mixed case in scope names with exclusion regex', () => {
        const mixedCaseScopesResult: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMetadata,
            allowedScopes: [
              { name: 'Auth-Client:read', desc: 'Filtered - case insensitive' },
              {
                name: 'Documentation:read',
                desc: 'Filtered - case insensitive',
              },
              mockScopes.risksRead,
            ] as ResourceScope[],
            clientLimit: 10,
          },
        };

        const result = transformClientsListQueryResponse(mixedCaseScopesResult);

        expect(result.metadata.allowedScopes).toHaveLength(1);
        const scopeNames = result.metadata.allowedScopes.map(
          (scope) => scope.name
        );
        expect(scopeNames).toContain('risks:read');
        expect(scopeNames).not.toContain('Auth-Client:read');
        expect(scopeNames).not.toContain('Documentation:read');
      });

      it('should handle single client in data array', () => {
        const singleClientResult: GetAppClientsResponse = {
          data: [mockClients.activeClient1],
          metadata: baseMockResult.metadata,
        };

        const result = transformClientsListQueryResponse(singleClientResult);

        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual(expectedTransformedClient1);
      });

      it('should handle client with empty scopes string', () => {
        const clientWithEmptyScopes: GetAppClientsResponse = {
          data: [
            {
              ...mockClients.activeClient1,
              clientName: 'Client No Scopes',
              scopes: '',
              clientId: 'client-empty',
            },
          ],
          metadata: baseMockResult.metadata,
        };

        const result = transformClientsListQueryResponse(clientWithEmptyScopes);

        expect(result.data).toHaveLength(1);
        expect(result.data[0]!.scopes).toEqual([]);
      });

      it('should handle client with single scope', () => {
        const singleScopeClient: GetAppClientsResponse = {
          data: [
            {
              ...mockClients.activeClient1,
              clientName: 'Single Scope Client',
              scopes: 'risks:read',
              clientId: 'client-single',
            },
          ],
          metadata: baseMockResult.metadata,
        };

        const result = transformClientsListQueryResponse(singleScopeClient);

        expect(result.data[0]!.scopes).toEqual(['risks:read']);
      });

      it('should handle client with many scopes', () => {
        const manyScopesClient: GetAppClientsResponse = {
          data: [
            {
              ...mockClients.activeClient1,
              clientName: 'Many Scopes Client',
              scopes:
                'risks:read,risks:write,actions:read,actions:write,controls:read',
              clientId: 'client-many',
            },
          ],
          metadata: baseMockResult.metadata,
        };

        const result = transformClientsListQueryResponse(manyScopesClient);

        expect(result.data[0]!.scopes).toEqual([
          'risks:read',
          'risks:write',
          'actions:read',
          'actions:write',
          'controls:read',
        ]);
      });

      it('should handle zero clientLimit', () => {
        const zeroLimitResult: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMockResult.metadata,
            clientLimit: 0,
          },
        };

        const result = transformClientsListQueryResponse(zeroLimitResult);

        expect(result.metadata.orgMaxClients).toBe(0);
      });

      it('should handle large clientLimit values', () => {
        const largeLimitResult: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMockResult.metadata,
            clientLimit: 9999,
          },
        };

        const result = transformClientsListQueryResponse(largeLimitResult);

        expect(result.metadata.orgMaxClients).toBe(9999);
      });

      it('should handle different compat versions', () => {
        const differentVersionsResult: GetAppClientsResponse = {
          data: [
            { ...mockClients.activeClient1, compatVersion: '2.5.0' },
            { ...mockClients.activeClient2, compatVersion: '1.0.0' },
          ],
          metadata: baseMockResult.metadata,
        };

        const result = transformClientsListQueryResponse(
          differentVersionsResult
        );

        expect(result.data[0]!.compatVersion).toBe('2.5.0');
        expect(result.data[1]!.compatVersion).toBe('1.0.0');
      });
    });

    describe('scope exclusion regex behavior', () => {
      it('should exclude scopes with "auth-client" as whole word', () => {
        const scopesWithAuthClient: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMetadata,
            allowedScopes: [
              {
                name: 'auth-client' as ResourceScopeKey,
                desc: 'Should be excluded',
                module: 'auth',
              },
              {
                name: 'auth-client:read' as ResourceScopeKey,
                desc: 'Should be excluded',
                module: 'auth',
              },
              {
                name: 'auth-client:write' as ResourceScopeKey,
                desc: 'Should be excluded',
                module: 'auth',
              },
              {
                name: 'my-auth-client' as ResourceScopeKey,
                desc: 'Should be excluded',
                module: 'auth',
              },
              {
                name: 'auth-clients' as ResourceScopeKey,
                desc: 'Should not be excluded',
                module: 'auth',
              },
              {
                name: 'authclient' as ResourceScopeKey,
                desc: 'Should not be excluded',
                module: 'auth',
              },
            ] as ResourceScope[],
            clientLimit: 10,
          },
        };

        const result = transformClientsListQueryResponse(scopesWithAuthClient);

        const scopeNames = result.metadata.allowedScopes.map(
          (scope) => scope.name
        );
        expect(scopeNames).toContain('auth-clients');
        expect(scopeNames).toContain('authclient');
        expect(scopeNames).not.toContain('auth-client');
        expect(scopeNames).not.toContain('auth-client:read');
        expect(scopeNames).not.toContain('auth-client:write');
        expect(scopeNames).not.toContain('my-auth-client');
      });

      it('should exclude scopes containing "documentation"', () => {
        const scopesWithDocumentation: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMetadata,
            allowedScopes: [
              { name: 'documentation', desc: 'Should be excluded' },
              { name: 'documentation:read', desc: 'Should be excluded' },
              { name: 'api-documentation', desc: 'Should be excluded' },
              mockScopes.documentsRead,
            ] as ResourceScope[],
            clientLimit: 10,
          },
        };

        const result = transformClientsListQueryResponse(
          scopesWithDocumentation
        );

        const scopeNames = result.metadata.allowedScopes.map(
          (scope) => scope.name
        );
        expect(scopeNames).toContain('documents:read');
        expect(scopeNames).not.toContain('documentation');
        expect(scopeNames).not.toContain('documentation:read');
        expect(scopeNames).not.toContain('api-documentation');
      });

      it('should exclude scopes containing "account"', () => {
        const scopesWithAccount: GetAppClientsResponse = {
          ...baseMockResult,
          metadata: {
            ...baseMetadata,
            allowedScopes: [
              mockScopes.accountRead,
              { name: 'account:read', desc: 'Should be excluded' },
              { name: 'my-account', desc: 'Should be excluded' },
              mockScopes.accountingRead,
              { name: 'accounts', desc: 'Should be excluded' },
            ] as ResourceScope[],
            clientLimit: 10,
          },
        };

        const result = transformClientsListQueryResponse(scopesWithAccount);

        expect(result.metadata.allowedScopes).toHaveLength(0);
      });
    });

    describe('schema validation', () => {
      it('should call appClientListResponse.parse with transformed data', async () => {
        const { appClientListResponse } =
          await import('../../schemas/app-clients/app-client.schema');

        transformClientsListQueryResponse(baseMockResult);

        expect(appClientListResponse.parse).toHaveBeenCalledTimes(1);
        expect(appClientListResponse.parse).toHaveBeenCalledWith({
          data: [expectedTransformedClient1, expectedTransformedClient2],
          metadata: {
            orgMaxClients: 10,
            allowedScopes: baseAllowedScopes,
            documentationPath: baseMetadata.signedDocsPath,
          },
        });
      });

      it('should throw error when schema validation fails', async () => {
        const { appClientListResponse } =
          await import('../../schemas/app-clients/app-client.schema');

        const validationError = new Error('Schema validation failed');
        vi.mocked(appClientListResponse.parse).mockImplementation(() => {
          throw validationError;
        });

        expect(() => transformClientsListQueryResponse(baseMockResult)).toThrow(
          'Schema validation failed'
        );
      });
    });
  });
});
