import { vi } from 'vitest';
import { ZodError } from 'zod';

// Mock dependencies
vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('../utils/environment', () => ({
  getEnv: vi.fn(),
  parseEnvJson: vi.fn(),
}));

vi.mock('../utils/schemas', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
    serializeZodError: vi.fn(
      (err: { issues: Array<{ path: string[]; message: string }> }) =>
        err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }))
    ),
  };
});

// Import the functions under test after mocking
import { getEnv, parseEnvJson } from '../utils/environment';
import { logger } from '../utils/logger';
import { serializeZodError } from '../utils/schemas';
import { generateAppAuthConfig, generateAppConfig } from './app.config';

describe('app.config', () => {
  // Common test data
  const validAuthConfig = {
    clientType: 'mock' as const,
    tokenUrl: 'https://example.com/token',
  };

  const validJwkProviders = [
    {
      issuer: 'https://example.com',
      jwkUri: 'https://example.com/.well-known/jwks.json',
      alg: 'RS256' as const,
    },
  ];

  const validLocalKeys = [
    {
      kty: 'RSA' as const,
      n: 'validBase64urlString',
      e: 'AQAB',
      alg: 'RS256' as const,
      kid: 'test-kid-123',
    },
  ];

  // Helper function to create mock parseEnvJson implementation
  const createMockParseEnvJson = (overrides: Record<string, unknown> = {}) => {
    return (key: string, required?: boolean, defaultValue?: unknown) => {
      const defaults: Record<string, unknown> = {
        JWK_LOCAL_KEYS: validLocalKeys,
        AUTH_CONFIG: validAuthConfig,
        AUTH_JWT_PROVIDERS: validJwkProviders,
        AUTH_BREAKER_CONFIG: null,
        ALLOWED_RS_USER_ROLES: ['RiskManager'],
      };

      if (key in overrides) {
        return overrides[key];
      }

      if (key in defaults) {
        return defaults[key];
      }

      return defaultValue ?? null;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAppAuthConfig', () => {
    describe('happy path, expected env var values & defaults', () => {
      it('should generate auth config with valid environment variables', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(createMockParseEnvJson());

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'ORG_CLIENT_LIMIT':
                return '56';
              case 'API_DOCS_SIGNING_KEY':
                return 'a'.repeat(64);
              case 'API_DOCS_EXPIRY_HRS':
                return '24';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        const result = generateAppAuthConfig();

        expect(result).toEqual({
          ...validAuthConfig,
          jwkProviders: validJwkProviders,
          localKeys: validLocalKeys,
          accessTokenExpiryHrs: 1, // default value
          orgClientLimit: 56,
          allowedRSUserRoles: ['RiskManager'],
          docsSigningKey: 'a'.repeat(64),
          docsExpiryHrs: 24,
          breakerPolicy: {
            threshold: 5,
            resetTimeoutMs: 3000,
            retryAttempts: 2,
            backoffBaseDelayMs: 2000,
            maxConcurrency: 5,
            maxQueueSize: 150,
          },
        });
      });

      it('should use custom breaker config when provided', () => {
        const customBreakerConfig = {
          threshold: 10,
          resetTimeoutMs: 6000,
          retryAttempts: 5,
          backoffBaseDelayMs: 2000,
          maxConcurrency: 15,
          maxQueueSize: 200,
        };

        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(
          createMockParseEnvJson({ AUTH_BREAKER_CONFIG: customBreakerConfig })
        );

        mockGetEnv.mockImplementation((key: string) => {
          switch (key) {
            case 'API_DOCS_SIGNING_KEY':
              return 'a'.repeat(64);
            case 'API_DOCS_EXPIRY_HRS':
              return '24';
            default:
              return '5';
          }
        });

        const result = generateAppAuthConfig();

        expect(result.breakerPolicy).toEqual(customBreakerConfig);
      });

      it('should handle empty local keys array', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(
          createMockParseEnvJson({ JWK_LOCAL_KEYS: [] })
        );

        mockGetEnv.mockImplementation((key: string) => {
          switch (key) {
            case 'API_DOCS_SIGNING_KEY':
              return 'a'.repeat(64);
            case 'API_DOCS_EXPIRY_HRS':
              return '24';
            default:
              return '5';
          }
        });

        const result = generateAppAuthConfig();

        expect(result.localKeys).toEqual([]);
      });

      it('should handle cognito client type with required fields', () => {
        const cognitoConfig = {
          ...validAuthConfig,
          clientType: 'cognito' as const,
          authTableName: 'test-table',
          userPoolId: 'us-east-1_123456789',
        };

        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(
          createMockParseEnvJson({
            JWK_LOCAL_KEYS: [],
            AUTH_CONFIG: cognitoConfig,
          })
        );

        mockGetEnv.mockImplementation((key: string) => {
          switch (key) {
            case 'API_DOCS_SIGNING_KEY':
              return 'a'.repeat(64);
            case 'API_DOCS_EXPIRY_HRS':
              return '24';
            default:
              return '5';
          }
        });

        const result = generateAppAuthConfig();

        expect(result.clientType).toBe('cognito');
        expect(
          result.clientType === 'cognito' ? result.authTableName : ''
        ).toBe('test-table');
        expect(result.clientType === 'cognito' ? result.userPoolId : '').toBe(
          'us-east-1_123456789'
        );
      });
    });

    describe('unhappy path - missing environment variables', () => {
      it('should throw error when AUTH_CONFIG is missing', () => {
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(
          (key: string, required?: boolean) => {
            if (key === 'AUTH_CONFIG' && required) {
              throw new Error(
                'Failed to parse AUTH_CONFIG: Environment variable AUTH_CONFIG is not defined'
              );
            }

            return null;
          }
        );

        expect(() => generateAppAuthConfig()).toThrow(
          'Failed to parse AUTH_CONFIG'
        );
      });

      it('should handle missing JWK_LOCAL_KEYS by defaulting to empty array', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(
          createMockParseEnvJson({ JWK_LOCAL_KEYS: [] })
        );

        mockGetEnv.mockImplementation((key: string) => {
          switch (key) {
            case 'API_DOCS_SIGNING_KEY':
              return 'a'.repeat(64);
            case 'API_DOCS_EXPIRY_HRS':
              return '24';
            default:
              return '5';
          }
        });

        const result = generateAppAuthConfig();

        expect(result.localKeys).toEqual([]);
      });
    });

    describe('unhappy path - validation failures', () => {
      it('should throw ZodError for invalid auth config structure', () => {
        const invalidConfig = {
          clientType: 'invalid-type',
          provider: '', // Too short
          alg: 'HS256', // Invalid algorithm
          jwkUrl: 'not-a-valid-url',
        };

        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(
          createMockParseEnvJson({
            AUTH_CONFIG: invalidConfig,
            JWK_LOCAL_KEYS: [],
          })
        );

        mockGetEnv.mockImplementation((key: string) => {
          switch (key) {
            case 'API_DOCS_SIGNING_KEY':
              return 'a'.repeat(64);
            case 'API_DOCS_EXPIRY_HRS':
              return '24';
            default:
              return '5';
          }
        });

        expect(() => generateAppAuthConfig()).toThrow(ZodError);
      });

      it('should throw ZodError for cognito client missing required fields', () => {
        const cognitoConfigMissingFields = {
          ...validAuthConfig,
          clientType: 'cognito',
          // Missing authTableName and userPoolId
        };

        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(
          createMockParseEnvJson({
            AUTH_CONFIG: cognitoConfigMissingFields,
            JWK_LOCAL_KEYS: [],
          })
        );

        mockGetEnv.mockImplementation((key: string) => {
          switch (key) {
            case 'API_DOCS_SIGNING_KEY':
              return 'a'.repeat(64);
            case 'API_DOCS_EXPIRY_HRS':
              return '24';
            default:
              return '5';
          }
        });

        expect(() => generateAppAuthConfig()).toThrow(ZodError);
      });

      it('should throw error for invalid JSON in AUTH_CONFIG', () => {
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation((key: string) => {
          if (key === 'AUTH_CONFIG') {
            throw new Error(
              'Failed to parse AUTH_CONFIG: Unexpected token i in JSON at position 0'
            );
          }

          return null;
        });

        expect(() => generateAppAuthConfig()).toThrow(
          'Failed to parse AUTH_CONFIG'
        );
      });

      it('should throw error for invalid JSON in JWK_LOCAL_KEYS', () => {
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation((key: string) => {
          if (key === 'JWK_LOCAL_KEYS') {
            throw new Error(
              'Failed to parse JWK_LOCAL_KEYS: Unexpected token i in JSON at position 0'
            );
          }
          if (key === 'AUTH_CONFIG') {
            return validAuthConfig;
          }

          return null;
        });

        expect(() => generateAppAuthConfig()).toThrow(
          'Failed to parse JWK_LOCAL_KEYS'
        );
      });

      it('should throw ZodError for invalid breaker config', () => {
        const invalidBreakerConfig = {
          threshold: -1, // Invalid: must be at least 1
          resetTimeoutMs: 50, // Invalid: must be at least 100
          retryAttempts: 0, // Invalid: must be at least 1
          backoffBaseDelayMs: 50, // Invalid: must be at least 100
          maxConcurrency: 0, // Invalid: must be at least 1
          maxQueueSize: 2, // Invalid: must be at least 5
        };

        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockParseEnvJson.mockImplementation(
          createMockParseEnvJson({
            JWK_LOCAL_KEYS: [],
            AUTH_BREAKER_CONFIG: invalidBreakerConfig,
          })
        );

        mockGetEnv.mockImplementation((key: string) => {
          switch (key) {
            case 'API_DOCS_SIGNING_KEY':
              return 'a'.repeat(64);
            case 'API_DOCS_EXPIRY_HRS':
              return '24';
            default:
              return '5';
          }
        });

        expect(() => generateAppAuthConfig()).toThrow(ZodError);
      });
    });
  });

  describe('generateAppConfig', () => {
    describe('happy path', () => {
      it('should generate app config with valid environment variables', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);
        const mockRateLimitTblName = 'rate_limit_tbl';
        const mockDynamoEndpoint = 'abc123';

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'mock';
              case 'TRPC_SERVICE_BASE_URL':
                return 'https://api.example.com';
              case 'PACKAGE_VERSION':
                return '1.2.3';
              case 'APP_BASE_PATH':
                return 'api/v123';
              case 'RESPONSE_COMPRESSION_LEVEL':
                return '6';
              case 'RATE_LIMIT_TBL_NAME':
                return mockRateLimitTblName;
              case 'ENABLE_RATE_LIMITER':
                return 'false';
              case 'ENABLE_TRUST_PROXY':
                return 'false';
              case 'DYNAMO_ENDPOINT':
                return mockDynamoEndpoint;
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockReturnValue(null);

        const result = generateAppConfig();

        expect(result).toEqual({
          clientType: 'mock',
          rateLimitTableName: mockRateLimitTblName,
          dynamoDBEndpoint: mockDynamoEndpoint,
          rateLimiterEnabled: false,
          trustProxyEnabled: false,
          trpcUrl: 'https://api.example.com',
          version: '1.2.3',
          basePath: 'api/v123',
          appDomain: 'default-value',
          breakerPolicy: {
            threshold: 5,
            resetTimeoutMs: 6000,
            retryAttempts: 3,
            backoffBaseDelayMs: 1000,
            maxConcurrency: 10,
            maxQueueSize: 100,
          },
          requestPageLimit: 250,
          responseCompressionLevel: 6,
        });
      });

      it('should use custom breaker config when provided', () => {
        const customBreakerConfig = {
          threshold: 8,
          resetTimeoutMs: 45000,
          retryAttempts: 4,
          backoffBaseDelayMs: 1500,
          maxConcurrency: 20,
          maxQueueSize: 250,
        };

        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'trpc';
              case 'TRPC_SERVICE_BASE_URL':
                return 'https://api.example.com';
              case 'PACKAGE_VERSION':
                return '1.2.3';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockReturnValue(customBreakerConfig);

        const result = generateAppConfig();

        expect(result.breakerPolicy).toEqual(customBreakerConfig);
      });

      it('should handle tRPC client type with URL', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'trpc';
              case 'TRPC_SERVICE_BASE_URL':
                return 'https://trpc.example.com';
              case 'PACKAGE_VERSION':
                return '2.0.0';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockReturnValue(null);

        const result = generateAppConfig();

        expect(result.clientType).toBe('trpc');
        expect(result.trpcUrl).toBe('https://trpc.example.com');
      });

      it('should handle mock client type without URL requirement', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'mock';
              case 'TRPC_SERVICE_BASE_URL':
                return undefined; // Not required for mock
              case 'PACKAGE_VERSION':
                return '1.0.0';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockReturnValue(null);

        const result = generateAppConfig();

        expect(result.clientType).toBe('mock');
        expect(result).not.toHaveProperty('trpcUrl');
      });
    });

    describe('unhappy path - missing environment variables', () => {
      it('should throw error when DATA_CLIENT_TYPE is missing', () => {
        const mockGetEnv = vi.mocked(getEnv);
        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            if (key === 'DATA_CLIENT_TYPE') {
              throw new Error(
                'Environment variable DATA_CLIENT_TYPE is not defined'
              );
            }

            return allowUndefined ? undefined : 'default-value';
          }
        );

        expect(() => generateAppConfig()).toThrow(
          'Environment variable DATA_CLIENT_TYPE is not defined'
        );
      });

      it('should throw error when PACKAGE_VERSION is missing', () => {
        const mockGetEnv = vi.mocked(getEnv);
        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            if (key === 'PACKAGE_VERSION') {
              throw new Error(
                'Environment variable PACKAGE_VERSION is not defined'
              );
            }
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'mock';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        expect(() => generateAppConfig()).toThrow(
          'Environment variable PACKAGE_VERSION is not defined'
        );
      });
    });

    describe('unhappy path - validation failures', () => {
      it('should throw ZodError for invalid client type', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'invalid-client';
              case 'TRPC_SERVICE_BASE_URL':
                return 'https://api.example.com';
              case 'PACKAGE_VERSION':
                return '1.0.0';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockReturnValue(null);

        expect(() => generateAppConfig()).toThrow(ZodError);
      });

      it('should throw ZodError for trpc client without URL', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'trpc';
              case 'TRPC_SERVICE_BASE_URL':
                return undefined; // Missing required URL for trpc client
              case 'PACKAGE_VERSION':
                return '1.0.0';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockReturnValue(null);

        expect(() => generateAppConfig()).toThrow(ZodError);
      });

      it('should throw ZodError for invalid URL format', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'trpc';
              case 'TRPC_SERVICE_BASE_URL':
                return 'not-a-valid-url';
              case 'PACKAGE_VERSION':
                return '1.0.0';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockReturnValue(null);

        expect(() => generateAppConfig()).toThrow(ZodError);
      });

      it('should throw error for invalid JSON in DATA_BREAKER_CONFIG', () => {
        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'mock';
              case 'PACKAGE_VERSION':
                return '1.0.0';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockImplementation((key: string) => {
          if (key === 'DATA_BREAKER_CONFIG') {
            throw new Error(
              'Failed to parse DATA_BREAKER_CONFIG: Unexpected token i in JSON at position 0'
            );
          }

          return null;
        });

        expect(() => generateAppConfig()).toThrow(
          'Failed to parse DATA_BREAKER_CONFIG'
        );
      });

      it('should throw ZodError for invalid breaker config values', () => {
        const invalidBreakerConfig = {
          threshold: 0, // Invalid: must be at least 1
          resetTimeoutMs: 50, // Invalid: must be at least 100
          retryAttempts: 0, // Invalid: must be at least 1
          backoffBaseDelayMs: 99, // Invalid: must be at least 100
          maxConcurrency: 0, // Invalid: must be at least 1
          maxQueueSize: 4, // Invalid: must be at least 5
        };

        const mockGetEnv = vi.mocked(getEnv);
        const mockParseEnvJson = vi.mocked(parseEnvJson);

        mockGetEnv.mockImplementation(
          (key: string, allowUndefined?: boolean) => {
            switch (key) {
              case 'DATA_CLIENT_TYPE':
                return 'mock';
              case 'PACKAGE_VERSION':
                return '1.0.0';
              default:
                return allowUndefined ? undefined : 'default-value';
            }
          }
        );

        mockParseEnvJson.mockReturnValue(invalidBreakerConfig);

        expect(() => generateAppConfig()).toThrow(ZodError);
      });
    });
  });

  describe('error logging', () => {
    it('should log ZodError with serialized errors in generateAppAuthConfig', () => {
      const mockGetEnv = vi.mocked(getEnv);
      const mockParseEnvJson = vi.mocked(parseEnvJson);

      mockParseEnvJson.mockImplementation(
        createMockParseEnvJson({
          AUTH_CONFIG: { clientType: 'invalid-type' },
          JWK_LOCAL_KEYS: [],
        })
      );

      mockGetEnv.mockReturnValue('5');

      expect(() => generateAppAuthConfig()).toThrow(ZodError);
      expect(logger.error).toHaveBeenCalled();
      expect(serializeZodError).toHaveBeenCalled();
    });

    it('should log generic error in generateAppAuthConfig', () => {
      const mockParseEnvJson = vi.mocked(parseEnvJson);

      mockParseEnvJson.mockImplementation((key: string) => {
        if (key === 'AUTH_CONFIG') {
          throw new Error('Generic error');
        }

        return null;
      });

      expect(() => generateAppAuthConfig()).toThrow('Generic error');
      expect(logger.error).toHaveBeenCalledWith(
        { error: expect.any(Error) as unknown as Error },
        'Failed to generate auth config'
      );
    });

    it('should log ZodError with serialized errors in generateAppConfig', () => {
      const mockGetEnv = vi.mocked(getEnv);
      const mockParseEnvJson = vi.mocked(parseEnvJson);

      mockGetEnv.mockImplementation((key: string, allowUndefined?: boolean) => {
        switch (key) {
          case 'DATA_CLIENT_TYPE':
            return 'invalid-client'; // Invalid client type
          case 'PACKAGE_VERSION':
            return '1.0.0';
          default:
            return allowUndefined ? undefined : 'default-value';
        }
      });

      mockParseEnvJson.mockReturnValue(null);

      expect(() => generateAppConfig()).toThrow(ZodError);
      expect(logger.error).toHaveBeenCalled();
      expect(serializeZodError).toHaveBeenCalled();
    });

    it('should log generic error in generateAppConfig', () => {
      const mockGetEnv = vi.mocked(getEnv);
      mockGetEnv.mockImplementation((key: string, allowUndefined?: boolean) => {
        if (key === 'DATA_CLIENT_TYPE') {
          throw new Error('Generic error');
        }

        return allowUndefined ? undefined : 'default-value';
      });

      expect(() => generateAppConfig()).toThrow('Generic error');
      expect(logger.error).toHaveBeenCalledWith(
        { error: expect.any(Error) as unknown as Error },
        'Failed to generate app data config'
      );
    });
  });
});
