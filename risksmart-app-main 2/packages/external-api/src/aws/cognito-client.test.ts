import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand,
  TimeUnitsType,
} from '@aws-sdk/client-cognito-identity-provider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InvalidAuthTokenRequestError } from '../errors/auth.errors';
import { logger } from '../utils/logger';
import { CognitoAuthClient } from './cognito-client';

// Mock AWS SDK
vi.mock('@aws-sdk/client-cognito-identity-provider', async () => {
  const actual = await vi.importActual(
    '@aws-sdk/client-cognito-identity-provider'
  );

  return {
    ...actual,
    CognitoIdentityProviderClient: vi.fn(),
  };
});

// Mock global fetch
global.fetch = vi.fn();

describe('CognitoAuthClient', () => {
  const mockTokenUrl =
    'https://test-cognito-domain.auth.us-east-1.amazoncognito.com/oauth2/token';
  const mockUserPoolId = 'us-east-1_testpool';
  const mockAccessTokenExpiryHrs = 24;

  let cognitoClient: CognitoAuthClient;
  let mockCognitoClientInstance: {
    send: ReturnType<typeof vi.fn>;
  };

  // Common mock objects
  const mockClientCredentials = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
  };

  const mockTokenResponse = {
    access_token: 'mock-access-token',
    expires_in: 3600,
    token_type: 'Bearer' as const,
    scope: 'api/v1/core/account:read',
  };

  const mockCreateClientParams = {
    clientName: 'Test Client Name',
  };

  const mockCreateClientResponse = {
    UserPoolClient: {
      ClientId: 'created-client-id',
      ClientSecret: 'created-client-secret',
      ClientName: 'Test Client Name',
      CreationDate: new Date('2024-01-01T00:00:00.000Z'),
    },
  };

  const mockDeleteClientParams = {
    clientId: 'client-to-delete',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Cognito client instance
    mockCognitoClientInstance = {
      send: vi.fn(),
    };

    // Mock the CognitoIdentityProviderClient constructor
    vi.mocked(CognitoIdentityProviderClient).mockImplementation(
      () =>
        mockCognitoClientInstance as unknown as CognitoIdentityProviderClient
    );

    cognitoClient = new CognitoAuthClient(
      mockTokenUrl,
      mockUserPoolId,
      mockAccessTokenExpiryHrs
    );
  });

  describe('getClientAccessToken', () => {
    it('should successfully retrieve access token with valid credentials', async () => {
      // Arrange
      const mockFetchResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      // Act
      const result = await cognitoClient.getClientAccessToken(
        mockClientCredentials
      );

      // Assert
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        mockTokenUrl,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringContaining('Basic ') as string,
          },
          body: 'grant_type=client_credentials',
        })
      );
    });

    it('should encode credentials correctly in Basic auth header', async () => {
      // Arrange
      const mockFetchResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      const expectedAuth = Buffer.from(
        `${mockClientCredentials.clientId}:${mockClientCredentials.clientSecret}`
      ).toString('base64');

      // Act
      await cognitoClient.getClientAccessToken(mockClientCredentials);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        mockTokenUrl,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Basic ${expectedAuth}`,
          }) as Record<string, string>,
        })
      );
    });

    it('should throw InvalidAuthTokenRequestError for 4xx client errors', async () => {
      // Arrange
      const mockFetchResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: vi.fn().mockResolvedValue('Invalid credentials'),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      // Act & Assert
      await expect(
        cognitoClient.getClientAccessToken(mockClientCredentials)
      ).rejects.toThrow(InvalidAuthTokenRequestError);
    });

    it('should throw InvalidAuthTokenRequestError for 400 Bad Request', async () => {
      // Arrange
      const mockFetchResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: vi.fn().mockResolvedValue('invalid_request'),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      // Act & Assert
      await expect(
        cognitoClient.getClientAccessToken(mockClientCredentials)
      ).rejects.toThrow(InvalidAuthTokenRequestError);
    });

    it('should throw InvalidAuthTokenRequestError for 403 Forbidden', async () => {
      // Arrange
      const mockFetchResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: vi.fn().mockResolvedValue('access_denied'),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      // Act & Assert
      await expect(
        cognitoClient.getClientAccessToken(mockClientCredentials)
      ).rejects.toThrow(InvalidAuthTokenRequestError);
    });

    it('should throw generic Error for 5xx server errors', async () => {
      // Arrange
      const errorBody = 'Internal Server Error';
      const mockFetchResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: vi.fn().mockResolvedValue(errorBody),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      const loggerErrorSpy = vi.spyOn(logger, 'error');

      // Act & Assert
      await expect(
        cognitoClient.getClientAccessToken(mockClientCredentials)
      ).rejects.toThrow(
        `Token request failed: 500 Internal Server Error ${errorBody}`
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          cognitoErrorResponseBody: errorBody,
          clientId: mockClientCredentials.clientId,
          statusCode: 500,
        }),
        'Failed to request new client credentials access token'
      );
    });

    it('should throw generic Error for 503 Service Unavailable', async () => {
      // Arrange
      const errorBody = 'Service Unavailable';
      const mockFetchResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: vi.fn().mockResolvedValue(errorBody),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      // Act & Assert
      await expect(
        cognitoClient.getClientAccessToken(mockClientCredentials)
      ).rejects.toThrow('Token request failed: 503 Service Unavailable');
    });

    it('should handle token response without optional scope field', async () => {
      // Arrange
      const responseWithoutScope = {
        access_token: 'mock-access-token',
        expires_in: 3600,
        token_type: 'Bearer' as const,
      };
      const mockFetchResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(responseWithoutScope),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      // Act
      const result = await cognitoClient.getClientAccessToken(
        mockClientCredentials
      );

      // Assert
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      });
    });

    it('should log info when requesting new access token', async () => {
      // Arrange
      const mockFetchResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockTokenResponse),
      };
      vi.mocked(global.fetch).mockResolvedValue(
        mockFetchResponse as unknown as Response
      );

      const loggerInfoSpy = vi.spyOn(logger, 'info');

      // Act
      await cognitoClient.getClientAccessToken(mockClientCredentials);

      // Assert
      expect(loggerInfoSpy).toHaveBeenCalledWith(
        { clientId: mockClientCredentials.clientId },
        'requesting new access token for client credentials'
      );
    });
  });

  describe('createUserPoolClient', () => {
    it('should successfully create a user pool client', async () => {
      // Arrange
      mockCognitoClientInstance.send.mockResolvedValue(
        mockCreateClientResponse
      );

      const loggerInfoSpy = vi.spyOn(logger, 'info');

      // Act
      const result = await cognitoClient.createUserPoolClient(
        mockCreateClientParams
      );

      // Assert
      expect(result).toEqual({
        clientId: 'created-client-id',
        clientSecret: 'created-client-secret',
        clientName: 'Test Client Name',
      });

      expect(mockCognitoClientInstance.send).toHaveBeenCalledWith(
        expect.any(CreateUserPoolClientCommand)
      );

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'created-client-id',
          clientName: 'Test Client Name',
          createdAt: '2024-01-01T00:00:00.000Z',
        }),
        'Successfully created Cognito user pool client: Test Client Name'
      );
    });

    it('should create client with correct Cognito parameters', async () => {
      // Arrange
      mockCognitoClientInstance.send.mockResolvedValue(
        mockCreateClientResponse
      );

      // Act
      await cognitoClient.createUserPoolClient(mockCreateClientParams);

      // Assert
      const sentCommand = mockCognitoClientInstance.send.mock
        .calls[0]?.[0] as CreateUserPoolClientCommand;
      expect(sentCommand).toBeDefined();
      expect(sentCommand.input).toBeDefined();
      expect(sentCommand.input).toEqual({
        UserPoolId: mockUserPoolId,
        ClientName: 'Test Client Name',
        GenerateSecret: true,
        AllowedOAuthFlowsUserPoolClient: true,
        AllowedOAuthFlows: ['client_credentials'],
        AllowedOAuthScopes: [
          'api/v1/core/account:read',
          'api/v1/core/documentation:read',
        ],
        SupportedIdentityProviders: ['COGNITO'],
        AccessTokenValidity: mockAccessTokenExpiryHrs,
        TokenValidityUnits: { AccessToken: TimeUnitsType.HOURS },
      });
    });

    it('should truncate client name to 128 characters', async () => {
      // Arrange
      const longClientName = 'A'.repeat(200);
      const paramsWithLongName = { clientName: longClientName };
      mockCognitoClientInstance.send.mockResolvedValue(
        mockCreateClientResponse
      );

      // Act
      await cognitoClient.createUserPoolClient(paramsWithLongName);

      // Assert
      const sentCommand = mockCognitoClientInstance.send.mock
        .calls[0]?.[0] as CreateUserPoolClientCommand;
      expect(sentCommand).toBeDefined();
      expect(sentCommand.input).toBeDefined();
      expect(sentCommand.input?.ClientName).toHaveLength(128);
      expect(sentCommand.input?.ClientName).toBe('A'.repeat(128));
    });

    it('should throw error when response is missing ClientId', async () => {
      // Arrange
      const invalidResponse = {
        UserPoolClient: {
          ClientSecret: 'created-client-secret',
          ClientName: 'Test Client Name',
        },
      };
      mockCognitoClientInstance.send.mockResolvedValue(invalidResponse);

      const loggerErrorSpy = vi.spyOn(logger, 'error');

      // Act & Assert
      await expect(
        cognitoClient.createUserPoolClient(mockCreateClientParams)
      ).rejects.toThrow(
        'Failed to create Cognito client: missing client ID, Name, or secret'
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clientName: 'Test Client Name',
          error:
            'Failed to create Cognito client: missing client ID, Name, or secret',
        }),
        'Failed to create Cognito user pool client'
      );
    });

    it('should throw error when response is missing ClientSecret', async () => {
      // Arrange
      const invalidResponse = {
        UserPoolClient: {
          ClientId: 'created-client-id',
          ClientName: 'Test Client Name',
        },
      };
      mockCognitoClientInstance.send.mockResolvedValue(invalidResponse);

      // Act & Assert
      await expect(
        cognitoClient.createUserPoolClient(mockCreateClientParams)
      ).rejects.toThrow(
        'Failed to create Cognito client: missing client ID, Name, or secret'
      );
    });

    it('should throw error when response is missing ClientName', async () => {
      // Arrange
      const invalidResponse = {
        UserPoolClient: {
          ClientId: 'created-client-id',
          ClientSecret: 'created-client-secret',
        },
      };
      mockCognitoClientInstance.send.mockResolvedValue(invalidResponse);

      // Act & Assert
      await expect(
        cognitoClient.createUserPoolClient(mockCreateClientParams)
      ).rejects.toThrow(
        'Failed to create Cognito client: missing client ID, Name, or secret'
      );
    });

    it('should throw error when UserPoolClient is undefined', async () => {
      // Arrange
      const invalidResponse = {};
      mockCognitoClientInstance.send.mockResolvedValue(invalidResponse);

      // Act & Assert
      await expect(
        cognitoClient.createUserPoolClient(mockCreateClientParams)
      ).rejects.toThrow(
        'Failed to create Cognito client: missing client ID, Name, or secret'
      );
    });

    it('should handle and log errors from Cognito service', async () => {
      // Arrange
      const cognitoError = new Error(
        'ResourceNotFoundException: User pool not found'
      );
      mockCognitoClientInstance.send.mockRejectedValue(cognitoError);

      const loggerErrorSpy = vi.spyOn(logger, 'error');

      // Act & Assert
      await expect(
        cognitoClient.createUserPoolClient(mockCreateClientParams)
      ).rejects.toThrow('ResourceNotFoundException: User pool not found');

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clientName: 'Test Client Name',
          error: 'ResourceNotFoundException: User pool not found',
        }),
        'Failed to create Cognito user pool client'
      );
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      mockCognitoClientInstance.send.mockRejectedValue('String error');

      const loggerErrorSpy = vi.spyOn(logger, 'error');

      // Act & Assert
      await expect(
        cognitoClient.createUserPoolClient(mockCreateClientParams)
      ).rejects.toBe('String error');

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          clientName: 'Test Client Name',
          error: 'Unknown error',
        }),
        'Failed to create Cognito user pool client'
      );
    });
  });

  describe('removeUserPoolClient', () => {
    it('should successfully remove a user pool client', async () => {
      // Arrange
      mockCognitoClientInstance.send.mockResolvedValue({});

      // Act
      const result = await cognitoClient.removeUserPoolClient(
        mockDeleteClientParams
      );

      // Assert
      expect(result).toEqual({
        clientId: 'client-to-delete',
      });

      expect(mockCognitoClientInstance.send).toHaveBeenCalledWith(
        expect.any(DeleteUserPoolClientCommand)
      );
    });

    it('should call DeleteUserPoolClientCommand with correct parameters', async () => {
      // Arrange
      mockCognitoClientInstance.send.mockResolvedValue({});

      // Act
      await cognitoClient.removeUserPoolClient(mockDeleteClientParams);

      // Assert
      const sentCommand = mockCognitoClientInstance.send.mock
        .calls[0]?.[0] as DeleteUserPoolClientCommand;
      expect(sentCommand).toBeDefined();
      expect(sentCommand.input).toBeDefined();
      expect(sentCommand.input).toEqual({
        ClientId: 'client-to-delete',
        UserPoolId: mockUserPoolId,
      });
    });

    it('should handle and log errors from Cognito service', async () => {
      // Arrange
      const cognitoError = new Error(
        'ResourceNotFoundException: Client not found'
      );
      mockCognitoClientInstance.send.mockRejectedValue(cognitoError);

      const loggerErrorSpy = vi.spyOn(logger, 'error');

      // Act & Assert
      await expect(
        cognitoClient.removeUserPoolClient(mockDeleteClientParams)
      ).rejects.toThrow('ResourceNotFoundException: Client not found');

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: mockDeleteClientParams,
          error: 'ResourceNotFoundException: Client not found',
        }),
        'Failed to remove/delete Cognito user pool client'
      );
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      mockCognitoClientInstance.send.mockRejectedValue('String error');

      const loggerErrorSpy = vi.spyOn(logger, 'error');

      // Act & Assert
      await expect(
        cognitoClient.removeUserPoolClient(mockDeleteClientParams)
      ).rejects.toBe('String error');

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: mockDeleteClientParams,
          error: 'Unknown error',
        }),
        'Failed to remove/delete Cognito user pool client'
      );
    });

    it('should handle TooManyRequestsException', async () => {
      // Arrange
      const rateLimitError = new Error(
        'TooManyRequestsException: Rate exceeded'
      );
      mockCognitoClientInstance.send.mockRejectedValue(rateLimitError);

      // Act & Assert
      await expect(
        cognitoClient.removeUserPoolClient(mockDeleteClientParams)
      ).rejects.toThrow('TooManyRequestsException: Rate exceeded');
    });

    it('should handle InvalidParameterException', async () => {
      // Arrange
      const invalidParamError = new Error(
        'InvalidParameterException: Invalid client ID'
      );
      mockCognitoClientInstance.send.mockRejectedValue(invalidParamError);

      // Act & Assert
      await expect(
        cognitoClient.removeUserPoolClient(mockDeleteClientParams)
      ).rejects.toThrow('InvalidParameterException: Invalid client ID');
    });
  });

  describe('constructor', () => {
    it('should accept custom CognitoIdentityProviderClient', () => {
      // Arrange
      const customClient = new CognitoIdentityProviderClient();

      // Act
      const client = new CognitoAuthClient(
        mockTokenUrl,
        mockUserPoolId,
        mockAccessTokenExpiryHrs,
        customClient
      );

      // Assert
      expect(client).toBeInstanceOf(CognitoAuthClient);
    });

    it('should create default CognitoIdentityProviderClient when not provided', () => {
      // Act
      const client = new CognitoAuthClient(
        mockTokenUrl,
        mockUserPoolId,
        mockAccessTokenExpiryHrs
      );

      // Assert
      expect(client).toBeInstanceOf(CognitoAuthClient);
      expect(CognitoIdentityProviderClient).toHaveBeenCalled();
    });
  });
});
