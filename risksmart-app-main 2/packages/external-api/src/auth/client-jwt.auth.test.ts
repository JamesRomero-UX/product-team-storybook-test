import type { Request } from 'express';
import type { GetVerificationKey } from 'express-jwt';
import createHttpError from 'http-errors';
import type { JwtPayload } from 'jsonwebtoken';
import { expressJwtSecret } from 'jwks-rsa';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppAuthClientConfig } from '../schemas/app-config/app-config.schema';
import { createMultiIssuerJWTParams } from './client-jwt.auth';

vi.mock('jwks-rsa', () => ({
  expressJwtSecret: vi.fn(() => vi.fn(() => 'mocked-secret')),
  SigningKeyNotFoundError: class extends Error {
    constructor(message?: string) {
      super(message);
      this.name = 'SigningKeyNotFoundError';
    }
  },
}));

vi.mock('http-errors', () => ({
  default: vi.fn((code: number, message: string) => {
    const error = new Error(message) as Error & { status: number };
    error.status = code;

    return error;
  }),
}));

// Common mock objects
const mockJwkProvider1 = {
  jwkUri: 'https://issuer1.com/.well-known/jwks.json',
  alg: 'RS256' as const,
  issuer: 'https://issuer1.com',
};

const mockJwkProvider2 = {
  jwkUri: 'https://issuer2.com/.well-known/jwks.json',
  alg: 'RS256' as const,
  issuer: 'https://issuer2.com',
};

const mockLocalKeys = [
  {
    kty: 'RSA',
    kid: 'test-key-id',
    n: 'test-n-value',
    e: 'AQAB',
    alg: 'RS256',
  } as const,
];

const createMockConfig = (overrides: Partial<AppAuthClientConfig> = {}) =>
  ({
    clientType: 'mock',
    accessTokenExpiryHrs: 1,
    jwkProviders: [mockJwkProvider1],
    tokenUrl: 'https://example.com/token',
    localKeys: [],
    orgClientLimit: 20,
    ...overrides,
  }) as AppAuthClientConfig;

const createMockRequest = (): Request => ({}) as Request;

const createMockToken = (payload: JwtPayload | string) => ({
  header: { alg: 'RS256', typ: 'JWT' },
  payload,
  signature: 'mock-signature',
});

