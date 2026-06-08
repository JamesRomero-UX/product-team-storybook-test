import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ResourceScope } from '../../auth/scopes';
import type {
  IAuthClient,
  IClient,
  NewClientResult,
  OrgClientItem,
} from '../../clients/client.interface';
import {
  AppClientNotFoundError,
  InvalidAppClientCredentialsError,
  InvalidAppClientScopesError,
} from '../../errors/app-client.errors';
import type {
  AppClientItemRequestInput,
  AppClientRequest,
} from '../../schemas/app-clients/app-client.schema';
import type { AuthTokenRequestData } from '../../schemas/auth.schema';
import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type { ServiceCallContext } from '../../types/service';
import type { DocumentationService } from '../documentation/documentation.service';
import type { AppClientServiceConfig } from './app-clients.service';
import { appClientsService } from './app-clients.service';

// Mock resource scopes list (hoisted to allow usage in vi.mock)
const mockResourceScopeList = vi.hoisted(() => [
  { name: 'risks:read', desc: 'Read risks' },
  { name: 'risks:get', desc: 'Get risks' },
  { name: 'risks:write', desc: 'Write risks' },
  { name: 'actions:read', desc: 'Read actions' },
  { name: 'actions:write', desc: 'Write actions' },
  { name: 'issues:read', desc: 'Read issues' },
  { name: 'issues:write', desc: 'Write issues' },
  { name: 'users:get', desc: 'Get user by ID' },
  { name: 'users:read', desc: 'Read access to users' },
]);

// Mock resource scopes Map (hoisted to allow usage in vi.mock)
const mockResourceScopes = vi.hoisted(
  () =>
    new Map([
      [
        'users:get',
        { name: 'users:get', desc: 'Get user by ID', module: 'user' },
      ],
      [
        'users:read',
        { name: 'users:read', desc: 'Read access to users', module: 'user' },
      ],
    ])
);

// Mock dependencies
vi.mock('../../transformers/app-clients/app-client.transformer', () => ({
  mapClientDataToCreateSchema: vi.fn(),
}));

vi.mock(
  '../../transformers/organisations/organisation-module.transformer',
  () => ({
    resolveScopesFromConfig: vi.fn(),
  })
);

vi.mock('../../schemas/organisation/organisationModule.schema', () => {
  type ModuleConfig = Record<
    string,
    {
      enabled: boolean;
      allowTabConfig?: boolean;
      subModules?: Record<string, unknown>;
    }
  >;

  return {
    moduleConfigSchema: {
      parse: vi.fn((data: unknown) => data as ModuleConfig),
    },
  };
});

vi.mock('../../versions/index', () => ({
  CURRENT_API_VERSION: '1.0.0',
}));

vi.mock('../../auth/scopes', () => ({
  resourceScopeList: mockResourceScopeList,
  resourceScopes: mockResourceScopes,
}));

