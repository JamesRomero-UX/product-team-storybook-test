import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RedocConfig } from '../../config/redoc.config';
import type { Compat } from '../../types/versioning';
import type { DocumentationServiceConfig } from './documentation.service';
import { documentationService } from './documentation.service';

// Mock dependencies
vi.mock('src/utils/buffer', () => ({
  b64url: vi.fn(),
  ub64url: vi.fn(),
}));

vi.mock('src/utils/crypto', () => ({
  generateSignature: vi.fn(),
  validateSignature: vi.fn(),
}));

vi.mock('../../schemas/openapi.schema', () => ({
  generateOpenApiDocument: vi.fn(),
}));

vi.mock('../../versions/index', () => ({
  CURRENT_API_VERSION: '2025-01-01',
}));

describe('documentation.service', () => {
  let mockConfig: DocumentationServiceConfig;
  let service: ReturnType<typeof documentationService>;

  // Common mock data
  const mockRedocTheme: RedocConfig['defaultTheme'] = {
    colors: {
      primary: { main: '#010101ff' },
      shape: { borderRadius: '8px' },
      text: {
        primary: '#2D2D53',
        secondary: '#8A8E9E',
      },
      border: {
        dark: '#C9CBD1',
        light: '#E8E9EE',
      },
      http: {
        get: '#00DECB',
        post: '#4F46E5',
        put: '#0EA5E9',
        delete: '#F43F5E',
        patch: '#F59E0B',
        options: '#64748B',
        basic: '#64748B',
        link: '#00DECB',
        unknown: '#94A3B8',
      },
      response: {
        success: '#10B981',
        error: '#EF4444',
        info: '#0EA5E9',
        redirect: '#F59E0B',
      },
      background: {
        general: '#FFFFFF',
        dark: '#14143A',
        light: '#F5F5F9',
      },
    },
    typography: {
      fontFamily: 'Sora, system-ui',
      fontSize: '16px',
      lineHeight: '1.6',
      headings: {
        fontFamily: 'Sora, system-ui',
        fontWeight: '700',
        lineHeight: '1.25',
      },
      code: {
        fontFamily: 'ui-monospace, SFMono-Regular',
        fontSize: '12px',
      },
      links: {
        color: '#00DECB',
        visited: '#00BCAA',
        hover: '#00CDBA',
      },
    },
    sidebar: {
      backgroundColor: '#14143A',
      textColor: '#E5E7EB',
      activeTextColor: '#FFFFFF',
      width: '280px',
      groupItems: {
        activeBackgroundColor: 'rgba(0, 222, 203, 0.16)',
        activeTextColor: '#00DECB',
        hoverBackgroundColor: 'rgba(255,255,255,0.05)',
        textTransform: 'none',
      },
      level1Items: {
        activeBackgroundColor: 'rgba(0, 222, 203, 0.16)',
        activeTextColor: '#00DECB',
        hoverBackgroundColor: 'rgba(255,255,255,0.05)',
        textTransform: 'none',
      },
      arrow: {
        color: '#8A8E9E',
      },
    },
    rightPanel: {
      backgroundColor: '#0E1222',
      textColor: '#E6E8EE',
      width: '36%',
      borderRadius: '10px',
    },
    codeBlock: {
      backgroundColor: '#0B1020',
      textColor: '#FFFFFF',
      borderRadius: '10px',
    },
    schema: {
      linesColor: '#E8E9EE',
      typeNameColor: '#14143A',
      typeTitleColor: '#14143A',
    },
    fab: { backgroundColor: '#00DECB', color: '#0B1020' },
    spacing: { unit: 8, sectionVertical: 24, sectionHorizontal: 24 },
    logo: {
      gutter: '16px',
      maxWidth: '200px',
    },
  };

  const mockOpenApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    paths: {},
  };

  // Common test constants
  const mockAppDomain = 'test.risksmart.com';
  const mockBasePath = '/api/v1';
  const mockApiBaseUrl = `https://${mockAppDomain}`;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Date.now mock
    vi.spyOn(Date, 'now').mockReturnValue(1704067200000); // 2024-01-01 00:00:00

    mockConfig = {
      basePath: mockBasePath,
      docsSigningKey: 'test-secret-key-12345',
      docsExpiryHrs: 24,
      redocDefaultTheme: mockRedocTheme,
      appDomain: mockAppDomain,
    };
  });

  describe('getSignedDocumentationPath', () => {
    describe('happy path', () => {
      it('should generate a signed documentation path with signature and expiry', async () => {
        const { b64url } = await import('src/utils/buffer');
        const { generateSignature } = await import('src/utils/crypto');

        const mockSignature = 'abc123def456';
        const mockEncodedSignature = 'YWJjMTIzZGVmNDU2';

        vi.mocked(generateSignature).mockReturnValue(mockSignature);
        vi.mocked(b64url).mockReturnValue(mockEncodedSignature);

        service = documentationService(mockConfig);
        const result = service.getSignedDocumentationPath();

        const expectedExpiry = 1704067200000 + 24 * 3600 * 1000; // +24 hours
        const expectedPayload = `GET:/api/v1/docs:${expectedExpiry}`;

        expect(generateSignature).toHaveBeenCalledWith(
          expectedPayload,
          'test-secret-key-12345'
        );
        expect(b64url).toHaveBeenCalledWith(mockSignature);
        expect(result).toEqual({
          signedDocsPath: `/api/v1/docs?sig=${mockEncodedSignature}&exp=${expectedExpiry}`,
        });
      });

      it('should generate different expiry times for different calls', async () => {
        const { b64url } = await import('src/utils/buffer');
        const { generateSignature } = await import('src/utils/crypto');

        vi.mocked(generateSignature).mockReturnValue('signature1');
        vi.mocked(b64url).mockReturnValue('encoded1');

        service = documentationService(mockConfig);

        // First call
        const result1 = service.getSignedDocumentationPath();
        const expiry1 = 1704067200000 + 24 * 3600 * 1000;

        // Advance time by 1 hour
        vi.spyOn(Date, 'now').mockReturnValue(1704067200000 + 3600 * 1000);

        // Second call
        const result2 = service.getSignedDocumentationPath();
        const expiry2 = 1704067200000 + 3600 * 1000 + 24 * 3600 * 1000;

        expect(result1.signedDocsPath).toContain(`exp=${expiry1}`);
        expect(result2.signedDocsPath).toContain(`exp=${expiry2}`);
        expect(expiry1).not.toBe(expiry2);
      });

      it('should respect different expiry hours configuration', async () => {
        const { b64url } = await import('src/utils/buffer');
        const { generateSignature } = await import('src/utils/crypto');

        vi.mocked(generateSignature).mockReturnValue('signature');
        vi.mocked(b64url).mockReturnValue('encoded');

        const configWith48Hours = { ...mockConfig, docsExpiryHrs: 48 };
        service = documentationService(configWith48Hours);

        const result = service.getSignedDocumentationPath();
        const expectedExpiry = 1704067200000 + 48 * 3600 * 1000; // +48 hours

        expect(result.signedDocsPath).toContain(`exp=${expectedExpiry}`);
      });

      it('should use correct basePath in documentation path', async () => {
        const { b64url } = await import('src/utils/buffer');
        const { generateSignature } = await import('src/utils/crypto');

        vi.mocked(generateSignature).mockReturnValue('signature');
        vi.mocked(b64url).mockReturnValue('encoded');

        const configWithDifferentPath = { ...mockConfig, basePath: '/api/v2' };
        service = documentationService(configWithDifferentPath);

        const result = service.getSignedDocumentationPath();

        expect(result.signedDocsPath).toContain('/api/v2/docs?sig=');
      });
    });
  });

  describe('verifyDocumentationPathSignature', () => {
    describe('happy path', () => {
      it('should return true for valid signature and expiry', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        const encodedSignature = 'YWJjMTIzZGVmNDU2';
        const decodedSignature = 'abc123def456';
        const futureExpiry = 1704067200000 + 3600 * 1000; // 1 hour from now

        vi.mocked(ub64url).mockReturnValue(decodedSignature);
        vi.mocked(validateSignature).mockReturnValue(true);

        service = documentationService(mockConfig);
        const result = service.verifyDocumentationPathSignature(
          encodedSignature,
          futureExpiry
        );

        const expectedPayload = `GET:/api/v1/docs:${futureExpiry}`;

        expect(ub64url).toHaveBeenCalledWith(encodedSignature);
        expect(validateSignature).toHaveBeenCalledWith(
          expectedPayload,
          decodedSignature,
          'test-secret-key-12345'
        );
        expect(result).toBe(true);
      });

      it('should return true for expiry exactly 1ms in the future', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        vi.mocked(ub64url).mockReturnValue('decoded');
        vi.mocked(validateSignature).mockReturnValue(true);

        service = documentationService(mockConfig);
        const futureExpiry = 1704067200000 + 1; // 1ms from now

        const result = service.verifyDocumentationPathSignature(
          'encoded',
          futureExpiry
        );

        expect(result).toBe(true);
      });

      it('should verify signature with different basePath configurations', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        vi.mocked(ub64url).mockReturnValue('decoded');
        vi.mocked(validateSignature).mockReturnValue(true);

        const configWithDifferentPath = { ...mockConfig, basePath: '/api/v3' };
        service = documentationService(configWithDifferentPath);

        const futureExpiry = 1704067200000 + 3600 * 1000;
        service.verifyDocumentationPathSignature('encoded', futureExpiry);

        const expectedPayload = `GET:/api/v3/docs:${futureExpiry}`;
        expect(validateSignature).toHaveBeenCalledWith(
          expectedPayload,
          'decoded',
          'test-secret-key-12345'
        );
      });
    });

    describe('unhappy path', () => {
      it('should return false when expiry is in the past', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        vi.mocked(ub64url).mockReturnValue('decoded');
        vi.mocked(validateSignature).mockReturnValue(true);

        service = documentationService(mockConfig);
        const pastExpiry = 1704067200000 - 1000; // 1 second ago

        const result = service.verifyDocumentationPathSignature(
          'encoded',
          pastExpiry
        );

        const expectedPayload = `GET:/api/v1/docs:${pastExpiry}`;

        expect(ub64url).toHaveBeenCalledWith('encoded');
        expect(validateSignature).toHaveBeenCalledWith(
          expectedPayload,
          'decoded',
          'test-secret-key-12345'
        );
        expect(result).toBe(false);
      });

      it('should return false when expiry equals current time', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        vi.mocked(ub64url).mockReturnValue('decoded');
        vi.mocked(validateSignature).mockReturnValue(true);

        service = documentationService(mockConfig);
        const currentExpiry = 1704067200000; // exactly now

        const result = service.verifyDocumentationPathSignature(
          'encoded',
          currentExpiry
        );

        const expectedPayload = `GET:/api/v1/docs:${currentExpiry}`;

        expect(ub64url).toHaveBeenCalledWith('encoded');
        expect(validateSignature).toHaveBeenCalledWith(
          expectedPayload,
          'decoded',
          'test-secret-key-12345'
        );
        expect(result).toBe(false);
      });

      it('should return false when signature is invalid', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        vi.mocked(ub64url).mockReturnValue('decoded');
        vi.mocked(validateSignature).mockReturnValue(false);

        service = documentationService(mockConfig);
        const futureExpiry = 1704067200000 + 3600 * 1000;

        const result = service.verifyDocumentationPathSignature(
          'invalid-signature',
          futureExpiry
        );

        expect(result).toBe(false);
      });

      it('should return false when signature is tampered with', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        const tamperedSignature = 'tampered-signature';
        vi.mocked(ub64url).mockReturnValue('tampered-decoded');
        vi.mocked(validateSignature).mockReturnValue(false);

        service = documentationService(mockConfig);
        const futureExpiry = 1704067200000 + 3600 * 1000;

        const result = service.verifyDocumentationPathSignature(
          tamperedSignature,
          futureExpiry
        );

        expect(result).toBe(false);
        expect(validateSignature).toHaveBeenCalled();
      });

      it('should handle expiry far in the past', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        vi.mocked(ub64url).mockReturnValue('decoded');
        vi.mocked(validateSignature).mockReturnValue(true);

        service = documentationService(mockConfig);
        const veryPastExpiry = 0; // Unix epoch

        const result = service.verifyDocumentationPathSignature(
          'encoded',
          veryPastExpiry
        );

        const expectedPayload = `GET:/api/v1/docs:${veryPastExpiry}`;

        expect(ub64url).toHaveBeenCalledWith('encoded');
        expect(validateSignature).toHaveBeenCalledWith(
          expectedPayload,
          'decoded',
          'test-secret-key-12345'
        );
        expect(result).toBe(false);
      });

      it('should return false when validateSignature throws an error', async () => {
        const { ub64url } = await import('src/utils/buffer');
        const { validateSignature } = await import('src/utils/crypto');

        vi.mocked(ub64url).mockReturnValue('decoded');
        vi.mocked(validateSignature).mockImplementation(() => {
          throw new Error('Signature validation error');
        });

        service = documentationService(mockConfig);
        const futureExpiry = 1704067200000 + 3600 * 1000;

        expect(() =>
          service.verifyDocumentationPathSignature('encoded', futureExpiry)
        ).toThrow('Signature validation error');
      });
    });
  });

  describe('getRedocOptions', () => {
    describe('happy path', () => {
      it('should return Redoc configuration with correct structure', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');

        vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

        service = documentationService(mockConfig);
        const result = service.getRedocOptions();

        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('spec');
        expect(result).toHaveProperty('redocOptions');
        expect(result.title).toBe('Developers Documentation');
      });

      it('should include the OpenAPI spec in the response', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');

        vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

        service = documentationService(mockConfig);
        const result = service.getRedocOptions();

        expect(result.spec).toEqual(mockOpenApiSpec);
      });

      it('should use the configured Redoc theme', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');

        vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

        service = documentationService(mockConfig);
        const result = service.getRedocOptions();

        expect(result.redocOptions.theme).toEqual(mockRedocTheme);
      });

      it('should have correct Redoc options', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');

        vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

        service = documentationService(mockConfig);
        const result = service.getRedocOptions();

        expect(result.redocOptions).toEqual({
          theme: mockRedocTheme,
          scrollYOffset: 0,
          hideDownloadButton: false,
          expandResponses: '200,201',
          onlyRequiredInSamples: true,
          disableSearch: true,
          hideSchemaTitles: true,
        });
      });

      it('should return consistent options on multiple calls', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');

        vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

        service = documentationService(mockConfig);
        const result1 = service.getRedocOptions();
        const result2 = service.getRedocOptions();

        expect(result1).toEqual(result2);
      });

      it('should use different theme for different service instances', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');

        vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

        const alternateTheme: RedocConfig['defaultTheme'] = {
          ...mockRedocTheme,
          colors: {
            ...mockRedocTheme.colors,
            primary: { main: '#FF0000' },
          },
        };

        const service1 = documentationService(mockConfig);
        const service2 = documentationService({
          ...mockConfig,
          redocDefaultTheme: alternateTheme,
        });

        const result1 = service1.getRedocOptions();
        const result2 = service2.getRedocOptions();

        expect(result1.redocOptions.theme.colors.primary.main).toBe(
          '#010101ff'
        );
        expect(result2.redocOptions.theme.colors.primary.main).toBe('#FF0000');
      });
    });
  });

  describe('getOpenApiDocument', () => {
    describe('happy path', () => {
      it('should return OpenAPI document for current version when no version specified', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');
        const { CURRENT_API_VERSION } = await import('../../versions/index');

        vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

        service = documentationService(mockConfig);
        const result = service.getOpenApiDocument();

        expect(generateOpenApiDocument).toHaveBeenCalledWith(
          CURRENT_API_VERSION,
          mockApiBaseUrl
        );
        expect(result).toEqual(mockOpenApiSpec);
      });

      it('should return OpenAPI document for specific version', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');

        const specificVersion: Compat = '2024-06-15';
        const versionedSpec = {
          ...mockOpenApiSpec,
          info: { ...mockOpenApiSpec.info, version: '2024-06-15' },
        };

        vi.mocked(generateOpenApiDocument).mockReturnValue(versionedSpec);

        service = documentationService(mockConfig);
        const result = service.getOpenApiDocument(specificVersion);

        expect(generateOpenApiDocument).toHaveBeenCalledWith(
          specificVersion,
          mockApiBaseUrl
        );
        expect(result).toEqual(versionedSpec);
      });

      it('should support multiple different version requests', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');
        const { CURRENT_API_VERSION } = await import('../../versions/index');

        const version1: Compat = '2024-01-01';
        const version2: Compat = '2024-12-31';

        const spec1 = {
          ...mockOpenApiSpec,
          info: { ...mockOpenApiSpec.info, version: version1 },
        };
        const spec2 = {
          ...mockOpenApiSpec,
          info: { ...mockOpenApiSpec.info, version: version2 },
        };

        vi.mocked(generateOpenApiDocument)
          .mockReturnValueOnce(mockOpenApiSpec) // Called during service initialization with CURRENT_API_VERSION
          .mockReturnValueOnce(spec1)
          .mockReturnValueOnce(spec2);

        service = documentationService(mockConfig);

        const result1 = service.getOpenApiDocument(version1);
        const result2 = service.getOpenApiDocument(version2);

        // First call is during initialization with CURRENT_API_VERSION
        expect(generateOpenApiDocument).toHaveBeenNthCalledWith(
          1,
          CURRENT_API_VERSION,
          mockApiBaseUrl
        );
        expect(generateOpenApiDocument).toHaveBeenNthCalledWith(
          2,
          version1,
          mockApiBaseUrl
        );
        expect(generateOpenApiDocument).toHaveBeenNthCalledWith(
          3,
          version2,
          mockApiBaseUrl
        );
        expect(result1).toEqual(spec1);
        expect(result2).toEqual(spec2);
      });

      it('should handle version in date format correctly', async () => {
        const { generateOpenApiDocument } =
          await import('../../schemas/openapi.schema');

        const dateVersion: Compat = '2025-03-15';
        vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

        service = documentationService(mockConfig);
        service.getOpenApiDocument(dateVersion);

        expect(generateOpenApiDocument).toHaveBeenCalledWith(
          dateVersion,
          mockApiBaseUrl
        );
      });
    });
  });

  describe('service factory', () => {
    it('should create service with all required methods', async () => {
      const { generateOpenApiDocument } =
        await import('../../schemas/openapi.schema');

      vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

      service = documentationService(mockConfig);

      expect(service).toHaveProperty('getSignedDocumentationPath');
      expect(service).toHaveProperty('verifyDocumentationPathSignature');
      expect(service).toHaveProperty('getRedocOptions');
      expect(service).toHaveProperty('getOpenApiDocument');

      expect(typeof service.getSignedDocumentationPath).toBe('function');
      expect(typeof service.verifyDocumentationPathSignature).toBe('function');
      expect(typeof service.getRedocOptions).toBe('function');
      expect(typeof service.getOpenApiDocument).toBe('function');
    });

    it('should create independent service instances', async () => {
      const { generateOpenApiDocument } =
        await import('../../schemas/openapi.schema');

      vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);

      const service1 = documentationService(mockConfig);
      const service2 = documentationService(mockConfig);

      expect(service1).not.toBe(service2);
      expect(service1.getSignedDocumentationPath).not.toBe(
        service2.getSignedDocumentationPath
      );
    });

    it('should use different configurations for different instances', async () => {
      const { generateOpenApiDocument } =
        await import('../../schemas/openapi.schema');
      const { b64url } = await import('src/utils/buffer');
      const { generateSignature } = await import('src/utils/crypto');

      vi.mocked(generateOpenApiDocument).mockReturnValue(mockOpenApiSpec);
      vi.mocked(generateSignature).mockReturnValue('signature');
      vi.mocked(b64url).mockReturnValue('encoded');

      const config1 = { ...mockConfig, basePath: '/api/v1' };
      const config2 = { ...mockConfig, basePath: '/api/v2' };

      const service1 = documentationService(config1);
      const service2 = documentationService(config2);

      const result1 = service1.getSignedDocumentationPath();
      const result2 = service2.getSignedDocumentationPath();

      expect(result1.signedDocsPath).toContain('/api/v1/docs');
      expect(result2.signedDocsPath).toContain('/api/v2/docs');
    });
  });
});
