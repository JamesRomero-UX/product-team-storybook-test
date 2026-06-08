import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handler } from './post';
import type { PostSchema } from './postSchema';

vi.mock('sst/node/config', () => ({
  Config: {
    AUTH0_CLIENT_SECRET: 'mock-auth0-client-secret',
  },
}));

vi.mock('src/sentryInit', () => ({
  initSentry: vi.fn(),
}));

vi.mock('src/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn(),
  })),
}));

const mockCreateSsoConnection = vi.fn();
const mockDeleteSsoConnection = vi.fn();
const mockEnableClientForConnection = vi.fn();
const mockGetSsoConnectionById = vi.fn();

vi.mock('src/services/auth0/ssoConnection', () => ({
  createSsoConnection: (...args: unknown[]) => mockCreateSsoConnection(...args),
  deleteSsoConnection: (...args: unknown[]) => mockDeleteSsoConnection(...args),
  enableClientForConnection: (...args: unknown[]) =>
    mockEnableClientForConnection(...args),
  getSsoConnectionById: (...args: unknown[]) =>
    mockGetSsoConnectionById(...args),
}));

const mockCreateOrganizationConnection = vi.fn();
const mockDeleteOrganizationConnection = vi.fn();
const mockGetOrganizationConnection = vi.fn();

vi.mock('src/services/auth0/organizationConnection', () => ({
  createOrganizationConnection: (...args: unknown[]) =>
    mockCreateOrganizationConnection(...args),
  deleteOrganizationConnection: (...args: unknown[]) =>
    mockDeleteOrganizationConnection(...args),
  getOrganizationConnection: (...args: unknown[]) =>
    mockGetOrganizationConnection(...args),
}));

vi.mock('src/services/auth0/getAuth0ManagementClient', () => ({
  getAuth0ManagementClient: () => ({}),
}));

const mockGetOrgDetails = vi.fn();
vi.mock('src/services/orgUtilities', () => ({
  getOrgDetails: (...args: unknown[]) => mockGetOrgDetails(...args),
}));

const mockRepoFindAll = vi.fn();
const mockRepoCreate = vi.fn();
const mockRepoUpdateByConnectionId = vi.fn();
const mockRepoDeleteByConnectionId = vi.fn();

vi.mock(
  'src/repositories/sso-configuration/ssoConfiguration.repository',
  () => ({
    ssoConfigurationRepository: () => ({
      findAll: (...args: unknown[]) => mockRepoFindAll(...args),
      create: (...args: unknown[]) => mockRepoCreate(...args),
      updateByConnectionId: (...args: unknown[]) =>
        mockRepoUpdateByConnectionId(...args),
      deleteByConnectionId: (...args: unknown[]) =>
        mockRepoDeleteByConnectionId(...args),
    }),
  })
);

const mockUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
vi.stubGlobal('crypto', {
  randomUUID: () => mockUUID,
});

const mockOrgKey = 'test-org-key';
const mockTenant = 'test-tenant';
const mockOrgName = 'Test Organization';
const mockConnectionId = 'con_abc123';
const mockOldConnectionId = 'con_old456';

const mockSsoConnection = {
  id: mockConnectionId,
  name: 'TestOrganization-okta-a1b2c3d4',
  strategy: 'okta',
  options: {
    domain: 'test.okta.com',
    domainAliases: ['alias.okta.com'],
  },
};

const mockEvent = (input: PostSchema['object']): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  headers: {},
  requestContext: {} as APIGatewayProxyEventV2['requestContext'],
  isBase64Encoded: false,
  pathParameters: {},
  body: JSON.stringify({
    action: {
      name: 'createEnterpriseConnection',
    },
    input: { object: input },
    session_variables: {
      'x-hasura-org-id': mockOrgKey,
      'x-hasura-tenant-name': mockTenant,
    },
  }),
});

const validInput: PostSchema['object'] = {
  strategy: 'okta',
  domain: 'test.okta.com',
  clientId: 'client-id-123',
  clientSecret: 'client-secret-456',
  addOrgConnection: false,
};

const mockRestApiClientId = 'mock-rest-api-client-id';
const mockWebClientId = 'mock-web-client-id';