describe('app-clients.service', () => {
  let mockAuthClient: IAuthClient;
  let mockDataClient: IClient;
  let mockDocumentationService: DocumentationService;
  let mockConfig: AppClientServiceConfig;
  let service: ReturnType<typeof appClientsService>;

  // Common mock objects
  const mockUserGetScope: ResourceScope = {
    name: 'users:get',
    desc: 'Get user by ID',
    module: 'user',
  };

  const mockUserReadScope: ResourceScope = {
    name: 'users:read',
    desc: 'Read access to users',
    module: 'user',
  };

  const mockOrgClientItem: OrgClientItem = {
    clientName: 'Test Client',
    scopes: 'risks:read,risks:write',
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    status: 'active',
    clientId: 'client_123',
    compatVersion: '1.0.0',
    role: 'rs-external',
    orgId: 'org-123',
    tenantId: 'tenant-456',
  };

  const mockServiceCallContext: ServiceCallContext = {
    authToken: 'Bearer test-token',
    orgId: 'org-123',
    tenantId: 'tenant-456',
  };

  const mockMutateServiceContext: MutateServiceContext = {
    authToken: 'Bearer test-token',
    orgId: 'org-123',
    tenantId: 'tenant-456',
    actorId: 'user|123456789',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthClient = {
      createNewClient: vi.fn(),
      createClientAccessToken: vi.fn(),
      getOrgClients: vi.fn(),
      getActiveClient: vi.fn(),
      disableAndRemoveClient: vi.fn(),
    } as IAuthClient;

    mockDataClient = {
      queryOrganisationModule: vi.fn(),
    } as unknown as IClient;

    mockDocumentationService = {
      getSignedDocumentationPath: vi.fn(() => ({
        signedDocsPath: '/api/v1/docs?sig=test-signature&exp=1234567890',
      })),
      verifyDocumentationPathSignature: vi.fn(),
      getRedocOptions: vi.fn(),
      getOpenApiDocument: vi.fn(),
    } as unknown as DocumentationService;

    mockConfig = {
      basePath: '/api/v1',
      clientLimit: 10,
    };

    service = appClientsService(
      {
        authClient: mockAuthClient,
        dataClient: mockDataClient,
        documentationService: mockDocumentationService,
      },
      mockConfig
    );
  });

  describe('getAppClients', () => {
    const mockModuleSettings = {
      risk: { enabled: true, subModules: {} },
      action: { enabled: true, subModules: {} },
    };

    const mockAllowedScopes: ResourceScope[] = [
      { name: 'risks:read', desc: 'Read risks', module: 'risk' },
      { name: 'risks:get', desc: 'Get risks', module: 'risk' },
    ];

    describe('happy path', () => {
      it('should fetch and return app clients with allowed scopes', async () => {
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        vi.mocked(mockAuthClient.getOrgClients).mockResolvedValue([
          mockOrgClientItem,
        ]);
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);

        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        const result = await service.getAppClients(mockServiceCallContext);

        expect(mockAuthClient.getOrgClients).toHaveBeenCalledWith(
          'tenant-456',
          'org-123'
        );
        expect(mockDataClient.queryOrganisationModule).toHaveBeenCalledWith({
          authorization: 'Bearer test-token',
        });
        expect(resolveScopesFromConfig).toHaveBeenCalledWith(
          mockModuleSettings,
          mockResourceScopeList
        );
        // User scopes are appended by default when at least one scope is resolved
        expect(result).toEqual({
          data: [mockOrgClientItem],
          metadata: {
            allowedScopes: [
              ...mockAllowedScopes,
              mockUserGetScope,
              mockUserReadScope,
            ],
            clientLimit: 10,
            signedDocsPath: '/api/v1/docs?sig=test-signature&exp=1234567890',
          },
        });
      });

      it('should append user read scopes to non-empty allowed scopes', async () => {
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const singleModuleScopes: ResourceScope[] = [
          { name: 'risks:read', desc: 'Read risks', module: 'risk' },
        ];

        vi.mocked(mockAuthClient.getOrgClients).mockResolvedValue([
          mockOrgClientItem,
        ]);
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(singleModuleScopes);

        const result = await service.getAppClients(mockServiceCallContext);

        expect(result.metadata.allowedScopes).toEqual([
          ...singleModuleScopes,
          mockUserGetScope,
          mockUserReadScope,
        ]);
      });

      it('should handle multiple app clients', async () => {
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const mockClients: OrgClientItem[] = [
          mockOrgClientItem,
          {
            ...mockOrgClientItem,
            clientId: 'client_456',
            clientName: 'Client 2',
          },
          {
            ...mockOrgClientItem,
            clientId: 'client_789',
            clientName: 'Client 3',
          },
        ];

        vi.mocked(mockAuthClient.getOrgClients).mockResolvedValue(mockClients);
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        const result = await service.getAppClients(mockServiceCallContext);

        expect(result.data).toHaveLength(3);
        expect(result.data).toEqual(mockClients);
        expect(result.metadata.signedDocsPath).toBe(
          '/api/v1/docs?sig=test-signature&exp=1234567890'
        );
      });

      it('should return empty scopes when no modules are enabled', async () => {
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        vi.mocked(mockAuthClient.getOrgClients).mockResolvedValue([
          mockOrgClientItem,
        ]);
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue([]);

        const result = await service.getAppClients(mockServiceCallContext);

        expect(result.metadata.allowedScopes).toEqual([]);
        expect(result.metadata.signedDocsPath).toBe(
          '/api/v1/docs?sig=test-signature&exp=1234567890'
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw AppClientNotFoundError when orgId is missing', async () => {
        const contextWithoutOrgId = {
          ...mockServiceCallContext,
          orgId: undefined,
        };

        await expect(
          service.getAppClients(contextWithoutOrgId)
        ).rejects.toThrow(AppClientNotFoundError);

        expect(mockAuthClient.getOrgClients).not.toHaveBeenCalled();
        expect(mockDataClient.queryOrganisationModule).not.toHaveBeenCalled();
      });

      it('should throw AppClientNotFoundError when tenantId is missing', async () => {
        const contextWithoutTenantId = {
          ...mockServiceCallContext,
          tenantId: undefined,
        };

        await expect(
          service.getAppClients(contextWithoutTenantId)
        ).rejects.toThrow(AppClientNotFoundError);

        expect(mockAuthClient.getOrgClients).not.toHaveBeenCalled();
        expect(mockDataClient.queryOrganisationModule).not.toHaveBeenCalled();
      });

      it('should throw AppClientNotFoundError when both orgId and tenantId are missing', async () => {
        const contextWithoutIds = {
          ...mockServiceCallContext,
          orgId: undefined,
          tenantId: undefined,
        };

        await expect(service.getAppClients(contextWithoutIds)).rejects.toThrow(
          AppClientNotFoundError
        );
      });

      it('should return empty allowed scopes when org module settings are missing', async () => {
        vi.mocked(mockAuthClient.getOrgClients).mockResolvedValue([
          mockOrgClientItem,
        ]);
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: null,
        } as never);

        const result = await service.getAppClients(mockServiceCallContext);

        expect(result).toEqual({
          data: [mockOrgClientItem],
          metadata: {
            allowedScopes: [],
            clientLimit: 10,
            signedDocsPath: '/api/v1/docs?sig=test-signature&exp=1234567890',
          },
        });
      });

      it('should return empty allowed scopes when ModuleSettings property is missing', async () => {
        vi.mocked(mockAuthClient.getOrgClients).mockResolvedValue([
          mockOrgClientItem,
        ]);
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: null,
          },
        } as never);

        const result = await service.getAppClients(mockServiceCallContext);

        expect(result).toEqual({
          data: [mockOrgClientItem],
          metadata: {
            allowedScopes: [],
            clientLimit: 10,
            signedDocsPath: '/api/v1/docs?sig=test-signature&exp=1234567890',
          },
        });
      });

      it('should throw error when authClient.getOrgClients fails', async () => {
        const clientError = new Error('Auth service unavailable');
        vi.mocked(mockAuthClient.getOrgClients).mockRejectedValue(clientError);

        await expect(
          service.getAppClients(mockServiceCallContext)
        ).rejects.toThrow('Auth service unavailable');
      });

      it('should throw error when dataClient.queryOrganisationModule fails', async () => {
        const clientError = new Error('Database connection failed');
        vi.mocked(mockAuthClient.getOrgClients).mockResolvedValue([
          mockOrgClientItem,
        ]);
        vi.mocked(mockDataClient.queryOrganisationModule).mockRejectedValue(
          clientError
        );

        await expect(
          service.getAppClients(mockServiceCallContext)
        ).rejects.toThrow('Database connection failed');
      });
    });
  });

  describe('removeAppClient', () => {
    const mockClientInput: AppClientItemRequestInput = {
      clientId: 'client_123',
    };

    describe('happy path', () => {
      it('should successfully remove app client', async () => {
        vi.mocked(mockAuthClient.disableAndRemoveClient).mockResolvedValue();

        const result = await service.removeAppClient(
          mockClientInput,
          mockMutateServiceContext
        );

        expect(mockAuthClient.disableAndRemoveClient).toHaveBeenCalledWith(
          'client_123',
          'user|123456789'
        );
        expect(result).toEqual({
          data: { id: 'client_123' },
        });
      });

      it('should use "system" as default actorId when not provided', async () => {
        const contextWithoutActorId = {
          ...mockMutateServiceContext,
          actorId: undefined,
        };

        vi.mocked(mockAuthClient.disableAndRemoveClient).mockResolvedValue();

        await service.removeAppClient(mockClientInput, contextWithoutActorId);

        expect(mockAuthClient.disableAndRemoveClient).toHaveBeenCalledWith(
          'client_123',
          'system'
        );
      });

      it('should handle different client IDs', async () => {
        const differentClientInput: AppClientItemRequestInput = {
          clientId: 'client_999',
        };

        vi.mocked(mockAuthClient.disableAndRemoveClient).mockResolvedValue();

        const result = await service.removeAppClient(
          differentClientInput,
          mockMutateServiceContext
        );

        expect(mockAuthClient.disableAndRemoveClient).toHaveBeenCalledWith(
          'client_999',
          'user|123456789'
        );
        expect(result.data).toStrictEqual({ id: 'client_999' });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when disableAndRemoveClient fails', async () => {
        const clientError = new Error('Failed to disable client');
        vi.mocked(mockAuthClient.disableAndRemoveClient).mockRejectedValue(
          clientError
        );

        await expect(
          service.removeAppClient(mockClientInput, mockMutateServiceContext)
        ).rejects.toThrow('Failed to disable client');
      });

      it('should throw error for non-existent client', async () => {
        const notFoundError = new AppClientNotFoundError();
        vi.mocked(mockAuthClient.disableAndRemoveClient).mockRejectedValue(
          notFoundError
        );

        await expect(
          service.removeAppClient(mockClientInput, mockMutateServiceContext)
        ).rejects.toThrow(AppClientNotFoundError);
      });
    });
  });

  describe('createAppClient', () => {
    const mockClientRequest: AppClientRequest = {
      name: 'New Test Client',
      scopes: ['risks:read', 'risks:write'],
    };

    const mockMappedClientData = {
      name: 'New Test Client',
      scopes: ['risks:read', 'risks:write'],
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
      createdBy: 'user|123456789',
      updatedBy: 'user|123456789',
      status: 'active' as const,
      compatVersion: '1.0.0',
      role: 'rs-external' as const,
      orgId: 'org-123',
      tenantId: 'tenant-456',
      rateLimitProfile: 'cruise' as const,
    };

    const mockNewClientResult: NewClientResult = {
      clientName: 'New Test Client',
      clientKey: 'key_abc123',
      clientSecret: 'secret_xyz789',
    };

    const mockModuleSettings = {
      risk: { enabled: true, subModules: {} },
      action: { enabled: true, subModules: {} },
    };

    const mockAllowedScopes = [
      { name: 'risks:read', desc: 'Read risks' },
      { name: 'risks:write', desc: 'Write risks' },
      { name: 'actions:read', desc: 'Read actions' },
      { name: 'actions:write', desc: 'Write actions' },
      { name: 'issues:write', desc: 'Write issues' },
    ] as ResourceScope[];

    describe('happy path', () => {
      it('should successfully create a new app client', async () => {
        const { mapClientDataToCreateSchema } =
          await import('../../transformers/app-clients/app-client.transformer');
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        vi.mocked(mapClientDataToCreateSchema).mockReturnValue(
          mockMappedClientData
        );
        vi.mocked(mockAuthClient.createNewClient).mockResolvedValue(
          mockNewClientResult
        );

        const result = await service.createAppClient(
          mockClientRequest,
          mockMutateServiceContext
        );

        expect(mockDataClient.queryOrganisationModule).toHaveBeenCalledWith({
          authorization: 'Bearer test-token',
        });
        expect(resolveScopesFromConfig).toHaveBeenCalledWith(
          mockModuleSettings,
          mockResourceScopeList
        );
        expect(mapClientDataToCreateSchema).toHaveBeenCalledWith(
          mockClientRequest,
          {
            role: 'rs-external',
            compatVersion: '1.0.0',
            createdAt: expect.any(Number) as number,
            createdBy: 'user|123456789',
            orgId: 'org-123',
            tenantId: 'tenant-456',
            rateLimitProfile: mockMappedClientData.rateLimitProfile,
          }
        );
        expect(mockAuthClient.createNewClient).toHaveBeenCalledWith(
          mockMappedClientData
        );
        expect(result).toEqual({
          data: mockNewClientResult,
        });
      });

      it('should create client with single scope', async () => {
        const { mapClientDataToCreateSchema } =
          await import('../../transformers/app-clients/app-client.transformer');
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const singleScopeRequest: AppClientRequest = {
          name: 'Single Scope Client',
          scopes: ['risks:read'],
        };

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        vi.mocked(mapClientDataToCreateSchema).mockReturnValue({
          ...mockMappedClientData,
          name: 'Single Scope Client',
          scopes: ['risks:read'],
        });
        vi.mocked(mockAuthClient.createNewClient).mockResolvedValue(
          mockNewClientResult
        );

        const result = await service.createAppClient(
          singleScopeRequest,
          mockMutateServiceContext
        );

        expect(mockAuthClient.createNewClient).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Single Scope Client',
            scopes: ['risks:read'],
          })
        );
        expect(result.data).toEqual(mockNewClientResult);
      });

      it('should allow user scopes as valid requested scopes when modules are enabled', async () => {
        const { mapClientDataToCreateSchema } =
          await import('../../transformers/app-clients/app-client.transformer');
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const userScopeRequest: AppClientRequest = {
          name: 'User Scope Client',
          scopes: ['risks:read', 'users:get', 'users:read'],
        };

        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        // resolveScopesFromConfig returns non-empty scopes, so user scopes get appended
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        vi.mocked(mapClientDataToCreateSchema).mockReturnValue({
          ...mockMappedClientData,
          name: 'User Scope Client',
        });
        vi.mocked(mockAuthClient.createNewClient).mockResolvedValue(
          mockNewClientResult
        );

        // users:get and users:read are implicitly allowed when module scopes are non-empty
        await expect(
          service.createAppClient(userScopeRequest, mockMutateServiceContext)
        ).resolves.toEqual({ data: mockNewClientResult });
      });

      it('should create client with multiple scopes', async () => {
        const { mapClientDataToCreateSchema } =
          await import('../../transformers/app-clients/app-client.transformer');
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const multiScopeRequest: AppClientRequest = {
          name: 'Multi Scope Client',
          scopes: ['risks:read', 'risks:write', 'actions:read', 'issues:write'],
        };

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        vi.mocked(mapClientDataToCreateSchema).mockReturnValue({
          ...mockMappedClientData,
          ...multiScopeRequest,
        });
        vi.mocked(mockAuthClient.createNewClient).mockResolvedValue(
          mockNewClientResult
        );

        await service.createAppClient(
          multiScopeRequest,
          mockMutateServiceContext
        );

        expect(mockAuthClient.createNewClient).toHaveBeenCalledWith(
          expect.objectContaining({
            scopes: [
              'risks:read',
              'risks:write',
              'actions:read',
              'issues:write',
            ],
          })
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw InvalidAppClientCredentialsError when actorId is not provided', async () => {
        const contextWithoutActorId = {
          ...mockMutateServiceContext,
          actorId: undefined,
        };

        await expect(
          service.createAppClient(mockClientRequest, contextWithoutActorId)
        ).rejects.toThrow(InvalidAppClientCredentialsError);
      });

      it('should throw error when createNewClient fails', async () => {
        const { mapClientDataToCreateSchema } =
          await import('../../transformers/app-clients/app-client.transformer');
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        const clientError = new Error('Failed to create client');
        vi.mocked(mapClientDataToCreateSchema).mockReturnValue(
          mockMappedClientData
        );
        vi.mocked(mockAuthClient.createNewClient).mockRejectedValue(
          clientError
        );

        await expect(
          service.createAppClient(mockClientRequest, mockMutateServiceContext)
        ).rejects.toThrow('Failed to create client');
      });

      it('should throw error when mapClientDataToCreateSchema fails', async () => {
        const { mapClientDataToCreateSchema } =
          await import('../../transformers/app-clients/app-client.transformer');
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        const mappingError = new Error('Invalid client data');
        vi.mocked(mapClientDataToCreateSchema).mockImplementation(() => {
          throw mappingError;
        });

        await expect(
          service.createAppClient(mockClientRequest, mockMutateServiceContext)
        ).rejects.toThrow('Invalid client data');
      });

      it('should handle non-Error objects thrown during creation', async () => {
        const { mapClientDataToCreateSchema } =
          await import('../../transformers/app-clients/app-client.transformer');
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        vi.mocked(mapClientDataToCreateSchema).mockReturnValue(
          mockMappedClientData
        );
        vi.mocked(mockAuthClient.createNewClient).mockRejectedValue(
          'string error'
        );

        await expect(
          service.createAppClient(mockClientRequest, mockMutateServiceContext)
        ).rejects.toThrow('string error');
      });

      it('should throw InvalidAppClientScopesError when requested scopes are not allowed', async () => {
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const requestWithInvalidScopes: AppClientRequest = {
          name: 'Invalid Scopes Client',
          scopes: ['risks:read', 'issues:read'], // issues:read is not in mockAllowedScopes
        };

        // Mock scope validation - issues:read is not allowed
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        await expect(
          service.createAppClient(
            requestWithInvalidScopes,
            mockMutateServiceContext
          )
        ).rejects.toThrow(InvalidAppClientScopesError);

        await expect(
          service.createAppClient(
            requestWithInvalidScopes,
            mockMutateServiceContext
          )
        ).rejects.toThrow('Invalid scopes requested: issues:read');
      });

      it('should throw InvalidAppClientScopesError when all requested scopes are invalid', async () => {
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const requestWithAllInvalidScopes: AppClientRequest = {
          name: 'All Invalid Scopes Client',
          scopes: ['invalid:read', 'invalid:write'],
        };

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        await expect(
          service.createAppClient(
            requestWithAllInvalidScopes,
            mockMutateServiceContext
          )
        ).rejects.toThrow(InvalidAppClientScopesError);

        await expect(
          service.createAppClient(
            requestWithAllInvalidScopes,
            mockMutateServiceContext
          )
        ).rejects.toThrow(
          'Invalid scopes requested: invalid:read, invalid:write'
        );
      });

      it('should throw InvalidAppClientScopesError with multiple invalid scopes', async () => {
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const requestWithMixedScopes: AppClientRequest = {
          name: 'Mixed Scopes Client',
          scopes: ['risks:read', 'issues:read', 'invalid:scope'],
        };

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        await expect(
          service.createAppClient(
            requestWithMixedScopes,
            mockMutateServiceContext
          )
        ).rejects.toThrow(InvalidAppClientScopesError);

        await expect(
          service.createAppClient(
            requestWithMixedScopes,
            mockMutateServiceContext
          )
        ).rejects.toThrow(
          'Invalid scopes requested: issues:read, invalid:scope'
        );
      });

      it('should handle empty scopes array', async () => {
        const { mapClientDataToCreateSchema } =
          await import('../../transformers/app-clients/app-client.transformer');
        const { resolveScopesFromConfig } =
          await import('../../transformers/organisations/organisation-module.transformer');

        const requestWithEmptyScopes: AppClientRequest = {
          name: 'Empty Scopes Client',
          scopes: [],
        };

        // Mock scope validation
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: mockModuleSettings,
          },
        } as never);
        vi.mocked(resolveScopesFromConfig).mockReturnValue(mockAllowedScopes);

        vi.mocked(mapClientDataToCreateSchema).mockReturnValue({
          ...mockMappedClientData,
          name: 'Empty Scopes Client',
        });
        vi.mocked(mockAuthClient.createNewClient).mockResolvedValue(
          mockNewClientResult
        );

        const result = await service.createAppClient(
          requestWithEmptyScopes,
          mockMutateServiceContext
        );

        expect(mockAuthClient.createNewClient).toHaveBeenCalledWith(
          expect.anything()
        );
        expect(result.data).toEqual(mockNewClientResult);
      });

      it('should return empty scopes when org module settings are missing', async () => {
        const requestWithInvalidScopes: AppClientRequest = {
          name: 'Invalid Scopes Client',
          scopes: ['risks:read'],
        };

        // Mock missing module settings
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: null,
        } as never);

        await expect(
          service.createAppClient(
            requestWithInvalidScopes,
            mockMutateServiceContext
          )
        ).rejects.toThrow(InvalidAppClientScopesError);
      });

      it('should return empty scopes when ModuleSettings property is missing', async () => {
        const requestWithScopes: AppClientRequest = {
          name: 'Scopes Client',
          scopes: ['risks:read'],
        };

        // Mock missing ModuleSettings
        vi.mocked(mockDataClient.queryOrganisationModule).mockResolvedValue({
          organisationModule: {
            ModuleSettings: null,
          },
        } as never);

        await expect(
          service.createAppClient(requestWithScopes, mockMutateServiceContext)
        ).rejects.toThrow(InvalidAppClientScopesError);
      });

      it('should throw error when queryOrganisationModule fails', async () => {
        const moduleError = new Error('Database connection failed');

        vi.mocked(mockDataClient.queryOrganisationModule).mockRejectedValue(
          moduleError
        );

        await expect(
          service.createAppClient(mockClientRequest, mockMutateServiceContext)
        ).rejects.toThrow('Database connection failed');
      });
    });
  });

  describe('createAppClientToken', () => {
    const mockTokenRequest: AuthTokenRequestData = {
      clientKey: 'key_abc123',
      clientSecret: 'secret_xyz789',
    };

    const mockTokenResult = {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      tokenType: 'Bearer' as const,
      expiresIn: 3600,
    };

    describe('happy path', () => {
      it('should successfully create access token for existing client', async () => {
        vi.mocked(mockAuthClient.getActiveClient).mockResolvedValue(
          mockOrgClientItem
        );
        vi.mocked(mockAuthClient.createClientAccessToken).mockResolvedValue(
          mockTokenResult
        );

        const result = await service.createAppClientToken(mockTokenRequest);

        expect(mockAuthClient.getActiveClient).toHaveBeenCalledWith(
          'key_abc123'
        );
        expect(mockAuthClient.createClientAccessToken).toHaveBeenCalledWith(
          mockTokenRequest
        );
        expect(result).toEqual(mockTokenResult);
      });

      it('should handle different client keys', async () => {
        const differentTokenRequest: AuthTokenRequestData = {
          clientKey: 'key_different123',
          clientSecret: 'secret_different789',
        };

        vi.mocked(mockAuthClient.getActiveClient).mockResolvedValue(
          mockOrgClientItem
        );
        vi.mocked(mockAuthClient.createClientAccessToken).mockResolvedValue(
          mockTokenResult
        );

        const result = (await service.createAppClientToken(
          differentTokenRequest
        )) as typeof mockTokenResult;

        expect(mockAuthClient.getActiveClient).toHaveBeenCalledWith(
          'key_different123'
        );
        expect(mockAuthClient.createClientAccessToken).toHaveBeenCalledWith(
          differentTokenRequest
        );
        expect(result).toEqual(mockTokenResult);
      });
    });

    describe('unhappy path', () => {
      it('should throw AppClientNotFoundError when client is not found', async () => {
        vi.mocked(mockAuthClient.getActiveClient).mockResolvedValue(null);

        await expect(
          service.createAppClientToken(mockTokenRequest)
        ).rejects.toThrow(AppClientNotFoundError);

        expect(mockAuthClient.createClientAccessToken).not.toHaveBeenCalled();
      });

      it('should throw error when createClientAccessToken fails', async () => {
        const tokenError = new Error('Invalid credentials');
        vi.mocked(mockAuthClient.getActiveClient).mockResolvedValue(
          mockOrgClientItem
        );
        vi.mocked(mockAuthClient.createClientAccessToken).mockRejectedValue(
          tokenError
        );

        await expect(
          service.createAppClientToken(mockTokenRequest)
        ).rejects.toThrow('Invalid credentials');
      });

      it('should throw error when getActiveClient fails', async () => {
        const clientError = new Error('Auth service unavailable');
        vi.mocked(mockAuthClient.getActiveClient).mockRejectedValue(
          clientError
        );

        await expect(
          service.createAppClientToken(mockTokenRequest)
        ).rejects.toThrow('Auth service unavailable');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('createAppClient');
      expect(service).toHaveProperty('createAppClientToken');
      expect(service).toHaveProperty('removeAppClient');
      expect(service).toHaveProperty('getAppClients');

      expect(typeof service.createAppClient).toBe('function');
      expect(typeof service.createAppClientToken).toBe('function');
      expect(typeof service.removeAppClient).toBe('function');
      expect(typeof service.getAppClients).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = appClientsService(
        {
          authClient: mockAuthClient,
          dataClient: mockDataClient,
          documentationService: mockDocumentationService,
        },
        mockConfig
      );
      const service2 = appClientsService(
        {
          authClient: mockAuthClient,
          dataClient: mockDataClient,
          documentationService: mockDocumentationService,
        },
        mockConfig
      );

      expect(service1).not.toBe(service2);
      expect(service1.getAppClients).not.toBe(service2.getAppClients);
    });
  });
});