describe('client-jwt.auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMultiIssuerJWTParams', () => {
    describe('Basic functionality', () => {
      it('should create JWT params with correct structure', () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        expect(result).toEqual({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          secret: expect.any(Function),
          algorithms: ['RS256'],
        });
      });

      it('should return algorithms from single provider', () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        expect(result.algorithms).toEqual(['RS256']);
      });

      it('should return unique algorithms from multiple providers', () => {
        const config = createMockConfig({
          jwkProviders: [mockJwkProvider1, mockJwkProvider2],
        });
        const result = createMultiIssuerJWTParams(config);

        expect(result.algorithms).toHaveLength(1);
        expect(result.algorithms).toContain('RS256');
      });

      it('should deduplicate algorithms when multiple providers use same algorithm', () => {
        const provider3 = {
          ...mockJwkProvider1,
          issuer: 'https://issuer3.com',
          jwkUri: 'https://issuer3.com/.well-known/jwks.json',
        };
        const config = createMockConfig({
          jwkProviders: [mockJwkProvider1, provider3],
        });
        const result = createMultiIssuerJWTParams(config);

        expect(result.algorithms).toEqual(['RS256']);
      });
    });

    describe('expressJwtSecret configuration', () => {
      it('should call expressJwtSecret with default options for single provider', () => {
        const config = createMockConfig();
        createMultiIssuerJWTParams(config);

        expect(expressJwtSecret).toHaveBeenCalledWith({
          cache: true,
          cacheMaxAge: 600000,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: 'https://issuer1.com/.well-known/jwks.json',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          handleSigningKeyError: expect.any(Function),
        });
      });

      it('should call expressJwtSecret once for each provider', () => {
        const config = createMockConfig({
          jwkProviders: [mockJwkProvider1, mockJwkProvider2],
        });
        createMultiIssuerJWTParams(config);

        expect(expressJwtSecret).toHaveBeenCalledTimes(2);
        expect(expressJwtSecret).toHaveBeenCalledWith(
          expect.objectContaining({
            jwksUri: 'https://issuer1.com/.well-known/jwks.json',
          })
        );
        expect(expressJwtSecret).toHaveBeenCalledWith(
          expect.objectContaining({
            jwksUri: 'https://issuer2.com/.well-known/jwks.json',
          })
        );
      });

      it('should call expressJwtSecret with custom options', () => {
        const config = createMockConfig({
          jwkEnableCache: false,
          jwkRateLimit: false,
          jwkRequestPerMin: 10,
          jwkCacheExpirySec: 1200,
        });
        createMultiIssuerJWTParams(config);

        expect(expressJwtSecret).toHaveBeenCalledWith({
          cache: false,
          cacheMaxAge: 1200000,
          rateLimit: false,
          jwksRequestsPerMinute: 10,
          jwksUri: 'https://issuer1.com/.well-known/jwks.json',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          handleSigningKeyError: expect.any(Function),
        });
      });
    });

    describe('Local keys configuration', () => {
      it('should add getKeysInterceptor when localKeys are provided', () => {
        const config = createMockConfig({
          localKeys: mockLocalKeys,
        });
        createMultiIssuerJWTParams(config);

        expect(expressJwtSecret).toHaveBeenCalledWith({
          cache: true,
          cacheMaxAge: 600000,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: 'https://issuer1.com/.well-known/jwks.json',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          handleSigningKeyError: expect.any(Function),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          getKeysInterceptor: expect.any(Function),
        });
      });

      it('should not add getKeysInterceptor when localKeys is empty array', () => {
        const config = createMockConfig({
          localKeys: [],
        });
        createMultiIssuerJWTParams(config);

        const call = vi.mocked(expressJwtSecret).mock.calls[0];
        expect(call?.[0]?.getKeysInterceptor).toBeUndefined();
      });

      it('should return local keys from getKeysInterceptor', async () => {
        const config = createMockConfig({
          localKeys: mockLocalKeys,
        });
        createMultiIssuerJWTParams(config);

        const call = vi.mocked(expressJwtSecret).mock.calls[0];
        const getKeysInterceptor = call?.[0]?.getKeysInterceptor;
        expect(getKeysInterceptor).toBeDefined();

        if (getKeysInterceptor) {
          const keys = await getKeysInterceptor();
          expect(keys).toEqual(mockLocalKeys);
        }
      });
    });

    describe('Dynamic secret function - happy paths', () => {
      it('should successfully validate token with valid issuer', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        const mockToken = createMockToken({
          iss: 'https://issuer1.com',
          sub: 'user123',
        });

        const mockSecretGetter = vi.mocked(expressJwtSecret).mock.results[0]
          ?.value as typeof vi.fn;

        await (result.secret as GetVerificationKey)(mockRequest, mockToken);

        expect(mockSecretGetter).toHaveBeenCalledWith(mockRequest, mockToken);
      });

      it('should handle multiple issuers and select correct secret getter', async () => {
        const mockSecretGetter1 = vi.fn(() => 'secret-1');
        const mockSecretGetter2 = vi.fn(() => 'secret-2');
        vi.mocked(expressJwtSecret)
          .mockReturnValueOnce(mockSecretGetter1)
          .mockReturnValueOnce(mockSecretGetter2);

        const config = createMockConfig({
          jwkProviders: [mockJwkProvider1, mockJwkProvider2],
        });
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();

        // Test first issuer
        const token1 = createMockToken({
          iss: 'https://issuer1.com',
          sub: 'user123',
        });
        await (result.secret as GetVerificationKey)(mockRequest, token1);
        expect(mockSecretGetter1).toHaveBeenCalledWith(mockRequest, token1);
        expect(mockSecretGetter2).not.toHaveBeenCalled();

        vi.clearAllMocks();

        // Test second issuer
        const token2 = createMockToken({
          iss: 'https://issuer2.com',
          sub: 'user456',
        });
        await (result.secret as GetVerificationKey)(mockRequest, token2);
        expect(mockSecretGetter2).toHaveBeenCalledWith(mockRequest, token2);
        expect(mockSecretGetter1).not.toHaveBeenCalled();
      });
    });

    describe('Dynamic secret function - unhappy paths', () => {
      it('should throw 401 error when token payload is a string', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        const mockToken = createMockToken('string-payload');

        await expect(
          (result.secret as GetVerificationKey)(mockRequest, mockToken)
        ).rejects.toThrow('Invalid token payload');
        expect(createHttpError).toHaveBeenCalledWith(
          401,
          'Invalid token payload'
        );
      });

      it('should throw 401 error when issuer claim is missing', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        const mockToken = createMockToken({
          sub: 'user123',
        });

        await expect(
          (result.secret as GetVerificationKey)(mockRequest, mockToken)
        ).rejects.toThrow('Token missing issuer claim');
        expect(createHttpError).toHaveBeenCalledWith(
          401,
          'Token missing issuer claim'
        );
      });

      it('should throw 401 error when issuer claim is undefined', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        const mockToken = createMockToken({
          iss: undefined,
          sub: 'user123',
        });

        await expect(
          (result.secret as GetVerificationKey)(mockRequest, mockToken)
        ).rejects.toThrow('Token missing issuer claim');
      });

      it('should throw 401 error when issuer is unknown', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        const mockToken = createMockToken({
          iss: 'https://unknown-issuer.com',
          sub: 'user123',
        });

        await expect(
          (result.secret as GetVerificationKey)(mockRequest, mockToken)
        ).rejects.toThrow('Unknown issuer');
        expect(createHttpError).toHaveBeenCalledWith(401, 'Unknown issuer');
      });

      it('should throw 401 error when token payload is null', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        const mockToken = {
          header: { alg: 'RS256', typ: 'JWT' },
          payload: null,
          signature: 'mock-signature',
        };

        await expect(
          (result.secret as GetVerificationKey)(mockRequest, mockToken as never)
        ).rejects.toThrow('Invalid token payload');
      });

      it('should throw 401 error when token payload is undefined', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        const mockToken = {
          header: { alg: 'RS256', typ: 'JWT' },
          payload: undefined,
          signature: 'mock-signature',
        };

        await expect(
          (result.secret as GetVerificationKey)(mockRequest, mockToken as never)
        ).rejects.toThrow('Invalid token payload');
      });
    });

    describe('Error handling in handleSigningKeyError', () => {
      it('should handle SigningKeyNotFoundError with 401 status', async () => {
        const { SigningKeyNotFoundError } = await import('jwks-rsa');
        const config = createMockConfig();
        createMultiIssuerJWTParams(config);

        const call = vi.mocked(expressJwtSecret).mock.calls[0];
        const handleSigningKeyError = call?.[0]?.handleSigningKeyError;
        expect(handleSigningKeyError).toBeDefined();

        const mockCallback = vi.fn();
        const signingKeyError = new SigningKeyNotFoundError('Key not found');

        handleSigningKeyError?.(signingKeyError, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 401,
            message: 'Token validation failed',
          })
        );
        expect(createHttpError).toHaveBeenCalledWith(
          401,
          'Token validation failed'
        );
      });

      it('should handle generic errors with 500 status', () => {
        const config = createMockConfig();
        createMultiIssuerJWTParams(config);

        const call = vi.mocked(expressJwtSecret).mock.calls[0];
        const handleSigningKeyError = call?.[0]?.handleSigningKeyError;
        expect(handleSigningKeyError).toBeDefined();

        const mockCallback = vi.fn();
        const genericError = new Error('Something went wrong');

        handleSigningKeyError?.(genericError, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 500,
            message: 'Internal Server Error',
          })
        );
        expect(createHttpError).toHaveBeenCalledWith(
          500,
          'Internal Server Error'
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle empty jwkProviders array', () => {
        const config = createMockConfig({
          jwkProviders: [],
        });
        const result = createMultiIssuerJWTParams(config);

        expect(result.algorithms).toEqual([]);
        expect(result.secret).toBeInstanceOf(Function);
      });

      it('should handle issuer claim with trailing slash', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        // Token issuer has trailing slash but should be normalized to match config
        const mockToken = createMockToken({
          iss: 'https://issuer1.com/',
          sub: 'user123',
        });

        const mockSecretGetter = vi.mocked(expressJwtSecret).mock.results[
          vi.mocked(expressJwtSecret).mock.calls.length - 1
        ]?.value as typeof vi.fn;

        await (result.secret as GetVerificationKey)(mockRequest, mockToken);
        expect(mockSecretGetter).toHaveBeenCalledWith(mockRequest, mockToken);
      });

      it('should handle case-sensitive issuer matching', async () => {
        const config = createMockConfig();
        const result = createMultiIssuerJWTParams(config);

        const mockRequest = createMockRequest();
        const mockToken = createMockToken({
          iss: 'https://ISSUER1.COM',
          sub: 'user123',
        });

        await expect(
          (result.secret as GetVerificationKey)(mockRequest, mockToken)
        ).rejects.toThrow('Unknown issuer');
      });
    });
  });
});
