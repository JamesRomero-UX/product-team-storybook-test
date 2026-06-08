import { describe, expect, it } from 'vitest';

import { createExpressJWT, type JWTConfig, parseJWTConfig } from '../jwt';

describe('JWT Utils', () => {
  describe('parseJWTConfig', () => {
    it('should correctly parse valid JWT config with key', () => {
      const validConfig = JSON.stringify({
        type: 'HS256',
        key: 'secret-key',
      });

      const result = parseJWTConfig(validConfig);
      expect(result).toEqual({
        type: 'HS256',
        key: 'secret-key',
        jwk_url: undefined,
      });
    });

    it('should correctly parse valid JWT config with jwk_url', () => {
      const validConfig = JSON.stringify({
        type: 'RS256',
        jwk_url: 'https://example.com/.well-known/jwks.json',
      });

      const result = parseJWTConfig(validConfig);
      expect(result).toEqual({
        type: 'RS256',
        key: undefined,
        jwk_url: 'https://example.com/.well-known/jwks.json',
      });
    });

    it('should throw error for non-object config', () => {
      const invalidConfig = JSON.stringify('not-an-object');

      expect(() => parseJWTConfig(invalidConfig)).toThrow(
        'JWT config must be an object'
      );
    });

    it('should throw error for missing type when not using issuers', () => {
      const invalidConfig = JSON.stringify({
        key: 'secret-key',
      });

      expect(() => parseJWTConfig(invalidConfig)).toThrow(
        'JWT config must have a type string when not using multi-issuer configuration'
      );
    });

    it('should throw error for invalid JSON', () => {
      const invalidConfig = 'invalid-json';

      expect(() => parseJWTConfig(invalidConfig)).toThrow(
        'Invalid JWT configuration'
      );
    });

    it('should parse JWT config with issuers', () => {
      const validConfig = JSON.stringify({
        type: 'RS256',
        key: 'default-key',
        issuers: {
          'https://auth0.example.com/': {
            type: 'RS256',
            jwk_url: 'https://auth0.example.com/.well-known/jwks.json',
          },
          'https://cognito.example.com/': {
            type: 'HS256',
            key: 'static-secret',
          },
        },
      });

      const result = parseJWTConfig(validConfig);
      expect(result).toEqual({
        type: 'RS256',
        key: 'default-key',
        jwk_url: undefined,
        issuers: {
          'https://auth0.example.com/': {
            type: 'RS256',
            key: undefined,
            jwk_url: 'https://auth0.example.com/.well-known/jwks.json',
          },
          'https://cognito.example.com/': {
            type: 'HS256',
            key: 'static-secret',
            jwk_url: undefined,
          },
        },
      });
    });

    it('should parse JWT config with issuers without top-level type', () => {
      const validConfig = JSON.stringify({
        issuers: {
          'https://auth0.example.com/': {
            type: 'RS256',
            jwk_url: 'https://auth0.example.com/.well-known/jwks.json',
          },
          'https://cognito.example.com/': {
            type: 'HS256',
            key: 'static-secret',
          },
        },
      });

      const result = parseJWTConfig(validConfig);
      expect(result).toEqual({
        type: undefined,
        key: undefined,
        jwk_url: undefined,
        issuers: {
          'https://auth0.example.com/': {
            type: 'RS256',
            key: undefined,
            jwk_url: 'https://auth0.example.com/.well-known/jwks.json',
          },
          'https://cognito.example.com/': {
            type: 'HS256',
            key: 'static-secret',
            jwk_url: undefined,
          },
        },
      });
    });

    it('should throw error for issuer config missing type', () => {
      const invalidConfig = JSON.stringify({
        type: 'RS256',
        issuers: {
          'https://example.com/': {
            key: 'test-key',
            // missing type
          },
        },
      });

      expect(() => parseJWTConfig(invalidConfig)).toThrow(
        'Issuer https://example.com/ config must have a type string'
      );
    });
  });

  describe('createExpressJWT', () => {
    it('should create JWT config with jwk_url', () => {
      const config: JWTConfig = {
        type: 'RS256',
        key: undefined,
        jwk_url: 'https://example.com/.well-known/jwks.json',
      };

      const result = createExpressJWT(config);

      expect(result).toHaveProperty('algorithms', ['RS256']);
      expect(result).toHaveProperty('secret');
    });

    it('should create JWT config with secret key', () => {
      const config: JWTConfig = {
        type: 'HS256',
        key: 'secret-key',
        jwk_url: undefined,
      };

      const result = createExpressJWT(config);

      expect(result).toHaveProperty('algorithms', ['RS256']);
      expect(result).toHaveProperty('secret', 'secret-key');
    });

    it('should throw error when neither key nor jwk_url is provided', () => {
      const config: JWTConfig = {
        type: 'RS256',
        key: undefined,
        jwk_url: undefined,
      };

      expect(() => createExpressJWT(config)).toThrow(
        'Invalid JWT configuration: key or jwk must be provided'
      );
    });

    it('should create JWT config with multiple issuers', () => {
      const config: JWTConfig = {
        type: 'RS256',
        key: undefined,
        jwk_url: undefined,
        issuers: {
          'https://auth0.example.com/': {
            type: 'RS256',
            key: undefined,
            jwk_url: 'https://auth0.example.com/.well-known/jwks.json',
          },
          'https://cognito.example.com/': {
            type: 'HS256',
            key: 'static-secret-key',
            jwk_url: undefined,
          },
        },
      };

      const result = createExpressJWT(config);

      expect(result).toHaveProperty('algorithms');
      expect(result.algorithms).toContain('RS256');
      expect(result.algorithms).toContain('HS256');
      expect(result).toHaveProperty('secret');
      expect(typeof result.secret).toBe('function');
    });

    it('should handle single issuer configuration with backwards compatibility', () => {
      const config: JWTConfig = {
        type: 'RS256',
        key: 'test-key',
        jwk_url: undefined,
      };

      const result = createExpressJWT(config);

      expect(result).toHaveProperty('algorithms', ['RS256']);
      expect(result).toHaveProperty('secret', 'test-key');
    });

    describe('issuer normalization', () => {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      it('should handle issuer URL with trailing slash when config has no slash', () => {
        const config: JWTConfig = {
          type: undefined,
          key: undefined,
          jwk_url: undefined,
          issuers: {
            'https://auth0.example.com': {
              type: 'RS256',
              key: 'test-key',
              jwk_url: undefined,
            },
          },
        };

        const result = createExpressJWT(config);
        expect(result).toHaveProperty('secret');
        expect(typeof result.secret).toBe('function');

        // Test the secret function with a token that has trailing slash in issuer
        const mockReq = {} as any;
        const mockToken = {
          payload: { iss: 'https://auth0.example.com/' },
        } as any;

        const secretFunction = result.secret as any;

        return new Promise((resolve, reject) => {
          secretFunction(mockReq, mockToken)
            .then((secret: string) => {
              expect(secret).toBe('test-key');
              resolve(secret);
            })
            .catch(reject);
        });
      });

      it('should handle issuer URL without trailing slash when config has slash', () => {
        const config: JWTConfig = {
          type: undefined,
          key: undefined,
          jwk_url: undefined,
          issuers: {
            'https://auth0.example.com/': {
              type: 'RS256',
              key: 'test-key',
              jwk_url: undefined,
            },
          },
        };

        const result = createExpressJWT(config);
        expect(result).toHaveProperty('secret');
        expect(typeof result.secret).toBe('function');

        // Test the secret function with a token that has no trailing slash in issuer
        const mockReq = {} as any;
        const mockToken = {
          payload: { iss: 'https://auth0.example.com' },
        } as any;

        const secretFunction = result.secret as any;

        return new Promise((resolve, reject) => {
          secretFunction(mockReq, mockToken)
            .then((secret: string) => {
              expect(secret).toBe('test-key');
              resolve(secret);
            })
            .catch(reject);
        });
      });

      it('should handle exact issuer match without normalization', () => {
        const config: JWTConfig = {
          type: undefined,
          key: undefined,
          jwk_url: undefined,
          issuers: {
            'https://auth0.example.com': {
              type: 'RS256',
              key: 'test-key',
              jwk_url: undefined,
            },
          },
        };

        const result = createExpressJWT(config);
        expect(result).toHaveProperty('secret');
        expect(typeof result.secret).toBe('function');

        // Test the secret function with exact match
        const mockReq = {} as any;
        const mockToken = {
          payload: { iss: 'https://auth0.example.com' },
        } as any;

        const secretFunction = result.secret as any;

        return new Promise((resolve, reject) => {
          secretFunction(mockReq, mockToken)
            .then((secret: string) => {
              expect(secret).toBe('test-key');
              resolve(secret);
            })
            .catch(reject);
        });
      });

      it('should reject when no issuer configuration is found after normalization attempts', () => {
        const config: JWTConfig = {
          type: undefined,
          key: undefined,
          jwk_url: undefined,
          issuers: {
            'https://different-issuer.com': {
              type: 'RS256',
              key: 'test-key',
              jwk_url: undefined,
            },
          },
        };

        const result = createExpressJWT(config);
        expect(result).toHaveProperty('secret');
        expect(typeof result.secret).toBe('function');

        // Test the secret function with an issuer that doesn't match
        const mockReq = {} as any;
        const mockToken = {
          payload: { iss: 'https://unknown-issuer.com' },
        } as any;

        const secretFunction = result.secret as any;

        return new Promise((resolve, reject) => {
          secretFunction(mockReq, mockToken)
            .then(() => {
              reject(new Error('Should have rejected'));
            })
            .catch((error: Error) => {
              expect(error.message).toContain(
                'No configuration found for issuer'
              );
              resolve(error);
            });
        });
      });

      it('should reject when token has no issuer claim', () => {
        const config: JWTConfig = {
          type: undefined,
          key: undefined,
          jwk_url: undefined,
          issuers: {
            'https://auth0.example.com': {
              type: 'RS256',
              key: 'test-key',
              jwk_url: undefined,
            },
          },
        };

        const result = createExpressJWT(config);
        expect(result).toHaveProperty('secret');
        expect(typeof result.secret).toBe('function');

        // Test the secret function with a token that has no issuer
        const mockReq = {} as any;
        const mockToken = {
          payload: {},
        } as any;

        const secretFunction = result.secret as any;

        return new Promise((resolve, reject) => {
          secretFunction(mockReq, mockToken)
            .then(() => {
              reject(new Error('Should have rejected'));
            })
            .catch((error: Error) => {
              expect(error.message).toBe('JWT token missing issuer claim');
              resolve(error);
            });
        });
      });

      it('should handle issuer normalization with JWKS URL configuration', () => {
        const config: JWTConfig = {
          type: undefined,
          key: undefined,
          jwk_url: undefined,
          issuers: {
            'https://auth0.example.com': {
              type: 'RS256',
              key: undefined,
              jwk_url: 'https://auth0.example.com/.well-known/jwks.json',
            },
          },
        };

        const result = createExpressJWT(config);
        expect(result).toHaveProperty('secret');
        expect(typeof result.secret).toBe('function');

        // Test the secret function with a token that has trailing slash in issuer
        // For JWKS, we expect the function to attempt to resolve the JWKS URL
        // but since we're mocking, we just verify the function is called correctly
        const mockReq = {} as any;
        const mockToken = {
          payload: { iss: 'https://auth0.example.com/' },
          header: { kid: 'test-key-id' },
        } as any;

        const secretFunction = result.secret as any;

        // The JWKS client will fail in test environment, but we're testing
        // that the issuer normalization works and finds the correct config
        return new Promise((resolve) => {
          secretFunction(mockReq, mockToken)
            .then(resolve)
            .catch((error: Error) => {
              // We expect this to fail in test environment due to JWKS resolution
              // but the error should not be about missing issuer configuration
              expect(error.message).not.toContain(
                'No configuration found for issuer'
              );
              resolve(error);
            });
        });
      });
    });
  });
});