describe('SSO Config Post Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('AUTH0_RISK_SMART_REST_API_CLIENT_ID', mockRestApiClientId);
    vi.stubEnv('REACT_APP_AUTH0_CLIENT_ID', mockWebClientId);
    mockGetOrgDetails.mockResolvedValue({ OrgName: mockOrgName });
    mockCreateSsoConnection.mockResolvedValue(mockSsoConnection);
    mockEnableClientForConnection.mockResolvedValue(undefined);
    mockCreateOrganizationConnection.mockResolvedValue({ id: 'org-con-123' });
    mockGetOrganizationConnection.mockResolvedValue(null);
    mockGetSsoConnectionById.mockResolvedValue(null);
    mockDeleteSsoConnection.mockResolvedValue(undefined);
    mockDeleteOrganizationConnection.mockResolvedValue(undefined);
    mockRepoFindAll.mockResolvedValue([]);
    mockRepoCreate.mockResolvedValue({ Id: mockConnectionId });
    mockRepoUpdateByConnectionId.mockResolvedValue({});
    mockRepoDeleteByConnectionId.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('new connection creation', () => {
    it('should create SSO connection and return 201', async () => {
      const response = await handler(mockEvent(validInput), {} as Context);

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body ?? '');

      expect(body).toEqual({
        Id: mockConnectionId,
        Name: mockSsoConnection.name,
        Strategy: mockSsoConnection.strategy,
        Enabled: true,
        IsOrgConnected: false,
        Action: 'created',
        Options: {
          Domain: mockSsoConnection.options.domain,
          DomainAliases: mockSsoConnection.options.domainAliases,
        },
      });
    });

    it('should generate connection name from org name and input name', async () => {
      await handler(mockEvent(validInput), {} as Context);

      expect(mockCreateSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'TestOrganization-okta-a1b2c3d4',
        })
      );
    });

    it('should call createSsoConnection with correct parameters', async () => {
      await handler(mockEvent(validInput), {} as Context);

      expect(mockCreateSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          strategy: validInput.strategy,
          options: {
            domain: validInput.domain,
            clientId: validInput.clientId,
            clientSecret: validInput.clientSecret,
            scope: 'openid',
            domainAliases: undefined,
          },
        })
      );
    });

    it('should pass domainAliases to createSsoConnection when provided', async () => {
      const inputWithAliases = {
        ...validInput,
        domainAliases: ['alias1.com', 'alias2.com'],
      };

      await handler(mockEvent(inputWithAliases), {} as Context);

      expect(mockCreateSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          options: expect.objectContaining({
            domainAliases: ['alias1.com', 'alias2.com'],
          }),
        })
      );
    });

    it('should enable client for connection after creation', async () => {
      await handler(mockEvent(validInput), {} as Context);

      expect(mockEnableClientForConnection).toHaveBeenCalledWith(
        expect.anything(),
        mockConnectionId,
        [mockRestApiClientId, mockWebClientId]
      );
    });

    it('should save config to repository after creation', async () => {
      await handler(mockEvent(validInput), {} as Context);

      expect(mockRepoCreate).toHaveBeenCalledWith({
        Name: mockSsoConnection.name,
        Strategy: mockSsoConnection.strategy,
        ClientId: validInput.clientId,
        ConnectionId: mockConnectionId,
        Domain: 'test.okta.com',
        DomainAliases: [],
        IsActive: true,
        IsRestApiEnabled: true,
        IsOrganizationConnected: false,
      });
    });

    it('should create organization connection when addOrgConnection is true', async () => {
      const inputWithOrgConnection = { ...validInput, addOrgConnection: true };

      const response = await handler(
        mockEvent(inputWithOrgConnection),
        {} as Context
      );

      expect(mockCreateOrganizationConnection).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockOrgKey },
        {
          connection_id: mockConnectionId,
          assign_membership_on_login: true,
          show_as_button: false,
        }
      );

      const body = JSON.parse(response.body ?? '');
      expect(body.IsOrgConnected).toBe(true);
    });

    it('should not create organization connection when addOrgConnection is false', async () => {
      await handler(mockEvent(validInput), {} as Context);

      expect(mockCreateOrganizationConnection).not.toHaveBeenCalled();
    });

    it('should use fallback name when input name is not provided', async () => {
      const inputWithoutName = { ...validInput, name: undefined };

      await handler(mockEvent(inputWithoutName), {} as Context);

      expect(mockCreateSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'TestOrganization-okta-a1b2c3d4',
        })
      );
    });
  });

  describe('existing config - update with new connection', () => {
    const existingConfig = {
      ConnectionId: mockOldConnectionId,
      Name: 'old-connection',
      Strategy: 'okta',
      ClientId: 'old-client-id',
      IsOrganizationConnected: false,
      IsActive: true,
      IsRestApiEnabled: true,
    };

    it('should create new connection when strategy changes', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);

      const inputWithNewStrategy = {
        ...validInput,
        connectionId: mockOldConnectionId,
        strategy: 'waad',
      };

      const response = await handler(
        mockEvent(inputWithNewStrategy),
        {} as Context
      );

      expect(response.statusCode).toBe(201);
      expect(mockCreateSsoConnection).toHaveBeenCalled();
    });

    it('should create new connection when clientId changes', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);

      const inputWithNewClientId = {
        ...validInput,
        connectionId: mockOldConnectionId,
        clientId: 'new-client-id',
      };

      const response = await handler(
        mockEvent(inputWithNewClientId),
        {} as Context
      );

      expect(response.statusCode).toBe(201);
      expect(mockCreateSsoConnection).toHaveBeenCalled();
    });

    it('should cleanup old connection when creating replacement', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);
      mockGetOrganizationConnection.mockResolvedValue({ id: 'old-org-con' });
      mockGetSsoConnectionById.mockResolvedValue({ id: mockOldConnectionId });

      const inputWithNewStrategy = {
        ...validInput,
        connectionId: mockOldConnectionId,
        strategy: 'ad',
      };

      await handler(mockEvent(inputWithNewStrategy), {} as Context);

      expect(mockDeleteOrganizationConnection).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockOrgKey, connectionId: mockOldConnectionId }
      );
      expect(mockDeleteSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        mockOldConnectionId
      );
      expect(mockRepoDeleteByConnectionId).toHaveBeenCalledWith(
        mockOldConnectionId
      );
    });

    it('should cleanup old connection via hasConnectionChanges path without connectionId in input', async () => {
      // existingConfig matched by clientId ('old-client-id' → not in validInput, use same clientId)
      const matchedByClientId = {
        ...existingConfig,
        ClientId: validInput.clientId,
      };
      mockRepoFindAll.mockResolvedValue([matchedByClientId]);
      mockGetOrganizationConnection.mockResolvedValue({ id: 'old-org-con' });
      mockGetSsoConnectionById.mockResolvedValue({ id: mockOldConnectionId });

      // Strategy changed; no connectionId sent from frontend
      const inputStrategyChanged = {
        ...validInput,
        strategy: 'waad',
        connectionId: undefined,
      };

      await handler(mockEvent(inputStrategyChanged), {} as Context);

      expect(mockCreateSsoConnection).toHaveBeenCalled();
      expect(mockDeleteOrganizationConnection).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockOrgKey, connectionId: mockOldConnectionId }
      );
      expect(mockDeleteSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        mockOldConnectionId
      );
      expect(mockRepoDeleteByConnectionId).toHaveBeenCalledWith(
        mockOldConnectionId
      );
    });

    it('should not delete org connection if it does not exist', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);
      mockGetOrganizationConnection.mockResolvedValue(null);
      mockGetSsoConnectionById.mockResolvedValue({ id: mockOldConnectionId });

      const inputWithNewStrategy = {
        ...validInput,
        connectionId: mockOldConnectionId,
        strategy: 'waad',
      };

      await handler(mockEvent(inputWithNewStrategy), {} as Context);

      expect(mockDeleteOrganizationConnection).not.toHaveBeenCalled();
      expect(mockDeleteSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        mockOldConnectionId
      );
    });

    it('should not delete SSO connection if it does not exist', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);
      mockGetOrganizationConnection.mockResolvedValue(null);
      mockGetSsoConnectionById.mockResolvedValue(null);

      const inputWithNewStrategy = {
        ...validInput,
        connectionId: mockOldConnectionId,
        strategy: 'waad',
      };

      await handler(mockEvent(inputWithNewStrategy), {} as Context);

      expect(mockDeleteSsoConnection).not.toHaveBeenCalled();
    });

    it('should cleanup orphaned connection when no connectionId is sent but DB has an existing record', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);
      mockGetOrganizationConnection.mockResolvedValue({ id: 'old-org-con' });
      mockGetSsoConnectionById.mockResolvedValue({ id: mockOldConnectionId });

      // Input has a different clientId and no connectionId — simulates the pre-fix Save path
      const inputWithDifferentProvider = {
        ...validInput,
        strategy: 'ad',
        clientId: 'completely-new-client-id',
        connectionId: undefined,
      };

      const response = await handler(
        mockEvent(inputWithDifferentProvider),
        {} as Context
      );

      expect(response.statusCode).toBe(201);
      expect(mockCreateSsoConnection).toHaveBeenCalled();
      expect(mockDeleteOrganizationConnection).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockOrgKey, connectionId: mockOldConnectionId }
      );
      expect(mockDeleteSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        mockOldConnectionId
      );
      expect(mockRepoDeleteByConnectionId).toHaveBeenCalledWith(
        mockOldConnectionId
      );
    });
  });

  describe('existing config - org connection toggle', () => {
    const existingConfig = {
      ConnectionId: mockConnectionId,
      Name: 'test-sso',
      Strategy: 'okta',
      ClientId: 'client-id-123',
      IsOrganizationConnected: false,
      IsActive: true,
      IsRestApiEnabled: true,
    };

    it('should enable org connection when toggled on', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);

      const inputEnableOrg = {
        ...validInput,
        addOrgConnection: true,
      };

      const response = await handler(mockEvent(inputEnableOrg), {} as Context);

      expect(response.statusCode).toBe(200);
      expect(mockCreateOrganizationConnection).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockOrgKey },
        {
          connection_id: mockConnectionId,
          assign_membership_on_login: true,
          show_as_button: false,
        }
      );
      expect(mockRepoUpdateByConnectionId).toHaveBeenCalledWith(
        mockConnectionId,
        { IsOrganizationConnected: true }
      );

      const body = JSON.parse(response.body ?? '');
      expect(body.Action).toBe('updated_org_connection');
      expect(body.IsOrgConnected).toBe(true);
    });

    it('should disable org connection when toggled off', async () => {
      const connectedConfig = {
        ...existingConfig,
        IsOrganizationConnected: true,
      };
      mockRepoFindAll.mockResolvedValue([connectedConfig]);

      const inputDisableOrg = {
        ...validInput,
        addOrgConnection: false,
      };

      const response = await handler(mockEvent(inputDisableOrg), {} as Context);

      expect(response.statusCode).toBe(200);
      expect(mockDeleteOrganizationConnection).toHaveBeenCalledWith(
        expect.anything(),
        { id: mockOrgKey, connectionId: mockConnectionId }
      );
      expect(mockRepoUpdateByConnectionId).toHaveBeenCalledWith(
        mockConnectionId,
        { IsOrganizationConnected: false }
      );

      const body = JSON.parse(response.body ?? '');
      expect(body.Action).toBe('updated_org_connection');
      expect(body.IsOrgConnected).toBe(false);
    });

    it('should not create new Auth0 connection for org toggle only', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);

      await handler(
        mockEvent({ ...validInput, addOrgConnection: true }),
        {} as Context
      );

      expect(mockCreateSsoConnection).not.toHaveBeenCalled();
    });
  });

  describe('existing config - no changes', () => {
    const existingConfig = {
      ConnectionId: mockConnectionId,
      Name: 'test-sso',
      Strategy: 'okta',
      ClientId: 'client-id-123',
      IsOrganizationConnected: false,
      IsActive: true,
      IsRestApiEnabled: true,
    };

    it('should return 200 with no_change when nothing changed', async () => {
      mockRepoFindAll.mockResolvedValue([existingConfig]);

      const response = await handler(mockEvent(validInput), {} as Context);

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body ?? '');
      expect(body.Action).toBe('no_change');
      expect(mockCreateSsoConnection).not.toHaveBeenCalled();
      expect(mockCreateOrganizationConnection).not.toHaveBeenCalled();
    });
  });

  describe('error handling and rollback', () => {
    it('should cleanup created connection when enableClientForConnection fails', async () => {
      mockEnableClientForConnection.mockRejectedValue(
        new Error('Enable client failed')
      );

      await expect(
        handler(mockEvent(validInput), {} as Context)
      ).rejects.toThrow('Enable client failed');

      expect(mockDeleteSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        mockConnectionId
      );
    });

    it('should cleanup created connection when createOrganizationConnection fails', async () => {
      const inputWithOrgConnection = { ...validInput, addOrgConnection: true };
      mockCreateOrganizationConnection.mockRejectedValue(
        new Error('Create org connection failed')
      );

      await expect(
        handler(mockEvent(inputWithOrgConnection), {} as Context)
      ).rejects.toThrow('Create org connection failed');

      expect(mockDeleteSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        mockConnectionId
      );
    });

    it('should cleanup created connection when old connection cleanup fails', async () => {
      mockRepoFindAll.mockResolvedValue([
        {
          ConnectionId: mockOldConnectionId,
          Name: 'old-name',
          Strategy: 'waad',
          ClientId: 'client-id-123',
          IsOrganizationConnected: false,
          IsActive: true,
          IsRestApiEnabled: true,
        },
      ]);

      mockGetOrganizationConnection.mockRejectedValue(
        new Error('Get org connection failed')
      );

      await expect(
        handler(mockEvent(validInput), {} as Context)
      ).rejects.toThrow('Get org connection failed');

      expect(mockDeleteSsoConnection).toHaveBeenCalledWith(
        expect.anything(),
        mockConnectionId
      );
    });

    it('should throw when createSsoConnection fails', async () => {
      mockCreateSsoConnection.mockRejectedValue(
        new Error('Create connection failed')
      );

      await expect(
        handler(mockEvent(validInput), {} as Context)
      ).rejects.toThrow('Create connection failed');
    });

    it('should not attempt cleanup if connection was never created', async () => {
      mockCreateSsoConnection.mockRejectedValue(
        new Error('Create connection failed')
      );

      await expect(
        handler(mockEvent(validInput), {} as Context)
      ).rejects.toThrow();

      expect(mockDeleteSsoConnection).not.toHaveBeenCalled();
    });

    it('should throw even if cleanup fails', async () => {
      mockEnableClientForConnection.mockRejectedValue(
        new Error('Enable client failed')
      );
      mockDeleteSsoConnection.mockRejectedValue(new Error('Cleanup failed'));

      await expect(
        handler(mockEvent(validInput), {} as Context)
      ).rejects.toThrow('Enable client failed');
    });

    it('should throw when repository findAll fails', async () => {
      mockRepoFindAll.mockRejectedValue(new Error('DB error'));

      await expect(
        handler(mockEvent(validInput), {} as Context)
      ).rejects.toThrow('DB error');
    });
  });

  describe('schema validation', () => {
    it('should return 400 when domain is missing', async () => {
      const invalidInput = { ...validInput, domain: '' };

      const response = await handler(mockEvent(invalidInput), {} as Context);

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when clientId is missing', async () => {
      const invalidInput = { ...validInput, clientId: '' };

      const response = await handler(mockEvent(invalidInput), {} as Context);

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when clientSecret is missing', async () => {
      const invalidInput = { ...validInput, clientSecret: '' };

      const response = await handler(mockEvent(invalidInput), {} as Context);

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when strategy is missing', async () => {
      const invalidInput = {
        ...validInput,
        strategy: undefined,
      } as unknown as PostSchema['object'];

      const response = await handler(mockEvent(invalidInput), {} as Context);

      expect(response.statusCode).toBe(400);
    });
  });
});
